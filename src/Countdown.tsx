import { useEffect, useState } from 'react'

interface CountdownProps {
  duration: number
  resetValue: string | number
}

export function Countdown({ duration, resetValue }: CountdownProps) {
  const [progress, setProgress] = useState(100)

  const [tickTock, setTickTock] = useState(false)

  useEffect(() => {
    const frameLength = 1000 / 60
    const totalFrames = (duration * 1000) / frameLength
    const percentPerFrame = 100 / totalFrames

    setProgress(100)

    setTickTock((prev) => !prev)
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const next = prevProgress - percentPerFrame
        if (next <= 0) clearInterval(interval)
        return next
      })
    }, frameLength)

    return () => {
      clearInterval(interval)
    }
  }, [duration, resetValue])

  const radius = 50
  const centre = radius / 2
  const sw = radius * (2 / 5)
  const r = radius * 0.25
  const circumference = 2 * Math.PI * r
  const offset = tickTock
    ? (progress / 100) * circumference
    : (progress / 100) * circumference - circumference

  return (
    <svg height="2em" viewBox={`0 0 ${radius} ${radius}`}>
      <g transform={`rotate(-90 ${centre} ${centre}) `}>
        <circle
          cx={centre}
          cy={centre}
          r={r}
          fill="transparent"
          stroke="white"
          strokeWidth={sw}
        />
        {/* <text x={radius} y={radius} textAnchor="middle" dy=".3em">
          {offset.toFixed(0)}
        </text> */}
        <circle
          cx={centre}
          cy={centre}
          r={r}
          fill="transparent"
          stroke="rgb(108, 108, 108)"
          strokeWidth={sw}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
        <circle
          cx={centre}
          cy={centre}
          r={centre - 2}
          fill="transparent"
          stroke="rgb(108, 108, 108)"
          strokeWidth={1}
        />
      </g>
    </svg>
  )
}
