import { vec3, mat4 } from "glm";
import { getGlobalModelMatrix } from "engine/core/SceneUtils.js";
import { Transform } from "engine/core.js";

export class Physics {
  constructor(scene, items_to_pick_up, colorArray, lightComponent) {
    this.scene = scene;
    this.shouldHideOnCollision = false;
    this.items_to_pick_up = items_to_pick_up;
    this.picked_up_items_counter = 0;
    this.colorArray = colorArray;
    this.colorIndex = 0;
    this.lightComponent = lightComponent;
    this.timeLeft = 30;
    this.completed_the_game = false;

    // Load audio elements without autoplay
    this.backgroundMusic = document.getElementById("background-music");
    this.correctMusic = document.getElementById("correct-music");
    this.wrongMusic = document.getElementById("wrong-music");
    this.tickingMusic = document.getElementById("ticking-music");
    // so when you reset it the music stops before you press start again
    this.backgroundMusic.pause();
    this.correctMusic.pause();
    this.wrongMusic.pause();
    this.tickingMusic.pause();

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
        this.shouldHideOnCollision = true;
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
      this.gameWinElement.style.display = "block";
    } else {
      document.getElementById(
        "game-over-p"
      ).innerText = `You have founded: ${this.picked_up_items_counter} from the ${this.items_to_pick_up.length}`;
      this.gameOverElement.style.display = "block";
    }
    this.circleTimer.style.disply = "none";
    document.getElementById("search-subject").style.display = "none";
    document.getElementById("image-subject").style.display = "none";
    this.timerElement.style.color = "black";
    this.tickingMusic.muted = true;
    this.backgroundMusic.muted = true;
  }

  update(t, dt) {
    this.scene.traverse((node) => {
      // console.log(node.id, node.aabb);
      if (node.isDynamic) {
        this.scene.traverse((other) => {
          if (node !== other && other.isStatic) {
            // check for colisions
            this.resolveCollision(node, other);
            // check for pick up
            this.isItemInCenterAndNear(node, other);
          }
        });
      }
    });
    // Reset the flag after each update
    this.shouldHideOnCollision = false;
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
    console.log(this.lightComponent);
  }

  // finding if subjects are near each other
  isItemInCenterAndNear(
    cameraNode,
    itemNode,
    thresholdDistance = 3,
    thresholdAngle = 25
  ) {
    if (!itemNode.pickable) {
      return;
    }
    const cameraPosition = cameraNode.getComponentOfType(Transform).translation;
    const itemPosition = itemNode.getComponentOfType(Transform).translation;

    const distance = vec3.distance(cameraPosition, itemPosition);
    if (distance > thresholdDistance) {
      return;
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
    if (this.shouldHideOnCollision) {
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
        }, 500);
      } else {
        console.log(itemNode.id);
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
        }, 500);
      }
    } else {
      document.getElementById("pickup-text").style.display = "block";
      setTimeout(() => {
        document.getElementById("pickup-text").style.display = "none";
      }, 500);
    }
  }
}
