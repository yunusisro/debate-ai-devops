# Debate Assistant AI - Backend

FastAPI backend for the Debate Assistant AI application with MongoDB and Gemini AI integration.

## Features

- User authentication (signup/login) with JWT tokens
- Debate topic management (predefined and custom topics)
- Real-time debate sessions with AI opponent
- AI-powered debate responses using Google Gemini API
- Comprehensive debate evaluation and scoring
- Leaderboard system
- User profile management

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **MongoDB**: NoSQL database for flexible data storage
- **Motor**: Async MongoDB driver
- **Google Gemini AI**: For generating debate arguments and evaluations
- **JWT**: Secure authentication
- **Pydantic**: Data validation and settings management

## Project Structure

```
backend/
├── main.py                 # Application entry point
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── database/
│   └── connection.py      # MongoDB connection
├── models/
│   ├── user.py           # User models
│   ├── debate.py         # Debate models
│   ├── topic.py          # Topic models
│   └── evaluation.py     # Evaluation models
├── routes/
│   ├── auth.py           # Authentication endpoints
│   ├── user.py           # User profile endpoints
│   ├── topics.py         # Topic management endpoints
│   ├── debate.py         # Debate session endpoints
│   ├── evaluation.py     # Evaluation endpoints
│   └── leaderboard.py    # Leaderboard endpoints
└── services/
    ├── auth_service.py   # Authentication logic
    └── gemini_service.py # Gemini AI integration
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=debate_assistant
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=your_secure_secret_key_here
```

### 3. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 4. Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

Or use MongoDB Atlas for cloud hosting.

### 5. Run the Application

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, access the interactive API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User Profile
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile

### Topics
- `GET /api/topics/` - List all debate topics
- `POST /api/topics/` - Create custom topic
- `GET /api/topics/{topic_id}` - Get specific topic

### Debate Sessions
- `POST /api/debate/session` - Start new debate session
- `GET /api/debate/session/{session_id}` - Get debate session details
- `POST /api/debate/respond` - Submit candidate response
- `POST /api/debate/session/{session_id}/end` - End debate session
- `GET /api/debate/sessions` - List user's debate sessions

### Evaluation
- `POST /api/evaluation/` - Create evaluation for completed debate
- `GET /api/evaluation/{evaluation_id}` - Get evaluation details
- `GET /api/evaluation/session/{session_id}` - Get evaluation by session
- `GET /api/evaluation/user/all` - Get all user evaluations

### Leaderboard
- `GET /api/leaderboard/` - Get top users leaderboard
- `GET /api/leaderboard/user/{user_id}` - Get specific user rank

## Database Collections

### users
- User account information
- Authentication credentials
- Debate statistics

### topics
- Predefined and custom debate topics
- Usage tracking

### debate_sessions
- Active and completed debates
- Conversation history
- Session metadata

### evaluations
- Debate performance scores
- AI-generated feedback
- Criteria-based evaluation

## How It Works

### 1. Starting a Debate

1. User selects or creates a topic
2. User chooses their stance
3. AI generates opening statement
4. Debate session is created

### 2. Debate Flow

1. Candidate submits spoken response (transcribed)
2. Response is saved to database
3. AI analyzes candidate's argument
4. AI generates counter-argument using Gemini
5. AI response is returned (with text-to-speech ready)

### 3. Evaluation

1. User ends debate session
2. System requests evaluation from Gemini AI
3. AI analyzes all candidate responses
4. Scores calculated for 5 criteria:
   - Argumentation
   - Clarity
   - Evidence
   - Rebuttal
   - Presentation
5. Overall score and feedback generated
6. User statistics updated

## Integration with Frontend

The backend provides REST API endpoints that can be consumed by any frontend application. Key integration points:

1. **Authentication**: Use JWT tokens in Authorization header
2. **Debate Sessions**: WebSocket or polling for real-time updates
3. **Text-to-Speech**: Frontend handles audio playback of AI responses
4. **Speech-to-Text**: Frontend converts candidate speech to text before sending

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black .
```

### Linting

```bash
flake8 .
```

## Production Deployment

1. Set `DEBUG=False` in production
2. Use strong `JWT_SECRET_KEY`
3. Use MongoDB Atlas or managed MongoDB instance
4. Enable HTTPS
5. Set up proper CORS origins
6. Use environment-specific configuration
7. Implement rate limiting
8. Add logging and monitoring

## License

MIT License
