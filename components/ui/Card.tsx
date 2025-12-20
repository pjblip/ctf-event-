import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  const MotionDiv = motion.div as any;
  
  return (
    <MotionDiv
      whileHover={hoverEffect ? { 
        y: -5, 
        boxShadow: "0 0 30px -5px rgba(168, 85, 247, 0.3)" // Purple glow on hover
      } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
      className={`
        relative group 
        bg-slate-900/40 backdrop-blur-xl 
        border border-slate-800 
        rounded-xl p-6 
        shadow-xl overflow-hidden
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
      `}
    >
      {/* Animated Gradient Border Overlay */}
      {hoverEffect && (
        <div className="absolute inset-0 p-[1px] rounded-xl z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 mask-content">
           <div className="absolute inset-0 bg-slate-900/90 rounded-xl" />
        </div>
      )}

      {/* Background Mesh Gradient (Subtle) */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Corner Accents - Updated to Multi-color */}
      {hoverEffect && (
        <>
           {/* Top Left - Cyan */}
           <span className="absolute top-0 left-0 w-[2px] h-0 bg-cyan-400 transition-all duration-300 group-hover:h-8 z-20" />
           <span className="absolute top-0 left-0 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-8 z-20" />
           
           {/* Bottom Right - Pink */}
           <span className="absolute bottom-0 right-0 w-[2px] h-0 bg-pink-500 transition-all duration-300 group-hover:h-8 z-20" />
           <span className="absolute bottom-0 right-0 w-0 h-[2px] bg-pink-500 transition-all duration-300 group-hover:w-8 z-20" />
        </>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </MotionDiv>
  );
};

export default Card;