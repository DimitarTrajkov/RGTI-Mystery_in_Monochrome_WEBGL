import { vec3, mat4 } from "glm";
import { getGlobalModelMatrix } from "engine/core/SceneUtils.js";
import { Transform } from "engine/core.js";

export class Physics {
  constructor(
    scene,
    items_to_pick_up,
    colorArray,
    lightComponent,
    animation_up,
    animation_down,
    button_press_in_animation
  ) {
    this.scene = scene;
    this.itemPickupKeyPressed = false;
    this.liftkeyUp = false;
    this.liftkeyDown = false;
    this.interactionKey = false;
    this.items_to_pick_up = items_to_pick_up;
    this.picked_up_items_counter = 0;
    this.colorArray = colorArray;
    this.colorIndex = 0;
    this.lightComponent = lightComponent;
    this.timeLeft = 10;
    this.completed_the_game = false;
    this.floor_number = 0;
    this.animate_lift_doors = false;
    this.animation_up = animation_up;
    this.animation_down = animation_down;
    this.button_press_in_animation = button_press_in_animation;
    
    // Load audio elements without autoplay
    this.backgroundMusic = document.getElementById("background-music");
    this.correctMusic = document.getElementById("correct-music");
    this.wrongMusic = document.getElementById("wrong-music");
    this.tickingMusic = document.getElementById("ticking-music");
    this.lift_text_blocked = false;

    // so when you reset it the music stops before you press start again
    this.backgroundMusic.pause();
    this.correctMusic.pause();
    this.wrongMusic.pause();
    this.tickingMusic.pause();

    // all screens
    this.timerElement = document.getElementById("timer");
    this.gameOverElement = document.getElementById("game-over");
    this.gameWinElement = document.getElementById("game-win");
    this.gameIntroElement = document.getElementById("game-intro");
    this.circleTimer = document.getElementById("timer-circle");

    // when start button is pressed the timer starts
    document.getElementById("start-button").addEventListener("click", () => {
      this.startGame();
    });

    document.getElementById("refresh-button1").onclick = function () {
      location.reload();
    };
    document.getElementById("refresh-button2").onclick = function () {
      location.reload();
    };
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
  startGame() {
    // Hide the game intro
    this.gameIntroElement.style.display = "none";
    this.startTimer();
    this.playBackgroundMusic();
    this.playTickingMusic();
  }
  playBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic
        .play()
        .catch((error) =>
          console.log("Background music playback failed:", error)
        );
    }
  }
  playTickingMusic() {
    if (this.tickingMusic) {
      this.tickingMusic
        .play()
        .catch((error) => console.log("Ticking music playback failed:", error));
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.showGameOver();
        clearInterval(this.timerInterval);
      }
    }, 100);
  }

  updateTimerDisplay() {
    this.timerElement.innerText = `${this.timeLeft.toFixed(1)}s`;
    this.updateMusicSpeed();
    const maxOffset = 376;
    const offset = maxOffset * (1 - this.timeLeft / 30);
    this.circleTimer.style.strokeDashoffset = offset;
  }

  updateMusicSpeed() {
    this.tickingMusic.playbackRate =
      0.5 + Math.max(((30 - this.timeLeft) / 30) * 1.5, 0);
    this.tickingMusic.volume =
      0.05 + Math.max((30 - this.timeLeft) / 30, 0) ** 2 * 0.85;
  }

  showGameOver() {
    this.timerElement.style.display = "none";
    if (this.completed_the_game) {
      setTimeout(() => {
        this.gameWinElement.style.display = "block"; // delay of 0.2 seconds
      }, 200); 
    } else {
      document.getElementById(
        "game-over-p"
      ).innerText = `You found: ${this.picked_up_items_counter} of the ${this.items_to_pick_up.length}`;
      this.gameOverElement.style.display = "block";
    }
    this.circleTimer.style.disply = "none";
    document.getElementById("/-subject").style.display = "none";
    document.getElementById("image-subject").style.display = "none";
    this.timerElement.style.color = "black";
    this.tickingMusic.muted = true;
    this.backgroundMusic.muted = true;
  }

  update(t, dt) {
    document.getElementById("pickup-text").style.display = "none";
    document.getElementById("lift-text").style.display = "none";
    this.scene.traverse((node) => {
      // console.log(node.id, node.aabb);
      // if camera
      if (node.isDynamic) {
        this.scene.traverse((other) => {
          // if camera != camera and colision detection
          if (node !== other && other.isStatic) {
            // check for colisions
            this.resolveCollision(node, other);
            // check for interaction
            this.checkInteraction(node, other);
          }
        });
        // this.checkLift(node);
      }
    });

    // Reset the flag after each update
    this.shouldHideOnCollision = false; // E
    this.liftkeyUp = false; // arrowUp
    this.liftkeyDown = false; // arrowDown
    this.interactionKey = false;
    this.itemPickupKeyPressed = false;
    this.liftkeyUp = false;
    this.liftkeyDown = false;
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

  updateLightColor() {
    this.colorIndex = (this.colorIndex + 1) % this.colorArray.length;
    this.lightComponent.color = this.colorArray[this.colorIndex];
  }

shrinkItem(itemNode, duration = 0.2) {
  const transform = itemNode.getComponentOfType(Transform);
  if (!transform) return;

  const initialScale = vec3.clone(transform.scale);
  const targetScale = vec3.fromValues(0, 0, 0); 
  
  const startTime = performance.now(); 
  const update = () => {
    const elapsedTime = (performance.now() - startTime) / 1000;
    const lerpFactor = Math.min(elapsedTime / duration, 1); 
    const newScale = vec3.lerp(vec3.create(), initialScale, targetScale, lerpFactor);

    transform.scale = newScale;

    if (lerpFactor < 1) {
      requestAnimationFrame(update);
    } else {
      itemNode.draw = false; 
    }
  };
  update();
}

  wrongItemPickedUp() {
    // console.log(itemNode.id);
    // logic for wrong pick
    this.timeLeft -= 1;
    this.timerElement.style.color = "red";
    this.circleTimer.style.stroke = "red";
    this.wrongMusic.play();
    document.getElementById("wrong-item").style.display = "block";
    setTimeout(() => {
      document.getElementById("wrong-item").style.display = "none";
      this.timerElement.style.color = "black";
      this.circleTimer.style.stroke = "black";
      this.wrongMusic.pause();
    }, 500);
  }

  correctItemPickedUp(itemNode) {
    this.picked_up_items_counter++;
    this.shrinkItem(itemNode); // Shrink the item with a 1-second duration

    // itemNode.draw = false;
    // itemNode.isStatic = false;
    if (this.picked_up_items_counter == this.items_to_pick_up.length) {
      this.completed_the_game = true;
      this.showGameOver();
      return;
    }
    this.updateLightColor();

    // logic for correct pick
    this.timeLeft += 3;
    this.timerElement.style.color = "green";
    this.circleTimer.style.stroke = "green";
    this.correctMusic.play();
    document.getElementById("correct-item").style.display = "block";
    setTimeout(() => {
      document.getElementById("correct-item").style.display = "none";
      this.timerElement.style.color = "black";
      this.circleTimer.style.stroke = "black";
      this.correctMusic.pause();
    }, 500);
  }

  checkIfCorrectItemPickedUp(itemNode) {
    // Check if the item picked up is any of the items needed to be picked up
    for (let i = 0; i < this.items_to_pick_up.length; i++) {
      if (itemNode.name == this.items_to_pick_up[i]) {
        document.querySelectorAll(".hotbar-item")[i].classList.add("grayscale");

        this.correctItemPickedUp(itemNode);
        return;
      }
    }

    this.wrongItemPickedUp();
  }

  // finding if subjects are near each other
  isItemInCenterAndNear(
    cameraNode,
    itemNode,
    thresholdDistance = 15,
    thresholdAngle = 5,
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
      return;
    }
    // console.log(this.shouldHideOnCollision);
    if (this.shouldHideOnCollision) { // tipko za pick up (E)
      if (itemNode.id == this.items_to_pick_up[this.picked_up_items_counter]) {
        // next item
        this.picked_up_items_counter++;
        itemNode.draw = false;
        itemNode.isStatic = false;
        if (this.picked_up_items_counter == this.items_to_pick_up.length) {
          this.completed_the_game = true;
          this.showGameOver();
          return;
        }
        document.getElementById("image-subject").src = `${
          this.items_to_pick_up[this.picked_up_items_counter]
        }.jpeg`;

        this.updateLightColor();

        // logic for correct pick
        this.timeLeft += 3;
        this.timerElement.style.color = "green";
        this.circleTimer.style.stroke = "green";
        this.correctMusic.play();
        document.getElementById("correct-item").style.display = "block";
        setTimeout(() => {
          document.getElementById("correct-item").style.display = "none";
          this.timerElement.style.color = "black";
          this.circleTimer.style.stroke = "black";
          this.correctMusic.pause();
        }, 500);
      } else {
        // console.log(itemNode.id);
        // logic for wrong pick
        this.timeLeft -= 1;
        this.timerElement.style.color = "red";
        this.circleTimer.style.stroke = "red";
        this.wrongMusic.play();
        document.getElementById("wrong-item").style.display = "block";
        setTimeout(() => {
          document.getElementById("wrong-item").style.display = "none";
          this.timerElement.style.color = "black";
          this.circleTimer.style.stroke = "black";
          this.wrongMusic.pause();
        }, 500);
      }
    }
    // console.log(this.itemPickupKeyPressed);
    return true;
  }
  checkLift(node) {
    // const transform = node.getComponentOfType(Transform);
    /* if (
      transform.translation[2] < 5 ||
      transform.translation[2] > 9 ||
      transform.translation[0] < -1.3 ||
      transform.translation[0] > 1.4
    )
      return; */
    // location of the camera must be in the lift
    // 1 is the highest floor

    if ((this.liftkeyUp || this.interactionKey) && this.floor_number == 0) {
      // get the animation
      this.floor_number ++;
      this.button_press_in_animation.play();
      this.animation_up.play();
    } else if ((this.liftkeyDown || this.interactionKey) && this.floor_number == 1) {
      this.floor_number --;
      this.button_press_in_animation.play();
      this.animation_down.play();
    }
    // } else {
    //   if (this.lift_text_blocked)
    //     return;

    //   this.lift_text_blocked = true;
    //   setTimeout(() => {
    //     this.lift_text_blocked = false;
    //   }, 500);
    // }
  }

  checkInteraction(camera, node) {
    if (node.pickable || node.switchable) {
      let isNear = this.isItemInCenterAndNear(camera, node);
      if (isNear) {
        if (node.pickable) {
            document.getElementById("pickup-text").style.display = "block";
            if (this.interactionKey || this.itemPickupKeyPressed) {
              this.checkIfCorrectItemPickedUp(node);
            }
        } else if (node.switchable) {
          document.getElementById("lift-text").style.display = "block";
          this.checkLift(node);
        }
      }
    }
  }
}
