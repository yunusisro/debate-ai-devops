# Backend Structure Overview

## Directory Structure

```
backend/
├── main.py                          # FastAPI application entry point
├── run.py                           # Application runner with lifecycle management
├── config.py                        # Configuration and environment settings
├── utils.py                         # Common utility functions
├── init_topics.py                   # Database initialization script
│
├── database/
│   ├── __init__.py
│   └── connection.py                # MongoDB connection management
│
├── models/                          # Pydantic models for validation
│   ├── __init__.py
│   ├── user.py                      # User-related models
│   ├── debate.py                    # Debate session models
│   ├── topic.py                     # Topic models
│   └── evaluation.py                # Evaluation and leaderboard models
│
├── routes/                          # API endpoints
│   ├── __init__.py
│   ├── auth.py                      # Authentication endpoints
│   ├── user.py                      # User profile endpoints
│   ├── topics.py                    # Topic management endpoints
│   ├── debate.py                    # Debate session endpoints
│   ├── evaluation.py                # Evaluation endpoints
│   └── leaderboard.py               # Leaderboard endpoints
│
├── services/                        # Business logic
│   ├── __init__.py
│   ├── auth_service.py              # JWT and password handling
│   └── gemini_service.py            # Gemini AI integration
│
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── Dockerfile                       # Docker container definition
├── docker-compose.yml               # Docker Compose configuration
│
└── Documentation/
    ├── README.md                    # Main documentation
    ├── QUICKSTART.md                # Quick setup guide
    ├── API_USAGE_EXAMPLES.md        # API integration examples
    └── STRUCTURE.md                 # This file
```

## Component Responsibilities

### Core Application

- **main.py**: FastAPI app initialization, middleware setup, router registration
- **run.py**: Server startup with database connection lifecycle
- **config.py**: Centralized configuration using Pydantic Settings

### Database Layer

- **database/connection.py**:
  - MongoDB client management
  - Connection pooling
  - Startup/shutdown handlers

### Data Models

- **models/user.py**: User registration, login, profile models
- **models/debate.py**: Debate sessions, messages, status enums
- **models/topic.py**: Topic creation and listing
- **models/evaluation.py**: Scoring criteria, evaluation results, leaderboard

### API Routes

- **routes/auth.py**:
  - POST /api/auth/signup
  - POST /api/auth/login
  - User authentication dependency

- **routes/user.py**:
  - GET /api/user/profile
  - PUT /api/user/profile

- **routes/topics.py**:
  - GET /api/topics/
  - POST /api/topics/
  - GET /api/topics/{topic_id}

- **routes/debate.py**:
  - POST /api/debate/session
  - POST /api/debate/respond
  - GET /api/debate/session/{session_id}
  - POST /api/debate/session/{session_id}/end
  - GET /api/debate/sessions

- **routes/evaluation.py**:
  - POST /api/evaluation/
  - GET /api/evaluation/{evaluation_id}
  - GET /api/evaluation/session/{session_id}
  - GET /api/evaluation/user/all

- **routes/leaderboard.py**:
  - GET /api/leaderboard/
  - GET /api/leaderboard/user/{user_id}

### Business Services

- **services/auth_service.py**:
  - Password hashing with bcrypt
  - JWT token creation and validation
  - Authentication utilities

- **services/gemini_service.py**:
  - AI argument generation
  - Opening statement creation
  - Debate evaluation and scoring
  - Response parsing and error handling

### Utilities

- **utils.py**: Common helper functions for MongoDB document serialization

### Scripts

- **init_topics.py**: Populates database with 12 predefined debate topics

## Data Flow

### Authentication Flow
```
Client → POST /api/auth/signup
  ↓
routes/auth.py
  ↓
services/auth_service.py (hash password)
  ↓
MongoDB users collection
  ↓
Return JWT token
```

### Debate Flow
```
Client → POST /api/debate/session
  ↓
routes/debate.py
  ↓
services/gemini_service.py (generate opening)
  ↓
MongoDB debate_sessions collection
  ↓
Return session with AI opening statement
  ↓
Client → POST /api/debate/respond (candidate speaks)
  ↓
routes/debate.py
  ↓
services/gemini_service.py (generate counter-argument)
  ↓
MongoDB (save both messages)
  ↓
Return AI response for text-to-speech
```

### Evaluation Flow
```
Client → POST /api/evaluation/
  ↓
routes/evaluation.py
  ↓
Fetch debate session from MongoDB
  ↓
services/gemini_service.py (analyze performance)
  ↓
Calculate scores
  ↓
MongoDB evaluations collection
  ↓
Update user statistics
  ↓
Return detailed evaluation
```

## Database Collections

### users
```javascript
{
  _id: ObjectId,
  email: string,
  username: string,
  full_name: string?,
  hashed_password: string,
  created_at: datetime,
  total_debates: number,
  avg_score: float
}
```

### topics
```javascript
{
  _id: ObjectId,
  title: string,
  description: string?,
  category: string,
  created_at: datetime,
  usage_count: number,
  created_by: ObjectId?
}
```

### debate_sessions
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  topic: string,
  custom_topic: boolean,
  ai_stance: string,
  candidate_stance: string,
  status: "active" | "completed" | "abandoned",
  messages: [{
    speaker: "ai" | "candidate",
    content: string,
    timestamp: datetime,
    audio_url: string?
  }],
  created_at: datetime,
  ended_at: datetime?,
  evaluation_id: ObjectId?
}
```

### evaluations
```javascript
{
  _id: ObjectId,
  session_id: ObjectId,
  user_id: ObjectId,
  criteria_scores: {
    argumentation: float,
    clarity: float,
    evidence: float,
    rebuttal: float,
    presentation: float
  },
  overall_score: float,
  strengths: [string],
  weaknesses: [string],
  feedback: string,
  ai_analysis: string,
  created_at: datetime
}
```

## Dependencies

### Core
- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **motor**: Async MongoDB driver
- **pydantic**: Data validation

### Authentication
- **python-jose**: JWT handling
- **passlib**: Password hashing

### AI
- **google-generativeai**: Gemini API client

### Utilities
- **python-dotenv**: Environment variables
- **python-multipart**: Form data parsing

## Environment Variables

Required:
- `MONGODB_URL`: MongoDB connection string
- `GEMINI_API_KEY`: Google Gemini API key
- `JWT_SECRET_KEY`: Secret for JWT signing

Optional:
- `DATABASE_NAME`: Database name (default: debate_assistant)
- `JWT_ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiry (default: 30)

## API Response Formats

### Success Response
```json
{
  "id": "...",
  "field1": "value1",
  "field2": "value2"
}
```

### Error Response
```json
{
  "detail": "Error message describing what went wrong"
}
```

## Security Features

1. **Password Security**: Bcrypt hashing
2. **Authentication**: JWT tokens with expiry
3. **Authorization**: User ownership verification
4. **CORS**: Configurable allowed origins
5. **Input Validation**: Pydantic models
6. **MongoDB Injection**: Parameterized queries via Motor

## Scalability Considerations

- Async/await throughout for high concurrency
- MongoDB connection pooling
- Stateless API design
- Horizontal scaling ready
- Dockerized for easy deployment

## Future Enhancements

- WebSocket support for real-time debate
- Audio file storage (S3/Cloud Storage)
- Rate limiting per user
- Advanced analytics
- Multi-language support
- Voice emotion analysis
- Debate tournaments
- Social features (followers, sharing)
