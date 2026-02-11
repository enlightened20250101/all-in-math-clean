'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function colorFromScale(t: number, scale: 'blueRed' | 'viridis' | 'mono') {
  const clamped = Math.min(1, Math.max(0, t));
  const smooth = clamped * clamped * (3 - 2 * clamped);
  if (scale === 'mono') {
    const v = Math.round(245 - 200 * smooth);
    return new THREE.Color(`rgb(${v},${v},${v})`);
  }
  if (scale === 'viridis') {
    const a = [68, 1, 84];
    const b = [253, 231, 37];
    return new THREE.Color(
      `rgb(${Math.round(lerp(a[0], b[0], smooth))},${Math.round(
        lerp(a[1], b[1], smooth),
      )},${Math.round(lerp(a[2], b[2], smooth))})`,
    );
  }
  const a = [37, 99, 235];
  const b = [248, 80, 73];
  return new THREE.Color(
    `rgb(${Math.round(lerp(a[0], b[0], smooth))},${Math.round(
      lerp(a[1], b[1], smooth),
    )},${Math.round(lerp(a[2], b[2], smooth))})`,
  );
}

export default function BivarSurface({
  gridData,
  width,
  height,
  colorScale,
  sensitivity = 0.008,
  viewPreset = 'default',
  resetNonce = 0,
}: {
  gridData:
    | {
        xs: number[];
        ys: number[];
        grid: number[][];
        zMin: number;
        zMax: number;
      }
    | null;
  width: number;
  height: number;
  colorScale: 'blueRed' | 'viridis' | 'mono';
  sensitivity?: number;
  viewPreset?: 'default' | 'iso' | 'top' | 'front' | 'side';
  resetNonce?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });
  const rotationRef = useRef({ x: -0.8, y: 0.6 });
  const sensitivityRef = useRef(sensitivity);
  const cameraDistanceRef = useRef(8);
  const lastRenderRef = useRef(0);

  const applyRotation = (x: number, y: number) => {
    rotationRef.current = { x, y };
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mesh = meshRef.current;
    const grid = gridRef.current;
    if (!renderer || !scene || !camera || !mesh) return;
    mesh.rotation.set(x, y, 0);
    if (grid) grid.rotation.set(x, y, 0);
    renderer.render(scene, camera);
  };

  const setCameraDistance = (distance: number) => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const mesh = meshRef.current;
    if (!camera || !renderer || !scene || !mesh) return;
    cameraDistanceRef.current = distance;
    camera.position.set(distance, distance, distance);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };

  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  useEffect(() => {
    rotationRef.current = { x: -0.8, y: 0.6 };
    applyRotation(-0.8, 0.6);
  }, [resetNonce]);

  useEffect(() => {
    if (viewPreset === 'default') {
      setCameraDistance(8);
      applyRotation(-0.8, 0.6);
      return;
    }
    if (viewPreset === 'iso') {
      setCameraDistance(9);
      applyRotation(-0.75, 0.8);
      return;
    }
    if (viewPreset === 'top') {
      setCameraDistance(7.5);
      applyRotation(-1.4, 0);
      return;
    }
    if (viewPreset === 'front') {
      setCameraDistance(7.5);
      applyRotation(-0.1, 0);
      return;
    }
    if (viewPreset === 'side') {
      setCameraDistance(7.5);
      applyRotation(-0.1, Math.PI / 2);
    }
  }, [viewPreset]);

  const geometryData = useMemo(() => {
    if (!gridData) return null;
    const { xs, ys, grid, zMin, zMax } = gridData;
    if (xs.length < 2 || ys.length < 2) return null;
    const nx = xs.length;
    const ny = ys.length;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const span = Math.max(1e-6, zMax - zMin);
    for (let j = 0; j < ny; j += 1) {
      for (let i = 0; i < nx; i += 1) {
        const x = xs[i];
        const y = ys[j];
        const z = grid[j]?.[i] ?? 0;
        positions.push(x, z, y);
        const t = (z - zMin) / span;
        const c = colorFromScale(t, colorScale);
        colors.push(c.r, c.g, c.b);
      }
    }
    for (let j = 0; j < ny - 1; j += 1) {
      for (let i = 0; i < nx - 1; i += 1) {
        const a = j * nx + i;
        const b = j * nx + i + 1;
        const c = (j + 1) * nx + i;
        const d = (j + 1) * nx + i + 1;
        indices.push(a, b, d, a, d, c);
      }
    }
    return { positions, colors, indices, nx, ny };
  }, [gridData, colorScale]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!rendererRef.current) {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      rendererRef.current = renderer;
      containerRef.current.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      sceneRef.current = scene;
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
      keyLight.position.set(6, 10, 8);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0002;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 50;
      keyLight.shadow.camera.left = -12;
      keyLight.shadow.camera.right = 12;
      keyLight.shadow.camera.top = 12;
      keyLight.shadow.camera.bottom = -12;
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.45);
      fillLight.position.set(-6, 6, -6);
      scene.add(fillLight);
      scene.add(new THREE.AmbientLight(0xffffff, 0.25));

      const gridHelper = new THREE.GridHelper(12, 12, 0x94a3b8, 0xe2e8f0);
      gridHelper.position.set(0, 0, 0);
      const gridMats = Array.isArray(gridHelper.material)
        ? gridHelper.material
        : [gridHelper.material];
      gridMats.forEach((mat) => {
        mat.transparent = true;
        mat.opacity = 0.35;
        mat.depthWrite = false;
      });
      gridRef.current = gridHelper;
      scene.add(gridHelper);

      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.ShadowMaterial({ opacity: 0.18 }),
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.01;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(8, 8, 8);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;
    }
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.setSize(Math.max(1, width), Math.max(1, height), true);
    camera.aspect = Math.max(1, width) / Math.max(1, height);
    camera.updateProjectionMatrix();
  }, [width, height]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
      meshRef.current = null;
    }
    if (!geometryData) return;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(geometryData.positions, 3),
    );
    geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(geometryData.colors, 3),
    );
    geometry.setIndex(geometryData.indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.65,
      metalness: 0.05,
      emissive: new THREE.Color(0x0f172a),
      emissiveIntensity: 0.08,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    meshRef.current = mesh;
    scene.add(mesh);

    if (gridRef.current && gridData) {
      const { xs, ys } = gridData;
      const minX = xs[0] ?? 0;
      const maxX = xs[xs.length - 1] ?? 0;
      const minY = ys[0] ?? 0;
      const maxY = ys[ys.length - 1] ?? 0;
      const spanX = Math.max(1, Math.abs(maxX - minX));
      const spanY = Math.max(1, Math.abs(maxY - minY));
      const span = Math.max(spanX, spanY);
      const scale = Math.max(0.5, span / 12);
      gridRef.current.scale.set(scale, 1, scale);
    }
  }, [geometryData]);

  useEffect(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mesh = meshRef.current;
    const grid = gridRef.current;
    if (!renderer || !scene || !camera || !mesh) return;
    const { x, y } = rotationRef.current;
    mesh.rotation.set(x, y, 0);
    if (grid) grid.rotation.set(x, y, 0);
    renderer.render(scene, camera);
  }, [geometryData, width, height]);

  useEffect(() => {
    const el = containerRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const mesh = meshRef.current;
    const grid = gridRef.current;
    if (!el || !renderer || !scene || !camera || !mesh) return;

    const onPointerDown = (e: PointerEvent) => {
      dragRef.current = { active: true, x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const now = performance.now();
      if (now - lastRenderRef.current < 12) return;
      lastRenderRef.current = now;
      const factor = sensitivityRef.current;
      const dx = (e.clientX - dragRef.current.x) * factor;
      const dy = (e.clientY - dragRef.current.y) * factor;
      dragRef.current.x = e.clientX;
      dragRef.current.y = e.clientY;
      rotationRef.current = {
        x: Math.max(-1.5, Math.min(1.5, rotationRef.current.x + dy)),
        y: rotationRef.current.y + dx,
      };
      mesh.rotation.set(rotationRef.current.x, rotationRef.current.y, 0);
      if (grid) grid.rotation.set(rotationRef.current.x, rotationRef.current.y, 0);
      renderer.render(scene, camera);
    };
    const onPointerUp = (e: PointerEvent) => {
      dragRef.current.active = false;
      el.releasePointerCapture(e.pointerId);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      const next = Math.min(18, Math.max(4, cameraDistanceRef.current + delta * 0.6));
      if (Math.abs(next - cameraDistanceRef.current) < 0.001) return;
      setCameraDistance(next);
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointerleave', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointerleave', onPointerUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, [geometryData, width, height]);

  return <div ref={containerRef} className="h-full w-full" />;
}
