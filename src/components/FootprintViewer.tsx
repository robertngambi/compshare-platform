import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ElectronicComponent } from '../types';

interface FootprintViewerProps {
  component: ElectronicComponent;
}

export const FootprintViewer: React.FC<FootprintViewerProps> = ({ component }) => {
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

  const pads = component.pads && component.pads.length > 0 ? component.pads : [
    { number: 1, x: -1.3, y: -0.95, width: 1.0, height: 0.6, shape: 'rect' as const, type: 'smd' as const },
    { number: 2, x: -1.3, y: 0.0, width: 1.0, height: 0.6, shape: 'rect' as const, type: 'smd' as const },
    { number: 3, x: -1.3, y: 0.95, width: 1.0, height: 0.6, shape: 'rect' as const, type: 'smd' as const },
    { number: 4, x: 1.3, y: 0.95, width: 1.0, height: 0.6, shape: 'rect' as const, type: 'smd' as const },
    { number: 5, x: 1.3, y: 0.0, width: 1.0, height: 0.6, shape: 'rect' as const, type: 'smd' as const },
    { number: 6, x: 1.3, y: -0.95, width: 1.0, height: 0.6, shape: 'rect' as const, type: 'smd' as const },
  ];

  // Scale mm to SVG pixels: 1 mm ~ 35px
  const mmToPx = 36;

  return (
    <div
      className="relative w-full h-full min-h-[220px] bg-black border border-neutral-800 rounded overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      {/* CAD Coordinate Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
        <defs>
          <pattern id="footprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00e5ff" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footprintGrid)" />
      </svg>

      {/* Footprint Graphics */}
      <div
        className="transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        <svg width="240" height="200" viewBox="-120 -100 240 200" className="overflow-visible">
          {/* Silkscreen Top / Bottom Guides matching screenshot cyan bars */}
          <line x1="-35" y1="-55" x2="35" y2="-55" stroke="#00e5ff" strokeWidth="3" strokeLinecap="round" />
          <line x1="-35" y1="55" x2="35" y2="55" stroke="#00e5ff" strokeWidth="3" strokeLinecap="round" />

          {/* Cyan Pin 1 Polarity Marker Dot */}
          <circle cx="-65" cy="-35" r="5.5" fill="#00e5ff" />

          {/* Red Copper SMD Pads with Pad Numbers */}
          {pads.map(pad => {
            const padW = pad.width * mmToPx;
            const padH = pad.height * mmToPx;
            const px = pad.x * mmToPx;
            const py = pad.y * mmToPx;

            return (
              <g key={`pad-${pad.number}`}>
                {/* Pad copper rectangle (deep red matching EDA layout) */}
                <rect
                  x={px - padW / 2}
                  y={py - padH / 2}
                  width={padW}
                  height={padH}
                  rx="2"
                  fill="#b91c1c"
                  stroke="#ef4444"
                  strokeWidth="1"
                />
                {/* Pad Number in white */}
                <text
                  x={px}
                  y={py + 3.5}
                  fontSize="11"
                  fontFamily="monospace"
                  fill="#ffffff"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {pad.number}
                </text>
              </g>
            );
          })}

          {/* Crosshair origin */}
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#475569" strokeWidth="0.8" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke="#475569" strokeWidth="0.8" />
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

      <div className="absolute top-2 left-2 pointer-events-none text-[10px] font-mono text-cyan-400 bg-black/70 px-1.5 py-0.5 rounded">
        Drag to pan • Scroll to zoom
      </div>
    </div>
  );
};
