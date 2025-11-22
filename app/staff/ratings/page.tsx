// app/staff/ratings/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ArrowLeft, MessageCircle, Calendar, User } from "lucide-react"

interface Rating {
  id: string
  complaintId: string
  complaintTitle: string
  studentName: string
  rating: number
  comment: string
  createdAt: string
  category: string
}

export default function StaffRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchRatings()
  }, [])

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/")
        return
      }

      // Simulate API call to fetch ratings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // This would be your actual API call
      // const response = await fetch('/api/staff/ratings', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // })
      
      // For now, using dummy data
      const dummyRatings: Rating[] = [
        {
          id: "1",
          complaintId: "COMP001",
          complaintTitle: "Network Connectivity Issue",
          studentName: "John Doe",
          rating: 5,
          comment: "Excellent service! The issue was resolved quickly and professionally.",
          createdAt: "2024-01-15T10:30:00Z",
          category: "IT Support"
        },
        {
          id: "2",
          complaintId: "COMP002",
          complaintTitle: "Library Book Not Available",
          studentName: "Jane Smith",
          rating: 4,
          comment: "Helpful staff, but took a bit longer than expected.",
          createdAt: "2024-01-14T14:20:00Z",
          category: "Library"
        },
        {
          id: "3",
          complaintId: "COMP003",
          complaintTitle: "Classroom AC Not Working",
          studentName: "Mike Johnson",
          rating: 3,
          comment: "Issue was resolved but had to follow up multiple times.",
          createdAt: "2024-01-12T09:15:00Z",
          category: "Maintenance"
        }
      ]

      setRatings(dummyRatings)
      
      // Calculate average rating
      const avg = dummyRatings.reduce((sum, rating) => sum + rating.rating, 0) / dummyRatings.length
      setAverageRating(Number(avg.toFixed(1)))
      
    } catch (error) {
      console.error('Error fetching ratings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-foreground">{rating}.0</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Star className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="mt-4 text-lg text-foreground">Loading Ratings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/staff/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Staff Ratings & Feedback</h1>
                <p className="text-sm text-muted-foreground">Student feedback and ratings for your service</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Overall Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-primary">{averageRating}</div>
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(averageRating))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Based on {ratings.length} reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">5-Star Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {ratings.filter(r => r.rating === 5).length}
              </div>
              <p className="text-xs text-muted-foreground">Excellent reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{ratings.length}</div>
              <p className="text-xs text-muted-foreground">All time reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">100%</div>
              <p className="text-xs text-muted-foreground">Complaints with feedback</p>
            </CardContent>
          </Card>
        </div>

        {/* Ratings List */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Student Feedback</CardTitle>
            <CardDescription>Recent ratings and comments from students</CardDescription>
          </CardHeader>
          <CardContent>
            {ratings.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
                <p className="text-muted-foreground">No ratings yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Student ratings will appear here once they rate your service.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {ratings.map((rating) => (
                  <div key={rating.id} className="p-4 border border-border/50 rounded-lg bg-card/30 backdrop-blur-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{rating.studentName}</p>
                          <p className="text-sm text-muted-foreground">{rating.complaintTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(rating.rating)}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {rating.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {rating.complaintId}
                      </span>
                    </div>

                    {rating.comment && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">Student Comment</span>
                        </div>
                        <p className="text-sm text-foreground">{rating.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}