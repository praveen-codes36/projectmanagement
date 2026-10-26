import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ContourShader } from './shaders/contourShader';
import { useTheme } from '../lib/theme';

function WaypointInstances({ count = 120, isDark }: { count?: number; isDark: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-generate pseudo-random waypoint coordinates across terrain
  const positions = useMemo(() => {
    const list: Array<[number, number, number]> = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 24;
      const y = (Math.random() - 0.5) * 16;
      // elevation matching sine function from vertex shader
      const z = Math.sin(x * 0.35) * 0.8 + Math.cos(y * 0.35) * 0.8 + 0.5;
      list.push([x, y, z]);
    }
    return list;
  }, [count]);

  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const color = new THREE.Color(isDark ? '#F59E0B' : '#D97706');

    positions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.08 + Math.random() * 0.06);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [positions, dummy, isDark]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Gentle floating pulse for beacons
    meshRef.current.rotation.z = Math.sin(t * 0.1) * 0.05;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={isDark ? '#F59E0B' : '#D97706'} />
    </instancedMesh>
  );
}

function TerrainMesh({ isDark }: { isDark: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(isDark ? '#141E1A' : '#F0F4F2') },
      uContourColor: { value: new THREE.Color(isDark ? '#3B7E67' : '#1C382F') },
      uPulseColor: { value: new THREE.Color(isDark ? '#F59E0B' : '#D97706') },
      uContourFrequency: { value: 14.0 },
    };
  }, [isDark]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uBaseColor.value.set(isDark ? '#141E1A' : '#F0F4F2');
      materialRef.current.uniforms.uContourColor.value.set(isDark ? '#3B7E67' : '#1C382F');
      materialRef.current.uniforms.uPulseColor.value.set(isDark ? '#F59E0B' : '#D97706');
    }
  }, [isDark]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation={[-Math.PI / 3.2, 0, 0]} position={[0, -1, -2]}>
      <planeGeometry args={[28, 20, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={ContourShader.vertexShader}
        fragmentShader={ContourShader.fragmentShader}
        uniforms={uniforms}
        transparent
        wireframe={false}
      />
    </mesh>
  );
}

function RouteLine({ isDark }: { isDark: boolean }) {
  const lineObject = useMemo(() => {
    const list: THREE.Vector3[] = [];
    list.push(new THREE.Vector3(-8, -4, 0.5));
    list.push(new THREE.Vector3(-4, -1, 1.2));
    list.push(new THREE.Vector3(0, 1.5, 1.8));
    list.push(new THREE.Vector3(4, 0.5, 2.2));
    list.push(new THREE.Vector3(8, 3, 2.8));
    const curve = new THREE.CatmullRomCurve3(list);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(isDark ? '#F59E0B' : '#D97706'),
      linewidth: 2,
    });
    return new THREE.Line(geometry, material);
  }, [isDark]);

  return (
    <group rotation={[-Math.PI / 3.2, 0, 0]} position={[0, -1, -2]}>
      <primitive object={lineObject} />
    </group>
  );
}

function ParallaxCamera() {
  const { camera, pointer } = useThree();

  useFrame(() => {
    // Gentle pointer parallax
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.2, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.8 + 2, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function TerrainScene() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <TerrainMesh isDark={isDark} />
        <WaypointInstances isDark={isDark} count={80} />
        <RouteLine isDark={isDark} />
        <ParallaxCamera />
      </Canvas>
    </div>
  );
}
