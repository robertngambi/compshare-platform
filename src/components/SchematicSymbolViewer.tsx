import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ElectronicComponent } from '../types';

interface SchematicSymbolViewerProps {
  component: ElectronicComponent;
}

export const SchematicSymbolViewer: React.FC<SchematicSymbolViewerProps> = ({ component }) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const onMouseUp = () => setIsDragging(false);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setScale(prev => Math.max(0.4, Math.min(prev * factor, 3.5)));
  };

  const leftPins = component.pins.filter(p => p.side === 'left');
  const rightPins = component.pins.filter(p => p.side === 'right');

  return (
    <div
      className="relative w-full h-full min-h-[220px] bg-[#d9d5c5] border border-[#a89d88] rounded overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      {/* Background Engineering Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <pattern id="schematicGrid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#75654c" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#schematicGrid)" />
      </svg>

      {/* Symbol Graphics Canvas */}
      <div
        className="transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        <svg width="240" height="200" viewBox="0 0 240 200" className="overflow-visible">
          {/* Main IC Symbol Box matching screenshot styling */}
          <rect
            x="60"
            y="25"
            width="120"
            height="145"
            fill="#d2cdba"
            stroke="#6e3729"
            strokeWidth="2.5"
          />

          {/* Left Pins */}
          {leftPins.map((pin, index) => {
            const spacing = 145 / (leftPins.length + 1);
            const y = 25 + (index + 1) * spacing;
            return (
              <g key={`l-${pin.number}`}>
                {/* Pin lead line */}
                <line x1="32" y1={y} x2="60" y2={y} stroke="#6e3729" strokeWidth="2.2" />
                {/* Pin number outside */}
                <text
                  x="24"
                  y={y + 3.5}
                  fontSize="9"
                  fontFamily="monospace"
                  fill="#5c3022"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  {pin.number}
                </text>
                {/* Pin name inside */}
                <text
                  x="68"
                  y={y + 3.5}
                  fontSize="10"
                  fontFamily="sans-serif"
                  fill="#412419"
                  fontWeight="600"
                >
                  {pin.name}
                </text>
              </g>
            );
          })}

          {/* Right Pins */}
          {rightPins.map((pin, index) => {
            const spacing = 145 / (rightPins.length + 1);
            const y = 25 + (index + 1) * spacing;
            return (
              <g key={`r-${pin.number}`}>
                {/* Pin lead line */}
                <line x1="180" y1={y} x2="208" y2={y} stroke="#6e3729" strokeWidth="2.2" />
                {/* Pin number outside */}
                <text
                  x="216"
                  y={y + 3.5}
                  fontSize="9"
                  fontFamily="monospace"
                  fill="#5c3022"
                  textAnchor="start"
                  fontWeight="bold"
                >
                  {pin.number}
                </text>
                {/* Pin name inside */}
                <text
                  x="172"
                  y={y + 3.5}
                  fontSize="10"
                  fontFamily="sans-serif"
                  fill="#412419"
                  textAnchor="end"
                  fontWeight="600"
                >
                  {pin.name}
                </text>
              </g>
            );
          })}

          {/* Component reference/name */}
          <text
            x="120"
            y="18"
            fontSize="9.5"
            fontFamily="monospace"
            fill="#523927"
            textAnchor="middle"
            fontWeight="bold"
          >
            U? ({component.name.slice(0, 10)})
          </text>
        </svg>
      </div>

      {/* Floating Zoom & Reset Toolbar */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-xs p-1 rounded-md text-white/90 text-xs shadow-md">
        <button
          onClick={() => setScale(s => Math.min(s * 1.25, 3.5))}
          title="Zoom In"
          className="p-1 hover:bg-white/20 rounded transition"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(s * 0.8, 0.4))}
          title="Zoom Out"
          className="p-1 hover:bg-white/20 rounded transition"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset View"
          className="p-1 hover:bg-white/20 rounded transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="px-1 text-[10px] text-gray-300 font-mono">{(scale * 100).toFixed(0)}%</span>
      </div>

      <div className="absolute top-2 left-2 pointer-events-none text-[10px] font-mono text-[#5f4937] bg-white/50 px-1.5 py-0.5 rounded">
        Drag to pan • Scroll to zoom
      </div>
    </div>
  );
};
