import { useRef, useEffect, useState, Suspense } from "react";
import { Box3, Vector3, BoxGeometry, MeshBasicMaterial, Mesh, BackSide } from "three";
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
}

interface Props {
  equippedItems?: EquippedItemData[];
}

function HatOnBone({
  hatScene,
  boneRef,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 22.5,
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

    const maskGeo = new BoxGeometry(0.5, 0.3, 0.5);
    const maskMat = new MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
      side: BackSide,
    });
    const mask = new Mesh(maskGeo, maskMat);
    mask.name = "hairMask";
    mask.position.set(0, 0.18, 0);

    boneRef.add(hat);
    boneRef.add(mask);
    boneRef.updateMatrixWorld(true);

    return () => {
      boneRef.remove(hat);
      boneRef.remove(mask);
    };
  }, [hatScene, boneRef, position, rotation, scale]);

  return null;
}

function EquippedHat({
  modelPath,
  boneRef,
  position,
  rotation,
  scale,
}: {
  modelPath: string;
  boneRef: Object3D;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const { scene } = useGLTF(modelPath);
  return (
    <HatOnBone
      hatScene={scene}
      boneRef={boneRef}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

function Model({
  modelY,
  cameraY,
  cameraZ,
  rotateY,
  animSpeed,
  equippedItems,
}: ModelProps) {
  const groupRef = useRef<Group>(null!);
  const innerRef = useRef<Group>(null!);
  const { scene, animations } = useGLTF("/models/pokeplants-trainer.glb");
  const { actions } = useAnimations(animations, groupRef);
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
        }
      }
    });

    if (!foundBone && equippedHat?.bone_name) {
      foundBone = scene.getObjectByName(equippedHat.bone_name) || null;
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

        {targetBone && equippedHat && (
          <Suspense fallback={null}>
            <EquippedHat
              key={equippedHat.model_path}
              modelPath={equippedHat.model_path}
              boneRef={targetBone}
              position={equippedHat.position || [0, 0, 0]}
              rotation={equippedHat.rotation || [0, 0, 0]}
              scale={equippedHat.scale ?? 22.5}
            />
          </Suspense>
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
        </div>
      )}
    </div>
  );
}
