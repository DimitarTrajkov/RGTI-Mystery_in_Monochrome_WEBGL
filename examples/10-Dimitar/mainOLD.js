// import { ResizeSystem } from "engine/systems/ResizeSystem.js";
// import { UpdateSystem } from "engine/systems/UpdateSystem.js";
// import { GLTFLoader } from "engine/loaders/GLTFLoader.js";
// import { FirstPersonController } from "engine/controllers/FirstPersonController.js";

// import { Camera, Model, Node, Transform } from "engine/core.js";

// import {
//   calculateAxisAlignedBoundingBox,
//   mergeAxisAlignedBoundingBoxes,
// } from "engine/core/MeshUtils.js";

// import { Renderer } from "./Renderer.js";
// import { Light } from "./Light.js";
// import { Physics } from "./Physics.js";

// const canvas = document.querySelector("canvas");
// const renderer = new Renderer(canvas);
// await renderer.initialize();

// const loader = new GLTFLoader();
// await loader.load("scene/untitled24.gltf");

// const scene = loader.loadScene(loader.defaultScene);
// const camera = loader.loadNode("Camera");
// camera.addComponent(new FirstPersonController(camera, canvas));
// camera.isDynamic = true;
// camera.aabb = {
//   min: [-0.2, -1, -0.4],
//   max: [0.2, 1, 0.4],
// };

// const light = new Node();
// light.addComponent(
//   new Transform({
//     translation: [1, 10, 0],
//   })
// );
// light.addComponent(
//   new Light({
//     color: [0, 50, 100],
//     intensity: 2.5,
//   })
// );

// // const light2 = new Node();
// // light2.addComponent(
// //   new Transform({
// //     translation: [-2, 2, 2],
// //   })
// // );
// // light2.addComponent(
// //   new Light({
// //     color: [0, 255, 255],
// //     intensity: 2,
// //   })
// // );

// // scene.addChild(light2);
// scene.addChild(light);

// loader.loadNode("Box.000").isStatic = true;
// loader.loadNode("Box.001").isStatic = true;
// loader.loadNode("Box.002").isStatic = true;
// loader.loadNode("Box.003").isStatic = true;
// loader.loadNode("Box.004").isStatic = true;
// loader.loadNode("Box.005").isStatic = true;
// loader.loadNode("Wall.000").isStatic = true;
// loader.loadNode("Wall.001").isStatic = true;
// loader.loadNode("Wall.002").isStatic = true;
// loader.loadNode("Wall.003").isStatic = true;

// const physics = new Physics(scene);
// scene.traverse((node) => {
//   const model = node.getComponentOfType(Model);
//   if (!model) {
//     return;
//   }
//   model.primitives.forEach((primitive) => {
//     const material = primitive.material;
//     material.diffuse = 20;
//     material.specular = 1;
//     material.shininess = 200;
//   });

//   const boxes = model.primitives.map((primitive) =>
//     calculateAxisAlignedBoundingBox(primitive.mesh)
//   );
//   node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
//   node.id = "blabal";
// });


// // console.log(scene)


// function update(time, dt) {
//   scene.traverse((node) => {
//     for (const component of node.components) {
//       component.update?.(time, dt);
//     }
//   });

//   physics.update(time, dt);
// }

// function render() {
//   renderer.render(scene, camera);
// }

// function resize({ displaySize: { width, height } }) {
//   camera.getComponentOfType(Camera).aspect = width / height;
// }

// new ResizeSystem({ canvas, resize }).start();
// new UpdateSystem({ update, render }).start();












// import { ResizeSystem } from "engine/systems/ResizeSystem.js";
// import { UpdateSystem } from "engine/systems/UpdateSystem.js";
// import { GLTFLoader } from "engine/loaders/GLTFLoader.js";
// import { FirstPersonController } from "engine/controllers/FirstPersonController.js";

// import { Camera, Model, Node, Transform } from "engine/core.js";
// import {
//   calculateAxisAlignedBoundingBox,
//   mergeAxisAlignedBoundingBoxes,
// } from "engine/core/MeshUtils.js";

// import { Renderer } from "./Renderer.js";
// import { Light } from "./Light.js";
// import { Physics } from "./Physics.js";

// const canvas = document.querySelector("canvas");
// const renderer = new Renderer(canvas);
// await renderer.initialize();

// const loader = new GLTFLoader();
// await loader.load("scene/untitled24.gltf");

