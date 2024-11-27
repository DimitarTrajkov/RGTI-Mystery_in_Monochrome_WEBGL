import { ResizeSystem } from "engine/systems/ResizeSystem.js";
import { UpdateSystem } from "engine/systems/UpdateSystem.js";
import { GLTFLoader } from "engine/loaders/GLTFLoader.js";
import { FirstPersonController } from "engine/controllers/FirstPersonController.js";
import { LinearAnimator } from "engine/animators/LinearAnimator.js";
import * as easing from "engine/animators/easingFunctions.js";

import { Camera, Model, Node, Transform } from "engine/core.js";
import {
  calculateAxisAlignedBoundingBox,
  mergeAxisAlignedBoundingBoxes,
} from "engine/core/MeshUtils.js";

import { Renderer } from "./Renderer.js";
import { Light } from "./Light.js";
import { Physics } from "./Physics.js";
import { RotateAnimator } from "../engine/animators/RotateAnimator.js";
import { GameLogic } from "./GameLogic.js";

const canvas = document.querySelector("canvas");
const renderer = new Renderer(canvas);
await renderer.initialize();

// LOAD THE DATA HERE
const loader = new GLTFLoader();
// await loader.load("scene/scene01.gltf");
await loader.load("https://sivanovska.github.io/WebGL-assets/scene51.gltf");

const scene = loader.loadScene(loader.defaultScene);
const camera = loader.loadNode("Camera");
const cameraHitbox = new Node();
cameraHitbox.parent = null;
cameraHitbox.addComponent(new Transform());
cameraHitbox.aabb = {
  min: [-0.2, -1.5, -0.2],
  max: [0.2, -0.0, 0.2],
};
cameraHitbox.isCameraHitbox = true;
cameraHitbox.isStatic = true;
cameraHitbox.draw = false;
scene.addChild(cameraHitbox);
camera.addComponent(new FirstPersonController(camera, canvas));

camera.isDynamic = true;
camera.hitbox = cameraHitbox;
let colorIndex = 0;

// Define color array for light and initialize color index
const colorArray = [
  [0, 30, 0],
  [0, 30, 30],
  [30, 0, 0],
  [30, 0, 30],
  [30, 30, 0],
];

const light = new Node();
const LightTranslationComponent = new Transform({
  translation: [1, 1.5, 0],
});
light.addComponent(LightTranslationComponent);
const lightComponent = new Light({
  color: colorArray[colorIndex], // Start with the first color
  intensity: 0,
});
light.addComponent(lightComponent);
light.draw = true; // Add `draw` property to control rendering

scene.addChild(light);


// TODO: fix it such that the lift goes down as well as the room
const name_Lift_sides = ["button","button place","celing elevator", "door part left", "door part right", "doors frame. right", "doors frame.up","doors frameleft","elevator floor",
  "elevator wall","elevator wall.001", "elevator wall.002" ]; // LIGHT IS PART OF THE LIFT      AND THE CAMERA!!!!
const pickable_items = [
  "all_purpose_cleaner","battery","bleach_bottle","blue cleaner","bonbons",
  "book","cinnamon rolls","encyclopedia","file holder", "gun1",
  "gun2", "lil duck","medkit","molotov","open book",
  "papers","radio transistor","tablet","walkie talkie"
];
// const switch_items_names = [];
// const switch_items = [];
const Lift = [];

for (let i of pickable_items) {
  const node = loader.loadNode(i);
  node.pickable = true;
}
// liftDoor.push(loader.loadNode("Chair.002"));
for (let i of name_Lift_sides) {
  Lift.push(loader.loadNode(i));
}

Lift.push(camera);
Lift.push(light);

const death_animation_rotation = new RotateAnimator([camera], {
  dx: 0,
  dy: 0,
  dz: 90,
  startTime: 0,
  duration: 1.5,
  loop: false,
  easingFunction: (t) => easing.poly(t, 10),
})
const death_animation_translation = new LinearAnimator([camera], {
dx: 0, //-3
dy: 0, // -1
dz: 0,
startTime: 0,
duration: 1.5,
loop: false,
})
const floor_up = new LinearAnimator([], {dx: 0,dy: 0,dz: 0,duration: 0});
const floor_down = new LinearAnimator([], {dx: 0,dy: 2,dz: 0,duration: 0  });

const UP_left_door_close = new LinearAnimator([loader.loadNode("door part left")], {dx: 0.75,dy: 0,dz: 0,duration: 2});
const DOWN_left_door_close = new LinearAnimator([loader.loadNode("door part left")], {dx: 0.75,dy: 0,dz: 0,duration: 2});
const left_door_open = new LinearAnimator([loader.loadNode("door part left")], {dx: -0.75,dy: 0,dz: 0,duration: 2});

const right_door_close = new LinearAnimator([loader.loadNode("door part right")], {dx: -0.75,dy: 0,dz: 0,duration: 2});
const right_door_open = new LinearAnimator([loader.loadNode("door part right")], {dx: 0.75,dy: 0,dz: 0,duration: 2});
const lift_up = new LinearAnimator(Lift, {dx: 0,dy: 3.4,dz: 0,duration: 1});
const lift_down = new LinearAnimator(Lift, {dx: 0,dy: -3.4,dz: 0,duration: 1});

