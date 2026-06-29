import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pen, RotateCcw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
}

export default function Whiteboard({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = isEraser ? '#000000' : color;
      ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    }
  }, [color, isEraser]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath(); // Reset path so next line isn't connected
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = isEraser ? 20 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const colors = ['#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];

  return (
    <div className={cn("flex flex-col gap-4 border border-nord-3 rounded-2xl p-4 bg-nord-1/50", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEraser(false)}
            className={cn("p-2 rounded-lg transition-colors", !isEraser ? "bg-white/20 text-white" : "text-nord-4 hover:text-white")}
          >
            <Pen className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsEraser(true)}
            className={cn("p-2 rounded-lg transition-colors", isEraser ? "bg-white/20 text-white" : "text-nord-4 hover:text-white")}
          >
            <Eraser className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-2" />
          {colors.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); }}
              className={cn("w-6 h-6 rounded-full border-2 transition-transform", color === c && !isEraser ? "scale-125 border-white" : "border-transparent hover:scale-110")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button 
          onClick={clearCanvas}
          className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
          title="Clear Board"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden bg-[#000000] border border-nord-3 shadow-inner touch-none cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
}
