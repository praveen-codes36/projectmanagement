import{a as e,c as t,d as n,f as r,h as i,i as a,l as o,m as s,n as c,o as l,p as u,r as d,s as f,t as p,u as m}from"./index-qN6rMJTl.js";var h=i(s(),1),g={uniforms:{uTime:{value:0},uBaseColor:{value:new l(`#141E1A`)},uContourColor:{value:new l(`#3B7E67`)},uPulseColor:{value:new l(`#F59E0B`)},uContourFrequency:{value:16}},vertexShader:`
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
  `,fragmentShader:`
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
  `},_=u();function v({count:e=120,isDark:t}){let n=(0,h.useRef)(null),r=(0,h.useMemo)(()=>new m,[]),i=(0,h.useMemo)(()=>{let t=[];for(let n=0;n<e;n++){let e=(Math.random()-.5)*24,n=(Math.random()-.5)*16,r=Math.sin(e*.35)*.8+Math.cos(n*.35)*.8+.5;t.push([e,n,r])}return t},[e]);return(0,h.useEffect)(()=>{if(!n.current)return;let e=n.current,a=new l(t?`#F59E0B`:`#D97706`);i.forEach(([t,n,i],o)=>{r.position.set(t,n,i),r.scale.setScalar(.08+Math.random()*.06),r.updateMatrix(),e.setMatrixAt(o,r.matrix),e.setColorAt(o,a)}),e.instanceMatrix.needsUpdate=!0,e.instanceColor&&(e.instanceColor.needsUpdate=!0),e.computeBoundingSphere()},[i,r,t]),c(e=>{if(!n.current)return;let t=e.clock.getElapsedTime();n.current.rotation.z=Math.sin(t*.1)*.05}),(0,_.jsxs)(`instancedMesh`,{ref:n,args:[void 0,void 0,e],frustumCulled:!1,children:[(0,_.jsx)(`sphereGeometry`,{args:[1,8,8]}),(0,_.jsx)(`meshBasicMaterial`,{color:t?`#F59E0B`:`#D97706`})]})}function y({isDark:e}){let t=(0,h.useRef)(null),n=(0,h.useMemo)(()=>({uTime:{value:0},uBaseColor:{value:new l(e?`#141E1A`:`#F0F4F2`)},uContourColor:{value:new l(e?`#3B7E67`:`#1C382F`)},uPulseColor:{value:new l(e?`#F59E0B`:`#D97706`)},uContourFrequency:{value:14}}),[e]);return(0,h.useEffect)(()=>{t.current&&(t.current.uniforms.uBaseColor.value.set(e?`#141E1A`:`#F0F4F2`),t.current.uniforms.uContourColor.value.set(e?`#3B7E67`:`#1C382F`),t.current.uniforms.uPulseColor.value.set(e?`#F59E0B`:`#D97706`))},[e]),c(e=>{t.current&&(t.current.uniforms.uTime.value=e.clock.getElapsedTime())}),(0,_.jsxs)(`mesh`,{rotation:[-Math.PI/3.2,0,0],position:[0,-1,-2],children:[(0,_.jsx)(`planeGeometry`,{args:[28,20,64,64]}),(0,_.jsx)(`shaderMaterial`,{ref:t,vertexShader:g.vertexShader,fragmentShader:g.fragmentShader,uniforms:n,transparent:!0,wireframe:!1})]})}function b({isDark:r}){let i=(0,h.useMemo)(()=>{let i=[];i.push(new n(-8,-4,.5)),i.push(new n(-4,-1,1.2)),i.push(new n(0,1.5,1.8)),i.push(new n(4,.5,2.2)),i.push(new n(8,3,2.8));let o=new e(i).getPoints(50),s=new a().setFromPoints(o),c=new t({color:new l(r?`#F59E0B`:`#D97706`),linewidth:2});return new f(s,c)},[r]);return(0,_.jsx)(`group`,{rotation:[-Math.PI/3.2,0,0],position:[0,-1,-2],children:(0,_.jsx)(`primitive`,{object:i})})}function x(){let{camera:e,pointer:t}=d();return c(()=>{e.position.x=o.lerp(e.position.x,t.x*1.2,.05),e.position.y=o.lerp(e.position.y,t.y*.8+2,.05),e.lookAt(0,0,0)}),null}function S(){let{resolvedTheme:e}=r(),t=e===`dark`;return(0,_.jsx)(`div`,{className:`absolute inset-0 w-full h-full pointer-events-none select-none z-0`,children:(0,_.jsxs)(p,{dpr:[1,1.75],camera:{position:[0,2,8],fov:45},gl:{antialias:!0,powerPreference:`high-performance`,alpha:!0},children:[(0,_.jsx)(`ambientLight`,{intensity:.6}),(0,_.jsx)(`directionalLight`,{position:[5,10,5],intensity:1.2}),(0,_.jsx)(y,{isDark:t}),(0,_.jsx)(v,{isDark:t,count:80}),(0,_.jsx)(b,{isDark:t}),(0,_.jsx)(x,{})]})})}export{S as TerrainScene};