floor_up.addNextAnimation(UP_left_door_close);
floor_up.addNextAnimation(right_door_close);
UP_left_door_close.addNextAnimation(lift_up);
lift_up.addNextAnimation(left_door_open);
lift_up.addNextAnimation(right_door_open);

floor_down.addNextAnimation(DOWN_left_door_close);
floor_down.addNextAnimation(right_door_close);
DOWN_left_door_close.addNextAnimation(lift_down);
lift_down.addNextAnimation(left_door_open);
lift_down.addNextAnimation(right_door_open);




const button_press_in_animation = new LinearAnimator([loader.loadNode("button")],  {dx: -0.017,dy: 0,dz: 0,startTime: 0,duration: 0.2});
const button_press_out_animation = new LinearAnimator([loader.loadNode("button")], {dx: 0.017,dy: 0,dz: 0,startTime: 0,duration: 0.2});


button_press_in_animation.addNextAnimation(button_press_out_animation);
scene.addComponent({
  update(t, dt) {
    // Only update if the animation is playing
    if(floor_up.playing){
      floor_up.update(t, dt);
    }
    if(floor_down.playing){
      floor_down.update(t, dt);
    }
    if(UP_left_door_close.playing){
      UP_left_door_close.update(t, dt);
    }
    if(DOWN_left_door_close.playing){
      DOWN_left_door_close.update(t, dt);
    }
    if(left_door_open.playing){
      left_door_open.update(t, dt);
    }
    if(right_door_close.playing){
      right_door_close.update(t, dt);
    }
    if(right_door_open.playing){
      right_door_open.update(t, dt);
    }
    if(lift_up.playing){
      lift_up.update(t, dt);
    }
    if(lift_down.playing){
      lift_down.update(t, dt);
    }
    if (button_press_in_animation.playing) {
      button_press_in_animation.update(t, dt);
    }
    if (button_press_out_animation.playing) {
      button_press_out_animation.update(t, dt);
    }
    if (death_animation_rotation.playing) {
      death_animation_rotation.update(t, dt);
    }
    if (death_animation_translation.playing) {
      death_animation_translation.update(t, dt);
    }
  },
});

document.querySelector(".loading-container").style.display = "none";
const levelButtons = document.querySelectorAll(".level-buttons .button");
const startButton = document.getElementById("start-button");

let num_correct_items = 0; // Store the selected level

levelButtons.forEach((button) => {
  button.disabled = false;
  });
// Add click event listeners to level buttons
levelButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    // Clear selected state from all buttons
    levelButtons.forEach((btn) => btn.classList.remove("selected"));

    // Mark the clicked button as selected
    const level = parseInt(event.target.id.split("-")[1]);
    event.target.classList.add("selected");

    // Update num_correct_items based on the level
    if (level === 1) {
      num_correct_items = 3;
    } else if (level === 2) {
      num_correct_items = 5;
    } else if (level === 3) {
      num_correct_items = 7;
    }

    // Enable the start button
    startButton.disabled = false;

    // Clear and update hotbar items
    hotbar.innerHTML = "";
    items_to_pick_up.length = 0;
    select_items_to_pick_up(num_correct_items);
  });
});

// Add functionality to the start button
startButton.addEventListener("click", () => {
  if (num_correct_items > 0) {
    console.log(`Starting search with ${num_correct_items} correct items!`);
    // Add your search logic here
  }
});


// Hotbar
// const num_correct_items = 5;
const items_to_pick_up = [];
// document.getElementById("image-subject").src = `${items_to_pick_up[0]}.jpeg`;
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
function select_items_to_pick_up(num_correct_items) {
  var indexes = [];
  for (let i = 0; i < pickable_items.length; i++) {
    indexes.push(i);
  }
  if (num_correct_items > pickable_items.length) {
    num_correct_items = pickable_items.length;
  }
  while (indexes.length > num_correct_items) {
    const index = Math.floor(Math.random() * indexes.length);
    indexes.splice(index, 1);
  }
  indexes.forEach((index) => {
    items_to_pick_up.push(pickable_items[index]);
  });
  createHotbar(items_to_pick_up);
}


select_items_to_pick_up(num_correct_items);

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


// 
const node = loader.loadNode("button place");
node.pickable = false; // vse dzide pa tleh
node.switchable = true;

const gameLogic = new GameLogic(
  camera,
  items_to_pick_up,
  floor_up,
  floor_down,
  death_animation_rotation,
  death_animation_translation,
  button_press_in_animation,
  colorArray,
  lightComponent,
);

const physics = new Physics(
  scene,
  camera,
  gameLogic,
);
scene.traverse((node) => {
  const model = node.getComponentOfType(Model);
  if (!model) return;

  node.isStatic = true;
  node.draw = true;

  model.primitives.forEach((primitive) => {
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
