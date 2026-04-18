import React from 'react';

export function WaveAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 1200 120"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <style>{`
            @keyframes wave1 {
              0%, 100% {
                d: path('M0,50 Q300,30 600,50 T1200,50 L1200,120 L0,120 Z');
              }
              25% {
                d: path('M0,40 Q300,20 600,40 T1200,40 L1200,120 L0,120 Z');
              }
              50% {
                d: path('M0,60 Q300,80 600,60 T1200,60 L1200,120 L0,120 Z');
              }
              75% {
                d: path('M0,45 Q300,25 600,45 T1200,45 L1200,120 L0,120 Z');
              }
            }
            
            @keyframes wave2 {
              0%, 100% {
                d: path('M0,70 Q300,50 600,70 T1200,70 L1200,120 L0,120 Z');
              }
              25% {
                d: path('M0,60 Q300,40 600,60 T1200,60 L1200,120 L0,120 Z');
              }
              50% {
                d: path('M0,80 Q300,100 600,80 T1200,80 L1200,120 L0,120 Z');
              }
              75% {
                d: path('M0,65 Q300,45 600,65 T1200,65 L1200,120 L0,120 Z');
              }
            }
            
            @keyframes wave3 {
              0%, 100% {
                d: path('M0,90 Q300,70 600,90 T1200,90 L1200,120 L0,120 Z');
              }
              25% {
                d: path('M0,80 Q300,60 600,80 T1200,80 L1200,120 L0,120 Z');
              }
              50% {
                d: path('M0,100 Q300,120 600,100 T1200,100 L1200,120 L0,120 Z');
              }
              75% {
                d: path('M0,85 Q300,65 600,85 T1200,85 L1200,120 L0,120 Z');
              }
            }
            
            .wave {
              animation-duration: 5s;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
              fill: rgba(255, 255, 255, 0.1);
            }
            
            .wave1 {
              animation-name: wave1;
              animation-delay: 0s;
            }
            
            .wave2 {
              animation-name: wave2;
              animation-delay: 1s;
            }
            
            .wave3 {
              animation-name: wave3;
              animation-delay: 2s;
            }
          `}</style>
        </defs>
        
        <path className="wave wave1" />
        <path className="wave wave2" />
        <path className="wave wave3" />
      </svg>
    </div>
  );
}
