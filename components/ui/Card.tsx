import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Map mouse position to rotation degrees
  // X position maps to Y rotation (left/right tilt)
  // Y position maps to X rotation (up/down tilt)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);
  
  // Dynamic gloss/shine effect based on mouse position
  const glossX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glossY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverEffect || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    
    // Calculate normalized position (-0.5 to 0.5)
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!hoverEffect) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: hoverEffect ? rotateX : 0,
        rotateY: hoverEffect ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      initial={{ scale: 1 }}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`
        relative group 
        bg-slate-900/40 backdrop-blur-xl 
        border border-slate-800 
        rounded-xl p-6 
        shadow-xl
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
      `}
    >
      {/* 3D Depth Layer - Background */}
      <div 
        className="absolute inset-0 bg-slate-900/80 rounded-xl transform translate-z-[-10px] shadow-2xl transition-all" 
      />

      {/* Gloss/Reflection Gradient */}
      {hoverEffect && (
        <motion.div 
            style={{ 
                background: `radial-gradient(circle at ${glossX} ${glossY}, rgba(255,255,255,0.07), transparent 60%)` 
            }}
            className="absolute inset-0 rounded-xl z-20 pointer-events-none"
        />
      )}

      {/* Animated Gradient Border Overlay */}
      {hoverEffect && (
        <div className="absolute inset-0 p-[1px] rounded-xl z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 mask-content pointer-events-none">
           <div className="absolute inset-0 bg-transparent rounded-xl" />
        </div>
      )}

      {/* Corner Accents */}
      {hoverEffect && (
        <>
           <span className="absolute top-0 left-0 w-[2px] h-0 bg-cyan-400 transition-all duration-300 group-hover:h-8 z-20" />
           <span className="absolute top-0 left-0 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-8 z-20" />
           
           <span className="absolute bottom-0 right-0 w-[2px] h-0 bg-pink-500 transition-all duration-300 group-hover:h-8 z-20" />
           <span className="absolute bottom-0 right-0 w-0 h-[2px] bg-pink-500 transition-all duration-300 group-hover:w-8 z-20" />
        </>
      )}
      
      {/* Content - Pushed forward in 3D space */}
      <div className="relative z-10 transform translate-z-[20px]">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;