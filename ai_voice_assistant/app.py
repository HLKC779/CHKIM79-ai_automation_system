#!/usr/bin/env python3

import argparse
import os
import sys
import time
from typing import List, Dict, Optional

import numpy as np

# Lazy heavy imports inside functions to minimize startup cost when only listing help


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Chat with an open-source LLM and speak responses (TTS). Voice mode adds STT input.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--model-id",
        type=str,
        default=os.environ.get("MODEL_ID", "openai/gpt-oss-20b"),
        help="Hugging Face model id for the chat LLM",
    )
    parser.add_argument(
        "--quantization",
        type=str,
        choices=["none", "8bit", "4bit"],
        default=os.environ.get("QUANTIZATION", "none"),
        help="Optional bitsandbytes quantization to reduce memory",
    )
    parser.add_argument(
        "--device",
        type=str,
        default=os.environ.get("DEVICE", "auto"),
        help="Device spec for Transformers (e.g., auto, cpu, cuda, cuda:0)",
    )
    parser.add_argument(
        "--max-new-tokens",
        type=int,
        default=int(os.environ.get("MAX_NEW_TOKENS", 256)),
        help="Maximum new tokens to generate per response",
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=float(os.environ.get("TEMPERATURE", 0.7)),
        help="Sampling temperature",
    )
    parser.add_argument(
        "--top-p",
        type=float,
        default=float(os.environ.get("TOP_P", 0.9)),
        help="Top-p nucleus sampling",
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["text", "voice"],
        default=os.environ.get("MODE", "text"),
        help="Interaction mode: text or voice (aka void-mode)",
    )
    parser.add_argument(
        "--tts",
        type=str,
        choices=["on", "off"],
        default=os.environ.get("TTS", "on"),
        help="Enable text-to-speech of model responses",
    )
    parser.add_argument(
        "--speaker-index",
        type=int,
        default=int(os.environ.get("SPEAKER_INDEX", 7306)),
        help="Index into CMU Arctic speaker embeddings for SpeechT5",
    )
    parser.add_argument(
        "--save-audio",
        type=str,
        default=os.environ.get("SAVE_AUDIO", ""),
        help="Optional path to save generated TTS wav files (basename-only, numbered)",
    )
    parser.add_argument(
        "--record-seconds",
        type=float,
        default=float(os.environ.get("RECORD_SECONDS", 5.0)),
        help="Recording duration per utterance in voice mode",
    )
    parser.add_argument(
        "--asr-model-id",
        type=str,
        default=os.environ.get("ASR_MODEL_ID", "openai/whisper-small"),
        help="ASR model id for voice mode",
    )
    parser.add_argument(
        "--no-remote-code",
        action="store_true",
        help="Do not set trust_remote_code=True when loading models",
    )
    return parser.parse_args()


