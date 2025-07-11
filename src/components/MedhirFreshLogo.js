import React from 'react';
import Link from 'next/link';

const MedhirFreshLogo = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'text-lg',
    default: 'text-2xl',
    large: 'text-3xl'
  };

  return (
    <div className={`medhir-fresh-logo ${sizeClasses[size]} ${className}`}>
      <Link href="/superadmin/companies" className="logo-link">
        <div className="logo-container">
          {/* Stylized M Icon */}
          <div className="m-icon">
            <div className="m-shape">
              <div className="m-left"></div>
              <div className="m-middle"></div>
              <div className="m-right"></div>
            </div>
          </div>
          
          {/* MEDHIR Text */}
          <div className="logo-text">
            <span className="med">MED</span>
            <span className="hir">HIR</span>
          </div>
        </div>
      </Link>

      <style jsx>{`
        .medhir-fresh-logo {
          display: inline-block;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .logo-link {
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 12px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.05) 0%,
            rgba(16, 185, 129, 0.05) 100%);
          border: 1px solid rgba(59, 130, 246, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        /* Stylized M Icon */
        .m-icon {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .m-shape {
          position: relative;
          width: 24px;
          height: 20px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .m-left,
        .m-middle,
        .m-right {
          background: linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%);
          border-radius: 2px;
          transition: all 0.3s ease;
          position: relative;
        }

        .m-left {
          width: 3px;
          height: 20px;
        }

        .m-middle {
          width: 3px;
          height: 14px;
          background: linear-gradient(180deg, #10B981 0%, #059669 100%);
          position: relative;
        }

        .m-middle::before,
        .m-middle::after {
          content: '';
          position: absolute;
          width: 3px;
          height: 8px;
          background: linear-gradient(180deg, #10B981 0%, #059669 100%);
          border-radius: 2px;
        }

        .m-middle::before {
          top: -2px;
          left: -6px;
          transform: rotate(25deg);
          transform-origin: bottom;
        }

        .m-middle::after {
          top: -2px;
          right: -6px;
          transform: rotate(-25deg);
          transform-origin: bottom;
        }

        .m-right {
          width: 3px;
          height: 20px;
        }

        /* Logo Text */
        .logo-text {
          display: flex;
          align-items: baseline;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .med {
          color: #111827;
          font-weight: 800;
          position: relative;
        }

        .hir {
          color: #3B82F6;
          font-weight: 600;
          margin-left: 1px;
        }

        /* Hover Effects */
        .logo-link:hover .logo-container {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.08) 0%,
            rgba(16, 185, 129, 0.08) 100%);
          border-color: rgba(59, 130, 246, 0.2);
          transform: translateY(-1px);
          box-shadow: 
            0 4px 12px rgba(59, 130, 246, 0.15),
            0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .logo-link:hover .m-left,
        .logo-link:hover .m-right {
          height: 22px;
          background: linear-gradient(180deg, #2563EB 0%, #1E40AF 100%);
        }

        .logo-link:hover .m-middle {
          height: 16px;
          background: linear-gradient(180deg, #059669 0%, #047857 100%);
        }

        .logo-link:hover .m-middle::before,
        .logo-link:hover .m-middle::after {
          background: linear-gradient(180deg, #059669 0%, #047857 100%);
          height: 9px;
        }

        .logo-link:hover .med {
          color: #0F172A;
        }

        .logo-link:hover .hir {
          color: #2563EB;
        }

        /* Active State */
        .logo-link:active .logo-container {
          transform: translateY(0) scale(0.98);
          transition: all 0.1s ease;
        }

        /* Gradient Animation */
        .logo-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          transition: left 0.6s ease;
        }

        .logo-link:hover .logo-container::before {
          left: 100%;
        }

        /* Size Variations */
        .text-lg .m-icon {
          width: 28px;
          height: 28px;
        }

        .text-lg .m-shape {
          width: 20px;
          height: 16px;
        }

        .text-lg .m-left,
        .text-lg .m-right {
          width: 2.5px;
          height: 16px;
        }

        .text-lg .m-middle {
          width: 2.5px;
          height: 12px;
        }

        .text-lg .m-middle::before,
        .text-lg .m-middle::after {
          width: 2.5px;
          height: 6px;
        }

        .text-3xl .m-icon {
          width: 40px;
          height: 40px;
        }

        .text-3xl .m-shape {
          width: 30px;
          height: 25px;
        }

        .text-3xl .m-left,
        .text-3xl .m-right {
          width: 4px;
          height: 25px;
        }

        .text-3xl .m-middle {
          width: 4px;
          height: 18px;
        }

        .text-3xl .m-middle::before,
        .text-3xl .m-middle::after {
          width: 4px;
          height: 10px;
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .logo-container {
            background: linear-gradient(135deg, 
              rgba(59, 130, 246, 0.1) 0%,
              rgba(16, 185, 129, 0.1) 100%);
            border-color: rgba(59, 130, 246, 0.2);
          }

          .med {
            color: #F9FAFB;
          }

          .hir {
            color: #60A5FA;
          }

          .logo-link:hover .logo-container {
            background: linear-gradient(135deg, 
              rgba(59, 130, 246, 0.15) 0%,
              rgba(16, 185, 129, 0.15) 100%);
            border-color: rgba(59, 130, 246, 0.3);
          }

          .logo-link:hover .med {
            color: #FFFFFF;
          }

          .logo-link:hover .hir {
            color: #3B82F6;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .logo-container {
            border-width: 2px;
            border-color: #3B82F6;
          }

          .med {
            color: #000000;
          }

          .hir {
            color: #1D4ED8;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .logo-link,
          .logo-container,
          .m-left,
          .m-middle,
          .m-right,
          .logo-container::before {
            transition: none !important;
            animation: none !important;
          }

          .logo-link:hover .logo-container {
            transform: none;
          }
        }

        /* Focus States for Accessibility */
        .logo-link:focus-visible {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
          border-radius: 8px;
        }

        .logo-link:focus-visible .logo-container {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default MedhirFreshLogo; 