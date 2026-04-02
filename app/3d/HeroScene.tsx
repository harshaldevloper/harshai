'use client';

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { StarField } from './StarField';
import { FloatingShape } from './FloatingShapes';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FloatingParticles() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
    }
  });
  
  return (
    <group ref={group}>
      <FloatingShape position={[-4, 2, -2]} scale={1.2} color="#8b5cf6" shape="cube" />
      <FloatingShape position={[4, -1, -3]} scale={0.8} color="#06b6d4" shape="sphere" />
      <FloatingShape position={[-3, -2, -1]} scale={1} color="#f472b6" shape="octahedron" />
      <FloatingShape position={[3, 3, -2]} scale={0.6} color="#8b5cf6" shape="sphere" />
      <FloatingShape position={[-2, 1, -4]} scale={0.9} color="#06b6d4" shape="cube" />
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        color="#f472b6"
      />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
        <Lights />
        <StarField count={3000} />
        <FloatingParticles />
        <Environment preset="city" />
        <ContactShadows
          position={[0, -4, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={4.5}
        />
      </Canvas>
    </div>
  );
}
