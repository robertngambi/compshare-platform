import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause } from 'lucide-react';
import { ElectronicComponent } from '../types';

interface ThreeDModelViewerProps {
  component: ElectronicComponent;
  zoomLevel?: number;
}

export const ThreeDModelViewer: React.FC<ThreeDModelViewerProps> = ({ component }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [zoom, setZoom] = useState(1);
  const controlsRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    modelGroup: THREE.Group;
    isMouseDown: boolean;
    prevMousePos: { x: number; y: number };
    rotationSpeed: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 280;
    const height = container.clientHeight || 240;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(5.5, 4.5, 6.5);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(6, 12, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x90caf9, 0.4);
    dirLight2.position.set(-6, 3, -6);
    scene.add(dirLight2);

    // 5. Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // PCB Substrate (green FR4 board with silkscreen and copper)
    const pcbGeo = new THREE.BoxGeometry(4.2, 0.22, 3.8);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x1e782f, // solder mask green
      roughness: 0.35,
      metalness: 0.15,
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.position.y = -0.11;
    pcb.receiveShadow = true;
    modelGroup.add(pcb);

    // Silkscreen outline box on PCB
    const silkLineGeo = new THREE.BufferGeometry();
    const halfW = 1.6;
    const halfD = 1.3;
    const vertices = new Float32Array([
      -halfW, 0.01, -halfD,   halfW, 0.01, -halfD,
      halfW, 0.01, -halfD,    halfW, 0.01, halfD,
      halfW, 0.01, halfD,    -halfW, 0.01, halfD,
      -halfW, 0.01, halfD,   -halfW, 0.01, -halfD,
    ]);
    silkLineGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const silkLineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const silkBox = new THREE.LineSegments(silkLineGeo, silkLineMat);
    modelGroup.add(silkBox);

    // Silkscreen Pin 1 Polarity Dot on PCB
    const dotGeo = new THREE.CircleGeometry(0.12, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const silkDot = new THREE.Mesh(dotGeo, dotMat);
    silkDot.rotation.x = -Math.PI / 2;
    silkDot.position.set(-1.8, 0.02, -1.2);
    modelGroup.add(silkDot);

    // Component IC Body (Matte black epoxy encapsulation)
    const isDip = component.packageType === 'DIP-8';
    const isSot = component.packageType === 'SOT-23-6';
    const bodyW = isSot ? 1.6 : (isDip ? 2.6 : 2.2);
    const bodyH = isDip ? 0.9 : 0.55;
    const bodyD = isSot ? 1.3 : (isDip ? 1.9 : 1.7);

    const bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x222225, // epoxy dark grey / black
      roughness: 0.65,
      metalness: 0.2,
    });
    const icBody = new THREE.Mesh(bodyGeo, bodyMat);
    icBody.position.y = bodyH / 2 + 0.12;
    icBody.castShadow = true;
    modelGroup.add(icBody);

    // Orientation dimple on IC top
    const dimpleGeo = new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dimpleMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
    const dimple = new THREE.Mesh(dimpleGeo, dimpleMat);
    dimple.rotation.x = Math.PI;
    dimple.position.set(-bodyW / 2 + 0.35, bodyH + 0.12, -bodyD / 2 + 0.35);
    modelGroup.add(dimple);

    // Metallic Pins / Leads & Gold Copper Pads
    const padMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // gold ENIG copper pads
      roughness: 0.25,
      metalness: 0.85,
    });
    const leadMat = new THREE.MeshStandardMaterial({
      color: 0xdddedf, // tin / silver plated alloy leads
      roughness: 0.2,
      metalness: 0.9,
    });

    const leadCount = component.pins.length || 6;
    const leadsPerSide = Math.ceil(leadCount / 2);
    const leadSpacing = (bodyD * 0.75) / Math.max(leadsPerSide - 1, 1);

    for (let i = 0; i < leadsPerSide; i++) {
      const zPos = -((leadsPerSide - 1) * leadSpacing) / 2 + i * leadSpacing;

      // Left Pad
      const padL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.28), padMat);
      padL.position.set(-bodyW / 2 - 0.35, 0.015, zPos);
      modelGroup.add(padL);

      // Left Gull-wing Lead
      const leadL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.2), leadMat);
      leadL.position.set(-bodyW / 2 - 0.2, 0.16, zPos);
      leadL.castShadow = true;
      modelGroup.add(leadL);

      // Right Pad
      const padR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.28), padMat);
      padR.position.set(bodyW / 2 + 0.35, 0.015, zPos);
      modelGroup.add(padR);

      // Right Gull-wing Lead
      const leadR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.2), leadMat);
      leadR.position.set(bodyW / 2 + 0.2, 0.16, zPos);
      leadR.castShadow = true;
      modelGroup.add(leadR);
    }

    // Default angle tilt (isometric perspective like in screenshot)
    modelGroup.rotation.y = 0.65;
    modelGroup.rotation.x = 0.25;

    // Controls reference
    const ctrl = {
      scene,
      camera,
      renderer,
      modelGroup,
      isMouseDown: false,
      prevMousePos: { x: 0, y: 0 },
      rotationSpeed: { x: 0, y: 0 },
    };
    controlsRef.current = ctrl;

    // Mouse drag handlers
    const onMouseDown = (e: MouseEvent) => {
      ctrl.isMouseDown = true;
      ctrl.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!ctrl.isMouseDown) return;
      const dx = e.clientX - ctrl.prevMousePos.x;
      const dy = e.clientY - ctrl.prevMousePos.y;
      ctrl.modelGroup.rotation.y += dx * 0.012;
      ctrl.modelGroup.rotation.x += dy * 0.012;
      ctrl.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      ctrl.isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      camera.zoom = Math.max(0.4, Math.min(camera.zoom * zoomFactor, 3.5));
      camera.updateProjectionMatrix();
      setZoom(Number(camera.zoom.toFixed(2)));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        ctrl.isMouseDown = true;
        ctrl.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!ctrl.isMouseDown || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - ctrl.prevMousePos.x;
      const dy = e.touches[0].clientY - ctrl.prevMousePos.y;
      ctrl.modelGroup.rotation.y += dx * 0.012;
      ctrl.modelGroup.rotation.x += dy * 0.012;
      ctrl.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      ctrl.isMouseDown = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isRotating && !ctrl.isMouseDown) {
        modelGroup.rotation.y += 0.007;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [component, isRotating]);

  const handleZoom = (inOut: 'in' | 'out') => {
    if (!controlsRef.current) return;
    const cam = controlsRef.current.camera;
    cam.zoom = Math.max(0.4, Math.min(cam.zoom * (inOut === 'in' ? 1.25 : 0.8), 3.5));
    cam.updateProjectionMatrix();
    setZoom(Number(cam.zoom.toFixed(2)));
  };

  const handleReset = () => {
    if (!controlsRef.current) return;
    controlsRef.current.modelGroup.rotation.set(0.25, 0.65, 0);
    controlsRef.current.camera.zoom = 1;
    controlsRef.current.camera.updateProjectionMatrix();
    setZoom(1);
  };

  return (
    <div className="relative w-full h-full min-h-[220px] bg-slate-900 rounded overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Toolbar Controls */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-xs p-1 rounded-md text-white/90 text-xs shadow-md">
        <button
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? 'Pause rotation' : 'Start rotation'}
          className="p-1 hover:bg-white/20 rounded transition"
        >
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-1 hover:bg-white/20 rounded transition"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-1 hover:bg-white/20 rounded transition"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          title="Reset Camera"
          className="p-1 hover:bg-white/20 rounded transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="px-1 text-[10px] text-gray-300 font-mono">{(zoom * 100).toFixed(0)}%</span>
      </div>
      <div className="absolute top-2 left-2 pointer-events-none text-[10px] font-mono text-gray-400 bg-black/40 px-1.5 py-0.5 rounded">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};
