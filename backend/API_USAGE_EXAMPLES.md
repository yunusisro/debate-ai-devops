# API Usage Examples

This document provides examples of how to interact with the Debate Assistant AI backend API.

## Base URL

```
http://localhost:8000
```

## Authentication

### Sign Up

```javascript
const response = await fetch('http://localhost:8000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123',
    username: 'debater123',
    full_name: 'John Doe'
  })
});

const data = await response.json();
// data = { access_token: "...", token_type: "bearer" }
```

### Login

```javascript
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123'
  })
});

const data = await response.json();
const token = data.access_token;
```

## User Profile

### Get Profile

```javascript
const response = await fetch('http://localhost:8000/api/user/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const profile = await response.json();
```

### Update Profile

```javascript
const response = await fetch('http://localhost:8000/api/user/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'newusername',
    full_name: 'John Smith'
  })
});

const updatedProfile = await response.json();
```

## Topics

### Get All Topics

```javascript
const response = await fetch('http://localhost:8000/api/topics/?limit=20&skip=0', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const { topics, total } = await response.json();
```

### Create Custom Topic

```javascript
const response = await fetch('http://localhost:8000/api/topics/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'My Custom Debate Topic',
    description: 'A detailed description',
    category: 'Custom'
  })
});

const newTopic = await response.json();
```

## Debate Sessions

### Start New Debate

```javascript
const response = await fetch('http://localhost:8000/api/debate/session', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    topic: 'Artificial Intelligence will replace most human jobs',
    custom_topic: false,
    ai_stance: 'FOR',
    candidate_stance: 'AGAINST'
  })
});

const session = await response.json();
// session contains initial AI opening statement
```

### Submit Candidate Response

```javascript
// After candidate speaks, convert speech to text using Web Speech API or similar
const candidateText = "I believe that AI will create more jobs than it replaces...";

const response = await fetch('http://localhost:8000/api/debate/respond', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    session_id: session.id,
    content: candidateText
  })
});

const aiResponse = await response.json();
// aiResponse = { ai_message: "...", audio_url: null }

// Convert AI response to speech using Text-to-Speech API
speakText(aiResponse.ai_message);
```

### Get Debate Session

```javascript
const response = await fetch(`http://localhost:8000/api/debate/session/${sessionId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const session = await response.json();
// session contains full conversation history
```

### End Debate Session

```javascript
const response = await fetch(`http://localhost:8000/api/debate/session/${sessionId}/end`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const result = await response.json();
```

### Get All User Sessions

```javascript
const response = await fetch('http://localhost:8000/api/debate/sessions?limit=10&skip=0', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const sessions = await response.json();
```

## Evaluation

### Create Evaluation

```javascript
const response = await fetch('http://localhost:8000/api/evaluation/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    session_id: sessionId
  })
});

const evaluation = await response.json();
/*
evaluation = {
  id: "...",
  criteria_scores: {
    argumentation: 8.5,
    clarity: 7.0,
    evidence: 8.0,
    rebuttal: 7.5,
    presentation: 8.0
  },
  overall_score: 7.8,
  strengths: ["Strong logical reasoning", "Good use of examples"],
  weaknesses: ["Could improve rebuttal technique"],
  feedback: "Overall excellent performance...",
  ai_analysis: "Detailed analysis..."
}
*/
```

### Get Evaluation by Session

```javascript
const response = await fetch(`http://localhost:8000/api/evaluation/session/${sessionId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const evaluation = await response.json();
```

### Get All User Evaluations

```javascript
const response = await fetch('http://localhost:8000/api/evaluation/user/all?limit=10&skip=0', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const evaluations = await response.json();
```

## Leaderboard

### Get Leaderboard

```javascript
const response = await fetch('http://localhost:8000/api/leaderboard/?limit=50', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const leaderboard = await response.json();
/*
leaderboard = [
  {
    user_id: "...",
    username: "debater123",
    total_debates: 15,
    average_score: 8.2,
    highest_score: 9.5,
    rank: 1
  },
  ...
]
*/
```

### Get User Rank

```javascript
const response = await fetch(`http://localhost:8000/api/leaderboard/user/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const userRank = await response.json();
```

## Complete Debate Flow Example

```javascript
// 1. User logs in
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { access_token } = await loginResponse.json();

// 2. Get available topics
const topicsResponse = await fetch('http://localhost:8000/api/topics/', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const { topics } = await topicsResponse.json();

// 3. Start debate session
const sessionResponse = await fetch('http://localhost:8000/api/debate/session', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    topic: topics[0].title,
    custom_topic: false,
    ai_stance: 'FOR',
    candidate_stance: 'AGAINST'
  })
});
const session = await sessionResponse.json();

// 4. Display AI's opening statement
console.log('AI:', session.messages[0].content);
speakText(session.messages[0].content);

// 5. Candidate responds (speech-to-text)
const candidateText = await captureVoiceInput();

// 6. Submit response and get AI counter-argument
const responseResult = await fetch('http://localhost:8000/api/debate/respond', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    session_id: session.id,
    content: candidateText
  })
});
const aiResponse = await responseResult.json();

// 7. Display and speak AI response
console.log('AI:', aiResponse.ai_message);
speakText(aiResponse.ai_message);

// 8. Repeat steps 5-7 for multiple rounds

// 9. End debate session
await fetch(`http://localhost:8000/api/debate/session/${session.id}/end`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${access_token}` }
});

// 10. Get evaluation
const evalResponse = await fetch('http://localhost:8000/api/evaluation/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ session_id: session.id })
});
const evaluation = await evalResponse.json();

// 11. Display results
console.log('Overall Score:', evaluation.overall_score);
console.log('Strengths:', evaluation.strengths);
console.log('Weaknesses:', evaluation.weaknesses);
console.log('Feedback:', evaluation.feedback);
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found
- `500` - Internal Server Error

Example error response:
```json
{
  "detail": "Error message here"
}
```

Always check response status and handle errors appropriately:

```javascript
const response = await fetch(url, options);

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.detail || 'Request failed');
}

const data = await response.json();
```
