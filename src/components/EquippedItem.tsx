import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import type { Group } from 'three'

interface Props {
  scene: Group
  modelPath: string
  boneName: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export default function EquippedItem({ scene, modelPath, boneName, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: Props) {
  const { scene: itemScene } = useGLTF(modelPath)
  const attached = useRef(false)

  useEffect(() => {
    if (attached.current) return

    let foundBone: any = null
    scene.traverse((child: any) => {
      if (!foundBone && (child.name === boneName || child.name.endsWith(boneName))) {
        foundBone = child
      }
    })

    if (foundBone) {
      const item = itemScene.clone(true)
      item.scale.setScalar(scale)
      item.position.set(...position)
      item.rotation.set(...rotation)
      foundBone.add(item)
      attached.current = true
    }
  }, [scene, itemScene, boneName, position, rotation, scale])

  return null
}
