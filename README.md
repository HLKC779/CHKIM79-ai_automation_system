---
title: AI Automation System
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: static
pinned: false
license: mit
---

# AI Assistant with Voice Mode

A powerful AI chat application powered by GPT-OSS-20B with advanced text-to-speech and voice recognition capabilities.

## 🚀 Features

### 🤖 AI Chat
- **GPT-OSS-20B Integration**: Powered by OpenAI's open-source 20B parameter model
- **Streaming Responses**: Real-time AI responses with typing indicators
- **Conversation History**: Maintains context across multiple messages
- **Smart Context**: Intelligent conversation flow with system prompts

### 🎤 Voice Recognition
- **Real-time Speech-to-Text**: Convert your voice to text instantly
- **Browser-native Support**: Uses Web Speech API for optimal performance
- **Multi-language Support**: Configurable language settings
- **Error Handling**: Comprehensive error messages and recovery

### 🔊 Text-to-Speech
- **Dual TTS Options**: 
  - Browser-native speech synthesis
  - AI-powered TTS using Microsoft SpeechT5
- **Customizable Settings**: Adjust rate, pitch, and volume
- **Auto-speak Responses**: Automatically speak AI responses
- **Manual Control**: Play/pause/stop speech playback

### 🎨 Modern UI
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Dark/Light Mode Ready**: Tailwind CSS styling
- **Accessibility**: Full keyboard navigation and screen reader support

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **AI Model**: GPT-OSS-20B via Hugging Face Inference API
- **Voice Recognition**: Web Speech API
- **Text-to-Speech**: Web Speech API + Microsoft SpeechT5
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks + Context

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Hugging Face API key:
   ```env
   VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

4. **Get your Hugging Face API key**
   - Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Create a new token with read permissions
   - Copy the token to your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Voice Settings
- **Auto-speak Responses**: Automatically speak AI responses
- **AI-powered TTS**: Use Microsoft SpeechT5 for higher quality speech
- **Speech Rate**: Adjust playback speed (0.5x - 2x)
- **Volume Control**: Set audio volume (0-100%)

### AI Model Settings
The application uses the following models:
- **Text Generation**: `openai/gpt-oss-20b`
- **Speech Recognition**: `openai/whisper-large-v3`
- **Text-to-Speech**: `microsoft/speecht5_tts`

## 🎯 Usage

### Basic Chat
1. Type your message in the input field
2. Press Enter or click the Send button
3. Wait for the AI response
4. Responses are automatically spoken if auto-speak is enabled

### Voice Input
1. Click the microphone button to start voice recognition
2. Speak your message clearly
3. The recognized text will appear in the input field
4. Click Send or press Enter to send the message

### Voice Output
- **Auto-speak**: Responses are automatically spoken
- **Manual Play**: Click the speaker icon on any AI message
- **Control**: Use pause/resume/stop buttons during playback

### Settings
- Click the settings icon in the header
- Adjust voice and speech settings
- Toggle between browser TTS and AI-powered TTS

## 🔒 Privacy & Security

- **Local Processing**: Voice recognition runs in your browser
- **API Security**: Uses Hugging Face's secure inference API
- **No Data Storage**: Conversations are not stored on servers
- **HTTPS Required**: Secure connections for API calls

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🐛 Troubleshooting

### Voice Recognition Issues
- **Microphone Access**: Ensure browser has microphone permissions
- **HTTPS Required**: Voice recognition requires secure connection
- **Browser Support**: Check if your browser supports Web Speech API

### AI Model Issues
- **API Key**: Verify your Hugging Face API key is correct
- **Rate Limits**: Check Hugging Face API usage limits
- **Model Availability**: Ensure models are available in your region

### Performance Issues
- **Large Responses**: Very long responses may take time to generate
- **Network**: Check your internet connection
- **Browser**: Try refreshing or using a different browser

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for providing the AI models
- [OpenAI](https://openai.com/) for GPT-OSS-20B
- [Microsoft](https://microsoft.com/) for SpeechT5
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) communities

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information
4. Include browser version, OS, and error messages

---

**Made with ❤️ using modern web technologies**