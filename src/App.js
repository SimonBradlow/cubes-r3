import * as THREE from 'three'
import { Color} from 'three'
import { useRef, useReducer, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment, Lightformer, Text, Html, Text3D} from '@react-three/drei'
import { CuboidCollider, BallCollider, Physics, RigidBody } from '@react-three/rapier'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
import { easing } from 'maath'
import { accents } from './colors'
import './App.css'


const shuffle = (accent = 0) => [
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.75 },
  { color: 'white', roughness: 0.75 },
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.75 },
  { color: 'white', roughness: 0.1 },
  //{ color: 'white', roughness: 0.1, accent: true },
  //{ color: accents[2], roughness: 0.75, accent: true },
  //{ color:  accents[3], roughness: 0.1, accent: true }
]

export const App = () => {
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @font-face {
        font-family: 'Arial';
        font-weight: normal;
        font-style: normal;
        lineHeight: '1',  // or a smaller value like '0.9'
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Scene />
    </div>
  )
}

function ResponsiveText({
  z = 0,
  margin = 0.15,
  shadowLayers = 6,
  shadowOffsetX = 0.005,
  shadowOffsetZ = 0.005,
}) {
  const { viewport } = useThree()
  const [text, setText] = useState('fucksimon')

  useEffect(() => {
    if (viewport.width < 5) {
      setText('fuck\nsimon')
    } else {
      setText('fucksimon')
    }
  }, [viewport.width])

  const fontSize = text.includes('\n')
    ? viewport.width / 5
    : viewport.width / 9

  const maxWidth = viewport.width

  function getShadowColor(index, totalLayers) {
    // Start at 255 (white), end at 102 (#66)
    const start = 255
    const end = 150
    const fraction = index / (totalLayers - 1) // 0 → 1
    const value = Math.round(start - (start - end) * fraction)
    const hex = `#${value.toString(16).padStart(2, '0').repeat(3)}`
    return hex
  }


  // Generate shadow layers
  const shadows = Array.from({ length: shadowLayers }).map((_, i) => {
    const offsetX = -shadowOffsetX * (i + 1)
    const offsetZ = z - shadowOffsetZ * (i + 1)

    return (
      <Text
        key={`shadow-${i}`}
        //font="/fonts/Triodion-Regular.ttf"
        color={getShadowColor(i, 5)}
        anchorX="left"
        anchorY="middle"
        fontSize={fontSize}
        maxWidth={viewport.width}
        position={[offsetX-0.25, 1.25, offsetZ]}
        lineHeight={.8}
        letterSpacing={-0.02}
        opacity={0.5}
      >
        {text}
      </Text>
    )
  })


  return (
    <>
      {shadows}
      <Text
        //font="/fonts/Triodion-Regular.ttf"
        color="white"
        anchorX="left"
        anchorY="middle"
        fontSize={fontSize}
        maxWidth={viewport.width}
        position={[-0.25, 1.25, z]}
        lineHeight={.8}
        letterSpacing={-0.02}
      >
        {text}
      </Text>
    </>
  )
}

const socials = [
  { name: "instagram", url: "https://instagram.com/fucksimon", icon: "\uf16d" }, // Instagram
  { name: "tiktok", url: "https://tiktok.com/@fucksim0n", icon: "\ue07b" },       // TikTok (might need pro or custom font)
  { name: "youtube", url: "https://youtube.com/@fucksimon", icon: "\uf167" },     // YouTube
  //{ name: "spotify", url: "https://spotify.com", icon: "\uf1bc" },     // Spotify
  //{ name: "apple music", url: "https://music.apple.com", icon: "\uf179" }, // Apple
]

// Shadow settings
const shadowLayers = 4
const shadowOffsetX = -0.005
const shadowOffsetY = 0

// Multiply base color by tint color, returns hex string
function tintColor(baseHex, tintHex = accents[4]) {
  const base = new Color(baseHex)
  const tint = new Color(tintHex)
  const r = base.r * tint.r
  const g = base.g * tint.g
  const b = base.b * tint.b
  const c = new Color(r, g, b)
  return `#${c.getHexString()}`
}

