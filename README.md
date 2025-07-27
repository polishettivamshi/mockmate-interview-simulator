# MockMate - AI-Powered Interview Simulator

MockMate is a full-stack AI-powered mock interview simulator designed to help students and job seekers practice interviews and overcome anxiety. Users can simulate real interview scenarios with an AI interviewer, receive instant feedback, and track their performance over time.

## 🚀 Features

- **Role-specific mock interviews** (Software Engineer, Data Analyst, Product Manager, etc.)
- **Dynamic AI interviewer** powered by OpenRouter API
- **Real-time feedback generation** with scoring (clarity, correctness, confidence)
- **Voice and text input support** using browser Speech Recognition API
- **Progress tracking** and saved sessions
- **Comprehensive analytics** and performance insights
- **Modern, responsive UI** built with Next.js and TailwindCSS

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **TailwindCSS** for styling
- **Shadcn/ui** components
- **React Hooks** for state management
- **Browser Speech Recognition API** for voice input

### Backend
- **FastAPI** (Python)
- **SQLite** (development) / **PostgreSQL** (production)
- **SQLAlchemy** ORM
- **JWT** authentication
- **OpenRouter API** for AI features
- **Pydantic** for data validation

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **OpenRouter API Key** (optional - falls back to mock responses)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mockmate
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:8000`

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

The backend API will be available at `http://localhost:8001`

### 4. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./mockmate.db

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OpenRouter API (optional)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# CORS Origins
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
```

## 🔧 Configuration

### OpenRouter API Setup

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Add it to your `.env` file as `OPENROUTER_API_KEY`

**Note:** If no API key is provided, the system will use mock responses for development.

### Database Setup

The application uses SQLite by default for development. The database will be created automatically when you first run the backend.

For production, update the `DATABASE_URL` in your environment to use PostgreSQL:

```env
DATABASE_URL=postgresql://username:password@localhost/mockmate
```

## 📁 Project Structure

```
mockmate/
├── src/                          # Frontend source code
│   ├── app/                      # Next.js app directory
│   │   ├── (auth)/              # Authentication pages
│   │   ├── (interview)/         # Interview flow pages
│   │   └── dashboard/           # Dashboard page
│   ├── components/              # React components
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utilities and API client
├── backend/                     # Backend source code
│   ├── models/                  # SQLAlchemy models
│   ├── routers/                 # FastAPI routers
│   ├── services/                # Business logic services
│   ├── utils/                   # Utility functions
│   ├── config.py               # Configuration
│   ├── database.py             # Database setup
│   └── main.py                 # FastAPI application
├── public/                      # Static assets
└── README.md
```

## 🎯 Usage

### 1. User Registration/Login
- Create an account or log in
- Set your target role and preferences

### 2. Interview Setup
- Choose your target role (Software Engineer, Data Analyst, etc.)
- Select interview type (Technical, Behavioral, or Mixed)
- Set difficulty level and duration
- Choose input method (Voice, Text, or Both)

### 3. Interview Session
- Answer questions from the AI interviewer
- Use voice input or type your responses
- Navigate through multiple questions
- End the interview when complete

### 4. Feedback & Analytics
- Receive detailed feedback with scores
- View strengths and improvement areas
- Track progress over time
- Access comprehensive analytics

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

### Interviews
- `POST /interviews/` - Create interview session
- `GET /interviews/{id}` - Get interview details
- `POST /interviews/{id}/question` - Get next question
- `POST /interviews/{id}/answer` - Submit answer
- `POST /interviews/{id}/end` - End interview

### Feedback
- `GET /feedback/{interview_id}` - Get feedback
- `POST /feedback/{interview_id}/generate` - Generate feedback
- `GET /feedback/user/stats` - User statistics

## 🧪 Development

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
python -m pytest
```

### Code Quality

```bash
# Frontend linting
npm run lint

# Backend formatting
cd backend
black .
flake8 .
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
npm run build
# Deploy to Vercel or your preferred platform
```

### Backend (Railway/Heroku)

1. Update environment variables for production
2. Change database to PostgreSQL
3. Set `DEBUG=False` in production
4. Deploy using your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/mockmate/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- OpenRouter for AI API services
- Shadcn/ui for beautiful components
- FastAPI for the excellent Python framework
- Next.js team for the amazing React framework

---

**Happy Interviewing! 🎉**

Built with ❤️ to help you ace your next interview.
