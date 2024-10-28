import { ResizeSystem } from "engine/systems/ResizeSystem.js";
import { UpdateSystem } from "engine/systems/UpdateSystem.js";
import { GLTFLoader } from "engine/loaders/GLTFLoader.js";
import { FirstPersonController } from "engine/controllers/FirstPersonController.js";

import { Camera, Model, Node, Transform } from "engine/core.js";
import {
  calculateAxisAlignedBoundingBox,
  mergeAxisAlignedBoundingBoxes,
} from "engine/core/MeshUtils.js";

import { Renderer } from "./Renderer.js";
import { Light } from "./Light.js";
import { Physics } from "./Physics.js";

const canvas = document.querySelector("canvas");
const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load("scene/untitled7.gltf");

const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode("Camera");
camera.addComponent(new FirstPersonController(camera, canvas));
camera.isDynamic = true;
camera.aabb = {
  min: [-0.2, -1, -0.4],
  max: [0.2, 1, 0.4],
};

// Define color array for light and initialize color index
const colorArray = [
  [0, 0, 255],
  [0, 255, 0],
  [0, 255, 255],
  [255, 0, 0],
  [255, 0, 255],
  [255, 255, 0],
];
const items_to_pick_up = ["Box.003", "Box.004", "Box.005","Suzanne"];
document.getElementById("image-subject").src = `${items_to_pick_up[0]}.jpeg`;
let colorIndex = 0;

const light = new Node();
const LightTranslationComponent = new Transform({
    translation: [1, 3, 0],
  })
  light.addComponent(LightTranslationComponent);
const lightComponent = new Light({
  color: colorArray[colorIndex], // Start with the first color
  intensity: 2.5,
});
light.addComponent(lightComponent);
light.draw = true; // Add `draw` property to control rendering

// Add the light to the scene
scene.addChild(light);

// Load other static nodes and set `draw` property
[
  "Box.000",
  "Box.001",
  "Box.002",
  "Box.003",
  "Box.004",
  "Box.005",
  "Wall.000",
  "Wall.001",
  "Wall.002",
  "Wall.003",
  "Cone",
  "Suzanne"
].forEach((nodeName) => {
  const node = loader.loadNode(nodeName);
  node.isStatic = true;
  node.draw = true;
  node.id = nodeName;
  node.pickable = true;
});

// boudaries of the space are not pickable
[
  "Box.000",
  "Box.001",
  "Wall.000",
  "Wall.001",
  "Wall.002",
  "Wall.003",
].forEach((nodeName) => {
  const node = loader.loadNode(nodeName);
  node.pickable = false;
});


const physics = new Physics(
  scene,
  items_to_pick_up,
  colorArray,
  lightComponent
);
scene.traverse((node) => {
  const model = node.getComponentOfType(Model);
  if (!model) return;

  model.primitives.forEach((primitive) => {
    const material = primitive.material;
    material.diffuse = 20;
    material.specular = 1;
    material.shininess = 200;
  });

  const boxes = model.primitives.map((primitive) =>
    calculateAxisAlignedBoundingBox(primitive.mesh)
  );
  node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
});
console.log(scene);
function update(time, dt) {
  scene.traverse((node) => {
    for (const component of node.components) {
      component.update?.(time, dt);
    }
  });
  // make the light little flickering
  lightComponent.intensity += (Math.random() * 0.3 -0.15);
  lightComponent.intensity = Math.max(1.5, lightComponent.intensity);
  lightComponent.intensity = Math.min(4.5, lightComponent.intensity);
  physics.update(time, dt);
}

function render() {
  renderer.render(scene, camera);
}

function resize({ displaySize: { width, height } }) {
  camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
