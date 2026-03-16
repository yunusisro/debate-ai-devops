# Quick Start Guide

Get the Debate Assistant AI backend running in 5 minutes!

## Prerequisites

- Python 3.8 or higher
- MongoDB (local or Atlas)
- Gemini API key

## Step-by-Step Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=debate_assistant
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
JWT_SECRET_KEY=YOUR_SECRET_KEY_HERE
```

### 3. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key to your `.env` file

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URL` in `.env`

### 5. Initialize Database with Topics

```bash
python init_topics.py
```

This creates 12 predefined debate topics.

### 6. Run the Server

```bash
python run.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload
```

### 7. Test the API

Open your browser and go to:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Test with cURL

### Sign Up
```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "username": "testuser"
  }'
```

### Get Topics
```bash
curl -X GET "http://localhost:8000/api/topics/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### "ModuleNotFoundError"
```bash
pip install -r requirements.txt
```

### "Connection refused" (MongoDB)
Make sure MongoDB is running:
```bash
mongod
```

### "Invalid API key" (Gemini)
Check your `.env` file has the correct `GEMINI_API_KEY`

### Port already in use
Change port in `run.py`:
```python
uvicorn.run(..., port=8001)
```

## Next Steps

1. Test all endpoints using Swagger UI at http://localhost:8000/docs
2. Integrate with your frontend application
3. Review `API_USAGE_EXAMPLES.md` for integration examples
4. Check `README.md` for detailed documentation

## Production Deployment

For production:
1. Set `DEBUG=False`
2. Use strong `JWT_SECRET_KEY` (generate with `openssl rand -hex 32`)
3. Enable HTTPS
4. Use managed MongoDB (Atlas)
5. Set appropriate CORS origins in `main.py`
6. Add rate limiting
7. Set up logging and monitoring

## Quick Command Reference

```bash
# Install dependencies
pip install -r requirements.txt

# Initialize topics
python init_topics.py

# Run development server
python run.py

# Run with auto-reload
uvicorn main:app --reload

# Run on custom port
uvicorn main:app --port 8001

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Support

For issues or questions:
1. Check the README.md
2. Review API_USAGE_EXAMPLES.md
3. Check FastAPI docs: https://fastapi.tiangolo.com
4. Check MongoDB docs: https://docs.mongodb.com