class ChatModel:
    def __init__(
        self,
        model_id: str,
        device: str = "auto",
        max_new_tokens: int = 256,
        temperature: float = 0.7,
        top_p: float = 0.9,
        quantization: str = "none",
        trust_remote_code: bool = True,
    ) -> None:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        import torch

        self.model_id = model_id
        self.max_new_tokens = max_new_tokens
        self.temperature = temperature
        self.top_p = top_p

        torch_dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32

        model_kwargs = {
            "torch_dtype": torch_dtype,
            "device_map": device if device != "auto" else "auto",
            "trust_remote_code": trust_remote_code,
        }

        if quantization in ("8bit", "4bit"):
            # Prefer BitsAndBytesConfig when available
            try:
                from transformers import BitsAndBytesConfig  # type: ignore
                load_in_8bit = quantization == "8bit"
                load_in_4bit = quantization == "4bit"
                bnb_config = BitsAndBytesConfig(
                    load_in_8bit=load_in_8bit,
                    load_in_4bit=load_in_4bit,
                    bnb_4bit_compute_dtype=torch_dtype if load_in_4bit else None,
                )
                model_kwargs["quantization_config"] = bnb_config
            except Exception as e:
                print(f"[WARN] Optional BitsAndBytesConfig not used: {e}")
                if quantization == "8bit":
                    model_kwargs["load_in_8bit"] = True
                if quantization == "4bit":
                    model_kwargs["load_in_4bit"] = True

        print(f"[INFO] Loading tokenizer: {model_id}")
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            use_fast=True,
            trust_remote_code=trust_remote_code,
        )

        print(f"[INFO] Loading model: {model_id}")
        self.model = AutoModelForCausalLM.from_pretrained(
            model_id,
            **model_kwargs,
        )

        # Some chat models need padding side configured for generation
        if getattr(self.tokenizer, "pad_token_id", None) is None and getattr(self.tokenizer, "eos_token_id", None) is not None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        self.device = getattr(self.model, "device", None)
        if self.device is None:
            try:
                self.device = next(self.model.parameters()).device
            except Exception:
                self.device = "cpu"

    def generate(self, messages: List[Dict[str, str]]) -> str:
        from transformers import GenerationConfig
        import torch

        # Use chat template if available
        try:
            inputs = self.tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                tokenize=True,
                return_dict=True,
                return_tensors="pt",
            )
            inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
        except Exception:
            # Fallback: simple prompt join
            prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages]) + "\nassistant:"
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        generation_config = GenerationConfig(
            do_sample=self.temperature > 0,
            temperature=self.temperature,
            top_p=self.top_p,
            max_new_tokens=self.max_new_tokens,
            repetition_penalty=1.1,
        )

        with torch.no_grad():
            output_ids = self.model.generate(**inputs, generation_config=generation_config)

        # Slice out only the newly generated tokens
        input_len = inputs["input_ids"].shape[-1]
        new_tokens = output_ids[0][input_len:]
        text = self.tokenizer.decode(new_tokens, skip_special_tokens=True)
        return text.strip()


class TextToSpeechSynthesizer:
    def __init__(self, speaker_index: int = 7306) -> None:
        # Defer heavy imports until used
        from transformers import SpeechT5ForTextToSpeech, SpeechT5HifiGan, SpeechT5Processor
        from datasets import load_dataset

        print("[INFO] Loading SpeechT5 (TTS) models...")
        self.processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
        self.tts_model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
        self.vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
        print("[INFO] Loading speaker embeddings (CMU Arctic xvectors)...")
        embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
        # Guard index
        speaker_index = max(0, min(speaker_index, len(embeddings_dataset) - 1))
        self.speaker_embeddings = np.array(embeddings_dataset[speaker_index]["xvector"], dtype=np.float32)[None, :]

    def synthesize(self, text: str) -> np.ndarray:
        import torch

        inputs = self.processor(text=text, return_tensors="pt")
        spk = torch.tensor(self.speaker_embeddings)
        with torch.no_grad():
            speech = self.tts_model.generate_speech(
                inputs["input_ids"],
                speaker_embeddings=spk,
                vocoder=self.vocoder,
            )
        audio = speech.numpy().astype(np.float32)
        return audio

    @staticmethod
    def play(audio: np.ndarray, sample_rate: int = 16000) -> None:
        try:
            import sounddevice as sd
            sd.play(audio, samplerate=sample_rate, blocking=True)
        except Exception as e:
            print(f"[WARN] Unable to play audio: {e}")

    @staticmethod
    def save_wav(audio: np.ndarray, sample_rate: int, path: str) -> None:
        from scipy.io.wavfile import write as wav_write
        wav_write(path, sample_rate, (audio * 32767.0).astype(np.int16))


class SpeechToTextRecognizer:
    def __init__(self, model_id: str = "openai/whisper-small", device: str = "auto") -> None:
        from transformers import pipeline

        print(f"[INFO] Loading ASR model: {model_id}")
        self.asr = pipeline(
            "automatic-speech-recognition",
            model=model_id,
            device=device if device != "auto" else None,
        )

    def transcribe(self, audio: np.ndarray, sample_rate: int) -> str:
        result = self.asr({"array": audio, "sampling_rate": sample_rate})
        if isinstance(result, dict) and "text" in result:
            return result["text"].strip()
        return str(result)


def record_audio(seconds: float, sample_rate: int = 16000) -> np.ndarray:
    try:
        import sounddevice as sd
    except Exception as e:
        print("[ERROR] sounddevice is required for recording. Install it and ensure microphone access.")
        raise e

    print(f"[INFO] Recording for {seconds:.1f}s...")
    audio = sd.rec(int(seconds * sample_rate), samplerate=sample_rate, channels=1, dtype="float32")
    sd.wait()
    audio = audio.reshape(-1)
    # Basic normalization/clipping
    max_val = float(np.max(np.abs(audio)) + 1e-8)
    if max_val > 1.0:
        audio = audio / max_val
    return audio


