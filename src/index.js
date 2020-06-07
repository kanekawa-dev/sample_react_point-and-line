//https://spectrum.chat/react-three-fiber/general/frame-loop-updating-geometry-performance~34a3ef6f-f6b2-4fdd-a925-287a0a481e70

import * as THREE from "three";
import React, { useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { useDrag } from "react-use-gesture";
import zustand from "zustand";
import "./styles.css";

const [useStore, api] = zustand(set => ({
  positions: {
    a: [-200, 50, 0],
    b: [0, -100, 0],
    c: [200, 0, 0],
    d: [100, 0, -100]
  },
  move: (uuid, position) =>
    set(state => ({
      ...state,
      positions: { ...state.positions, [uuid]: position }
    }))
}));

const Plane = React.memo(({ uuid }) => {
  const move = useStore(state => state.move);
  const initialPosition = useRef(api.getState().positions[uuid]);
  const mesh = useRef();
  const position = useRef(initialPosition.current);
  const { camera, mouse, viewport } = useThree();

  const onClick = e => {
    //Delete Point
    var x = mouse.x * (viewport.width / 2);
    var y = mouse.y * (viewport.height / 2);
    console.log("mouse (" + mouse.x + ", " + mouse.y + ")");
    console.log("x,y (" + x + ", " + y + ")");
  };

  useFrame(() => mesh.current.position.set(...position.current));
  const bindDrag = useDrag(
    ({ offset: [mx, my], event }) => {
      if (event) event.stopPropagation();
      position.current = [
        initialPosition.current[0] + mx,
        initialPosition.current[1] - my,
        0
      ];
      move(uuid, position.current);
    },
    { pointerEvents: true }
  );

  return (
    <mesh ref={mesh} {...bindDrag()} onClick={onClick}>
      <planeBufferGeometry attach="geometry" args={[10, 10]} />
      <meshBasicMaterial attach="material" color={0x0074d9} />
    </mesh>
  );
});

const Line = React.memo(() => {
  const geometryRef = useRef();
  const { camera, mouse, viewport } = useThree();

  const onClick = e => {
    var x = mouse.x * (viewport.width / 2);
    var y = mouse.y * (viewport.height / 2);
    //const vector3d = new THREE.Vector3(x, y, 0);
    //setVertices(vertices.concat(vector3d));
    console.log("mouse (" + mouse.x + ", " + mouse.y + ")");
    console.log("x,y (" + x + ", " + y + ")");
  };

  useFrame(() => {
    const state = api.getState();
    var a = new THREE.Vector3(...state.positions["a"]);
    var b = new THREE.Vector3(...state.positions["b"]);
    var c = new THREE.Vector3(...state.positions["c"]);
    var d = new THREE.Vector3(...state.positions["d"]);
    const anchors = [a, b, c, d];
    const curve = new THREE.CatmullRomCurve3(anchors, true, "catmullrom");
    const points = curve.getPoints(50);
    geometryRef.current.setFromPoints(points);
  });

  return (
    <line onClick={onClick}>
      <bufferGeometry attach="geometry" ref={geometryRef} />
      <lineBasicMaterial attach="material" color={0x333333} />
    </line>
  );
});

ReactDOM.render(
  <Canvas orthographic pixelRatio={window.devicePixelRatio}>
    <Line />
    <Plane uuid="a" />
    <Plane uuid="b" />
    <Plane uuid="c" />
    <Plane uuid="d" />
  </Canvas>,
  document.getElementById("root")
);
