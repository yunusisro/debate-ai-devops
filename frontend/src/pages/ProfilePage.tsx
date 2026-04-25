import { apiClient } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Navbar } from "@/components/ui/navbar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userService, DebateHistoryItem } from "@/services/userService";
import {
  User,
  Trophy,
  History,
  Settings,
  Bell,
  Shield,
  Mic,
  Volume2,
  ArrowLeft,
  Edit2,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Target,
} from "lucide-react";


const mockSettings = {
  notifications: {
    debateReminders: true,
    weeklyReports: true,
    leaderboardUpdates: false,
  },
  voice: {
    speechToText: true,
    textToSpeech: true,
    voiceSpeed: 1.0,
  },
  privacy: {
    showOnLeaderboard: true,
    publicProfile: false,
  },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading, loadUser } = useAuth(); // add loadUser
  const { toast } = useToast(); // add this line

  // Add state for real data
  const [debateHistory, setDebateHistory] = useState<DebateHistoryItem[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    id: "",
    name: "",
    email: "",
    avatar: "",
    joinedDate: "",
    bio: "",
    stats: {
      totalDebates: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageScore: 0,
      rank: 0,
      streakCurrent: 0,
      streakBest: 0,
    },
  });
  const [settings, setSettings] = useState(mockSettings);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  // Fetch debate history and rank on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoadingHistory(true);

        // Fetch user rank
        try {
          const rankData = await apiClient.get(
            `/api/leaderboard/user/${user.id}`,
          );
          // Handle different possible response structures
          const rank = rankData.rank
          setUserRank(rank);
        } catch (rankError) {
          console.error("Error fetching rank:", rankError);
          setUserRank(0); // Default rank if fetch fails
        }

        // Fetch debate history
        const historyData = await userService.getDebateHistory();
        setDebateHistory(historyData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Calculate stats from real data
  const calculateStats = () => {
    const evaluations = debateHistory.filter((d) => d.evaluation);
    const wins = evaluations.filter(
      (d) => d.evaluation.overall_score === 10,
    ).length; // Consider 10 as win
    const losses = evaluations.length - wins;
    const winRate =
      evaluations.length > 0
        ? Math.round((wins / evaluations.length) * 100)
        : 0;

    // Calculate streaks (simplified - consecutive perfect debates)
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (const debate of debateHistory.slice().reverse()) {
      // Check from most recent
      if (debate.evaluation && debate.evaluation.overall_score === 10) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
        if (debate === debateHistory[debateHistory.length - 1]) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    return { wins, losses, winRate, currentStreak, bestStreak };
  };

  const realStats = calculateStats();

  // Map backend user -> view model with real calculated stats
  const profile = useMemo(
    () => {
      if (!user) return null;

      return {
        id: user.id,
        name: user.full_name || user.username,
        email: user.email,
        avatar: "",
        joinedDate: user.created_at,
        bio: user.bio || "Passionate debater using DebateAI.",
        stats: {
          totalDebates: user.total_debates,
          wins: realStats.wins,
          losses: realStats.losses,
          winRate: realStats.winRate,
          averageScore: Math.round(user.avg_score * 10) / 10,
          rank: userRank,
          streakCurrent: realStats.currentStreak,
          streakBest: realStats.bestStreak,
        },
      };
    },
    [user, realStats, userRank],
  );

    // Sync localProfile whenever profile changes
  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

    // Show loading state if user is not authenticated or profile not loaded
  if (isLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <p className="text-center text-muted-foreground">
            Loading profile...
          </p>
        </main>
      </div>
    );
  }

  const handleProfileUpdate = (field: string, value: string) => {
    setLocalProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (
    key: keyof typeof settings.notifications,
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
  };

  const handleVoiceToggle = (key: keyof typeof settings.voice) => {
    if (typeof settings.voice[key] === "boolean") {
      setSettings((prev) => ({
        ...prev,
        voice: { ...prev.voice, [key]: !prev.voice[key] },
      }));
    }
  };

  const handlePrivacyToggle = (key: keyof typeof settings.privacy) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: !prev.privacy[key] },
    }));
  };

  const getResultBadge = (result: string) => {
    if (result === "won") {
      return <Badge className="bg-emerald-500 text-emerald-100">Winner</Badge>;
    }

    if (result === "almost") {
      return <Badge className="bg-emerald-500/20 text-emerald-500 border border-emerald-200">Almost Won</Badge>;
    }

    if (result === "close") {
      return <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-200">Close Match</Badge>;
    }

    return <Badge className="bg-red-500 text-red-100">Lost</Badge>;
  };

  const handleSaveProfile = async () => {
    try {
      const payload: { username?: string; full_name?: string; bio?: string } = {
        full_name: localProfile.name,
        bio: localProfile.bio, // Add bio to payload
      };

      await userService.updateProfile(payload);
      await loadUser();

      setIsEditing(false);

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.message || "Could not update profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Back Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Profile Header */}
        <div className="mb-8">
          <Card className="card-gradient border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage
                    src={localProfile.avatar}
                    alt={localProfile.name}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {localProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {localProfile.name}
                    </h1>
                    <Badge
                      variant="secondary"
                      className="hidden md:inline-flex"
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      Rank #{localProfile.stats.rank}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {localProfile.email}
                  </p>
                  <p className="text-sm text-foreground/80 max-w-xl">
                    {localProfile.bio}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Member since{" "}
                    {new Date(localProfile.joinedDate).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" },
                    )}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-primary">
                      {localProfile.stats.totalDebates}
                    </p>
                    <p className="text-xs text-muted-foreground">Debates</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-accent">
                      {localProfile.stats.winRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-foreground">
                      {localProfile.stats.averageScore}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-primary">
                      {localProfile.stats.streakCurrent}
                    </p>
                    <p className="text-xs text-muted-foreground">Win Streak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Debate History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Debate History
                </CardTitle>
                <CardDescription>
                  Your recent debate sessions and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Loading debate history...
                    </p>
                  </div>
                ) : debateHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No debates completed yet.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => navigate("/api/topics")}
                    >
                      Start Your First Debate
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {debateHistory.map((debate) => {
                      const evaluation = debate.evaluation;
                      const score = evaluation
                        ? Math.round(evaluation.overall_score)
                        : 0;
                      const result =
                        score === 10
                          ? "won"
                          : score >= 8
                          ? "almost"
                          : score >= 5
                          ? "close"
                          : "lost";
                      const duration = debate.session?.duration_seconds || 0;
                      const mins = Math.floor(duration / 60);
                      const secs = duration % 60;
                      const durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;

                      return (
                        <div
                          key={debate.session.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {debate.session.topic}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  debate.session.created_at,
                                ).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {durationStr}
                              </span>
                              <Badge variant="outline">
                                {debate.session.candidate_stance}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-semibold text-foreground">
                                {score}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Score
                              </p>
                            </div>
                            {getResultBadge(result)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Load More Button - Ready for pagination */}
                {debateHistory.length > 0 && (
                  <div className="mt-6 text-center">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Load More History
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Total Debates
                      </span>
                      <span className="font-semibold">
                        {localProfile.stats.totalDebates}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Wins</span>
                      <span className="font-semibold text-accent">
                        {localProfile.stats.wins}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Losses</span>
                      <span className="font-semibold text-destructive">
                        {localProfile.stats.losses}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-bold text-primary">
                        {localProfile.stats.winRate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Scoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Average Score
                      </span>
                      <span className="font-semibold">
                        {localProfile.stats.averageScore}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Highest Score
                      </span>
                      <span className="font-semibold text-accent">91</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Lowest Score
                      </span>
                      <span className="font-semibold">72</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Streaks & Rank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Current Streak
                      </span>
                      <span className="font-semibold">
                        {localProfile.stats.streakCurrent} 🔥
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Best Streak</span>
                      <span className="font-semibold text-accent">
                        {localProfile.stats.streakBest}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Global Rank</span>
                      <span className="font-bold text-primary">
                        #{localProfile.stats.rank}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Profile
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={localProfile.name}
                      onChange={(e) =>
                        handleProfileUpdate("name", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={localProfile.email}
                      onChange={(e) =>
                        handleProfileUpdate("email", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={localProfile.bio}
                      onChange={(e) =>
                        handleProfileUpdate("bio", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  {isEditing && (
                    <Button className="w-full" onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Debate Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about scheduled debates
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.debateReminders}
                      onCheckedChange={() =>
                        handleNotificationToggle("debateReminders")
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly performance summaries
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.weeklyReports}
                      onCheckedChange={() =>
                        handleNotificationToggle("weeklyReports")
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Leaderboard Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Know when your rank changes
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.leaderboardUpdates}
                      onCheckedChange={() =>
                        handleNotificationToggle("leaderboardUpdates")
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Voice Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-primary" />
                    Voice Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Speech-to-Text</p>
                      <p className="text-sm text-muted-foreground">
                        Enable voice input during debates
                      </p>
                    </div>
                    <Switch
                      checked={settings.voice.speechToText}
                      onCheckedChange={() => handleVoiceToggle("speechToText")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Text-to-Speech</p>
                      <p className="text-sm text-muted-foreground">
                        AI reads responses aloud
                      </p>
                    </div>
                    <Switch
                      checked={settings.voice.textToSpeech}
                      onCheckedChange={() => handleVoiceToggle("textToSpeech")}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Voice Speed</p>
                      <span className="text-sm text-muted-foreground">
                        {settings.voice.voiceSpeed}x
                      </span>
                    </div>
                    <Input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.voice.voiceSpeed}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          voice: {
                            ...prev.voice,
                            voiceSpeed: parseFloat(e.target.value),
                          },
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show on Leaderboard</p>
                      <p className="text-sm text-muted-foreground">
                        Appear in public rankings
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.showOnLeaderboard}
                      onCheckedChange={() =>
                        handlePrivacyToggle("showOnLeaderboard")
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-muted-foreground">
                        Allow others to view your profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.publicProfile}
                      onCheckedChange={() =>
                        handlePrivacyToggle("publicProfile")
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark mode
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
