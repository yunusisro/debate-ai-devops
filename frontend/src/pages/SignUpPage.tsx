import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import debateLightImage from "@/assets/debate-light.jpg"
import debateDarkImage from "@/assets/debate-dark.jpg"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { handleApiError } from "@/utils/errorHandling"

export default function SignUpPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { signup, isLoading } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const debateImage = theme === 'dark' ? debateDarkImage : debateLightImage

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    //Validate email
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }
    try {
      await signup(
        formData.email,
        formData.password,
        formData.username,
        formData.name || undefined // full_name is optional
      )
      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      })
      navigate('/topics') // Redirect to topics page
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: handleApiError(error),
        variant: "destructive",
      })
    }
  }

// to block access to signup page if user is already logged in
  const { user } = useAuth()
  //redirect to homepage if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])


  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-12">
        <div className="max-w-lg text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl dark:from-primary/10 dark:to-accent/10" />
            <img
              src={debateImage}
              alt="People debating illustration"
              className="relative rounded-3xl shadow-card dark:shadow-neon w-full h-auto animate-float"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Join the Debate Revolution
            </h2>
            <p className="text-lg text-foreground/80 leading-relaxed">
              Connect with AI and fellow debaters to sharpen your argumentation skills and explore new perspectives.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign up form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <ThemeToggle />
          </div>

          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="rounded-lg bg-primary p-3">
                <MessageSquare className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DebateAI
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Create your account</h1>
              <p className="text-foreground/70">
                Start your debate journey today
              </p>
            </div>
          </div>

          {/* Sign up form */}
          <Card className="card-gradient border-border/50 shadow-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
              <CardDescription className="text-center">
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-12 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-2 dark:focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="h-12 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-2 dark:focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-2 dark:focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-2 dark:focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-12 rounded-lg focus:ring-primary focus:border-primary dark:focus:ring-2 dark:focus:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  variant="hero"
                >
                  Sign Up
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="submit" 
                className="w-full h-12 text-lg" 
                variant="hero"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-primary hover:underline transition-colors"
                >
                  Log in
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
