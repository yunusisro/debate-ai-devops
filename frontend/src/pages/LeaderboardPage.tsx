import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Trophy, Medal, Award, Crown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ThemeToggle } from "@/components/theme-toggle"

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, name: "Alex Chen", wins: 89, debates: 102, points: 2840 },
  { rank: 2, name: "Sarah Kim", wins: 76, debates: 95, points: 2650 },
  { rank: 3, name: "Marcus Johnson", wins: 71, debates: 88, points: 2480 },
  { rank: 4, name: "Emma Wilson", wins: 68, debates: 85, points: 2320 },
  { rank: 5, name: "David Rodriguez", wins: 65, debates: 82, points: 2180 },
  { rank: 6, name: "Lily Zhang", wins: 62, debates: 79, points: 2050 },
  { rank: 7, name: "James Miller", wins: 58, debates: 76, points: 1920 },
  { rank: 8, name: "Maya Patel", wins: 55, debates: 73, points: 1800 },
  { rank: 9, name: "Noah Brown", wins: 52, debates: 70, points: 1680 },
  { rank: 10, name: "Zoe Davis", wins: 49, debates: 67, points: 1560 }
]

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const [timeFrame, setTimeFrame] = useState("all-time")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400 dark:text-gray-300" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600 dark:text-amber-500" />
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const variant = rank === 1 ? "default" : rank === 2 ? "secondary" : "outline"
      return (
        <Badge variant={variant} className="flex items-center gap-1">
          {getRankIcon(rank)}
          #{rank}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {getRankIcon(rank)}
        #{rank}
      </Badge>
    )
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
              <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
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
            <h2 className="text-4xl font-bold">
              Top Debaters
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how you rank against other debate enthusiasts. Climb the leaderboard by winning debates and engaging with the community.
            </p>
          </div>

          {/* Top 3 Podium */}
          <Card className="card-gradient border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leaderboardData.slice(0, 3).map((user, index) => (
                  <div key={user.rank} className={`text-center space-y-4 ${index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'}`}>
                    <div className="relative">
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center ${
                        user.rank === 1 
                          ? 'from-yellow-400 to-yellow-600 dark:from-yellow-300 dark:to-yellow-500' 
                          : user.rank === 2 
                          ? 'from-gray-300 to-gray-500 dark:from-gray-400 dark:to-gray-600'
                          : 'from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600'
                      }`}>
                        {getRankIcon(user.rank)}
                      </div>
                      <Badge className="absolute -top-2 -right-2">#{user.rank}</Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.points} points</p>
                      <p className="text-sm text-muted-foreground">{user.wins}/{user.debates} wins</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Frame Tabs */}
          <Tabs value={timeFrame} onValueChange={setTimeFrame} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="all-time">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value={timeFrame} className="space-y-4">
              {/* Full Leaderboard Table */}
              <Card className="card-gradient border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Full Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="w-20">Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-center">Wins</TableHead>
                        <TableHead className="text-center">Debates</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboardData.map((user) => (
                        <TableRow 
                          key={user.rank} 
                          className={`border-border hover:bg-secondary/50 transition-colors ${
                            user.rank <= 3 ? 'bg-accent/5 dark:bg-accent/10' : ''
                          }`}
                        >
                          <TableCell className="font-medium">
                            {getRankBadge(user.rank)}
                          </TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-center font-medium text-accent">
                            {user.wins}
                          </TableCell>
                          <TableCell className="text-center">{user.debates}</TableCell>
                          <TableCell className="text-center font-bold text-primary">
                            {user.points.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="card-gradient border-border/50 shadow-card text-center">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Join the Competition?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start debating now and climb your way to the top of the leaderboard!
              </p>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent-hover text-accent-foreground font-semibold"
                onClick={() => navigate('/topics')}
              >
                Start Debating
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}