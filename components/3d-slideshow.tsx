"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float } from "@react-three/drei"
import { useState, useEffect } from "react"

const slides = [
  {
    title: "AI-Powered Grievance Handling",
    description: "Smart categorization and priority assignment",
    color: "#8B5CF6",
  },
  {
    title: "Transparency & Accountability",
    description: "Real-time tracking and multi-level authority system",
    color: "#06B6D4",
  },
  {
    title: "Faster Problem Resolution",
    description: "Automated escalation and performance analytics",
    color: "#10B981",
  },
]

function Scene3D({ currentSlide }: { currentSlide: number }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* 3D text removed to avoid missing font JSON errors; overlay text is shown below */}

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
        <mesh position={[2, 1, -1]} rotation={[0.5, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={slides[currentSlide].color} opacity={0.7} transparent />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.4}>
        <mesh position={[-1, -1, 1]} rotation={[0.3, 0.8, 0.2]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={slides[currentSlide].color} opacity={0.8} transparent />
        </mesh>
      </Float>
    </>
  )
}

export function ThreeDSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-2xl border border-border">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Scene3D currentSlide={currentSlide} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>

      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-8 left-8 right-8 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2 text-balance">{slides[currentSlide].title}</h3>
        <p className="text-muted-foreground text-lg text-pretty">{slides[currentSlide].description}</p>

        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
