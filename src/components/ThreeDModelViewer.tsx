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

  const pkg = component.packageType || 'SOIC-8';
  const isDip = pkg === 'DIP-8';
  const isSot = pkg === 'SOT-23-6';

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 280;
    const height = container.clientHeight || 240;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark slate backdrop matching CAD viewer

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(5.2, 4.2, 6.2);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(6, 12, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.5);
    dirLight2.position.set(-6, 4, -6);
    scene.add(dirLight2);

    // 5. Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // PCB Substrate: FR4 dark solder mask green with glossy reflections
    const pcbW = isDip ? 5.2 : (isSot ? 3.8 : 4.4);
    const pcbD = isDip ? 5.0 : (isSot ? 3.6 : 4.2);
    const pcbGeo = new THREE.BoxGeometry(pcbW, 0.2, pcbD);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // dark solder mask green
      roughness: 0.3,
      metalness: 0.2,
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.position.y = -0.1;
    pcb.receiveShadow = true;
    modelGroup.add(pcb);

    // Common Materials
    const padMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04, // gold ENIG copper pads
      roughness: 0.2,
      metalness: 0.85,
    });
    const drillMat = new THREE.MeshBasicMaterial({
      color: 0x050505, // black drill hole through PCB
    });
    const leadMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // silver / tin lead finish
      roughness: 0.2,
      metalness: 0.9,
    });
    const silkLineMat = new THREE.LineBasicMaterial({ color: 0xffffff }); // white silkscreen on green PCB
    const silkDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    // Build Package Specific 3D Geometries matching Footprint
    if (isDip) {
      // --- DIP-8 Through-Hole Component ---
      const bodyW = 2.4;
      const bodyH = 0.9;
      const bodyD = 3.6;

      // 1. Silkscreen Outline Box with U-Notch on top edge
      const silkPts: THREE.Vector3[] = [
        new THREE.Vector3(-bodyW / 2 - 0.2, 0.015, -bodyD / 2 - 0.1),
        new THREE.Vector3(-0.35, 0.015, -bodyD / 2 - 0.1),
        new THREE.Vector3(0, 0.015, -bodyD / 2 + 0.25), // notch
        new THREE.Vector3(0.35, 0.015, -bodyD / 2 - 0.1),
        new THREE.Vector3(bodyW / 2 + 0.2, 0.015, -bodyD / 2 - 0.1),
        new THREE.Vector3(bodyW / 2 + 0.2, 0.015, bodyD / 2 + 0.1),
        new THREE.Vector3(-bodyW / 2 - 0.2, 0.015, bodyD / 2 + 0.1),
        new THREE.Vector3(-bodyW / 2 - 0.2, 0.015, -bodyD / 2 - 0.1),
      ];
      const silkGeo = new THREE.BufferGeometry().setFromPoints(silkPts);
      const silkLine = new THREE.Line(silkGeo, silkLineMat);
      modelGroup.add(silkLine);

      // Pin 1 White Dot on PCB
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), silkDotMat);
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(-bodyW / 2 - 0.5, 0.02, -bodyD / 2 + 0.4);
      modelGroup.add(dot);

      // 2. Component IC Epoxy Body
      const bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1f242c,
        roughness: 0.7,
        metalness: 0.15,
      });
      const icBody = new THREE.Mesh(bodyGeo, bodyMat);
      icBody.position.y = bodyH / 2 + 0.25;
      icBody.castShadow = true;
      modelGroup.add(icBody);

      // Top notch indent on DIP body
      const notchGeo = new THREE.CylinderGeometry(0.2, 0.2, bodyH + 0.02, 16);
      const notch = new THREE.Mesh(notchGeo, new THREE.MeshStandardMaterial({ color: 0x15181e }));
      notch.position.set(0, bodyH / 2 + 0.25, -bodyD / 2);
      modelGroup.add(notch);

      // 3. 8 Through-Hole Copper Annular Rings & Silver Metal Pins
      const pinPositions = [
        { x: -1.5, z: -1.35 },
        { x: -1.5, z: -0.45 },
        { x: -1.5, z: 0.45 },
        { x: -1.5, z: 1.35 },
        { x: 1.5, z: 1.35 },
        { x: 1.5, z: 0.45 },
        { x: 1.5, z: -0.45 },
        { x: 1.5, z: -1.35 },
      ];

      pinPositions.forEach(pos => {
        // Copper Annular Ring Pad on PCB
        const padRing = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 20), padMat);
        padRing.position.set(pos.x, 0.012, pos.z);
        modelGroup.add(padRing);

        // Black Drill hole inside pad
        const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16), drillMat);
        drill.position.set(pos.x, 0.015, pos.z);
        modelGroup.add(drill);

        // Through-hole leg extending down from IC into PCB
        const legH = 0.55;
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, legH, 0.16), leadMat);
        leg.position.set(pos.x, legH / 2 + 0.02, pos.z);
        leg.castShadow = true;
        modelGroup.add(leg);

        // Upper pin shoulder connecting to body
        const shoulderW = Math.abs(pos.x) - bodyW / 2 + 0.1;
        const shoulder = new THREE.Mesh(new THREE.BoxGeometry(shoulderW, 0.1, 0.18), leadMat);
        shoulder.position.set(pos.x > 0 ? bodyW / 2 + shoulderW / 2 - 0.05 : -bodyW / 2 - shoulderW / 2 + 0.05, 0.55, pos.z);
        shoulder.castShadow = true;
        modelGroup.add(shoulder);
      });
    } else {
      // --- SMT Component (SOIC-8 or SOT-23-6) ---
      const bodyW = isSot ? 1.5 : 2.2;
      const bodyH = isSot ? 0.5 : 0.6;
      const bodyD = isSot ? 1.9 : 2.6;
      const leadCount = isSot ? 6 : 8;
      const leadsPerSide = leadCount / 2;

      // 1. Silkscreen Outline Box on PCB matching Footprint
      const silkPts: THREE.Vector3[] = [
        new THREE.Vector3(-bodyW / 2 - 0.1, 0.015, -bodyD / 2 - 0.2),
        new THREE.Vector3(bodyW / 2 + 0.1, 0.015, -bodyD / 2 - 0.2),
        new THREE.Vector3(bodyW / 2 + 0.1, 0.015, bodyD / 2 + 0.2),
        new THREE.Vector3(-bodyW / 2 - 0.1, 0.015, bodyD / 2 + 0.2),
        new THREE.Vector3(-bodyW / 2 - 0.1, 0.015, -bodyD / 2 - 0.2),
      ];
      const silkGeo = new THREE.BufferGeometry().setFromPoints(silkPts);
      const silkLine = new THREE.Line(silkGeo, silkLineMat);
      modelGroup.add(silkLine);

      // Pin 1 White Dot on PCB
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), silkDotMat);
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(-bodyW / 2 - 0.65, 0.02, -bodyD / 2 + 0.35);
      modelGroup.add(dot);

      // 2. Component IC Body
      const bodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x222226,
        roughness: 0.65,
        metalness: 0.2,
      });
      const icBody = new THREE.Mesh(bodyGeo, bodyMat);
      icBody.position.y = bodyH / 2 + 0.12;
      icBody.castShadow = true;
      modelGroup.add(icBody);

      // Pin 1 chamfer dimple on IC surface
      const dimple = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9 })
      );
      dimple.rotation.x = Math.PI;
      dimple.position.set(-bodyW / 2 + 0.32, bodyH + 0.12, -bodyD / 2 + 0.35);
      modelGroup.add(dimple);

      // 3. Gull-Wing SMT Leads & Copper Pads
      const padWidth = 0.55;
      const padLength = 0.26;
      const leadSpanX = bodyW / 2 + 0.35;
      const zSpacing = (bodyD * 0.72) / (leadsPerSide - 1);

      for (let i = 0; i < leadsPerSide; i++) {
        const zPos = -((leadsPerSide - 1) * zSpacing) / 2 + i * zSpacing;

        // Left Copper Pad on PCB
        const padL = new THREE.Mesh(new THREE.BoxGeometry(padWidth, 0.025, padLength), padMat);
        padL.position.set(-leadSpanX, 0.012, zPos);
        modelGroup.add(padL);

        // Left Gull-wing Lead
        const leadL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.07, 0.18), leadMat);
        leadL.position.set(-bodyW / 2 - 0.18, 0.14, zPos);
        leadL.castShadow = true;
        modelGroup.add(leadL);

        // Right Copper Pad on PCB
        const padR = new THREE.Mesh(new THREE.BoxGeometry(padWidth, 0.025, padLength), padMat);
        padR.position.set(leadSpanX, 0.012, zPos);
        modelGroup.add(padR);

        // Right Gull-wing Lead
        const leadR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.07, 0.18), leadMat);
        leadR.position.set(bodyW / 2 + 0.18, 0.14, zPos);
        leadR.castShadow = true;
        modelGroup.add(leadR);
      }
    }

    // Default angle tilt (isometric perspective matching EDA viewer)
    modelGroup.rotation.y = 0.65;
    modelGroup.rotation.x = 0.28;

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
  }, [component, isRotating, isDip, isSot]);

  const handleZoom = (inOut: 'in' | 'out') => {
    if (!controlsRef.current) return;
    const cam = controlsRef.current.camera;
    cam.zoom = Math.max(0.4, Math.min(cam.zoom * (inOut === 'in' ? 1.25 : 0.8), 3.5));
    cam.updateProjectionMatrix();
    setZoom(Number(cam.zoom.toFixed(2)));
  };

  const handleReset = () => {
    if (!controlsRef.current) return;
    controlsRef.current.modelGroup.rotation.set(0.28, 0.65, 0);
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
          className="p-1 hover:bg-white/20 rounded transition cursor-pointer"
        >
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-1 hover:bg-white/20 rounded transition cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-1 hover:bg-white/20 rounded transition cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          title="Reset Camera"
          className="p-1 hover:bg-white/20 rounded transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="px-1 text-[10px] text-gray-300 font-mono">{(zoom * 100).toFixed(0)}%</span>
      </div>
      <div className="absolute top-2 left-2 pointer-events-none text-[10px] font-mono text-cyan-400 bg-black/70 px-1.5 py-0.5 rounded">
        {pkg} 3D Model • Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};
