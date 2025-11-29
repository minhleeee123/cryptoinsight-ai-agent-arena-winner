
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const TechAvatar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef(new THREE.Vector2());
  const targetRotation = useRef(new THREE.Vector2());
  const windowHalfX = useRef(window.innerWidth / 2);
  const windowHalfY = useRef(window.innerHeight / 2);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- 1. SETUP ---
    const scene = new THREE.Scene();
    
    // Camera Setup
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
    camera.position.z = 10;
    camera.position.y = 0;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // --- 2. LIGHTING (Ultra Bright Tech Setup) ---
    // Hemisphere Light: Intense base light
    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x2e1065, 3.0); 
    scene.add(hemiLight);

    // Main Key Light (Cyan)
    const keyLight = new THREE.DirectionalLight(0x22d3ee, 4);
    keyLight.position.set(5, 5, 8);
    scene.add(keyLight);

    // Back Light (Magenta) for outline
    const backLight = new THREE.DirectionalLight(0xd946ef, 4);
    backLight.position.set(-5, 2, -10);
    scene.add(backLight);

    // --- 3. OBJECTS GROUP ---
    const pivot = new THREE.Group();
    scene.add(pivot);

    // --- LAYER 1: INNER CORE (Bright Energy) ---
    const coreGeo = new THREE.OctahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, // Use BasicMaterial so it's always bright, ignores shadow
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    pivot.add(coreMesh);

    // --- LAYER 2: MECHANICAL SHELL (Visible Tech Armor) ---
    const shellGroup = new THREE.Group();
    pivot.add(shellGroup);

    const mainShellGeo = new THREE.IcosahedronGeometry(2, 1);
    
    // FIX: Lower metalness, use BlinnPhong or Standard with low roughness for visibility without env map
    const mainShellMat = new THREE.MeshStandardMaterial({
        color: 0x334155, // Slate 700 (Visible grey-blue)
        emissive: 0x1e3a8a, // Blue glow from within
        emissiveIntensity: 0.4,
        metalness: 0.2, // Low metalness to avoid black reflection
        roughness: 0.2,
        flatShading: true,
    });
    const mainShell = new THREE.Mesh(mainShellGeo, mainShellMat);
    shellGroup.add(mainShell);

    // ADDITION: Wireframe overlay for High-Tech look & Visibility
    const wireframeGeo = new THREE.IcosahedronGeometry(2.05, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa, // Light blue wireframe
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const wireframeShell = new THREE.Mesh(wireframeGeo, wireframeMat);
    shellGroup.add(wireframeShell);

    // Add "Greebles" (Floating Data Plates)
    const plateGeo = new THREE.BoxGeometry(0.4, 0.4, 0.05);
    const plateMat = new THREE.MeshStandardMaterial({ 
        color: 0x0ea5e9, // Sky Blue
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.5,
        metalness: 0.5, 
        roughness: 0.1 
    });
    
    for (let i = 0; i < 18; i++) {
        const plate = new THREE.Mesh(plateGeo, plateMat);
        // Random position
        const phi = Math.acos(-1 + (2 * i) / 18);
        const theta = Math.sqrt(18 * Math.PI) * phi;
        
        plate.position.setFromSphericalCoords(2.3, phi, theta);
        plate.lookAt(0, 0, 0);
        plate.scale.set(1 + Math.random(), 1 + Math.random(), 1); 
        shellGroup.add(plate);
    }

    // --- LAYER 3: SCANNER EYE (The Interface) ---
    const scannerGeo = new THREE.TorusGeometry(2.4, 0.03, 16, 100, Math.PI / 2.5); // Arc
    const scannerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Bright sky blue
    const scannerRing = new THREE.Mesh(scannerGeo, scannerMat);
    scannerRing.rotation.z = Math.PI / 2;
    scannerRing.position.z = 0.5;
    pivot.add(scannerRing);

    // The glowing eye lens
    const lensGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 2.0; 
    lens.scale.set(0.2, 1, 0.2); 
    pivot.add(lens);

    // --- LAYER 4: ORBITAL RINGS ---
    const ringGroup = new THREE.Group();
    pivot.add(ringGroup);

    const outerRingGeo = new THREE.TorusGeometry(3.5, 0.02, 16, 100);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.3 });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    ringGroup.add(outerRing);

    // --- 4. ANIMATION LOOP ---
    const onDocumentMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX - windowHalfX.current);
      mouse.current.y = (event.clientY - windowHalfY.current);
    };

    const onWindowResize = () => {
        if (!containerRef.current) return;
        windowHalfX.current = window.innerWidth / 2;
        windowHalfY.current = window.innerHeight / 2;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Mouse Tracking
      targetRotation.current.x = mouse.current.y * 0.0008; 
      targetRotation.current.y = mouse.current.x * 0.0008;

      pivot.rotation.x += 0.05 * (targetRotation.current.x - pivot.rotation.x);
      pivot.rotation.y += 0.05 * (targetRotation.current.y - pivot.rotation.y);

      // Idle Motion
      pivot.position.y = Math.sin(time) * 0.3;
      
      // Rotations
      coreMesh.rotation.y += 0.03;
      coreMesh.rotation.z -= 0.01;
      
      shellGroup.rotation.z = Math.sin(time * 0.5) * 0.1;

      outerRing.rotation.x = Math.sin(time * 0.5) * 0.3;
      outerRing.rotation.y = Math.cos(time * 0.2) * 0.3;

      scannerRing.rotation.z += 0.05;

      // Eye Pulse
      const pulse = 1 + Math.sin(time * 6) * 0.2;
      lens.scale.set(0.2 * pulse, 1 * pulse, 0.2);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', onWindowResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full relative"
        style={{ cursor: 'crosshair' }}
    />
  );
};

export default TechAvatar;
