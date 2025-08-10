---
title: AI Automation System
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: static
pinned: false
license: mit
---

# TTS AI Application

A modern, cross-platform Text-to-Speech AI application with a beautiful UI and comprehensive backend services. Built with React, Node.js, and multiple AI providers.

## 🌟 Features

### Core Functionality
- **Multi-Provider TTS**: Support for OpenAI, Google Cloud, AWS Polly, Azure, and ElevenLabs
- **Real-time Streaming**: Live audio streaming with WebSocket support
- **Batch Processing**: Convert multiple texts simultaneously
- **Voice Customization**: Extensive voice and language options
- **Audio Controls**: Playback, download, and format conversion

### User Experience
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Cross-Platform**: Works on iOS, Mac, iPhone, iPad, and all modern browsers
- **Dark Mode**: Full dark mode support with automatic detection
- **Accessibility**: WCAG compliant with keyboard navigation
- **Mobile-First**: Optimized for mobile and tablet devices

### Advanced Features
- **User Authentication**: Secure JWT-based authentication
- **Usage Analytics**: Track conversion history and statistics
- **API Management**: Generate and manage API keys
- **Privacy Controls**: Comprehensive privacy settings and data management
- **Caching**: Redis-based caching for improved performance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Redis (optional, for caching)
- SQLite (included)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tts-ai-application
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp backend/.env.example backend/.env
   
   # Edit environment variables
   nano .env
   nano backend/.env
   ```

4. **Start the application**
   ```bash
   # Start backend (in one terminal)
   cd backend
   npm run dev
   
   # Start frontend (in another terminal)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## 📁 Project Structure

```
tts-ai-application/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── App.tsx           # Main application component
├── backend/               # Node.js backend
│   ├── controllers/       # Business logic controllers
│   ├── database/          # Database configuration
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── public/               # Static assets
├── docs/                 # Documentation
└── tests/                # Test files
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=TTS AI
VITE_APP_VERSION=1.0.0
```

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=sqlite://./data/tts_ai.db

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# TTS Provider API Keys
OPENAI_API_KEY=your-openai-api-key
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=your-azure-region
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

### TTS Services
- `GET /api/tts/voices` - Get available voices
- `GET /api/tts/languages` - Get supported languages
- `POST /api/tts/convert` - Convert text to speech
- `POST /api/tts/stream` - Stream TTS conversion
- `POST /api/tts/batch` - Batch TTS conversion
- `GET /api/tts/history` - Get conversion history
- `DELETE /api/tts/history/:id` - Delete history item
- `GET /api/tts/stats` - Get usage statistics

### User Management
- `GET /api/users/settings` - Get user settings
- `PUT /api/users/settings` - Update user settings
- `GET /api/users/usage` - Get usage information
- `GET /api/users/api-keys` - Get API keys
- `POST /api/users/api-keys` - Create API key
- `DELETE /api/users/api-keys/:id` - Delete API key
- `PATCH /api/users/api-keys/:id/toggle` - Toggle API key

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run test         # Run tests
```

#### Backend
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
```

### Code Quality

The project uses several tools to maintain code quality:

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Jest**: Unit testing
- **Supertest**: API testing

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🔒 Security

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing protection
- **Input Validation**: Comprehensive input validation and sanitization
- **Helmet**: Security headers middleware
- **SQL Injection Protection**: Parameterized queries with Knex.js

### Security Best Practices
- All API keys stored in environment variables
- HTTPS enforced in production
- Regular security updates and patches
- Comprehensive logging and monitoring
- Data encryption in transit and at rest

## 📊 Performance

### Optimization Features
- **Redis Caching**: TTS results cached for improved performance
- **Compression**: Gzip compression for API responses
- **CDN Ready**: Static assets optimized for CDN delivery
- **Lazy Loading**: Component and route lazy loading
- **Image Optimization**: Optimized images and icons
- **Bundle Optimization**: Tree shaking and code splitting

### Performance Monitoring
- **Lighthouse**: Performance, accessibility, and SEO scoring
- **Bundle Analysis**: Webpack bundle analyzer
- **API Monitoring**: Response time and error tracking
- **User Analytics**: Usage patterns and performance metrics

## 🌐 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   cd backend && npm run build
   ```

2. **Set up production environment**
   ```bash
   # Set NODE_ENV=production
   # Configure production database
   # Set up SSL certificates
   # Configure reverse proxy (nginx)
   ```

3. **Deploy to your preferred platform**
   - **Vercel**: Frontend deployment
   - **Railway**: Full-stack deployment
   - **Heroku**: Full-stack deployment
   - **AWS**: EC2 or ECS deployment
   - **Docker**: Containerized deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t tts-ai-frontend .
docker build -t tts-ai-backend ./backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check the [docs/](docs/) folder
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions
- **Email**: support@tts-ai-app.com

### Common Issues

#### Frontend Issues
- **Build Errors**: Clear node_modules and reinstall dependencies
- **TypeScript Errors**: Run `npm run type-check` for detailed errors
- **Styling Issues**: Check Tailwind CSS configuration

#### Backend Issues
- **Database Errors**: Check database connection and migrations
- **API Errors**: Verify environment variables and API keys
- **Redis Issues**: Ensure Redis is running and accessible

## 🗺️ Roadmap

### Upcoming Features
- [ ] Real-time collaboration
- [ ] Advanced voice cloning
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Enterprise SSO integration

### Version History
- **v1.0.0**: Initial release with core TTS functionality
- **v1.1.0**: Added batch processing and advanced settings
- **v1.2.0**: Enhanced UI/UX and mobile optimization
- **v1.3.0**: Added API management and usage analytics

---

**Built with ❤️ using modern web technologies**