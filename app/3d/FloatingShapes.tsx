'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface FloatingShapeProps {
  position: [number, number, number];
  scale?: number;
  color: string;
  shape?: 'cube' | 'sphere' | 'octahedron';
}

export function FloatingShape({ 
  position, 
  scale = 1, 
  color, 
  shape = 'cube' 
}: FloatingShapeProps) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useGSAP(() => {
    if (!mesh.current) return;
    
    gsap.to(mesh.current.rotation, {
      y: mesh.current.rotation.y + Math.PI * 2,
      x: mesh.current.rotation.x + Math.PI,
      duration: 8 + Math.random() * 4,
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true,
    });
    
    gsap.to(mesh.current.position, {
      y: position[1] + Math.sin(Date.now() * 0.001) * 0.5,
      duration: 3 + Math.random() * 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }, { scope: mesh });
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.005;
      mesh.current.rotation.z += 0.003;
    }
  });
  
  const geometry = shape === 'sphere' 
    ? <sphereGeometry args={[0.5 * scale, 32, 32]} />
    : shape === 'octahedron'
    ? <octahedronGeometry args={[0.5 * scale]} />
    : <boxGeometry args={[1 * scale, 1 * scale, 1 * scale]} />;
  
  return (
    <mesh ref={mesh} position={position}>
      {geometry}
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}
