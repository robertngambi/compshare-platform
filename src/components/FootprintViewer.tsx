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

  const pkg = component.packageType || 'SOIC-8';
  const isDip = pkg === 'DIP-8';
  const isSot = pkg === 'SOT-23-6';

  const pads = component.pads && component.pads.length > 0 ? component.pads : [
    { number: 1, x: -2.7, y: -1.905, width: 1.55, height: 0.65, shape: 'rect' as const, type: 'smd' as const },
    { number: 2, x: -2.7, y: -0.635, width: 1.55, height: 0.65, shape: 'rect' as const, type: 'smd' as const },
    { number: 3, x: -2.7, y: 0.635, width: 1.55, height: 0.65, shape: 'rect' as const, type: 'smd' as const },
    { number: 4, x: -2.7, y: 1.905, width: 1.55, height: 0.65, shape: 'rect' as const, type: 'smd' as const },
    { number: 5, x: 2.7, y: 1.905, width: 1.55, height: 0.65, shape: 'rect' as const, type: 'smd' as const },
    { number: 6, x: 2.7, y: 0.635, width: 1.55, height: 0.65, shape: 'rect' as const, type: 'smd' as const },
    { number: 7, x: 2.7, y: -0.635, width: 1.55, height: 0.65, shape: 'rect' as const, type: 'smd' as const },
    { number: 8, x: 2.7, y: -1.905, width: 1.55, height: 0.65, shape: 'rect' as const, type: 'smd' as const },
  ];

  // Scale factor mm to SVG coordinate units
  const mmToPx = isDip ? 20 : (isSot ? 42 : 28);

  // Silkscreen dimensions calculated to match the 3D model body outline
  const bodyHalfW = isDip ? 3.0 * mmToPx : (isSot ? 0.9 * mmToPx : 2.0 * mmToPx);
  const bodyHalfH = isDip ? 4.8 * mmToPx : (isSot ? 1.5 * mmToPx : 2.6 * mmToPx);

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
        <svg width="260" height="220" viewBox="-130 -110 260 220" className="overflow-visible">
          {/* Silkscreen Layer (Cyan) matching 3D Model Body dimensions & Polarity Notch */}
          {isDip ? (
            /* DIP-8 Silkscreen with Top U-Notch */
            <g stroke="#00e5ff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path
                d={`M -${bodyHalfW} -${bodyHalfH} 
                   L -12 -${bodyHalfH} 
                   A 12 12 0 0 0 12 -${bodyHalfH} 
                   L ${bodyHalfW} -${bodyHalfH} 
                   L ${bodyHalfW} ${bodyHalfH} 
                   L -${bodyHalfW} ${bodyHalfH} Z`}
              />
              {/* Pin 1 Polarity Marker Dot */}
              <circle cx={-bodyHalfW - 12} cy={-bodyHalfH + 12} r="4.5" fill="#00e5ff" stroke="none" />
              {/* Reference Text */}
              <text x="0" y="4" fill="#00e5ff" fontSize="11" fontFamily="monospace" textAnchor="middle" stroke="none">
                U1 ({pkg})
              </text>
            </g>
          ) : (
            /* SMT Silkscreen (SOIC / SOT) */
            <g stroke="#00e5ff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Horizontal Boundary Guides */}
              <line x1={-bodyHalfW} y1={-bodyHalfH} x2={bodyHalfW} y2={-bodyHalfH} />
              <line x1={-bodyHalfW} y1={bodyHalfH} x2={bodyHalfW} y2={bodyHalfH} />
              {/* Chamfer notch at top-left pin 1 corner */}
              <line x1={-bodyHalfW} y1={-bodyHalfH} x2={-bodyHalfW} y2={-bodyHalfH + 14} />
              <line x1={bodyHalfW} y1={-bodyHalfH} x2={bodyHalfW} y2={-bodyHalfH + 14} />
              <line x1={-bodyHalfW} y1={bodyHalfH} x2={-bodyHalfW} y2={bodyHalfH - 14} />
              <line x1={bodyHalfW} y1={bodyHalfH} x2={bodyHalfW} y2={bodyHalfH - 14} />

              {/* Pin 1 Polarity Dot */}
              <circle cx={-bodyHalfW - 14} cy={-bodyHalfH + 10} r="4.5" fill="#00e5ff" stroke="none" />

              {/* Reference Designator Text */}
              <text x="0" y="3.5" fill="#00e5ff" fontSize="10" fontFamily="monospace" textAnchor="middle" stroke="none">
                {pkg}
              </text>
            </g>
          )}

          {/* Copper Pads with Pad Numbers - matching through-hole or SMD */}
          {pads.map(pad => {
            const px = pad.x * mmToPx;
            const py = pad.y * mmToPx;

            if (pad.type === 'tht' || pad.shape === 'round') {
              // Plated Through-Hole (THT) pad with copper annular ring and drill hole
              const radius = (pad.width * mmToPx) / 2;
              const drillRadius = radius * 0.52;

              return (
                <g key={`pad-${pad.number}`}>
                  {/* Outer copper pad */}
                  <circle
                    cx={px}
                    cy={py}
                    r={radius}
                    fill="#b91c1c"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                  />
                  {/* Inner drill hole (black) */}
                  <circle
                    cx={px}
                    cy={py}
                    r={drillRadius}
                    fill="#000000"
                    stroke="#fca5a5"
                    strokeWidth="0.8"
                  />
                  {/* Pad Number in white */}
                  <text
                    x={px}
                    y={py + 3.5}
                    fontSize="10"
                    fontFamily="monospace"
                    fill="#ffffff"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {pad.number}
                  </text>
                </g>
              );
            }

            // SMT Rectangular Copper Pad
            const padW = pad.width * mmToPx;
            const padH = pad.height * mmToPx;

            return (
              <g key={`pad-${pad.number}`}>
                <rect
                  x={px - padW / 2}
                  y={py - padH / 2}
                  width={padW}
                  height={padH}
                  rx="2"
                  fill="#b91c1c"
                  stroke="#ef4444"
                  strokeWidth="1.2"
                />
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
          className="p-1 hover:bg-white/20 rounded transition cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(s * 0.8, 0.4))}
          title="Zoom Out"
          className="p-1 hover:bg-white/20 rounded transition cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset View"
          className="p-1 hover:bg-white/20 rounded transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="px-1 text-[10px] text-gray-300 font-mono">{(scale * 100).toFixed(0)}%</span>
      </div>

      <div className="absolute top-2 left-2 pointer-events-none text-[10px] font-mono text-cyan-400 bg-black/70 px-1.5 py-0.5 rounded">
        {pkg} Footprint • Drag to pan • Scroll to zoom
      </div>
    </div>
  );
};
