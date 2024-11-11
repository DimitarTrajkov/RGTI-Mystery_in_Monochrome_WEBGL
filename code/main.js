import { ResizeSystem } from "engine/systems/ResizeSystem.js";
import { UpdateSystem } from "engine/systems/UpdateSystem.js";
import { GLTFLoader } from "engine/loaders/GLTFLoader.js";
import { FirstPersonController } from "engine/controllers/FirstPersonController.js";
import { LinearAnimator } from "engine/animators/LinearAnimator.js";

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
// await loader.load("scene/untitled4.gltf");
await loader.load("scene/try1/scene11.gltf");

const scene = loader.loadScene(loader.defaultScene);
// console.log(scene);
const camera = loader.loadNode("Camera");
camera.addComponent(new FirstPersonController(camera, canvas));
camera.isDynamic = true;
camera.aabb = {
  min: [-0.2, -0.8, -0.4],
  max: [0.2, 0.8, 0.4],
};
// console.log(camera);

// Define color array for light and initialize color index
const colorArray = [
  [255,255,255],
  [0, 0, 255],
  [0, 255, 0],
  [0, 255, 255],
  [255, 0, 0],
  [255, 0, 255],
  [255, 255, 0],
];
// TODO: fix it such that the lift goes down as well as the room
// const pickable_items = ["Box.002", "Box.004", "Box.005", "Suzanne","Cone", "Box.003","Floor","Camera"];
const pickable_items = ["Chair.002","Chair.003", "Chair.004"];
const nodes = [];
const liftDoor = [];
for (let i of pickable_items) {
  // nodes.push(loader.loadNode(i));
}
// liftDoor.push(loader.loadNode("Cube.002"));
const close_up_door_up = new LinearAnimator(liftDoor, {
  dx: 3.3,  
  dy: 0,
  dz: 0,
  startTime: 0,
  duration: 2,
  loop: false,
});
const close_up_door_down = new LinearAnimator(liftDoor, {
  dx: 3.3,  
  dy: 0,
  dz: 0,
  startTime: 0,
  duration: 2,
  loop: false,
});
const open_up_door = new LinearAnimator(liftDoor, {
  dx: -3.3,  
  dy: 0,
  dz: 0,
  startTime: 0,
  duration: 3,
  loop: false,
});
const animacija_up = new LinearAnimator(nodes, {
  dx: 0,  
  dy: 2,
  dz: 0,
  startTime: 0,
  duration: 1,
  loop: false,
});
const animacija_down = new LinearAnimator(nodes, {
  dx: 0,  
  dy: -2,
  dz: 0,
  startTime: 0,
  duration: 1,
  loop: false,
});
close_up_door_up.setNextAnimation(animacija_down);
close_up_door_down.setNextAnimation(animacija_up);
animacija_up.setNextAnimation(open_up_door);
animacija_down.setNextAnimation(open_up_door);
scene.addComponent({
  update(t, dt) {
    // Only update if the animation is playing
    if (close_up_door_up.playing) {
      close_up_door_up.update(t, dt);
    }
    if (close_up_door_down.playing) {
      close_up_door_down.update(t, dt);
    }
    if (open_up_door.playing) {
      open_up_door.update(t, dt);
    }
    if (animacija_up.playing) {
      animacija_up.update(t, dt);
    }
    if (animacija_down.playing) {
      animacija_down.update(t, dt);
    }
  },
});

// Hotbar
const items_to_pick_up = ["Chair.002"];
// document.getElementById("image-subject").src = `${items_to_pick_up[0]}.jpeg`;
let colorIndex = 0;
var hotbar = document.querySelector(".hotbar");
function createHotbar(items) {
  items.forEach((item) => {
    const img = document.createElement("img");
    img.src = `pickableItems/${item}.jpeg`;
    img.alt = item;

    const img_container = document.createElement("div");
    img_container.classList.add("hotbar-item");
    img_container.appendChild(img);

    hotbar.appendChild(img_container);
  });
}
createHotbar(items_to_pick_up);

const light = new Node();
const LightTranslationComponent = new Transform({
  translation: [1, 3, 0],
});
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
  "Chair.002","Chair.003", "Chair.004","Ceiling.Panels", "Plane", "Wall.Bar.Back.Overhang", "Wall.Bar.Back.Unfurnished", "Wall.Bar.Back.Unfurnished.001", "Wall.Bar.Back.Unfurnished.002",
  "Wall.Door.Overhang", "Bar_Stool.003",
   "Wall.Internal.001", "Wall.Internal.002", "Wall.Internal.003", "Wall.Internal.004", "Wall.Internal.005",
   "Wall.Internal.006", "Wall.Internal.007", "Wall.Internal.008", "Wall.Internal.009", "Wall.Internal.010",
   "Wall.Internal.011", "Wall.Internal.012", "Wall.Internal.013", "Wall.Internal.014", "Wall.Internal.015",
   "Wall.Internal.016", "Wall.Internal.017"
].forEach((nodeName) => {
  const node = loader.loadNode(nodeName);
  node.isStatic = true;
  node.draw = true;
  node.id = nodeName;
  node.pickable = true;
});

// boudaries of the space are not pickable
[
  "Plane", "Wall.Bar.Back.Overhang", "Wall.Bar.Back.Unfurnished", "Wall.Bar.Back.Unfurnished.001", "Wall.Bar.Back.Unfurnished.002",
  "Wall.Door.Overhang", "Bar_Stool.003",
   "Wall.Internal.001", "Wall.Internal.002", "Wall.Internal.003", "Wall.Internal.004", "Wall.Internal.005",
   "Wall.Internal.006", "Wall.Internal.007", "Wall.Internal.008", "Wall.Internal.009", "Wall.Internal.010",
   "Wall.Internal.011", "Wall.Internal.012", "Wall.Internal.013", "Wall.Internal.014", "Wall.Internal.015",
   "Wall.Internal.016", "Wall.Internal.017"
].forEach((nodeName) => {
  const node = loader.loadNode(nodeName);
  node.pickable = false;
});

const physics = new Physics(
  scene,
  items_to_pick_up,
  colorArray,
  lightComponent,
  close_up_door_up,
  close_up_door_down
);
scene.traverse((node) => {
  const model = node.getComponentOfType(Model);
  if (!model) return;
  // console.log(model);
  model.primitives.forEach((primitive) => {
    const material = primitive.material;
    material.diffuse = 20;
    material.specular = 1;
    material.shininess = 200;
  });
  // console.log("difuse specular and shininess added");
  const boxes = model.primitives.map((primitive) =>
    calculateAxisAlignedBoundingBox(primitive.mesh)
  );
  // console.log("boxes",boxes);
  // console.log("node",node);
  // node.aabb  = 5; // testing  
  // console.log("node",node);
  // ORIGINAL
  // node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
  // console.log(node);
  // console.log("x",mergeAxisAlignedBoundingBoxes(boxes));
  var  x = mergeAxisAlignedBoundingBoxes(boxes);
  node.aabb = x;
  // console.log("blabla2");
});
function update(time, dt) {
  scene.traverse((node) => {
    for (const component of node.components) {
      component.update?.(time, dt);
    }
  });
  // make the light little flickering
  lightComponent.intensity += Math.random() * 0.3 - 0.15;
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
