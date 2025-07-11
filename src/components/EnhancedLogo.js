import React from 'react';
import Image from 'next/image';

const EnhancedLogo = ({ width = 160, height = 48, className = "" }) => {
  return (
    <div className={`enhanced-logo-container ${className}`}>
      <div className="logo-wrapper">
        <Image
          src="/assets/logos/medhir-logo-enhanced.svg"
          alt="MEDHIR"
          width={width}
          height={height}
          className="enhanced-logo"
          priority
        />
        
        {/* CSS-only enhancement overlay */}
        <div className="logo-enhancement-overlay">
          {/* Floating particles */}
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          
          {/* Glow effects */}
          <div className="glow-effect glow-1"></div>
          <div className="glow-effect glow-2"></div>
        </div>
      </div>
      
      <style jsx>{`
        .enhanced-logo-container {
          position: relative;
          display: inline-block;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .logo-wrapper {
          position: relative;
          display: inline-block;
          padding: 8px;
          border-radius: 16px;
          background: linear-gradient(135deg, 
            rgba(16, 185, 129, 0.05) 0%, 
            rgba(5, 150, 105, 0.08) 50%, 
            rgba(4, 120, 87, 0.05) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(16, 185, 129, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        
        .enhanced-logo {
          display: block;
          transition: all 0.3s ease-in-out;
          filter: drop-shadow(0 4px 12px rgba(5, 150, 105, 0.15));
        }
        
        .logo-enhancement-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        /* Floating particles */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, #34D399, #10B981);
          animation: float 3s ease-in-out infinite;
        }
        
        .particle-1 {
          width: 4px;
          height: 4px;
          top: 20%;
          left: 15%;
          animation-delay: 0s;
          animation-duration: 3s;
        }
        
        .particle-2 {
          width: 3px;
          height: 3px;
          top: 70%;
          right: 20%;
          animation-delay: 1s;
          animation-duration: 4s;
        }
        
        .particle-3 {
          width: 2px;
          height: 2px;
          top: 40%;
          right: 10%;
          animation-delay: 2s;
          animation-duration: 3.5s;
        }
        
        /* Glow effects */
        .glow-effect {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .glow-1 {
          width: 30px;
          height: 30px;
          top: 10px;
          left: 10px;
          animation-delay: 0s;
        }
        
        .glow-2 {
          width: 20px;
          height: 20px;
          bottom: 10px;
          right: 15px;
          animation-delay: 1s;
        }
        
        /* Hover effects */
        .enhanced-logo-container:hover .logo-wrapper {
          background: linear-gradient(135deg, 
            rgba(16, 185, 129, 0.12) 0%, 
            rgba(5, 150, 105, 0.15) 50%, 
            rgba(4, 120, 87, 0.12) 100%);
          border-color: rgba(16, 185, 129, 0.3);
          transform: translateY(-2px);
          box-shadow: 
            0 10px 25px rgba(5, 150, 105, 0.15),
            0 0 0 1px rgba(16, 185, 129, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .enhanced-logo-container:hover .enhanced-logo {
          transform: scale(1.05);
          filter: 
            drop-shadow(0 8px 20px rgba(5, 150, 105, 0.25))
            drop-shadow(0 0 15px rgba(16, 185, 129, 0.15));
        }
        
        .enhanced-logo-container:hover .logo-enhancement-overlay {
          opacity: 1;
        }
        
        /* Active state */
        .enhanced-logo-container:active .logo-wrapper {
          transform: translateY(0) scale(0.98);
          transition: all 0.1s ease;
        }
        
        /* Animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-8px) translateX(2px);
            opacity: 1;
          }
          50% {
            transform: translateY(-12px) translateX(-2px);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-6px) translateX(1px);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        /* Responsive scaling */
        @media (max-width: 768px) {
          .logo-wrapper {
            padding: 6px;
            border-radius: 12px;
          }
          
          .enhanced-logo-container:hover .logo-wrapper {
            transform: translateY(-1px);
          }
          
          .enhanced-logo-container:hover .enhanced-logo {
            transform: scale(1.02);
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .logo-wrapper {
            background: linear-gradient(135deg, 
              rgba(16, 185, 129, 0.08) 0%, 
              rgba(5, 150, 105, 0.12) 50%, 
              rgba(4, 120, 87, 0.08) 100%);
            border-color: rgba(16, 185, 129, 0.15);
          }
          
          .enhanced-logo-container:hover .logo-wrapper {
            background: linear-gradient(135deg, 
              rgba(16, 185, 129, 0.15) 0%, 
              rgba(5, 150, 105, 0.20) 50%, 
              rgba(4, 120, 87, 0.15) 100%);
            border-color: rgba(16, 185, 129, 0.4);
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .logo-wrapper {
            border-width: 2px;
            border-color: #10B981;
          }
          
          .enhanced-logo {
            filter: contrast(1.2) drop-shadow(0 4px 12px rgba(5, 150, 105, 0.3));
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .enhanced-logo-container,
          .logo-wrapper,
          .enhanced-logo,
          .logo-enhancement-overlay,
          .particle,
          .glow-effect {
            animation: none !important;
            transition: none !important;
          }
          
          .enhanced-logo-container:hover .enhanced-logo {
            transform: none;
          }
          
          .enhanced-logo-container:hover .logo-wrapper {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedLogo; 