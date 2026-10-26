import * as THREE from 'three';

/**
 * Custom GLSL Shader for Elevation Terrain Contours & Route Pulse
 */
export const ContourShader = {
  uniforms: {
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color('#141E1A') },
    uContourColor: { value: new THREE.Color('#3B7E67') },
    uPulseColor: { value: new THREE.Color('#F59E0B') },
    uContourFrequency: { value: 16.0 },
  },

  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;

      // Mathematical procedural terrain elevation with multiple sine harmonics
      float elevation = sin(position.x * 0.35 + uTime * 0.2) * 0.8
                      + cos(position.y * 0.35 + uTime * 0.15) * 0.8
                      + sin(position.x * 0.7 - position.y * 0.7) * 0.4;

      vElevation = elevation;
      vec3 transformed = position + normal * (elevation * 0.3);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 uBaseColor;
    uniform vec3 uContourColor;
    uniform vec3 uPulseColor;
    uniform float uContourFrequency;
    uniform float uTime;

    varying vec2 vUv;
    varying float vElevation;
    varying vec3 vPosition;

    void main() {
      // Calculate sharp topographic contour lines
      float contour = fract((vElevation + 2.0) * uContourFrequency * 0.25);
      float line = smoothstep(0.85, 0.95, contour);

      // Route pulse traveling across coordinates
      float pulse = sin((vPosition.x + vPosition.y) * 0.8 - uTime * 2.0) * 0.5 + 0.5;
      pulse = pow(pulse, 4.0);

      // Blend base terrain with contour lines and survey beacon pulse
      vec3 color = mix(uBaseColor, uContourColor, line * 0.7);
      color = mix(color, uPulseColor, pulse * line * 0.6);

      gl_FragColor = vec4(color, 0.85);
    }
  `,
};
