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
await loader.load("scene/test03.gltf");

const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode("Camera");
camera.addComponent(new FirstPersonController(camera, canvas));

camera.isDynamic = true;
camera.aabb = {
  min: [-0.2, -0.2, -0.2],
  max: [0.2, 0.2, 0.2],
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
// TODO: fix it such that the lift goes down as well as the room
// const pickable_items = ["Box.002", "Box.004", "Box.005", "Suzanne","Cone", "Box.003","Floor","Camera"];
const name_of_Lift_Doors = [];
const Lift_sides = [];
const pickable_items = [
  //"book closed",
  "blue cleaner",
  "lil duck",
  // "Radio transistor", 
  // "gun 1",
  // "gun 2",
  
  //"bleach_bottle", //nema 
  //"all_purpose_cleaner",
  //cinamon rolls, 
];
//const pickable_items = [];
const switch_items_names = [];
const switch_items = [];
const nodes = [];
const liftDoor = [];
for (let i of pickable_items) {
  // nodes.push(loader.loadNode(i));
}
// liftDoor.push(loader.loadNode("Chair.002"));

for (let i of name_of_Lift_Doors) {
  liftDoor.push(loader.loadNode(i));
}
for (let i of Lift_sides) {
  nodes.push(loader.loadNode(i));
}


for (let i of switch_items_names) {
  switch_items.push(loader.loadNode(i));
}
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
const button_press_in_animation = new LinearAnimator(switch_items, {
  dx: 0,
  dy: 0,
  dz: 0.1,
  startTime: 0,
  duration: 0.1,
  loop: false,
});
const button_press_out_animation = new LinearAnimator(switch_items, {
  dx: 0,
  dy: 0,
  dz: -0.1,
  startTime: 0,
  duration: 0.1,
  loop: false,
});
close_up_door_up.setNextAnimation(animacija_down);
close_up_door_down.setNextAnimation(animacija_up);
animacija_up.setNextAnimation(open_up_door);
animacija_down.setNextAnimation(open_up_door);
button_press_in_animation.setNextAnimation(button_press_out_animation);
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
    if (button_press_in_animation.playing) {
      button_press_in_animation.update(t, dt);
    }
    if (button_press_out_animation.playing) {
      button_press_out_animation.update(t, dt);
    }
  },
});

// Hotbar
const how_many_items = 3;
const items_to_pick_up = [];
// document.getElementById("image-subject").src = `${items_to_pick_up[0]}.jpeg`;
let colorIndex = 0;
var hotbar = document.querySelector(".hotbar");
function createHotbar(items) {
  items.forEach((item) => {
    const img = document.createElement("img");
    img.src = `pickableItems/${item}.jpg`;
    img.alt = item;

    const img_container = document.createElement("div");
    img_container.classList.add("hotbar-item");
    img_container.appendChild(img);

    hotbar.appendChild(img_container);
  });
}
function select_items_to_pick_up(how_many_items) {
  var indexes = [];
  for (let i = 0; i < pickable_items.length; i++) {
    indexes.push(i);
  }
  if (how_many_items > pickable_items.length) {
    how_many_items = pickable_items.length;
  }
  while (indexes.length > how_many_items) {
    const index = Math.floor(Math.random() * indexes.length);
    indexes.splice(index, 1);
  }
  indexes.forEach((index) => {
    items_to_pick_up.push(pickable_items[index]);
  });
  createHotbar(items_to_pick_up);
}
select_items_to_pick_up(how_many_items);

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
// var static_nodes = [
//   "Chair.002","Chair.003", "Chair.004","Ceiling.Panels", "Plane", "Wall.Bar.Back.Overhang", "Wall.Bar.Back.Unfurnished", "Wall.Bar.Back.Unfurnished.001", "Wall.Bar.Back.Unfurnished.002",
//   "Wall.Door.Overhang", "Bar_Stool.003",
//    "Wall.Internal.001", "Wall.Internal.002", "Wall.Internal.003", "Wall.Internal.004", "Wall.Internal.005",
//    "Wall.Internal.006", "Wall.Internal.007", "Wall.Internal.008", "Wall.Internal.009", "Wall.Internal.010",
//    "Wall.Internal.011", "Wall.Internal.012", "Wall.Internal.013", "Wall.Internal.014", "Wall.Internal.015",
//    "Wall.Internal.016", "Wall.Internal.017"
// ]

// TODO: NAREDI DA BO FOR EACH
// static_nodes.forEach((nodeName) => {
//   const node = loader.loadNode(nodeName);
//   node.isStatic = true; // for colision detection
//   node.draw = true; // da narise
//   node.id = nodeName; // da imajo nek id
//   node.pickable = true; // da lahko jih uzamemo

// });

pickable_items.forEach((nodeName) => {
  const node = loader.loadNode(nodeName);
  node.pickable = true;
});

switch_items_names.forEach((nodeName) => {
  const node = loader.loadNode(nodeName);
  node.pickable = false; // vse dzide pa tleh
  node.switchable = true;
});

const physics = new Physics(
  scene,
  items_to_pick_up,
  colorArray,
  lightComponent,
  close_up_door_up,
  close_up_door_down,
  button_press_in_animation
);
scene.traverse((node) => {
  const model = node.getComponentOfType(Model);
  if (!model) return;

  node.isStatic = true;
  node.draw = true;

  model.primitives.forEach((primitive) => {
    console.log(primitive);
    const material = primitive.material;
    if (!material) return; // for debug purpose only
    material.diffuse = 20;
    material.specular = 1;
    material.shininess = 200;
  });
  const boxes = model.primitives.map((primitive) =>
    calculateAxisAlignedBoundingBox(primitive.mesh)
  );
  var x = mergeAxisAlignedBoundingBoxes(boxes);
  node.aabb = x;
  node.isStatic = true;
});
console.log(scene);
function update(time, dt) {
  scene.traverse((node) => {
    for (const component of node.components) {
      component.update?.(time, dt);
    }
  });
  // make the light little flickering
  lightComponent.intensity += Math.random() * 0.3 - 0.15;
  lightComponent.intensity = Math.max(1.5, lightComponent.intensity);
  lightComponent.intensity = Math.min(1.5, lightComponent.intensity);
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
