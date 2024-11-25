import { vec3, mat4 } from "glm";
import { getGlobalModelMatrix } from "engine/core/SceneUtils.js";
import { Camera, Transform } from "engine/core.js";
export class Physics {
  constructor(
    scene,
    camera,
    gameLogic,
  ) {


    this.scene = scene;
    this.camera = camera;

    this.gameLogic = gameLogic;

    this.itemPickupKeyPressed = false;
    this.liftkeyUp = false;
    this.liftkeyDown = false;
    this.interactionKey = false;
    this.floor_number = 0;

    // letter P for pick up
    document.addEventListener("keydown", (event) => {
      if (event.key === "p" || event.key === "P") {
        this.itemPickupKeyPressed = true;
      } else if (event.key === "ArrowUp") {
        this.liftkeyUp = true;
      } else if (event.key === "ArrowDown") {
        this.liftkeyDown = true;
      } else if (event.key === "e" || event.key === "E") {
        this.interactionKey = true;
      }
    });
  }


  update(t, dt) {
    // Remove all text, since it will be re-added if needed before frame update
    document.getElementById("pickup-text").style.display = "none";
    document.getElementById("lift-text").style.display = "none";

    this.scene.traverse((node) => {
      // if camera
      if (node.isDynamic) {
        this.scene.traverse((other) => {
          // if camera != camera and has colision detection
          if (node !== other && other.isStatic) {

            // Teleport hitbox to camera
            if (other.isCameraHitbox) { other.components[0].translation = node.components[0].translation; }
            else {
              // check for colisions
              this.resolveCollision(node.hitbox, other);
            }

            // Teleport camera to hitbox
            if (other.isCameraHitbox) { node.components[0].translation = other.components[0].translation; }

            // check for interaction
            this.checkInteraction(node, other);
          }
        });
      }
    });

    // Reset the flag after each update
    this.gameLogic.shouldHideOnCollision = false; // E
    this.liftkeyUp = false; // arrowUp
    this.liftkeyDown = false; // arrowDown
    this.interactionKey = false;
    this.itemPickupKeyPressed = false;
  }

  intervalIntersection(min1, max1, min2, max2) {
    return !(min1 > max2 || min2 > max1);
  }

  aabbIntersection(aabb1, aabb2) {
    return (
      this.intervalIntersection(
        aabb1.min[0],
        aabb1.max[0],
        aabb2.min[0],
        aabb2.max[0]
      ) &&
      this.intervalIntersection(
        aabb1.min[1],
        aabb1.max[1],
        aabb2.min[1],
        aabb2.max[1]
      ) &&
      this.intervalIntersection(
        aabb1.min[2],
        aabb1.max[2],
        aabb2.min[2],
        aabb2.max[2]
      )
    );
  }

  getTransformedAABB(node) {
    const matrix = getGlobalModelMatrix(node);
    const { min, max } = node.aabb;
    const vertices = [
      [min[0], min[1], min[2]],
      [min[0], min[1], max[2]],
      [min[0], max[1], min[2]],
      [min[0], max[1], max[2]],
      [max[0], min[1], min[2]],
      [max[0], min[1], max[2]],
      [max[0], max[1], min[2]],
      [max[0], max[1], max[2]],
    ].map((v) => vec3.transformMat4(v, v, matrix));

    const xs = vertices.map((v) => v[0]);
    const ys = vertices.map((v) => v[1]);
    const zs = vertices.map((v) => v[2]);
    const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
    const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
    return { min: newmin, max: newmax };
  }

  // a - camera, b - object
  resolveCollision(a, b) {
    const aBox = this.getTransformedAABB(a);
    const bBox = this.getTransformedAABB(b);

    const isColliding = this.aabbIntersection(aBox, bBox);
    if (!isColliding) {
      return;
    }

    const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
    const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);

    let minDiff = Infinity;
    let minDirection = [0, 0, 0];
    if (diffa[0] >= 0 && diffa[0] < minDiff) {
      minDiff = diffa[0];
      minDirection = [minDiff, 0, 0];
    }
    if (diffa[1] >= 0 && diffa[1] < minDiff) {
      minDiff = diffa[1];
      minDirection = [0, minDiff, 0];
    }
    if (diffa[2] >= 0 && diffa[2] < minDiff) {
      minDiff = diffa[2];
      minDirection = [0, 0, minDiff];
    }
    if (diffb[0] >= 0 && diffb[0] < minDiff) {
      minDiff = diffb[0];
      minDirection = [-minDiff, 0, 0];
    }
    if (diffb[1] >= 0 && diffb[1] < minDiff) {
      minDiff = diffb[1];
      minDirection = [0, -minDiff, 0];
    }
    if (diffb[2] >= 0 && diffb[2] < minDiff) {
      minDiff = diffb[2];
      minDirection = [0, 0, -minDiff];
    }

    const transform = a.getComponentOfType(Transform);
    if (!transform) {
      return;
    }

    vec3.add(transform.translation, transform.translation, minDirection);
  }

  // finding if subjects are near each other
  isItemInCenterAndNear(
    cameraNode,
    itemNode,
    thresholdDistance = 15,
    thresholdAngle = 5
  ) {
    const cameraPosition = cameraNode.getComponentOfType(Transform).translation;
    const itemPosition = itemNode.getComponentOfType(Transform).translation;

    const distance = vec3.distance(cameraPosition, itemPosition);
    if (distance > thresholdDistance) {
      return false;
    }

    // Calculate direction vector from camera to item
    const toItemDir = vec3.sub(vec3.create(), itemPosition, cameraPosition);
    vec3.normalize(toItemDir, toItemDir);

    // Get camera's forward direction
    const forwardDir = vec3.transformQuat(
      vec3.create(),
      [0, 0, -1],
      cameraNode.getComponentOfType(Transform).rotation
    );
    vec3.normalize(forwardDir, forwardDir);

    // Calculate the angle between camera forward direction and direction to item
    const angle = Math.acos(vec3.dot(forwardDir, toItemDir)) * (180 / Math.PI);
    // Check if item is within the specified angle threshold for "center"
    if (angle >= thresholdAngle) {
      return false;
    }

    return true;
  }
  checkLift(node) {
    // location of the camera must be in the lift
    // 1 is the highest floor

    if ((this.liftkeyUp || this.interactionKey) && this.floor_number == 0) {
      // get the animation
      this.floor_number++;
      this.gameLogic.button_press_in_animation.play();
      this.gameLogic.animation_up.play();
    } else if (
      (this.liftkeyDown || this.interactionKey) &&
      this.floor_number == 1
    ) {
      this.floor_number--;
      this.gameLogic.button_press_in_animation.play();
      this.gameLogic.animation_down.play();
    }
  }

  checkInteraction(camera, node) {
    if (node.pickable || node.switchable) {
      let isNear = this.isItemInCenterAndNear(camera, node);
      if (isNear) {
        if (node.pickable) {
          document.getElementById("pickup-text").style.display = "block";
          if (this.interactionKey || this.itemPickupKeyPressed) {
            this.gameLogic.checkIfCorrectItemPickedUp(node);
          }
        } else if (node.switchable) {
          document.getElementById("lift-text").style.display = "block";
          this.checkLift(node);
        }
      }
    }
  }
}
