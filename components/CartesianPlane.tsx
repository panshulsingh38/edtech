'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface CartesianPlaneProps {
  onCoordinateSelect: (x: number, y: number) => void;
  disabled?: boolean;
  correctAnswer?: { x: number, y: number } | null;
  selectedCoordinate?: { x: number, y: number } | null;
}

export default function CartesianPlane({ onCoordinateSelect, disabled, correctAnswer, selectedCoordinate }: CartesianPlaneProps) {
  const GRID_SIZE = 10;
  const CELL_SIZE = 20;
  const PIXEL_SIZE = GRID_SIZE * 2 * CELL_SIZE;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel coordinates to Cartesian coordinates
    const x = Math.round((clickX - PIXEL_SIZE / 2) / CELL_SIZE);
    const y = Math.round((PIXEL_SIZE / 2 - clickY) / CELL_SIZE);

    if (x >= -GRID_SIZE && x <= GRID_SIZE && y >= -GRID_SIZE && y <= GRID_SIZE) {
      onCoordinateSelect(x, y);
    }
  };

  const toPixel = (x: number, y: number) => {
    return {
      left: PIXEL_SIZE / 2 + x * CELL_SIZE,
      top: PIXEL_SIZE / 2 - y * CELL_SIZE
    };
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative bg-nord-1/50 border-2 border-white/20 rounded-xl overflow-hidden cursor-crosshair shadow-lg"
        style={{ width: PIXEL_SIZE, height: PIXEL_SIZE }}
        onClick={handleClick}
      >
        {/* Grid Lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          backgroundPosition: 'center center'
        }} />

        {/* Axes */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/40 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-[2px] bg-white/40 -translate-x-1/2" />

        {/* Labels */}
        <span className="absolute top-1/2 right-2 text-xs text-white/50 -translate-y-6">x</span>
        <span className="absolute left-1/2 top-2 text-xs text-white/50 ml-2">y</span>

        {/* Selected Point */}
        {selectedCoordinate && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute w-4 h-4 bg-nord-8 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-[0_0_10px_rgba(99,102,241,0.8)]"
            style={{ ...toPixel(selectedCoordinate.x, selectedCoordinate.y) }}
          />
        )}

        {/* Correct Point (if showing results and wrong) */}
        {correctAnswer && (selectedCoordinate?.x !== correctAnswer.x || selectedCoordinate?.y !== correctAnswer.y) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute w-5 h-5 text-green-400 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
            style={{ ...toPixel(correctAnswer.x, correctAnswer.y) }}
          >
            <Target className="w-5 h-5" />
          </motion.div>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-nord-4">
        {selectedCoordinate 
          ? `Selected: (${selectedCoordinate.x}, ${selectedCoordinate.y})` 
          : 'Click on the grid to select a coordinate'}
      </div>
    </div>
  );
}
