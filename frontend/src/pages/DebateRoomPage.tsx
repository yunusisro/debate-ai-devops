import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Send, Bot, User, Clock, Flag, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/ui/navbar"
import { apiClient } from "@/lib/api"

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function DebateRoomPage() {
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { topicId, topic, stance, difficulty, isCustom, description, category } = location.state || {}
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [debateRound, setDebateRound] = useState(1)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const maxRounds = 5


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ✅ timer
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed((p) => p + 1), 1000)
    return () => clearInterval(timer)
  }, [])
  
  // Auto-scroll to bottom
  useEffect(() => {
    ;(async () => {
      try {
        const candidate_stance = stance === "neutral" ? "for" : stance
        const ai_stance = candidate_stance === "for" ? "against" : "for"

        const session = await apiClient.post<any>("/api/debate/session", {
          topic,
          topic_id: topicId,
          custom_topic: !!isCustom,
          ai_stance,
          candidate_stance,
          description,
          category,
          difficulty,
        })

        setSessionId(session.id)
        const opening = session.messages?.[0]?.content || "Let’s begin."
        setMessages([{ id: 1, role: "ai", content: opening, timestamp: new Date() }])
      } catch (e) {
        // optional: navigate to login or show toast
        console.error(e)
      }
    })()
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  // Simulated AI responses based on difficulty
  const getAIResponse = (userMessage: string): string => {
    const responses = [
      `That's an interesting point about "${userMessage.slice(0, 50)}...". However, consider this counter-argument: The evidence suggests that while your perspective has merit, there are significant factors you may not have considered. Studies show that the opposing view has substantial backing in academic literature.`,
      `I appreciate your argument, but let me challenge that assumption. The data indicates that the situation is more nuanced than you've presented. Furthermore, historical precedents suggest a different outcome than what you're proposing.`,
      `While I understand your position, there are critical flaws in that reasoning. First, the premise relies on assumptions that haven't been proven. Second, similar arguments have been made before and were found to be incomplete when examined under scrutiny.`,
      `That's a compelling point. However, I'd like to present an alternative perspective. The consequences of your proposed stance could lead to unintended outcomes that might actually contradict your original goals. Let me explain why...`,
      `Your argument raises valid concerns, but overlooks key evidence. Recent research contradicts some of your core assumptions. Additionally, experts in this field have noted that the approach you're advocating has significant limitations.`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return
    const content = inputMessage.trim()

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", content, timestamp: new Date() },
    ])
    setInputMessage("")
    setIsTyping(true)

    const res = await apiClient.post<{ ai_message: string }>("/api/debate/respond", {
      session_id: sessionId,
      content,
    })

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "ai", content: res.ai_message, timestamp: new Date() },
    ])
    setIsTyping(false)

    // ✅ keep your round progress UI working
    setDebateRound((r) => Math.min(r + 1, maxRounds))
  }


const handleEndDebate = async () => {
  if (!sessionId) return;
  
  try {
    // End the debate session
    await apiClient.post(`/api/debate/session/${sessionId}/end`);
    
    // Create evaluation
    await apiClient.post("/api/evaluation", {
      session_id: sessionId,
    });
    
    // Navigate to report page with session ID
    navigate('/debate-report', {
      state: {
        sessionId,
        topic,
        stance,
        difficulty,
        messages,
        timeElapsed,
        rounds: debateRound
      }
    });
  } catch (error) {
    console.error("Error ending debate:", error);
    // Still navigate to report even if evaluation fails
    navigate('/debate-report', {
      state: {
        sessionId,
        topic,
        stance,
        difficulty,
        messages,
        timeElapsed,
        rounds: debateRound
      }
    });
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Debate Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/topics')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground line-clamp-1">
                  {topic}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getDifficultyColor(difficulty)}>
                    {difficulty || 'Intermediate'}
                  </Badge>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {stance === 'for' ? 'Supporting' : stance === 'against' ? 'Opposing' : 'Open'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Round {debateRound}/{maxRounds}</span>
                <Progress value={(debateRound / maxRounds) * 100} className="w-20 h-2" />
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleEndDebate}
              >
                <Flag className="h-4 w-4 mr-2" />
                End Debate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'ai' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-accent/20 text-accent'
                }`}>
                  {message.role === 'ai' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <Card className={`max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-accent/10 border-accent/30' 
                    : 'bg-card border-border'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">
                        {message.role === 'ai' ? 'AI Opponent' : 'You'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">AI Opponent</span>
                      <span className="text-muted-foreground">is thinking...</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              className={`flex-shrink-0 ${isRecording ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-border'}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Textarea
              placeholder="Type your argument..."
              className="min-h-[60px] max-h-[150px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping || debateRound > maxRounds}
            />
            <Button 
              className="flex-shrink-0 bg-accent hover:bg-accent-hover text-accent-foreground"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping || debateRound > maxRounds}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          {debateRound >= maxRounds && (
            <p className="text-center text-muted-foreground text-sm mt-3">
              Maximum rounds reached. Click "End Debate" to see your report.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
