import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isListening }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const lineWidth = 3;
    const primaryColor = '#4F46E5'; // Indigo-600
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set line style
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.strokeStyle = primaryColor;

      if (!isListening) {
        // Draw flat line with subtle pulse when not recording
        const pulseIntensity = (Math.sin(phase * 0.5) + 1) * 0.5;
        ctx.globalAlpha = 0.2 + pulseIntensity * 0.1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      } else {
        // Draw smooth wave animation when recording
        const segments = 50;
        const segmentWidth = canvas.width / segments;
        
        // Main wave
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const x = i * segmentWidth;
          const normalizedX = i / segments;
          
          // Create natural wave movement
          const y = canvas.height / 2 + 
                   Math.sin(normalizedX * 4 + phase) * 20 * Math.sin(phase * 0.5) +
                   Math.sin(normalizedX * 8 - phase * 1.5) * 10;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.bezierCurveTo(
              x - segmentWidth * 0.5, y,
              x - segmentWidth * 0.5, y,
              x, y
            );
          }
        }
        ctx.stroke();

        // Secondary wave (echo effect)
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const x = i * segmentWidth;
          const normalizedX = i / segments;
          
          const y = canvas.height / 2 + 
                   Math.sin(normalizedX * 4 + phase * 1.2) * 30 * Math.sin(phase * 0.5) +
                   Math.sin(normalizedX * 8 - phase * 1.8) * 15;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.bezierCurveTo(
              x - segmentWidth * 0.5, y,
              x - segmentWidth * 0.5, y,
              x, y
            );
          }
        }
        ctx.stroke();
      }

      phase += isListening ? 0.1 : 0.03;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          className="w-full h-full"
        />
        {!isListening && (
          <div className="absolute inset-0 flex items-center justify-center text-indigo-600/60 font-medium">
            Click Start Recording to begin...
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioVisualizer;