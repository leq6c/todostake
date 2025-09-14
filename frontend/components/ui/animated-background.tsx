"use client"

import { useEffect, useState, useRef } from "react"

interface AnimatedBackgroundProps {
  isRecording: boolean
}

export default function AnimatedBackground({ isRecording }: AnimatedBackgroundProps) {
  const [soundDirection, setSoundDirection] = useState({ x: 50, y: 50 })

  return (
    <div className="absolute inset-0 transform-y-[-40%]">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 500px 300px at ${soundDirection.x}% ${soundDirection.y}%, 
              rgba(99, 102, 241, ${isRecording ? 0.25 : 0.18}) 0%, 
              rgba(99, 102, 241, ${isRecording ? 0.15 : 0.1}) 25%,
              rgba(99, 102, 241, ${isRecording ? 0.08 : 0.05}) 50%,
              transparent 75%)
          `,
          filter: "blur(60px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 400px 250px at ${100 - soundDirection.x}% ${100 - soundDirection.y}%, 
              rgba(168, 85, 247, ${isRecording ? 0.18 : 0.14}) 0%, 
              rgba(168, 85, 247, ${isRecording ? 0.1 : 0.08}) 30%,
              transparent 60%)
          `,
          filter: "blur(80px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(${soundDirection.x * 4}deg, 
              rgba(147, 197, 253, ${isRecording ? 0.12 : 0.09}) 0%,
              rgba(147, 197, 253, ${isRecording ? 0.06 : 0.05}) 30%,
              transparent 60%,
              rgba(196, 181, 253, ${isRecording ? 0.06 : 0.05}) 80%,
              rgba(196, 181, 253, ${isRecording ? 0.1 : 0.08}) 100%)
          `,
          filter: "blur(40px)",
        }}
      />
    </div>
  )
}
