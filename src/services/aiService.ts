import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face inference client
const hf = new HfInference(process.env.VITE_HUGGINGFACE_API_KEY);

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  text: string;
  error?: string;
}

class AIService {
  private model = 'openai/gpt-oss-20b';
  private maxTokens = 500;
  private temperature = 0.7;

  async generateResponse(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      // Format messages for the model
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Create the prompt using chat template
      const prompt = this.formatChatPrompt(formattedMessages);

      const response = await hf.textGeneration({
        model: this.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: this.maxTokens,
          temperature: this.temperature,
          do_sample: true,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
      });

      return {
        text: response.generated_text || 'No response generated',
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private formatChatPrompt(messages: ChatMessage[]): string {
    // Format messages in a way that works with GPT-OSS-20B
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `System: ${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `User: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    prompt += 'Assistant: ';
    return prompt;
  }

  async generateStreamingResponse(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const prompt = this.formatChatPrompt(messages);
      
      const response = await hf.textGenerationStream({
        model: this.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: this.maxTokens,
          temperature: this.temperature,
          do_sample: true,
          top_p: 0.9,
          repetition_penalty: 1.1,
        },
      });

      for await (const chunk of response) {
        if (chunk.token?.text) {
          onChunk(chunk.token.text);
        }
      }
    } catch (error) {
      console.error('Streaming AI Service Error:', error);
      onChunk('\n[Error: Failed to generate response]');
    }
  }

  // Method to handle voice input processing
  async processVoiceInput(audioBlob: Blob): Promise<string> {
    try {
      // Convert audio to text using Hugging Face's speech recognition
      const response = await hf.automaticSpeechRecognition({
        model: 'openai/whisper-large-v3',
        file: audioBlob,
      });
      
      return response.text || '';
    } catch (error) {
      console.error('Voice Processing Error:', error);
      throw new Error('Failed to process voice input');
    }
  }

  // Method to convert text to speech
  async textToSpeech(text: string): Promise<Blob> {
    try {
      const response = await hf.textToSpeech({
        model: 'microsoft/speecht5_tts',
        inputs: text,
      });
      
      return response;
    } catch (error) {
      console.error('Text-to-Speech Error:', error);
      throw new Error('Failed to convert text to speech');
    }
  }
}

export const aiService = new AIService();
export default aiService;