// Progressive shadow gray colors for shadows, darkening on deeper layers
function getShadowColor(index, totalLayers, isActive, tintHex = accents[4]) {
  // Base shadow grayscale value
  const baseVal = isActive
    ? 250 - (index / (totalLayers - 1)) * 80  // lighter shadows when active
    : 220 - (index / (totalLayers - 1)) * 80  // normal shadows

  // Clamp and convert to hex
  const grayVal = Math.round(baseVal)
  const grayHex = new Color(`rgb(${grayVal},${grayVal},${grayVal})`)
  const tintColorObj = new Color(tintHex)

  if (isActive) {
    // multiply shadow gray by tint color
    grayHex.r *= tintColorObj.r
    grayHex.g *= tintColorObj.g
    grayHex.b *= tintColorObj.b
  }

  return `#${grayHex.getHexString()}`
}

export function SocialLinks3D() {
  const { viewport } = useThree()
  const groupRef = useRef()
  const [hovered, setHovered] = useState(null)
  const [pressed, setPressed] = useState(null)
  const [ready, setReady] = useState(false)

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  const FONT_SIZE = 0.3
  const GAP = 0.25
  const marginX = -viewport.width / 2 + 0.15
  const marginY = -viewport.height / 2 + 0.72
  const spacingY = 0.4
  const fixedZ = 2

  const iconRefs = useRef({})
  const textRefs = useRef({})
  const [bounds, setBounds] = useState({})
  const targetOffsets = useRef({})

  useEffect(() => {
    const timeout = setTimeout(() => {
      const newBounds = {}
      socials.forEach(({ name }) => {
        const icon = iconRefs.current[name]
        const text = textRefs.current[name]
        if (icon && text && icon.geometry && text.geometry) {
          icon.geometry.computeBoundingBox()
          text.geometry.computeBoundingBox()
          const iconBox = icon.geometry.boundingBox
          const textBox = text.geometry.boundingBox
          const width = (iconBox.max.x - iconBox.min.x) + (textBox.max.x - textBox.min.x) + GAP
          const height = Math.max(
            iconBox.max.y - iconBox.min.y,
            textBox.max.y - textBox.min.y
          )
          newBounds[name] = { width, height }
        }
      })
      setBounds(newBounds)
      setReady(true)
    }, 200) // wait for fonts to load
    return () => clearTimeout(timeout)
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(marginX, marginY + (socials.length - 1) * spacingY, fixedZ)

    socials.forEach(({ name }, i) => {
      const group = groupRef.current.children[i]
      if (!group) return

      const targetX = (hovered === name || pressed === name) ? 0.08 : 0
      if (!targetOffsets.current[name]) targetOffsets.current[name] = 0
      targetOffsets.current[name] += (targetX - targetOffsets.current[name]) * 0.15
      group.position.x = targetOffsets.current[name]
    })
  })

  return (
    <group ref={groupRef}>
      {socials.map(({ name, url, icon, tint }, i) => {
        const yPos = -i * spacingY
        const iconX = 0.15
        const textX = 0.15 + GAP
        const isHovered = hovered === name
        const isActive = !isMobile ? isHovered : pressed === name
        const box = bounds[name]

        // Calculate tinted active color or fallback to white
        const activeColor = isActive ? tintColor('white', tint) : 'white'

        return (
          <group key={name} position={[0, yPos, 0]}>
            {/* Hover Box */}
            {ready && box && (
              <mesh
                position={[(box.width / 2) - 0.05, 0, 0.05]}
                onPointerOver={() => !isMobile && setHovered(name)}
                onPointerOut={() => !isMobile && setHovered(null)}
                onPointerDown={() => isMobile && setPressed(name)}
                onPointerUp={() => isMobile && setPressed(null)}
                onPointerCancel={() => isMobile && setPressed(null)}
              >
                <boxGeometry args={[box.width, box.height * 0.8, 0.1]} />
                <meshBasicMaterial
                  transparent
                  opacity={0}
                  depthWrite={false}
                  depthTest={false}
                />
              </mesh>
            )}

            {/* Icon shadows */}
            {Array.from({ length: shadowLayers }).map((_, j) => (
              <Text
                key={`icon-shadow-${j}`}
                ref={j === 0 ? el => (iconRefs.current[name] = el) : null}
                font="/fonts/fa-brands-400.ttf"
                fontSize={FONT_SIZE}
                anchorX="center"
                anchorY="middle"
                color={getShadowColor(j, shadowLayers, isActive)}
                position={[
                  iconX + shadowOffsetX * (j + 1),
                  shadowOffsetY * (j + 1),
                  -0.001 - j * 0.0001,
                ]}
                material-toneMapped={true}
              >
                {icon}
              </Text>
            ))}

            {/* Main Icon */}
            <Text
              font="/fonts/fa-brands-400.ttf"
              fontSize={FONT_SIZE}
              anchorX="center"
              anchorY="middle"
              color={activeColor}
              position={[iconX, 0, 0]}
              material-toneMapped={true}
              onClick={() => window.open(url, '_blank')}
              ref={el => (iconRefs.current[name] = el)}
            >
              {icon}
            </Text>

            {/* Text shadows */}
            {Array.from({ length: shadowLayers }).map((_, j) => (
              <Text
                key={`text-shadow-${j}`}
                //font="/fonts/Triodion-Regular.ttf"
                fontSize={FONT_SIZE}
                position={[
                  textX + shadowOffsetX * (j + 1),
                  shadowOffsetY * (j + 1),
                  -0.0005 - j * 0.0001,
                ]}
                anchorX="left"
                anchorY="middle"
                color={getShadowColor(j, shadowLayers, isActive)}
                material-toneMapped={true}
              >
                {name}
              </Text>
            ))}

            {/* Main Text */}
            <Text
              //font="/fonts/Triodion-Regular.ttf"
              fontSize={FONT_SIZE}
              position={[textX, 0, 0]}
              anchorX="left"
              anchorY="middle"
              color={activeColor}
              material-toneMapped={true}
              onClick={() => window.open(url, '_blank')}
              ref={el => (textRefs.current[name] = el)}
            >
              {name}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

function Scene(props) {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const cameraZoom = isMobile ? 160 : 200  // Increase for desktop only
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function onTouchMove(e) {
      e.preventDefault()
    }

    canvas.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      canvas.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const [accent, click] = useReducer((state) => ++state % accents.length, 0)
  const connectors = useMemo(() => shuffle(accent), [accent])
  return (
    <Canvas ref={canvasRef} style={{ touchAction: 'none' }} shadows dpr={isMobile ? 1 : [1, 1.5]}f gl={{ antialias: false }} orthographic camera={{ zoom: cameraZoom, position: [0, 0, 100], near: 1, far: 200 }} {...props}>
      
      <color attach="background" args={['#b1b3bd']} />
      <ResponsiveText z={2} />
      <SocialLinks3D />
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
          <Model checkerColors={[accents[2], accents[3]]}>
          </Model>
        </Connector>
        <Connector position={[10, 10, 5]}>
          <Model checkerColors={[accents[2], accents[3]]}>
          </Model>
        </Connector>
        {/*<Connector position={[10, 10, 5]}>
          <Model checkerColors={[accents[4], '#ffffff']}>
          </Model>
        </Connector>*/}
        <Connector position={[10, 10, 5]}>
          <Model divisions={5}>
          </Model>
        </Connector>
      </Physics>
      <EffectComposer disableNormalPass multisampling={8}>
        <N8AO distanceFalloff={1} aoRadius={1} intensity={4} halfRes={true} />
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

function Model({ children, color = 'white', roughness = 0, divisions = 4, checkerColors = [accents[1], accents[0]], ...props }) {
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
