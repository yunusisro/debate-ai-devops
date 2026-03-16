import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/ui/navbar"
import { MessageSquare, Zap, BookOpen, Trophy, ArrowRight, Users, Brain, Target } from "lucide-react"
import { useNavigate } from "react-router-dom"
import debateLightImage from "@/assets/ai-human-debate-light.jpg"
import debateDarkImage from "@/assets/ai-human-debate-dark.jpg"
import { useTheme } from "@/components/theme-provider"

export default function HomePage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const debateImage = theme === 'dark' ? debateDarkImage : debateLightImage

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-20">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-foreground drop-shadow-sm">
                  Sharpen Your{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-none">
                    Debate Skills
                  </span>{" "}
                  with AI
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed drop-shadow-sm">
                  Practice arguments, explore perspectives, and master the art of persuasion with our intelligent debate companion.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-accent hover:bg-accent-hover text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate('/login')}
                >
                  Start a Debate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate('/topics')}
                >
                  Explore Arguments
                </Button>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl dark:from-primary/10 dark:to-accent/10" />
              <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-background/90 dark:to-background/70 rounded-3xl p-4 backdrop-blur-sm">
                <img 
                  src={debateImage}
                  alt="AI and human debating"
                  className="rounded-2xl shadow-card dark:shadow-neon w-full h-auto animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Master Every Argument
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform offers everything you need to become a confident and persuasive debater.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-card dark:hover:shadow-glow transition-all duration-300 hover:-translate-y-2 card-gradient border-border/50">
              <CardHeader>
                <div className="rounded-lg bg-primary/10 p-3 w-fit group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">Quick Debate</CardTitle>
                <CardDescription className="text-base text-foreground/70 leading-relaxed">
                  Jump into instant AI-powered debates on any topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                  Start Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-card dark:hover:shadow-glow transition-all duration-300 hover:-translate-y-2 card-gradient border-border/50">
              <CardHeader>
                <div className="rounded-lg bg-accent/10 p-3 w-fit group-hover:bg-accent/20 transition-colors">
                  <BookOpen className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl font-semibold">Topic Library</CardTitle>
                <CardDescription className="text-base text-foreground/70 leading-relaxed">
                  Explore trending debates and curated argument collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-accent/10"
                  onClick={() => navigate('/topics')}
                >
                  Browse Topics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-card dark:hover:shadow-glow transition-all duration-300 hover:-translate-y-2 card-gradient border-border/50">
              <CardHeader>
                <div className="rounded-lg bg-primary/10 p-3 w-fit group-hover:bg-primary/20 transition-colors">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">Saved Debates</CardTitle>
                <CardDescription className="text-base text-foreground/70 leading-relaxed">
                  Review your past debates and track your improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-primary/10"
                  onClick={() => navigate('/leaderboard')}
                >
                  View Leaderboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Users className="h-8 w-8 text-primary mr-2" />
                <span className="text-4xl font-bold text-primary">10K+</span>
              </div>
              <p className="text-base text-foreground/70">Active Debaters</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Brain className="h-8 w-8 text-accent mr-2" />
                <span className="text-4xl font-bold text-accent">50K+</span>
              </div>
              <p className="text-base text-foreground/70">Debates Completed</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Target className="h-8 w-8 text-primary mr-2" />
                <span className="text-4xl font-bold text-primary">95%</span>
              </div>
              <p className="text-base text-foreground/70">Skill Improvement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/20 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="rounded-lg bg-primary p-2">
                  <MessageSquare className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">DebateAI</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                Empowering minds through intelligent debate and discussion.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Platform</h4>
              <div className="space-y-2 text-foreground/70">/
                <p className="hover:text-foreground cursor-pointer transition-colors">Features</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Pricing</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">API</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <div className="space-y-2 text-foreground/70">/
                <p className="hover:text-foreground cursor-pointer transition-colors">Help Center</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Tutorials</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Community</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-foreground/70">/
                <p className="hover:text-foreground cursor-pointer transition-colors">About</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Blog</p>
                <p className="hover:text-foreground cursor-pointer transition-colors">Contact</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-foreground/60">/
            <p>&copy; 2025 DebateAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}