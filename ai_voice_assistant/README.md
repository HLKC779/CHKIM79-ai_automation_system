# AI Voice Assistant (Text + Voice)

This small app loads the open-source `openai/gpt-oss-20b` model from Hugging Face for chat, adds Text-To-Speech with SpeechT5, and a voice mode with Whisper ASR.

Note: `openai/gpt-oss-20b` is huge. Prefer a large GPU with quantization or try a smaller model via `--model-id`.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

If using GPU with CUDA, ensure PyTorch CUDA build is installed and working. For quantization, `bitsandbytes` is required.

## Run (Text mode)

```bash
python app.py --mode text --model-id openai/gpt-oss-20b --quantization 4bit --tts on
```

- Type messages at the prompt.
- The assistant replies and optionally speaks the response.

## Run (Voice mode)

Voice mode records from your default microphone for a few seconds, transcribes with Whisper, sends to the LLM, and optionally speaks the reply.

```bash
python app.py --mode voice --record-seconds 5 --tts on \
  --model-id openai/gpt-oss-20b --quantization 4bit \
  --asr-model-id openai/whisper-small
```

- Press Enter to record; `q` to quit.
- To save audio responses: `--save-audio out/tts`

## Tips

- Use `--device cuda` (or `cuda:0`) if you have a GPU.
- Reduce `--max-new-tokens` to speed up generation.
- Try a smaller model id for testing (e.g., `Qwen/Qwen2.5-7B-Instruct`, `meta-llama/Llama-3.1-8B-Instruct`).
- Set `--tts off` if you only want text replies.