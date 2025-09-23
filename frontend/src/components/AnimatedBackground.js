import React from 'react';

const AnimatedBackground = () => {
  // Generate floating bubbles dynamically
  const bubbles = Array.from({ length: 70 }, (_, i) => {
    const size = Math.floor(Math.random() * 20) + 8; // Size between 8-28px
    const left = Math.floor(Math.random() * 100);
    const delay = Math.floor(Math.random() * 15);
    const duration = 20 + Math.floor(Math.random() * 20); // 20-40s duration
    
    return (
      <div
        key={i}
        className="absolute rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 animate-float-bubble"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          top: '100%',
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });

  // Generate floating particles for additional visual interest
  const particles = Array.from({ length: 50 }, (_, i) => {
    const size = Math.floor(Math.random() * 6) + 2; // Size between 2-8px
    const left = Math.floor(Math.random() * 100);
    const delay = Math.floor(Math.random() * 10);
    const duration = 25 + Math.floor(Math.random() * 15); // 25-40s duration
    
    return (
      <div
        key={`particle-${i}`}
        className="absolute rounded-full bg-gradient-to-br from-teal-300/30 to-cyan-400/30 animate-float-particle"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          top: '100%',
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0c4a6e] to-[#0369a1] animate-gradient-shift-modern"></div>
      
      {/* Enhanced wave layers with more prominent movement */}
      <div className="absolute bottom-0 left-0 right-0 h-96 opacity-90">
        <svg 
          className="w-full h-full animate-wave-slowest" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,140 900,-20 1200,60 L1200,120 L0,120 Z" 
            fill="url(#waveGradient1)"
          ></path>
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-80 opacity-80">
        <svg 
          className="w-full h-full animate-wave-slow" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" 
            fill="url(#waveGradient2)"
          ></path>
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-70">
        <svg 
          className="w-full h-full animate-wave-medium" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,100 900,20 1200,60 L1200,120 L0,120 Z" 
            fill="url(#waveGradient3)"
          ></path>
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-48 opacity-60">
        <svg 
          className="w-full h-full animate-wave-fast" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,80 900,40 1200,60 L1200,120 L0,120 Z" 
            fill="url(#waveGradient4)"
          ></path>
        </svg>
      </div>
      
      {/* Additional wave for more dynamic movement */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-50">
        <svg 
          className="w-full h-full animate-wave-fastest" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,70 900,50 1200,60 L1200,120 L0,120 Z" 
            fill="url(#waveGradient5)"
          ></path>
        </svg>
      </div>
      
      {/* Floating bubbles */}
      {bubbles}
      
      {/* Floating particles */}
      {particles}
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-radial-gradient from-cyan-400/5 via-blue-500/5 to-transparent"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full border border-cyan-400/20 animate-pulse-glow"></div>
      <div className="absolute top-1/3 right-32 w-24 h-24 rounded-full border border-blue-400/20 animate-pulse-glow delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-16 h-16 rounded-full border border-teal-400/20 animate-pulse-glow delay-2000"></div>
      
      {/* Gradient definitions for wave patterns */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cffafe" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#bfdbfe" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="waveGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ddd6fe" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="waveGradient5" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#faf5ff" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#f3e8ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default AnimatedBackground;