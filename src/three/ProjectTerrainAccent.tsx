import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../lib/theme';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface PeakMeshProps {
  progressRatio: number;
  isDark: boolean;
}

function PeakMesh({ progressRatio, isDark }: PeakMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  // Elevation height scales between 0.8 and 2.4 based on task completion
  const targetElevation = 0.8 + progressRatio * 1.6;

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Gentle continuous rotation
      meshRef.current.rotation.y += delta * 0.4;
      // Smoothly interpolate elevation height
      meshRef.current.scale.y = THREE.MathUtils.damp(
        meshRef.current.scale.y,
        targetElevation,
        4,
        delta
      );
    }
    if (beaconRef.current && meshRef.current) {
      beaconRef.current.rotation.y += delta * 0.4;
      beaconRef.current.position.y = meshRef.current.scale.y * 0.85;
    }
  });

  const baseColor = useMemo(
    () => new THREE.Color(isDark ? '#273A33' : '#E1E8E5'),
    [isDark]
  );
  const peakColor = useMemo(
    () => new THREE.Color(isDark ? '#3B7E67' : '#1C382F'),
    [isDark]
  );
  const beaconColor = useMemo(
    () => new THREE.Color(progressRatio === 1 ? '#22C55E' : '#F59E0B'),
    [progressRatio]
  );

  return (
    <group position={[0, -0.4, 0]}>
      {/* Low-poly faceted mountain terrain peak */}
      <mesh ref={meshRef}>
        <coneGeometry args={[1.5, 1.8, 6]} />
        <meshStandardMaterial
          color={peakColor}
          flatShading
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Summit Waypoint Beacon */}
      <mesh ref={beaconRef} position={[0, targetElevation * 0.85, 0]}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshBasicMaterial color={beaconColor} />
      </mesh>
    </group>
  );
}

export interface ProjectTerrainAccentProps {
  totalTasks: number;
  completedTasks: number;
  className?: string;
}

export function ProjectTerrainAccent({
  totalTasks,
  completedTasks,
  className,
}: ProjectTerrainAccentProps) {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const isDark = resolvedTheme === 'dark';

  const progressRatio = totalTasks > 0 ? Math.min(1, completedTasks / totalTasks) : 0;
  const percent = Math.round(progressRatio * 100);

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        aria-label="Display 3D Elevation Accent"
        className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-text-muted hover:text-text border border-border rounded-xs bg-surface-raised/50 transition-colors cursor-pointer"
      >
        <Eye className="w-3 h-3 text-accent" />
        <span>3D Peak ({percent}%)</span>
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center bg-surface border border-border rounded-sm p-1.5 shadow-xs">
      <div className="w-16 h-14 relative overflow-hidden rounded-xs bg-surface-raised/60">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.5, 3.2], fov: 42 }}
          gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 2]} intensity={1.5} />
          <PeakMesh progressRatio={progressRatio} isDark={isDark} />
        </Canvas>
      </div>

      <div className="px-2 space-y-0.5 text-left">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
            Terrain Elevation
          </span>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            aria-label="Hide 3D Accent"
            className="text-text-muted hover:text-text p-0.5 rounded-xs transition-colors cursor-pointer"
          >
            <EyeOff className="w-2.5 h-2.5" />
          </button>
        </div>
        <p className="font-mono text-xs font-semibold text-text tabular-nums">
          {percent}% Summit Reach
        </p>
      </div>
    </div>
  );
}