// const scene = loader.loadScene(loader.defaultScene);
// const camera = loader.loadNode("Camera");
// camera.addComponent(new FirstPersonController(camera, canvas));
// camera.isDynamic = true;
// camera.aabb = {
//   min: [-0.2, -1, -0.4],
//   max: [0.2, 1, 0.4],
// };

// // Define the array of colors to cycle through
// const colorArray = [
//   [4, 138, 129],
//   [234, 242, 124],
//   [33, 118, 255],
//   [41, 21, 40],
//   [193, 41, 46],
//   [247, 152, 36],
//   [4, 42, 43],
//   [80, 48, 71],
//   [244, 91, 105],
// ];

// // Initialize a counter to track the current color index
// let colorIndex = 0;

// const light = new Node();
// light.addComponent(
//   new Transform({
//     translation: [1, 3, 0],
//   })
// );

// const lightComponent = new Light({
//   color: colorArray[colorIndex], // Start with the first color in the array
//   intensity: 2.5,
// });
// light.addComponent(lightComponent);

// // Add the light to the scene
// scene.addChild(light);

// // Load other static nodes
// ["Box.000", "Box.001", "Box.002", "Box.003", "Box.004", "Box.005", "Wall.000", "Wall.001", "Wall.002", "Wall.003"].forEach((nodeName) => {
//   loader.loadNode(nodeName).isStatic = true;
// });

// const physics = new Physics(scene);
// scene.traverse((node) => {
//   const model = node.getComponentOfType(Model);
//   if (!model) return;

//   model.primitives.forEach((primitive) => {
//     const material = primitive.material;
//     material.diffuse = 20;
//     material.specular = 1;
//     material.shininess = 200;
//   });

//   const boxes = model.primitives.map((primitive) =>
//     calculateAxisAlignedBoundingBox(primitive.mesh)
//   );
//   node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
// });

// // Function to cycle through colors
// function updateLightColor() {
//   colorIndex = (colorIndex + 1) % colorArray.length; // Move to the next color in the array
//   lightComponent.color = colorArray[colorIndex];
// }

// // Event listener for key press
// document.addEventListener("keydown", (event) => {
//   if (event.key === "p" || event.key === "P") {
//     updateLightColor();
//   }
// });

// function update(time, dt) {
//   scene.traverse((node) => {
//     for (const component of node.components) {
//       component.update?.(time, dt);
//     }
//   });

//   physics.update(time, dt);
// }

// function render() {
//   renderer.render(scene, camera);
// }

// function resize({ displaySize: { width, height } }) {
//   camera.getComponentOfType(Camera).aspect = width / height;
// }

// new ResizeSystem({ canvas, resize }).start();
// new UpdateSystem({ update, render }).start();



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
await loader.load("scene/untitled24.gltf");

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
  // [4, 138, 129],
  // [234, 242, 124],
  // [33, 118, 255],
  // [41, 21, 40],
  // [193, 41, 46],
  // [247, 152, 36],
  // [4, 42, 43],
  // [80, 48, 71],
  // [244, 91, 105],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
];
const items_to_pick_up = [
  "Box.003",
  "Box.004",
  "Box.005"
];
document.getElementById("image-subject").src = `${items_to_pick_up[0]}.jpeg`;
let colorIndex = 0;

const light = new Node();
light.addComponent(
  new Transform({
    translation: [1, 3, 0],
  })
);
const lightComponent = new Light({
  color: colorArray[colorIndex], // Start with the first color
  intensity: 2.5,
});
light.addComponent(lightComponent);
light.draw = true; // Add `draw` property to control rendering

// Add the light to the scene
scene.addChild(light);

// Load other static nodes and set `draw` property
["Box.000", "Box.001", "Box.002", "Box.003", "Box.004", "Box.005", "Wall.000", "Wall.001", "Wall.002", "Wall.003"].forEach((nodeName) => {
  const node = loader.loadNode(nodeName);
  node.isStatic = true;
  node.draw = true; // Add `draw` property, default to true
  node.id = nodeName;
});

["Box.001", "Box.002"].forEach((nodeName) => {
  const node = loader.loadNode(nodeName);
  node.draw = true;
});

const physics = new Physics(scene, items_to_pick_up, colorArray, lightComponent);
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



function update(time, dt) {
  scene.traverse((node) => {
    for (const component of node.components) {
      component.update?.(time, dt);
    }
  });

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
