import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MessageSquare, Users, Target, Award, Lightbulb, Rocket } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-foreground">About DebateAI</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Empowering Debaters Worldwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              DebateAI is your intelligent companion for mastering the art of persuasive argumentation through AI-powered practice and feedback.
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="card-gradient border-border/50 shadow-card">
            <CardContent className="py-8 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We believe that effective communication and critical thinking are essential skills for success in the modern world. 
                DebateAI was created to make debate practice accessible, engaging, and personalized for everyone—from students 
                preparing for competitions to professionals sharpening their persuasion skills.
              </p>
            </CardContent>
          </Card>

          {/* Core Values */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-center text-foreground">What We Stand For</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="card-gradient border-border/50 shadow-card hover:shadow-lg transition-all">
                <CardContent className="pt-6 space-y-3 text-center">
                  <div className="rounded-lg bg-accent/10 p-3 w-fit mx-auto">
                    <Lightbulb className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-bold text-foreground">Innovation</h4>
                  <p className="text-sm text-muted-foreground">
                    Leveraging cutting-edge AI to create personalized debate experiences.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-border/50 shadow-card hover:shadow-lg transition-all">
                <CardContent className="pt-6 space-y-3 text-center">
                  <div className="rounded-lg bg-primary/10 p-3 w-fit mx-auto">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground">Community</h4>
                  <p className="text-sm text-muted-foreground">
                    Building a supportive network of debaters learning and growing together.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-border/50 shadow-card hover:shadow-lg transition-all">
                <CardContent className="pt-6 space-y-3 text-center">
                  <div className="rounded-lg bg-accent/10 p-3 w-fit mx-auto">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-bold text-foreground">Excellence</h4>
                  <p className="text-sm text-muted-foreground">
                    Committed to helping you achieve your highest potential as a debater.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <Card className="card-gradient border-border/50 shadow-card">
            <CardContent className="py-8 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">How DebateAI Works</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Choose Your Topic</h4>
                    <p className="text-muted-foreground text-sm">
                      Select from hundreds of debate topics across various categories, or create your own custom debate.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Engage with AI</h4>
                    <p className="text-muted-foreground text-sm">
                      Practice your arguments against our intelligent AI opponent that adapts to your skill level.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Receive Feedback</h4>
                    <p className="text-muted-foreground text-sm">
                      Get instant, detailed feedback on your arguments, logic, and persuasion techniques.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Track Progress</h4>
                    <p className="text-muted-foreground text-sm">
                      Monitor your improvement over time and compete on the leaderboard with debaters worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="card-gradient border-border/50 shadow-card text-center">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Transform Your Debate Skills?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Join thousands of debaters who are already improving their argumentation skills with DebateAI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent-hover text-accent-foreground font-semibold"
                  onClick={() => navigate('/signup')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Get Started Free
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/topics')}
                >
                  Explore Topics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
