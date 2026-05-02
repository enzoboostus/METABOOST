'use client';
import React, { Suspense, useRef } from 'react';
import { View, Platform } from 'react-native';
import { AvatarParams } from '@/hooks/useAvatarParams';

// ─── Continuous body morphology ──────────────────────────────────────────────
// No discrete steps — scales derive directly from raw measurements.
// The body evolves smoothly at every decimal point of BMI / waist.
function computeBodyShape(bmi: number, waistCm: number, gender: 'male' | 'female') {
  // Baseline: BMI 22, waist 80cm (male) / 70cm (female)
  const waistBase = gender === 'male' ? 80 : 70;
  const bmiRef    = 22;

  const bmiDelta   = bmi - bmiRef;          // negative = slimmer, positive = heavier
  const waistDelta = waistCm - waistBase;   // cm above/below baseline

  // Width & depth grow with both BMI and waist
  const widthRaw = 1.0 + bmiDelta * 0.028 + waistDelta * 0.007;
  const depthRaw = 1.0 + bmiDelta * 0.022 + waistDelta * 0.006;

  // Height shrinks slightly as mass increases (postural compression)
  const heightRaw = 1.0 - Math.max(0, bmiDelta) * 0.006;

  return {
    x: Math.max(0.68, Math.min(1.70, widthRaw)),
    y: Math.max(0.87, Math.min(1.06, heightRaw)),
    z: Math.max(0.65, Math.min(1.60, depthRaw)),
  };
}

// ─── GLB sources ─────────────────────────────────────────────────────────────
// Soldier.glb = realistic male (Three.js public example)
// XBot female = Three.js example female character
const MALE_GLB   = 'https://threejs.org/examples/models/gltf/Soldier.glb';
const FEMALE_GLB = 'https://threejs.org/examples/models/gltf/XBot.glb';

interface Props {
  gender: 'male' | 'female';
  params: AvatarParams;
  size?: number;
}

function Avatar3DWeb({ gender, params, size = 200 }: Props) {
  const waistCm = (params as any).waist ?? (gender === 'male' ? 80 : 70);
  const shape   = computeBodyShape(params.bmi, waistCm, gender);
  const modelUrl = gender === 'male' ? MALE_GLB : FEMALE_GLB;

  const h      = Math.round(size * 2.6);
  const platH  = Math.round(size * 0.55);
  const totalH = h + Math.round(platH * 0.32);

  const sceneHtml = `<!DOCTYPE html>
<html style="margin:0;padding:0;background:transparent;overflow:hidden">
<head>
<meta charset="utf-8">
<style>body{margin:0;padding:0;background:transparent;overflow:hidden}canvas{display:block}</style>
<script type="importmap">
{"imports":{"three":"https://unpkg.com/three@0.165.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.165.0/examples/jsm/"}}
</script>
</head>
<body>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const W = ${size}, H = ${totalH};
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(W, H);
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
camera.position.set(0, 1.1, 3.0);
camera.lookAt(0, 0.9, 0);

// ── Lighting setup ─────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.0));

const key = new THREE.DirectionalLight(0xffffff, 2.8);
key.position.set(1.5, 3, 2);
scene.add(key);

const fill = new THREE.DirectionalLight(0x6688ff, 0.9);
fill.position.set(-2, 1, -1);
scene.add(fill);

const rim = new THREE.DirectionalLight(0x00ffd0, 0.8);
rim.position.set(0, 2.5, -3);
scene.add(rim);

// ── Fortnite-style platform ────────────────────────────────────────────────
// Main disc
const disc = new THREE.Mesh(
  new THREE.CylinderGeometry(0.52, 0.52, 0.035, 72),
  new THREE.MeshStandardMaterial({ color: 0x050F1E, metalness: 0.95, roughness: 0.15 })
);
disc.position.y = 0.018;
scene.add(disc);

// Edge top shine
const shine = new THREE.Mesh(
  new THREE.CylinderGeometry(0.52, 0.52, 0.004, 72),
  new THREE.MeshStandardMaterial({ color: 0xaaddff, emissive: 0xaaddff, emissiveIntensity: 1.2, transparent: true, opacity: 0.6 })
);
shine.position.y = 0.038;
scene.add(shine);

// Main glowing teal ring
const ringMat = new THREE.MeshStandardMaterial({ color: 0x00ffd0, emissive: 0x00ffd0, emissiveIntensity: 2.8, metalness: 0, roughness: 0 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.016, 20, 128), ringMat);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.036;
scene.add(ring);

// Outer diffuse rings
[{ r: 0.66, op: 0.40, ei: 0.8 }, { r: 0.82, op: 0.22, ei: 0.4 }, { r: 0.99, op: 0.10, ei: 0.2 }].forEach(({ r, op, ei }) => {
  const m = new THREE.MeshStandardMaterial({ color: 0x00ffd0, emissive: 0x00ffd0, emissiveIntensity: ei, transparent: true, opacity: op });
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, 0.007, 8, 96), m);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = 0.005;
  scene.add(mesh);
});

// ── Load 3D character ──────────────────────────────────────────────────────
const bodyX = ${shape.x.toFixed(4)};
const bodyY = ${shape.y.toFixed(4)};
const bodyZ = ${shape.z.toFixed(4)};

const loader = new GLTFLoader();
loader.load('${modelUrl}', (gltf) => {
  const model = gltf.scene;

  // Normalize height to ~1.85 units
  const box = new THREE.Box3().setFromObject(model);
  const modelHeight = box.getSize(new THREE.Vector3()).y;
  const baseScale = 1.85 / modelHeight;

  model.scale.set(
    baseScale * bodyX,
    baseScale * bodyY,
    baseScale * bodyZ
  );

  // Place feet exactly on platform
  const box2 = new THREE.Box3().setFromObject(model);
  model.position.y = 0.055 - box2.min.y;

  // Improve material quality
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      if (child.material) {
        child.material.envMapIntensity = 1.0;
      }
    }
  });

  scene.add(model);
}, undefined, (err) => {
  // Fallback: show a basic mannequin if GLB fails
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18 * bodyX, 0.55 * bodyY, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.3, roughness: 0.7 })
  );
  torso.position.y = 1.1;
  scene.add(torso);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x8B6450, roughness: 0.8 })
  );
  head.position.y = 1.65;
  scene.add(head);
});

// ── Animation loop ─────────────────────────────────────────────────────────
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.004;
  scene.rotation.y = t;

  // Teal ring breathing pulse
  ringMat.emissiveIntensity = 2.2 + 0.8 * Math.sin(Date.now() * 0.0018);

  renderer.render(scene, camera);
}
animate();
</script>
</body>
</html>`;

  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(sceneHtml)}`;

  return (
    <View style={{ width: size, height: totalH }}>
      <iframe
        src={dataUrl}
        style={{ width: size, height: totalH, border: 'none', background: 'transparent' } as any}
        sandbox="allow-scripts"
        title="avatar-3d"
      />
    </View>
  );
}

export default function Avatar3D(props: Props) {
  if (Platform.OS !== 'web') return null;
  return <Avatar3DWeb {...props} />;
}
