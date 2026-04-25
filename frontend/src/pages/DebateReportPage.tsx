import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Target,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Clock,
  MessageSquare,
  BarChart3,
  Download,
  Share2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/ui/navbar";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface EvaluationData {
  id: string;
  session_id: string;
  user_id: string;
  criteria_scores: {
    argumentation: number;
    clarity: number;
    evidence: number;
    rebuttal: number;
    presentation: number;
  };
  overall_score: number;
  strengths: Array<{
    title: string;
    description: string;
  }>;
  weaknesses: Array<{
    title: string;
    description: string;
  }>;
  improvements: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  missed_points: string[];
  feedback: string;
  ai_analysis: string;
  created_at: string;
}

interface SessionData {
  id: string;
  topic: string;
  category: string;
  difficulty: string;
  description: string;
  duration_seconds: number;
  candidate_message_count: number;
  total_message_count: number;
}

interface DebateReportData {
  session: SessionData;
  evaluation: EvaluationData | null;
}

export default function DebateReportPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { sessionId } = location.state || {};

  const [reportData, setReportData] = useState<DebateReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchReportData = async (retryCount = 0) => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient.get<DebateReportData>(
        `/api/debate/session/${sessionId}/with-evaluation`
      );
      
      // If evaluation is not ready yet, retry once after a delay
      if (!data.evaluation && retryCount < 1) {
        setTimeout(() => fetchReportData(retryCount + 1), 2000);
        return;
      }
      
      setReportData(data);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to load debate report");
    } finally {
      setLoading(false);
    }
  };

  fetchReportData();
}, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Generating your debate report...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {error || "Report data not available"}
          </p>
          <Button onClick={() => navigate("/topics")}>Back to Topics</Button>
        </div>
      </div>
    );
  }

  const { session, evaluation } = reportData;

  const overallScore = evaluation ? Math.round(evaluation.overall_score) : 0;
  const scores = evaluation
    ? {
        argumentation: Math.round(evaluation.criteria_scores.argumentation),
        clarity: Math.round(evaluation.criteria_scores.clarity),
        evidence: Math.round(evaluation.criteria_scores.evidence),
        rebuttal: Math.round(evaluation.criteria_scores.rebuttal),
        presentation: Math.round(evaluation.criteria_scores.presentation),
      }
    : {
        argumentation: 0,
        clarity: 0,
        evidence: 0,
        rebuttal: 0,
        presentation: 0,
      };

  const strengths = evaluation?.strengths || [];
  const weaknesses = evaluation?.weaknesses || [];
  const improvements = evaluation?.improvements || [];
  const missedPoints = evaluation?.missed_points || [];

  // Update the topic display
  const topic = session.topic;

  // Calculate duration from session data
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const timeElapsed = session.duration_seconds;
  const userMessages = session.candidate_message_count;
  const rounds = Math.ceil(session.total_message_count / 2); // Approximate rounds

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreResultLabel = (score: number) => {
    if (score === 10) return "Winner";
    if (score >= 8) return "Almost a winner";
    if (score >= 5) return "Close match";
    return "Lost";
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "advanced":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "expert":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-5xl flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Analyzing Your Debate
            </h2>
            <p className="text-muted-foreground">
              Our AI is evaluating your performance...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Button
            variant="ghost"
            className="mb-6 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/topics")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Topics
          </Button>

          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {error ? "Report Unavailable" : "Evaluation In Progress"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error ||
                "Your debate evaluation is being processed. Please check back in a few moments."}
            </p>
            <Button onClick={() => navigate("/topics")}>Browse Topics</Button>
          </div>
        </div>
      </div>
    );
  }

  // main return statement
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/topics")}
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
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-2">
            "{session.topic}"
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Badge
              variant="outline"
              className={getDifficultyColor(session.difficulty)}
            >
              {session.difficulty}
            </Badge>
            <Badge variant="outline">{session.category}</Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Trophy
                className={`h-8 w-8 mx-auto mb-2 ${getScoreColor(overallScore)}`}
              />
              <div
                className={`text-3xl font-bold ${getScoreColor(overallScore)}`}
              >
                {overallScore}
              </div>
              <div className={`text-sm font-medium ${getScoreColor(overallScore)}`}>
                {getScoreResultLabel(overallScore)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold text-foreground">
                {formatTime(timeElapsed)}
              </div>
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
              <div className="text-3xl font-bold text-foreground">
                {userMessages}
              </div>
              <div className="text-sm text-muted-foreground">
                Arguments Made
              </div>
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
                    <span className="text-foreground capitalize font-medium">
                      {skill}
                    </span>
                    <span className={`font-bold ${getScoreColor(score)}`}>
                      {score}/10
                    </span>
                  </div>
                  <Progress value={(score / 10) * 100} className="h-2" />
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
                  <div
                    key={index}
                    className="p-4 bg-green-500/10 rounded-lg border border-green-500/20"
                  >
                    <h4 className="font-semibold text-foreground mb-1">
                      {strength.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {strength.description}
                    </p>
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
                  <div
                    key={index}
                    className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                  >
                    <h4 className="font-semibold text-foreground mb-1">
                      {weakness.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {weakness.description}
                    </p>
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
                <div
                  key={index}
                  className="p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">
                      {improvement.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={getPriorityColor(improvement.priority)}
                    >
                      {improvement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {improvement.description}
                  </p>
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

        {/* AI Feedback */}
        {evaluation?.feedback && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                AI Feedback
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Personalized analysis of your debate performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">
                  {evaluation.feedback}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Analysis */}
        {evaluation?.ai_analysis && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Deep Analysis
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Detailed breakdown of your debate style and potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">
                  {evaluation.ai_analysis}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
            onClick={() => navigate("/topics")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Topics
          </Button>
          <Button
            className="bg-accent hover:bg-accent-hover text-accent-foreground"
            onClick={() => navigate("/custom-debate")}
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
  );
}
