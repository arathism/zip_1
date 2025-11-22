"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, Send, User, Bot, Lightbulb } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  suggestions?: string[]
}

const predefinedResponses = {
  "wifi issue": {
    response:
      "I understand you're experiencing WiFi connectivity issues. This is commonly categorized under 'IT Services' with medium to high priority depending on the scope. Here's what I recommend:",
    suggestions: [
      "Category: IT Services",
      "Priority: High (if affecting multiple students)",
      "Include: Room number, device type, specific error messages",
      "Expected resolution: 2-3 business days",
    ],
  },
  "hostel problem": {
    response:
      "Hostel-related complaints are typically handled by the Hostel Warden. Let me help you categorize this properly:",
    suggestions: [
      "Category: Hostel",
      "Priority: Medium (unless safety concern)",
      "Include: Room number, specific issue details",
      "Authority: Hostel Warden (Level 2)",
    ],
  },
  "food quality": {
    response: "Food quality concerns are important for student health and satisfaction. Here's how to proceed:",
    suggestions: [
      "Category: Canteen",
      "Priority: High (health and safety)",
      "Include: Date, time, specific meal details",
      "May escalate to: Dean of Student Affairs",
    ],
  },
  library: {
    response: "Library-related requests are usually processed quickly. Here's the typical workflow:",
    suggestions: [
      "Category: Library",
      "Priority: Low to Medium",
      "Authority: Library Staff (Level 1)",
      "Expected resolution: 1-2 business days",
    ],
  },
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm your AI assistant for SolveIT. I can help you understand how to file complaints, suggest appropriate categories and priorities, and answer questions about the complaint resolution process. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (userMessage: string): { response: string; suggestions?: string[] } => {
    const message = userMessage.toLowerCase()

    // Check for predefined responses
    for (const [key, value] of Object.entries(predefinedResponses)) {
      if (message.includes(key.replace(" ", "")) || message.includes(key)) {
        return value
      }
    }

    // General responses based on keywords
    if (message.includes("category") || message.includes("categorize")) {
      return {
        response:
          "I can help you choose the right category for your complaint. The main categories are: Academic, Hostel, Infrastructure, Library, Canteen, Transportation, Administration, IT Services, Sports, and Other. What type of issue are you facing?",
        suggestions: ["Tell me more about your specific issue", "I need help with categorization"],
      }
    }

    if (message.includes("priority") || message.includes("urgent")) {
      return {
        response:
          "Priority levels help determine how quickly your complaint will be addressed:\n\n• High: Safety issues, infrastructure failures, urgent academic matters\n• Medium: General facility issues, service improvements\n• Low: Suggestions, minor inconveniences\n\nWhat type of issue would you like to report?",
        suggestions: ["My issue is urgent", "This is a general concern", "I have a suggestion"],
      }
    }

    if (message.includes("escalation") || message.includes("escalate")) {
      return {
        response:
          "Our multi-level escalation system ensures no complaint is ignored:\n\n1. Level 1: Department staff (IT, Library, etc.)\n2. Level 2: Department heads (Hostel Warden, etc.)\n3. Level 3: Senior administration (Dean of Student Affairs)\n4. Level 4: Top management (Principal)\n\nComplaints automatically escalate if not resolved within the deadline.",
        suggestions: ["How long does escalation take?", "Who handles my complaint?"],
      }
    }

    if (message.includes("status") || message.includes("track")) {
      return {
        response:
          "You can track your complaint status in real-time through your dashboard. Status updates include:\n\n• Pending: Awaiting assignment\n• In Progress: Being actively resolved\n• Resolved: Successfully completed\n• Escalated: Moved to higher authority\n\nYou'll receive notifications for every status change.",
        suggestions: ["How do I check my complaint status?", "When will I get updates?"],
      }
    }

    // Default response
    return {
      response:
        "I'm here to help with your complaint-related questions. I can assist with:\n\n• Choosing the right category and priority\n• Understanding the resolution process\n• Explaining escalation procedures\n• Tracking complaint status\n• General guidance on filing complaints\n\nWhat specific help do you need?",
      suggestions: ["Help me file a complaint", "Explain the process", "I have a technical issue"],
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI processing delay
    setTimeout(
      () => {
        const { response, suggestions } = generateResponse(inputValue)

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: response,
          timestamp: new Date(),
          suggestions,
        }

        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          AI Assistant
        </CardTitle>
        <CardDescription>Get instant help with complaint filing, categorization, and process guidance</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user" ? "bg-primary" : "bg-muted"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                <div
                  className={`rounded-lg p-3 ${
                    message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs p-2 rounded bg-background/50 hover:bg-background/80 transition-colors"
                        >
                          <Lightbulb className="w-3 h-3 inline mr-2" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about filing complaints..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
