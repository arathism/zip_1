"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Play } from "lucide-react"

export function DemoVideoModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2 bg-transparent">
          <Play className="w-5 h-5" />
          Watch Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>SolveIT System Demo</DialogTitle>
        </DialogHeader>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Complete System Walkthrough</h3>
            <p className="text-muted-foreground">
              See how SolveIT revolutionizes problem reporting and resolution in educational institutions
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                // In a real implementation, this would start the video
                console.log("Starting demo video...")
              }}
            >
              Start Demo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
