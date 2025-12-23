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
    
    // Character Set: Extended for more visual variety
    const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const symbols = '⚡xxxxx<>[]{}/*-+=!?^&%$#@'; // Added some hacker-ish symbols
    const alphabet = katakana + latin + nums + symbols;
    const splitLetters = alphabet.split('');
    
    // Configuration for Parallax Layers
    interface Layer {
        fontSize: number;
        drops: Drop[];
        speedFactor: number;
        colors: string[];
        opacity: number;
    }

    interface Drop {
      x: number;
      y: number;
      speed: number;
      color: string;
      text: string;
    }

    // Three distinct layers for depth
    const layers: Layer[] = [
        { 
            fontSize: 10, 
            drops: [], 
            speedFactor: 0.3, 
            colors: ['#083344', '#172554', '#4c1d95'], // Deep dark blues/purples
            opacity: 0.3
        },
        { 
            fontSize: 14, 
            drops: [], 
            speedFactor: 0.8, 
            colors: ['#06b6d4', '#8b5cf6', '#ec4899'], // Standard brand colors
            opacity: 0.7 
        },
        { 
            fontSize: 20, 
            drops: [], 
            speedFactor: 1.4, 
            colors: ['#67e8f9', '#d8b4fe', '#f9a8d4', '#ffffff'], // Bright highlights
            opacity: 1.0 
        }
    ];

    const initLayers = () => {
        layers.forEach(layer => {
            const columns = Math.ceil(width / layer.fontSize);
            layer.drops = [];
            for (let i = 0; i < columns; i++) {
                layer.drops.push({
                    x: i * layer.fontSize,
                    y: Math.random() * -1000, // Stagger significantly
                    speed: (Math.random() * 1.5 + 0.5) * layer.speedFactor,
                    color: layer.colors[Math.floor(Math.random() * layer.colors.length)],
                    text: splitLetters[Math.floor(Math.random() * splitLetters.length)]
                });
            }
        });
    };

    initLayers();

    const draw = () => {
      // Create trails
      // Use a very slight opacity to make trails last longer but fade smoothly
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'; // Matches bg-slate-950 roughly
      ctx.fillRect(0, 0, width, height);

      layers.forEach((layer, layerIdx) => {
          ctx.font = `bold ${layer.fontSize}px monospace`;
          ctx.globalAlpha = layer.opacity;

          layer.drops.forEach(drop => {
              // 1. Random Character Flip (Simulate processing)
              if (Math.random() < 0.02) {
                  drop.text = splitLetters[Math.floor(Math.random() * splitLetters.length)];
              }

              // 2. Mouse Interaction (Spotlight / Repulsion)
              const dx = mouseRef.current.x - drop.x;
              const dy = mouseRef.current.y - drop.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const isNearMouse = dist < 120;

              // 3. Render Logic
              const isHead = Math.random() > 0.995; // Bright white leader
              const isGlitch = Math.random() > 0.999; // Red corruption

              if (isGlitch) {
                  ctx.fillStyle = '#ef4444'; // Red-500
                  ctx.shadowBlur = 8;
                  ctx.shadowColor = '#ef4444';
                  ctx.fillText(drop.text, drop.x + (Math.random() * 4 - 2), drop.y); // Jitter
              } else if (isHead) {
                  ctx.fillStyle = '#ffffff';
                  ctx.shadowBlur = 10;
                  ctx.shadowColor = '#ffffff';
                  ctx.fillText(drop.text, drop.x, drop.y);
              } else {
                  ctx.shadowBlur = 0;
                  if (isNearMouse) {
                      ctx.fillStyle = '#cffafe'; // Cyan-100 (Bright)
                      ctx.shadowBlur = 5;
                      ctx.shadowColor = drop.color;
                  } else {
                      ctx.fillStyle = drop.color;
                  }
                  ctx.fillText(drop.text, drop.x, drop.y);
              }

              // 4. Movement
              let moveSpeed = drop.speed;
              if (isNearMouse) {
                  // "Time Dilation" effect near mouse
                  moveSpeed *= 0.5;
              }
              
              drop.y += moveSpeed;

              // 5. Reset
              if (drop.y > height && Math.random() > 0.98) {
                  drop.y = -50; // Reset above screen
                  drop.speed = (Math.random() * 1.5 + 0.5) * layer.speedFactor;
                  drop.color = layer.colors[Math.floor(Math.random() * layer.colors.length)];
                  drop.text = splitLetters[Math.floor(Math.random() * splitLetters.length)];
              }
          });
      });
      
      // Reset global alpha for next frame's clearRect/fillRect
      ctx.globalAlpha = 1.0;
    };

    const interval = setInterval(draw, 33); // ~30 FPS

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initLayers();
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