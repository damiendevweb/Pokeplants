import { useRef, useEffect, useMemo, useState } from "react";
import { Box3, Vector3 } from "three";
import type { Group, Object3D } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  Environment,
  OrbitControls,
  Sky,
} from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

interface EquippedItemData {
  model_path: string;
  bone_name: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

interface ModelProps {
  modelY: number;
  cameraY: number;
  cameraZ: number;
  rotateY: number;
  animSpeed: number;
  equippedItems: EquippedItemData[];
  hatX: number;
  hatY: number;
  hatZ: number;
  hatRotX: number;
  hatRotY: number;
  hatRotZ: number;
  hatScale: number;
}

interface Props {
  equippedItems?: EquippedItemData[];
}

function HatOnBone({
  hatScene,
  boneRef,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.15,
}: {
  hatScene: Object3D;
  boneRef: Object3D;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  useEffect(() => {
    const hat = SkeletonUtils.clone(hatScene);
    hat.name = "modelAttachedToBone";
    hat.position.set(...position);
    hat.rotation.set(...rotation);
    hat.scale.setScalar(scale);

    boneRef.add(hat);
    boneRef.updateMatrixWorld(true);

    return () => {
      boneRef.remove(hat);
    };
  }, [hatScene, boneRef, position, rotation, scale]);

  return null;
}

function Model({
  modelY,
  cameraY,
  cameraZ,
  rotateY,
  animSpeed,
  equippedItems,
  hatX,
  hatY,
  hatZ,
  hatRotX,
  hatRotY,
  hatRotZ,
  hatScale,
}: ModelProps) {
  const groupRef = useRef<Group>(null!);
  const innerRef = useRef<Group>(null!);
  const { scene, animations } = useGLTF("/models/pokeplants-trainer.glb");
  const { actions } = useAnimations(animations, groupRef);
  const { scene: hatSource } = useGLTF("/models/items/witch-hat.glb");
  const { camera } = useThree();
  const clock = useRef(0);
  const baseY = useRef(0);

  const [targetBone, setTargetBone] = useState<Object3D | null>(null);

  const equippedHat = equippedItems[0];

  useEffect(() => {
    let foundBone: Object3D | null = null;

    scene.traverse((child: any) => {
      if (foundBone) return;

      if (child.isSkinnedMesh && child.skeleton && equippedHat?.bone_name) {
        const bone = child.skeleton.getBoneByName(equippedHat.bone_name);
        if (bone) {
          foundBone = bone;
          console.log("BONE FOUND VIA SKELETON:", bone.name);
        }
      }
    });

    if (!foundBone && equippedHat?.bone_name) {
      foundBone = scene.getObjectByName(equippedHat.bone_name) || null;
      if (foundBone) {
        console.log("BONE FOUND VIA SCENE:", foundBone.name);
      }
    }

    setTargetBone(foundBone);
  }, [scene, equippedHat]);

  useEffect(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleVal = 2 / maxDim;

    innerRef.current.scale.setScalar(scaleVal);

    const center = box.getCenter(new Vector3());
    const bottom = box.min.y;
    baseY.current = -bottom * scaleVal - 0.3;
    innerRef.current.position.set(-center.x, baseY.current, -center.z);

    const action = Object.values(actions || {})[0];
    if (action) {
      action.reset();
      action.timeScale = animSpeed;
      action.play();
    }
  }, [scene, actions, animSpeed]);

  useEffect(() => {
    const action = Object.values(actions || {})[0];
    if (action) action.timeScale = animSpeed;
  }, [actions, animSpeed]);

  useEffect(() => {
    camera.position.set(0, cameraY, cameraZ);
    camera.lookAt(0, cameraY, 0);
  }, [camera, cameraY, cameraZ]);

  useEffect(() => {
    if (innerRef.current) innerRef.current.position.y = baseY.current + modelY;
  }, [modelY]);

  useEffect(() => {
    if (innerRef.current) innerRef.current.rotation.y = rotateY;
  }, [rotateY]);

  useFrame((_, delta) => {
    clock.current += delta;
    groupRef.current.position.y = Math.sin(clock.current * 1.5) * 0.008;
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef}>
        <primitive object={scene} />

        {targetBone && hatSource && equippedHat && (
          <HatOnBone
            hatScene={hatSource}
            boneRef={targetBone}
            position={[hatX, hatY, hatZ]}
            rotation={[hatRotX, hatRotY, hatRotZ]}
            scale={hatScale}
          />
        )}
      </group>
    </group>
  );
}

export default function ModelViewer({ equippedItems = [] }: Props) {
  const [modelY, setModelY] = useState(-0.74);
  const [cameraY, setCameraY] = useState(0.5);
  const [cameraZ, setCameraZ] = useState(3.8);
  const [rotateY, setRotateY] = useState(-0.3);
  const [animSpeed, setAnimSpeed] = useState(0.4);
  const [showSky, setShowSky] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hatX, setHatX] = useState(0);
  const [hatY, setHatY] = useState(0.2);
  const [hatZ, setHatZ] = useState(0);
  const [hatRotX, setHatRotX] = useState(0);
  const [hatRotY, setHatRotY] = useState(0);
  const [hatRotZ, setHatRotZ] = useState(0);
  const [hatScale, setHatScale] = useState(20);

  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 0.3, 3], fov: 35 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 2, -3]} intensity={0.4} />

        <Model
          modelY={modelY}
          cameraY={cameraY}
          cameraZ={cameraZ}
          rotateY={rotateY}
          animSpeed={animSpeed}
          equippedItems={equippedItems}
          hatX={hatX}
          hatY={hatY}
          hatZ={hatZ}
          hatRotX={hatRotX}
          hatRotY={hatRotY}
          hatRotZ={hatRotZ}
          hatScale={hatScale}
        />

        <OrbitControls enableZoom={false} enablePan={false} />
        {showSky && (
          <Sky
            distance={450000}
            sunPosition={[0, -1, 0]}
            inclination={0}
            azimuth={0.25}
          />
        )}
        <Environment preset="sunset" />
      </Canvas>

      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-2 right-2 z-10 text-xs font-bold pixel-border bg-surface/90 px-2 py-1 rounded-lg"
      >
        ⚙️
      </button>

      {showControls && (
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-surface/95 pixel-border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold w-20">Modèle Y</label>
            <input
              type="range"
              min="-2"
              max="1"
              step="0.01"
              value={modelY}
              onChange={(e) => setModelY(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs w-10 text-right">{modelY.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold w-20">Caméra Y</label>
            <input
              type="range"
              min="-1"
              max="2"
              step="0.01"
              value={cameraY}
              onChange={(e) => setCameraY(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs w-10 text-right">
              {cameraY.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold w-20">Zoom</label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.1"
              value={cameraZ}
              onChange={(e) => setCameraZ(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs w-10 text-right">
              {cameraZ.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold w-20">Rotation</label>
            <input
              type="range"
              min="-3.14"
              max="3.14"
              step="0.01"
              value={rotateY}
              onChange={(e) => setRotateY(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs w-10 text-right">
              {rotateY.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold w-20">Vitesse</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={animSpeed}
              onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs w-10 text-right">
              {animSpeed.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => setShowSky(!showSky)}
            className={`text-xs font-bold pixel-border px-3 py-1.5 rounded-lg w-full ${
              showSky ? "🌅 Ciel ON" : "🌅 Ciel OFF"
            } ${showSky ? "bg-primary text-white" : "bg-card"}`}
          >
            {showSky ? "🌅 Ciel ON" : "🌅 Ciel OFF"}
          </button>

          <div className="border-t border-border pt-2 mt-2">
            <p className="text-xs font-bold text-primary mb-1">🎩 Chapeau</p>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold w-20">Pos X</label>
              <input type="range" min="-1" max="1" step="0.01" value={hatX} onChange={(e) => setHatX(parseFloat(e.target.value))} className="flex-1" />
              <span className="text-xs w-10 text-right">{hatX.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold w-20">Pos Y</label>
              <input type="range" min="-1" max="1" step="0.01" value={hatY} onChange={(e) => setHatY(parseFloat(e.target.value))} className="flex-1" />
              <span className="text-xs w-10 text-right">{hatY.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold w-20">Pos Z</label>
              <input type="range" min="-1" max="1" step="0.01" value={hatZ} onChange={(e) => setHatZ(parseFloat(e.target.value))} className="flex-1" />
              <span className="text-xs w-10 text-right">{hatZ.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold w-20">Rot X</label>
              <input type="range" min="-3.14" max="3.14" step="0.01" value={hatRotX} onChange={(e) => setHatRotX(parseFloat(e.target.value))} className="flex-1" />
              <span className="text-xs w-10 text-right">{hatRotX.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold w-20">Rot Y</label>
              <input type="range" min="-3.14" max="3.14" step="0.01" value={hatRotY} onChange={(e) => setHatRotY(parseFloat(e.target.value))} className="flex-1" />
              <span className="text-xs w-10 text-right">{hatRotY.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold w-20">Rot Z</label>
              <input type="range" min="-3.14" max="3.14" step="0.01" value={hatRotZ} onChange={(e) => setHatRotZ(parseFloat(e.target.value))} className="flex-1" />
              <span className="text-xs w-10 text-right">{hatRotZ.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold w-20">Taille</label>
              <input type="range" min="0" max="100" step="0.5" value={hatScale} onChange={(e) => setHatScale(parseFloat(e.target.value))} className="flex-1" />
              <span className="text-xs w-10 text-right">{hatScale.toFixed(1)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setModelY(-1.27);
              setCameraY(0.3);
              setCameraZ(3.8);
              setRotateY(0);
              setAnimSpeed(0.5);
              setHatX(0);
              setHatY(0.2);
              setHatZ(0);
              setHatRotX(0);
              setHatRotY(0);
              setHatRotZ(0);
              setHatScale(20);
            }}
            className="text-xs font-bold text-accent hover:underline"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
