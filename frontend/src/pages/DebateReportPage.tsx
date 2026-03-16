import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Trophy, Target, AlertTriangle, Lightbulb, TrendingUp, Clock, MessageSquare, BarChart3, Download, Share2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/ui/navbar"

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function DebateReportPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const { topic, stance, difficulty, messages, timeElapsed, rounds } = location.state || {
    topic: "Sample Debate Topic",
    stance: "for",
    difficulty: "intermediate",
    messages: [],
    timeElapsed: 300,
    rounds: 5
  }

  // Calculate mock scores and analysis
  const overallScore = 72
  const scores = {
    argumentation: 78,
    evidence: 65,
    rebuttal: 80,
    clarity: 75,
    persuasion: 68
  }

  const strengths = [
    {
      title: "Strong Opening Arguments",
      description: "You effectively established your position with clear reasoning from the start."
    },
    {
      title: "Good Use of Examples",
      description: "Your arguments were supported by relevant real-world examples that strengthened your case."
    },
    {
      title: "Effective Rebuttals",
      description: "You addressed counterarguments directly and provided thoughtful responses."
    }
  ]

  const weaknesses = [
    {
      title: "Limited Statistical Evidence",
      description: "Your arguments could be strengthened with more data and research citations."
    },
    {
      title: "Emotional Appeals",
      description: "Some arguments relied too heavily on emotional reasoning rather than logical analysis."
    }
  ]

  const improvements = [
    {
      title: "Research More Data Points",
      description: "Before debating, gather statistics and studies that support your position.",
      priority: "high"
    },
    {
      title: "Anticipate Counterarguments",
      description: "Prepare responses to likely opposing views before the debate begins.",
      priority: "medium"
    },
    {
      title: "Structure Arguments Better",
      description: "Use the claim-evidence-reasoning framework for each point you make.",
      priority: "medium"
    },
    {
      title: "Practice Active Listening",
      description: "Pay closer attention to opponent's exact words to craft more targeted rebuttals.",
      priority: "low"
    }
  ]

  const missedPoints = [
    "Economic implications of the topic were not adequately addressed",
    "Historical precedents that could have supported your argument",
    "Expert opinions and academic consensus on the matter",
    "Long-term consequences versus short-term benefits analysis",
    "Addressing the ethical dimensions of the opposing view"
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const userMessages = messages?.filter((m: Message) => m.role === 'user') || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/topics')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Topics
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Debate Report</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Performance Analysis
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            "{topic}"
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Trophy className={`h-8 w-8 mx-auto mb-2 ${getScoreColor(overallScore)}`} />
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold text-foreground">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-3xl font-bold text-foreground">{rounds}</div>
              <div className="text-sm text-muted-foreground">Rounds</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold text-foreground">{userMessages.length}</div>
              <div className="text-sm text-muted-foreground">Arguments Made</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Scores */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Skill Breakdown
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Performance across different debate skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(scores).map(([skill, score]) => (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground capitalize font-medium">{skill}</span>
                    <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-400" />
                Your Strengths
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                What you did well in this debate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strengths.map((strength, index) => (
                  <div key={index} className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-semibold text-foreground mb-1">{strength.title}</h4>
                    <p className="text-sm text-muted-foreground">{strength.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Areas to Improve
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Points that need more work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weaknesses.map((weakness, index) => (
                  <div key={index} className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <h4 className="font-semibold text-foreground mb-1">{weakness.title}</h4>
                    <p className="text-sm text-muted-foreground">{weakness.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Improvements */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Recommended Improvements
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Actionable steps to enhance your debate skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {improvements.map((improvement, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{improvement.title}</h4>
                    <Badge variant="outline" className={getPriorityColor(improvement.priority)}>
                      {improvement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{improvement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Missed Points */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Points You Missed
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Important arguments that could have strengthened your position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {missedPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="border-border text-foreground hover:bg-muted"
            onClick={() => navigate('/topics')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Topics
          </Button>
          <Button 
            className="bg-accent hover:bg-accent-hover text-accent-foreground"
            onClick={() => navigate('/custom-debate')}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Debate
          </Button>
          <Button 
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button 
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  )
}