def interactive_text_loop(chat: ChatModel, tts: Optional[TextToSpeechSynthesizer], speak: bool, save_audio_basename: str) -> None:
    messages: List[Dict[str, str]] = []
    counter = 1
    print("Type your messages. Ctrl+C to exit.\n")
    while True:
        try:
            user = input("you> ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n[INFO] Exiting.")
            break
        if not user:
            continue

        messages.append({"role": "user", "content": user})
        reply = chat.generate(messages)
        messages.append({"role": "assistant", "content": reply})
        print(f"assistant> {reply}")

        if speak and tts is not None:
            audio = tts.synthesize(reply)
            tts.play(audio, sample_rate=16000)
            if save_audio_basename:
                out_path = f"{save_audio_basename}_{counter:03d}.wav"
                tts.save_wav(audio, 16000, out_path)
                print(f"[INFO] Saved TTS to {out_path}")
                counter += 1


def interactive_voice_loop(
    chat: ChatModel,
    asr: SpeechToTextRecognizer,
    tts: Optional[TextToSpeechSynthesizer],
    speak: bool,
    record_seconds: float,
    save_audio_basename: str,
) -> None:
    messages: List[Dict[str, str]] = []
    counter = 1
    print("Voice mode (aka void-mode). Press Enter to record, 'q' to quit.\n")

    while True:
        try:
            cmd = input("[Enter=record | q=quit]> ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            print("\n[INFO] Exiting.")
            break

        if cmd == "q":
            break

        audio = record_audio(seconds=record_seconds, sample_rate=16000)
        text = asr.transcribe(audio, sample_rate=16000)
        print(f"you (ASR)> {text}")
        if not text:
            continue

        messages.append({"role": "user", "content": text})
        reply = chat.generate(messages)
        messages.append({"role": "assistant", "content": reply})
        print(f"assistant> {reply}")

        if speak and tts is not None:
            audio_out = tts.synthesize(reply)
            tts.play(audio_out, sample_rate=16000)
            if save_audio_basename:
                out_path = f"{save_audio_basename}_{counter:03d}.wav"
                tts.save_wav(audio_out, 16000, out_path)
                print(f"[INFO] Saved TTS to {out_path}")
                counter += 1


def main() -> None:
    args = parse_args()

    # Safety and usability notes for huge models
    if args.model_id == "openai/gpt-oss-20b":
        print(
            "[NOTE] 'openai/gpt-oss-20b' is very large. A high-memory GPU with quantization is recommended.\n"
            "       You can override with --model-id to a smaller instruct model for local testing."
        )

    trust_remote_code = not args.no_remote_code

    try:
        chat = ChatModel(
            model_id=args.model_id,
            device=args.device,
            max_new_tokens=args.max_new_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
            quantization=args.quantization,
            trust_remote_code=trust_remote_code,
        )
    except Exception as e:
        print(f"[ERROR] Failed to load chat model '{args.model_id}': {e}")
        print("You may try: --quantization 4bit (requires bitsandbytes), or a smaller model via --model-id")
        sys.exit(1)

    tts = None
    if args.tts == "on":
        try:
            tts = TextToSpeechSynthesizer(speaker_index=args.speaker_index)
        except Exception as e:
            print(f"[WARN] TTS initialization failed: {e}")

    save_audio_basename = args.save_audio.strip()

    if args.mode == "text":
        interactive_text_loop(chat, tts, speak=(args.tts == "on" and tts is not None), save_audio_basename=save_audio_basename)
    else:
        try:
            asr = SpeechToTextRecognizer(model_id=args.asr_model_id, device=args.device)
        except Exception as e:
            print(f"[ERROR] ASR initialization failed: {e}")
            sys.exit(1)
        interactive_voice_loop(
            chat,
            asr,
            tts,
            speak=(args.tts == "on" and tts is not None),
            record_seconds=args.record_seconds,
            save_audio_basename=save_audio_basename,
        )


if __name__ == "__main__":
    main()