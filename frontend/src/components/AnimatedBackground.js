import React from 'react';

const AnimatedBackground = () => {
  // Generate floating bubbles dynamically
  const bubbles = Array.from({ length: 50 }, (_, i) => {
    const size = Math.floor(Math.random() * 16) + 5; // Size between 5-20px
    const left = Math.floor(Math.random() * 100);
    const delay = Math.floor(Math.random() * 10);
    const duration = 15 + Math.floor(Math.random() * 15); // 15-30s duration
    
    return (
      <div
        key={i}
        className="absolute rounded-full bg-blue-200/30 dark:bg-blue-100/20 animate-float"
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
  const particles = Array.from({ length: 30 }, (_, i) => {
    const size = Math.floor(Math.random() * 8) + 2; // Size between 2-10px
    const left = Math.floor(Math.random() * 100);
    const delay = Math.floor(Math.random() * 5);
    const duration = 20 + Math.floor(Math.random() * 10); // 20-30s duration
    
    return (
      <div
        key={`particle-${i}`}
        className="absolute rounded-full bg-cyan-300/20 dark:bg-cyan-200/10 animate-float-particle"
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
      {/* Ocean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D47A1] via-[#1976D2] to-[#64B5F6] animate-gradient-shift"></div>
      
      {/* Enhanced wave layers with more prominent movement */}
      <div className="absolute bottom-0 left-0 right-0 h-80 opacity-80">
        <svg 
          className="w-full h-full animate-wave-slowest" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,140 900,-20 1200,60 L1200,120 L0,120 Z" 
            fill="#B3E5FC"
          ></path>
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-70">
        <svg 
          className="w-full h-full animate-wave-slow" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" 
            fill="#64B5F6"
          ></path>
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-48 opacity-60">
        <svg 
          className="w-full h-full animate-wave-medium" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,100 900,20 1200,60 L1200,120 L0,120 Z" 
            fill="#1976D2"
          ></path>
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-50">
        <svg 
          className="w-full h-full animate-wave-fast" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,80 900,40 1200,60 L1200,120 L0,120 Z" 
            fill="#0D47A1"
          ></path>
        </svg>
      </div>
      
      {/* Additional wave for more dynamic movement */}
      <div className="absolute bottom-0 left-0 right-0 h-20 opacity-40">
        <svg 
          className="w-full h-full animate-wave-fastest" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,70 900,50 1200,60 L1200,120 L0,120 Z" 
            fill="#08306b"
          ></path>
        </svg>
      </div>
      
      {/* Floating bubbles */}
      {bubbles}
      
      {/* Floating particles */}
      {particles}
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-400/10 via-transparent to-transparent"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full border-2 border-cyan-300/30 animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-20 w-16 h-16 rounded-full border-2 border-blue-300/30 animate-pulse-medium"></div>
      <div className="absolute bottom-1/3 left-1/4 w-12 h-12 rounded-full border-2 border-teal-300/30 animate-pulse-fast"></div>
    </div>
  );
};

export default AnimatedBackground;