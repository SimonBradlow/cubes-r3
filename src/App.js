import * as THREE from 'three'
import { useRef, useReducer, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, MeshTransmissionMaterial, Environment, Lightformer, Text3D, Center } from '@react-three/drei'
import { CuboidCollider, BallCollider, Physics, RigidBody } from '@react-three/rapier'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
import { easing } from 'maath'

const accents = ['#ff9d00', '#9582ff', '#a1004b', '#4060ff']
//const accents = ['#4060ff', '#20ffa0', '#ff4060', '#ffcc00']
const shuffle = (accent = 0) => [
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.75 },
  { color: 'white', roughness: 0.75 },
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.75 },
  { color: 'white', roughness: 0.1 },
  //{ color: 'white', roughness: 0.1, accent: true },
  { color: accents[2], roughness: 0.75, accent: true },
  //{ color:  accents[3], roughness: 0.1, accent: true }
]

export const App = () => <Scene style={{ borderRadius: 0 }} />

function Scene(props) {
  const [accent, click] = useReducer((state) => ++state % accents.length, 0)
  const connectors = useMemo(() => shuffle(accent), [accent])
  return (
    <Canvas onClick={click} shadows dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 0, 15], fov: 17.5, near: 1, far: 20 }} {...props}>
      <color attach="background" args={['#b1b3bd']} />
        <Text3D letterSpacing={-0.04} size={0.5} font="/Triodion_Regular.json" position={[0,0,0]}>
          Simon Bradlow
          <meshStandardMaterial color="white" />
        </Text3D>
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <Physics /*debug*/ gravity={[0, 0, 0]}>
        <Pointer />
        {connectors.map((props, i) => <Connector key={i} {...props} />) /* prettier-ignore */}
        <Connector position={[10, 10, 5]}>
          <Model>
            <MeshTransmissionMaterial clearcoat={1} thickness={0.1} anisotropicBlur={0.1} chromaticAberration={0.1} samples={8} resolution={512} />
          </Model>
        </Connector>
        <Connector position={[10, 10, 5]}>
          <Model>
            <MeshTransmissionMaterial clearcoat={1} thickness={0.1} anisotropicBlur={0.1} chromaticAberration={0.1} samples={8} resolution={512} />
          </Model>
        </Connector>
        <Connector position={[10, 10, 5]}>
          <Model checkerColors={['#a2a1ff', '#ad73ff']}>
          </Model>
        </Connector>
        <Connector position={[10, 10, 5]}>
          <Model checkerColors={['#00a2ff', '#ffffff']}>
          </Model>
        </Connector>
        <Connector position={[10, 10, 5]}>
          <Model divisions={5}>
          </Model>
        </Connector>
      </Physics>
      <EffectComposer disableNormalPass multisampling={8}>
        <N8AO distanceFalloff={1} aoRadius={1} intensity={4} />
      </EffectComposer>
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
        </group>
      </Environment>
    </Canvas>
  )
}

function Connector({ position, children, vec = new THREE.Vector3(), scale, r = THREE.MathUtils.randFloatSpread, accent, ...props }) {
  const api = useRef()
  const pos = useMemo(() => position || [r(10), r(10), r(10)], [])
  const size = 0.5 // Adjust this to change cube size -originally 1.27
  useFrame((state, delta) => {
    delta = Math.min(0.1, delta)
    api.current?.applyImpulse(vec.copy(api.current.translation()).negate().multiplyScalar(0.15))
  })

  return (
    <RigidBody linearDamping={4} angularDamping={1} friction={0.1} position={pos} ref={api} colliders={false}>
      <CuboidCollider args={[size, size, size]} />
      {children ? children : <Model {...props} />}
      {accent && <pointLight intensity={4} distance={2.5} color={props.color} />}
    </RigidBody>
  )
}

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef()
  useFrame(({ mouse, viewport }) => {
    ref.current?.setNextKinematicTranslation(vec.set((mouse.x * viewport.width) / 2, (mouse.y * viewport.height) / 2, 0))
  })
  return (
    <RigidBody position={[0, 0, 0]} type="kinematicPosition" colliders={false} ref={ref}>
      <BallCollider args={[0.6]} />
    </RigidBody>
  )
}

function Model({ children, color = 'white', roughness = 0, divisions = 4, checkerColors = ['#0000ff', '#ffffff'], ...props }) {
  const ref = useRef()
  useFrame((state, delta) => {
    easing.dampC(ref.current.material.color, color, 0.2, delta)
  })
  const checkerTexture = useMemo(() => {
    // Create a checkerboard pattern texture
    const size = divisions; // size of the checkerboard
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    const colors = ['#0000ff', '#ffffff']; // Black and white for the checker pattern
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        context.fillStyle = checkerColors[(x + y) % 2]; // Alternate colors for each square
        context.fillRect(x, y, 1, 1); // Draw each square of the checkerboard
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    // Set texture filtering to prevent smoothing
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false; // Disable mipmaps to avoid unwanted smoothing

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1); // Scale the texture across the mesh
    return texture;
  }, []);
  return (
    <mesh ref={ref} castShadow receiveShadow scale={10}>
      <boxGeometry args={[0.10, 0.10, 0.10]} /> {/* Cube Model */}
      <meshStandardMaterial metalness={0.01} roughness={roughness} map={checkerTexture} />  {/* map={materials.base.map} */}
      {children}
    </mesh>
  )
}
