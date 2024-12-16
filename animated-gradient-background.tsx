'use client'

import { useEffect, useRef } from 'react'

export const AnimatedGradientBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createGradient = (t: number) => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, `hsl(${(t * 0.1) % 360}, 100%, 70%)`)
      gradient.addColorStop(1, `hsl(${(t * 0.1 + 60) % 360}, 100%, 70%)`)
      return gradient
    }

    const animate = (t: number) => {
      ctx.fillStyle = createGradient(t)
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    animate(0)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}

