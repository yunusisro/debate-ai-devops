import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Sparkles, MessageSquare, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/ui/navbar"
import { apiClient } from "@/lib/api"

const suggestedTopics = [
  "Should genetic engineering be used to enhance human abilities?",
  "Is cryptocurrency the future of global finance?",
  "Should voting be mandatory in democracies?",
  "Is cancel culture beneficial for society?",
]

export default function CustomDebatePage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")
  const [stance, setStance] = useState("")
  const [difficulty, setDifficulty] = useState("")
  // add near other state
  const [category, setCategory] = useState("General")

  const categories = [
    "General",
    "Technology",
    "Politics",
    "Environment",
    "Business",
    "Sports",
    "Economics",
    "Science",
    "Ethics",
    "Philosophy",
  ]

  const handleStartDebate = async () => {
    if (topic.trim()) {
      // Saving to the database 
      await apiClient.post("/api/topics", {
        title: topic.trim(),
        description: description.trim(),
        category,
        difficulty: difficulty.trim(),
        participants: 0,
      })

      navigate('/debate', {
        state: {
          topic: topic.trim(),
          description: description.trim(),
          stance,
          difficulty,
          isCustom: true
        }
      })
    }
  }

  const handleSuggestedTopic = (suggestedTopic: string) => {
    setTopic(suggestedTopic)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
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
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Custom Debate</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Create Your Own Debate
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter any topic you'd like to debate and challenge our AI opponent
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Debate Topic
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter a topic you want to argue about. Be specific for better debate quality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-foreground font-medium">
                Your Debate Topic
              </Label>
              <Textarea
                id="topic"
                placeholder="e.g., Should artificial intelligence be granted legal rights?"
                className="min-h-[50px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </CardContent>

          {/* Topic Description  */}
          <CardHeader className="mt-[-30px]">
            <CardTitle className="text-foreground text-sm">
              Topic Description
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter a description of the topic you want to argue about. Be specific for better debate quality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-medium">
                Your Debate Topic Description
              </Label>
              <Textarea
                id="description"
                placeholder="Your Description goes here..."
                className="min-h-[100px] bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Stance Selection */}
            <div className="space-y-2">
              <Label htmlFor="stance" className="text-foreground font-medium">
                Your Stance
              </Label>
              <Select value={stance} onValueChange={setStance}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Choose your position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="for">For (Supporting the topic)</SelectItem>
                  <SelectItem value="against">Against (Opposing the topic)</SelectItem>
                  <SelectItem value="neutral">Let AI assign a stance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection  */}

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground font-medium">
                Topic Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-foreground font-medium">
                AI Difficulty Level
              </Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - Gentle arguments</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Balanced challenge</SelectItem>
                  <SelectItem value="advanced">Advanced - Tough opponent</SelectItem>
                  <SelectItem value="expert">Expert - No mercy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Button */}
            <Button
              className="w-full bg-accent hover:bg-accent-hover text-accent-foreground font-semibold py-6 text-lg"
              onClick={handleStartDebate}
              disabled={!topic.trim()}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Start Debate
            </Button>
          </CardContent>
        </Card>

        {/* Suggested Topics */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Need Inspiration?
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Click on any topic below to use it as your debate subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {suggestedTopics.map((suggestedTopic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 border-border text-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => handleSuggestedTopic(suggestedTopic)}
                >
                  <span className="text-muted-foreground mr-3">{index + 1}.</span>
                  {suggestedTopic}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
