import React, { useEffect, useState } from 'react'

export default function CloudLayer() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Different parallax speeds for depth layers
  const farLayerOffset = scrollY * 0.15   // Slowest - furthest back
  const midLayerOffset = scrollY * 0.25   // Medium speed
  const nearLayerOffset = scrollY * 0.35  // Fastest - closest

  return (
    <>
      {/* FAR BACKGROUND LAYER - Smallest, most transparent, slowest */}
      <div 
        className="cloud-layer-container"
        style={{ transform: `translateY(${farLayerOffset}px)`, zIndex: 1 }}
      >
        <img 
          src="/Cloud 2.png" 
          alt="" 
          className="cloud-img"
          style={{ 
            top: '15%', 
            left: '8%', 
            width: '140px',
            opacity: 0.2,
            animation: 'cloudDrift1 40s ease-in-out infinite'
          }}
        />
      </div>

      {/* MIDDLE LAYER - Medium size and opacity */}
      <div 
        className="cloud-layer-container"
        style={{ transform: `translateY(${midLayerOffset}px)`, zIndex: 5 }}
      >
        <img 
          src="/Cloud 1.png" 
          alt="" 
          className="cloud-img"
          style={{ 
            top: '12%', 
            right: '10%', 
            width: '190px',
            opacity: 0.32,
            animation: 'cloudDrift2 32s ease-in-out infinite'
          }}
        />
        <img 
          src="/Cloud 3.png" 
          alt="" 
          className="cloud-img"
          style={{ 
            top: '50%', 
            left: '15%', 
            width: '180px',
            opacity: 0.304,
            animation: 'cloudDrift3 35s ease-in-out infinite'
          }}
        />
      </div>

      {/* NEAR FOREGROUND LAYER - Largest, most opaque, fastest */}
      {/* <div 
        className="cloud-layer-container"
        style={{ transform: `translateY(${nearLayerOffset}px)`, zIndex: 10 }}
      >
        <img 
          src="/Cloud 2.png" 
          alt="" 
          className="cloud-img"
          style={{ 
            top: '25%', 
            left: '35%', 
            width: '240px',
            opacity: 0.44,
            animation: 'cloudDrift4 25s ease-in-out infinite'
          }}
        />
        <img 
          src="/Cloud 3.png" 
          alt="" 
          className="cloud-img"
          style={{ 
            top: '60%', 
            right: '20%', 
            width: '230px',
            opacity: 0.416,
            animation: 'cloudDrift5 27s ease-in-out infinite'
          }}
        />
      </div> */}
    </>
  )
}
