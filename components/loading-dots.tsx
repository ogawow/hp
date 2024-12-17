'use client'

export function LoadingDots() {
  return (
    <div className="flex space-x-1 animate-pulse">
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-200"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-400"></div>
    </div>
  )
}

