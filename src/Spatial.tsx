import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';

type Props = { counts: number[]; selected: number; onSelect: (index: number) => void };
export default function Spatial({ counts, selected, onSelect }: Props) {
  const max = Math.max(...counts, 1);
  return <Canvas camera={{ position: [6.5, 5, 8], fov: 37 }} dpr={[1, 1.5]} frameloop="demand" gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} fallback={<div className="spatial-fallback">3D unavailable. Journey counts are available in the stage list.</div>} onCreated={({ gl }) => gl.domElement.setAttribute('aria-hidden', 'true')}>
    <ambientLight intensity={1.5}/>
    <directionalLight position={[3, 7, 5]} intensity={2.5}/>
    <directionalLight position={[-4, 2, -3]} color="#dce4ee" intensity={1}/>
    <group position={[0, -.35, 0]} rotation={[0, -.2, 0]}>
      {counts.map((count, i) => {
        const height = count / max * 2.7 + .02;
        const color = i < 3 ? '#4769A8' : i === 4 ? '#E3A46D' : '#65A69B';
        return <RoundedBox key={i} args={[.62, height, 1.25]} radius={.045} smoothness={3} position={[(i - 2.5) * .85, height / 2 - 1, 0]} scale={selected === i ? [1.06, 1, 1.06] : [1, 1, 1]} onPointerOver={event => { event.stopPropagation(); onSelect(i); }} onClick={event => { event.stopPropagation(); onSelect(i); }}>
          <meshPhysicalMaterial color={color} roughness={.45} metalness={.08} clearcoat={.35} emissive={color} emissiveIntensity={selected === i ? .12 : 0}/>
        </RoundedBox>;
      })}
      <mesh onAfterRender={renderer => renderer.domElement.setAttribute('data-rendered', 'true')} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.06, 0]}><planeGeometry args={[6.3, 2.8]}/><meshStandardMaterial color="#8b97a8" transparent opacity={.08}/></mesh>
    </group>
    <OrbitControls enableDamping dampingFactor={.1} enableZoom={false} enablePan={false} minPolarAngle={.55} maxPolarAngle={1.4} minAzimuthAngle={-.8} maxAzimuthAngle={1.5}/>
  </Canvas>;
}

