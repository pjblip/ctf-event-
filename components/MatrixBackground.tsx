import React, { useEffect, useRef } from 'react';

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    // Character Set: Katakana + Latin + Numbers + Symbols
    const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;
    const splitLetters = alphabet.split('');
    
    const fontSize = 16;
    const columns = Math.ceil(width / fontSize);

    // Drop Configuration
    // Each column has its own state to allow for varied speeds and colors
    interface Drop {
      y: number;
      speed: number;
      color: string;
      length: number; // how long the trail is visual perception
    }

    const drops: Drop[] = [];
    
    // Theme Colors: Cyan, Purple, Pink (and rare Green/White)
    const colors = ['#06b6d4', '#22d3ee', '#8b5cf6', '#d946ef', '#ec4899']; 

    for (let i = 0; i < columns; i++) {
      drops[i] = {
        y: Math.random() * -1000, // Stagger start significantly
        speed: Math.random() * 1.5 + 0.5, // Speed between 0.5 and 2.0
        color: colors[Math.floor(Math.random() * colors.length)],
        length: Math.random() * 20 + 10
      };
    }

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      
      // Clear background with very low opacity to create long, dreamy trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; 
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        
        // Pick a random character
        const text = splitLetters[Math.floor(Math.random() * splitLetters.length)];
        
        // Interaction: Distance from mouse
        const x = i * fontSize;
        const dx = mouseRef.current.x - x;
        // Simple distance check for x-axis only to create a "curtain" effect, or euclidean for spotlight
        // Let's use euclidean for a spotlight effect
        const dy = mouseRef.current.y - drop.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNearMouse = dist < 100;

        // Color Logic
        const isHead = Math.random() > 0.98; // Bright white leading character
        const isGlitch = Math.random() > 0.999; // Red glitch

        if (isGlitch) {
           ctx.fillStyle = '#ff003c'; // Cyberpunk Red
           ctx.shadowBlur = 10;
           ctx.shadowColor = '#ff003c';
        } else if (isHead) {
           ctx.fillStyle = '#ffffff';
           ctx.shadowBlur = 8;
           ctx.shadowColor = '#ffffff';
        } else if (isNearMouse) {
           // Mouse lights up the matrix
           ctx.fillStyle = '#ffffff'; 
           ctx.shadowBlur = 15;
           ctx.shadowColor = drop.color;
        } else {
           ctx.fillStyle = drop.color;
           ctx.shadowBlur = 0;
        }

        ctx.fillText(text, x, drop.y);
        
        // Reset Shadow for performance
        ctx.shadowBlur = 0;

        // Move drop
        // If near mouse, speed up slightly (turbulence)
        const currentSpeed = isNearMouse ? drop.speed * 2 : drop.speed;
        
        if (drop.y > height && Math.random() > 0.98) {
          drop.y = 0;
          // Randomize properties on reset for variety
          drop.speed = Math.random() * 1.5 + 0.5;
          drop.color = colors[Math.floor(Math.random() * colors.length)];
        }
        
        drop.y += currentSpeed;
      }
    };

    const interval = setInterval(draw, 30); // ~30fps is enough for matrix

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        // Re-initialize drops on resize to prevent gaps
        const newColumns = Math.ceil(width / fontSize);
        if (newColumns > drops.length) {
            for (let i = drops.length; i < newColumns; i++) {
                drops[i] = {
                    y: Math.random() * -100,
                    speed: Math.random() * 1.5 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    length: Math.random() * 20 + 10
                };
            }
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-bg" />;
};

export default MatrixBackground;