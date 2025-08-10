# AI Assistant Setup Guide

This guide will help you set up the AI Assistant with full voice recognition and text-to-speech capabilities.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ installed
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Microphone access for voice features
- Hugging Face account for AI model access

### 2. Installation
```bash
# Clone and install dependencies
git clone <repository-url>
cd ai-assistant
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your API key
nano .env
```

Add your Hugging Face API key:
```env
VITE_HUGGINGFACE_API_KEY=your_actual_api_key_here
```

### 4. Get Hugging Face API Key
1. Visit [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name (e.g., "AI Assistant")
6. Select "Read" permissions
7. Copy the generated token
8. Paste it in your `.env` file

### 5. Start the Application
```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## 🎯 Features Overview

### Demo Mode (Default)
- **No API Key Required**: Works immediately
- **UI Preview**: See the full interface
- **Simulated Responses**: Understand how the app works
- **Perfect for Testing**: Try before you commit

### Full AI Mode
- **Real AI Responses**: Powered by GPT-OSS-20B
- **Voice Recognition**: Speak to the AI
- **Text-to-Speech**: AI speaks back to you
- **Streaming Responses**: Real-time AI generation

## 🔧 Configuration Options

### Voice Settings
Access via the settings icon (⚙️) in the header:

- **Auto-speak Responses**: Automatically speak AI responses
- **AI-powered TTS**: Use Microsoft SpeechT5 for better quality
- **Speech Rate**: Adjust playback speed (0.5x - 2x)
- **Volume Control**: Set audio volume (0-100%)

### Browser Permissions
For voice features to work:
1. Allow microphone access when prompted
2. Use HTTPS in production (required for voice APIs)
3. Ensure browser supports Web Speech API

## 🎤 Voice Features

### Voice Input
1. Click the microphone button 🎤
2. Speak your message clearly
3. Text appears in the input field
4. Click Send or press Enter

### Voice Output
- **Auto-speak**: Responses automatically spoken
- **Manual Play**: Click speaker icon on any message
- **Control**: Pause/resume/stop during playback

## 🤖 AI Models Used

The application uses these Hugging Face models:

| Feature | Model | Purpose |
|---------|-------|---------|
| Text Generation | `openai/gpt-oss-20b` | AI responses |
| Speech Recognition | `openai/whisper-large-v3` | Voice to text |
| Text-to-Speech | `microsoft/speecht5_tts` | Text to voice |

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_HUGGINGFACE_API_KEY`: Your API key
3. Deploy automatically on push

### Netlify
1. Build: `npm run build`
2. Upload `dist` folder to Netlify
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
- **"Microphone access denied"**: Check browser permissions
- **"Speech recognition not supported"**: Update browser or use Chrome/Firefox
- **"No speech detected"**: Speak louder or check microphone

### AI Model Issues
- **"API key invalid"**: Verify your Hugging Face token
- **"Rate limit exceeded"**: Check Hugging Face usage limits
- **"Model unavailable"**: Models may be temporarily down

### Performance Issues
- **Slow responses**: Large models take time to generate
- **Browser freezing**: Close other tabs or restart browser
- **Memory issues**: Refresh page or restart application

## 🔒 Security & Privacy

- **Local Processing**: Voice recognition runs in your browser
- **Secure API**: Uses Hugging Face's HTTPS endpoints
- **No Data Storage**: Conversations not stored on servers
- **API Key Security**: Keep your API key private

## 📱 Browser Compatibility

| Browser | Voice Recognition | Text-to-Speech | Status |
|---------|------------------|----------------|--------|
| Chrome | ✅ Full Support | ✅ Full Support | Recommended |
| Firefox | ✅ Full Support | ✅ Full Support | Recommended |
| Safari | ⚠️ Limited | ✅ Full Support | Works |
| Edge | ✅ Full Support | ✅ Full Support | Works |

## 🎯 Usage Tips

### For Best Results
1. **Clear Speech**: Speak clearly and at normal volume
2. **Good Microphone**: Use a quality microphone for better recognition
3. **Quiet Environment**: Minimize background noise
4. **Specific Questions**: Ask clear, specific questions
5. **Patience**: Large AI models take time to respond

### Advanced Features
- **Conversation Context**: The AI remembers previous messages
- **Streaming Responses**: See responses generate in real-time
- **Settings Persistence**: Your preferences are saved locally
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line

## 📞 Support

If you encounter issues:

1. **Check this guide** for common solutions
2. **Browser Console**: Press F12 to see error messages
3. **API Status**: Check [Hugging Face Status](https://status.huggingface.co/)
4. **GitHub Issues**: Report bugs with detailed information

## 🎉 Next Steps

Once you have the basic setup working:

1. **Explore the Interface**: Try different features
2. **Test Voice Features**: Practice with voice input/output
3. **Customize Settings**: Adjust to your preferences
4. **Deploy**: Share with others or deploy to production
5. **Contribute**: Help improve the application

---

**Happy chatting with your AI assistant! 🤖✨**