import { useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, MessageSquare, Users, TrendingUp, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"

const categories = ["All", "Technology", "Politics", "Environment", "Business", "Sports", "Economics", "Science", "Ethics", "Philosophy"]


type Topic = {
  id: string,
  title: string,
  description?: string,
  category: string,
  difficulty: string,
  participants: number,
  usage_count:  number
}

export default function TopicsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [topics, setTopics] = useState<Topic[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    ;(async () => {
      try {
        const res = await apiClient.get<{ topics: Topic[]; total: number }>("/api/topics")
        setTopics(res.topics || [])
      } catch (e: any) {
        toast({
          title: "Failed to load topics",
          description: e?.message || "Please login and try again.",
          variant: "destructive",
        })
      }
    })()
  }, [])

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "All" || t.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [topics, searchTerm, selectedCategory])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

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
              <h1 className="text-2xl font-bold text-foreground">Debate Topics</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">
              Explore Debate Topics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover fascinating topics across various categories. Join ongoing debates or start new discussions on subjects that matter to you.
            </p>
          </div>

          {/* Search Bar */}
          <Card className="card-gradient border-border/50 shadow-card">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base focus:ring-primary focus:border-primary dark:focus:ring-2 dark:focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "hover:bg-secondary border-border"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="card-gradient border-border/50 shadow-card hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="space-y-3">
                  {/* <div className="flex items-start justify-between">
                    <Badge variant="outline" className="text-xs">
                      {topic.category}
                    </Badge>
                    {topic.trending && (
                      <Badge className="bg-accent text-accent-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </Badge>
                    )}
                  </div> */}
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {topic.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {topic.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {topic.participants} participants
                    </div>
                    <Badge className={getDifficultyColor(topic.difficulty)}>
                      {topic.difficulty}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full bg-accent hover:bg-accent-hover text-accent-foreground font-semibold"
                    onClick={() => navigate('/debate', { 
                      state: { 
                        topic: topic.title,
                        description: topic.description,
                        stance: 'for', 
                        difficulty: topic.difficulty.toLowerCase(),
                        isCustom: false 
                      } 
                    })}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Debate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredTopics.length === 0 && (
            <Card className="card-gradient border-border/50 shadow-card text-center">
              <CardContent className="py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No topics found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or category filter.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("All")
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="card-gradient border-border/50 shadow-card text-center">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">Don't see your topic?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Suggest a new debate topic or start a custom discussion with our AI assistant.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  className="hover:bg-secondary"
                  onClick={() => toast({
                    title: "Coming Soon!",
                    description: "Topic suggestions will be available in a future update.",
                  })}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Suggest Topic
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
                  onClick={() => navigate('/custom-debate')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Custom Debate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}