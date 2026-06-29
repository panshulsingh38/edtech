'use client';

import React, { useState, useEffect } from 'react';

interface Variable {
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

interface PhysicsSlidersProps {
  variables: Variable[];
  onChange: (values: Record<string, number>) => void;
  disabled?: boolean;
}

export default function PhysicsSliders({ variables, onChange, disabled }: PhysicsSlidersProps) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    variables.forEach(v => {
      initial[v.name] = v.defaultValue;
    });
    return initial;
  });

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  const handleChange = (name: string, val: number) => {
    if (disabled) return;
    setValues(prev => ({ ...prev, [name]: val }));
  };

  return (
    <div className="space-y-6 bg-glass-surface p-6 rounded-xl border border-glass-border mt-4">
      <h4 className="text-sm font-bold tracking-wider uppercase text-white mb-4">Interactive Variables</h4>
      {variables.map((v) => (
        <div key={v.name} className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-zinc-400 font-medium capitalize">{v.name}</label>
            <span className="text-white font-mono bg-electric-blue/10 px-2 py-1 rounded text-sm">
              {values[v.name]}
            </span>
          </div>
          <input
            type="range"
            min={v.min}
            max={v.max}
            step={v.step}
            value={values[v.name]}
            onChange={(e) => handleChange(v.name, parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{v.min}</span>
            <span>{v.max}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
