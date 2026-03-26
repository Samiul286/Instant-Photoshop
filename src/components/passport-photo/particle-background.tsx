'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

// Configuration matching the template
const PARTICLE_CONFIG = {
  number: 80,
  color: '#4a5568',
  lineColor: '#718096',
  maxDistance: 150,
  speed: 2,
  opacity: 0.5,
  lineWidth: 1
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < PARTICLE_CONFIG.number; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * PARTICLE_CONFIG.speed,
        vy: (Math.random() - 0.5) * PARTICLE_CONFIG.speed,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * PARTICLE_CONFIG.opacity + 0.2
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      const width = canvas.width
      const height = canvas.height

      // Clear with dark background
      ctx.fillStyle = '#1a202c'
      ctx.fillRect(0, 0, width, height)

      const particles = particlesRef.current

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off walls
        if (particle.x < 0 || particle.x > width) {
          particle.vx *= -1
          particle.x = Math.max(0, Math.min(width, particle.x))
        }
        if (particle.y < 0 || particle.y > height) {
          particle.vy *= -1
          particle.y = Math.max(0, Math.min(height, particle.y))
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = PARTICLE_CONFIG.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.globalAlpha = 1

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j]
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < PARTICLE_CONFIG.maxDistance) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = PARTICLE_CONFIG.lineColor
            ctx.globalAlpha = 0.4 * (1 - distance / PARTICLE_CONFIG.maxDistance)
            ctx.lineWidth = PARTICLE_CONFIG.lineWidth
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }

        // Repulse from mouse
        const mouseDx = particle.x - mouseRef.current.x
        const mouseDy = particle.y - mouseRef.current.y
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy)

        if (mouseDistance < 100) {
          const force = (100 - mouseDistance) / 100
          particle.x += mouseDx * force * 0.02
          particle.y += mouseDy * force * 0.02
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (particlesRef.current.length === 0) {
        initParticles(canvas.width, canvas.height)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleClick = (e: MouseEvent) => {
      // Add particles on click like the template
      for (let i = 0; i < 4; i++) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 50,
          y: e.clientY + (Math.random() - 0.5) * 50,
          vx: (Math.random() - 0.5) * PARTICLE_CONFIG.speed * 2,
          vy: (Math.random() - 0.5) * PARTICLE_CONFIG.speed * 2,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * PARTICLE_CONFIG.opacity + 0.2
        })
      }
      // Keep particle count reasonable
      if (particlesRef.current.length > PARTICLE_CONFIG.number * 1.5) {
        particlesRef.current = particlesRef.current.slice(-PARTICLE_CONFIG.number)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1]"
      style={{ backgroundColor: '#1a202c' }}
    />
  )
}
