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

    // Load audio elements without autoplay
    this.backgroundMusic = document.getElementById("background-music");
    this.correctMusic = document.getElementById("correct-music");
    this.tickingMusic = document.getElementById("ticking-music");
    // so when you reset it the music stops before you press start again
    this.backgroundMusic.pause();
    this.correctMusic.pause();
    this.tickingMusic.pause();
    this.tickingMusic.playbackRate = 0.3;

    // this.setUpMusicListeners();

    this.timeLeft = 30;
    this.timerElement = document.getElementById("timer");
    this.gameOverElement = document.getElementById("game-over");
    this.gameIntroElement = document.getElementById("game-intro"); // Get the game intro element
    // this.startGame();
    document.getElementById("start-button").addEventListener("click", () => {
      this.startGame();
    });
    document.getElementById("refresh-button").onclick = function () {
      location.reload();
    };
    document.addEventListener("keydown", (event) => {
      if (event.key === "p" || event.key === "P") {
        this.shouldHideOnCollision = true;
      }
    });
  }
  startGame() {
    // Hide the game intro
    this.gameIntroElement.style.display = "none";

    // Start the timer and music
    this.startTimer();
    this.playBackgroundMusic();
    this.playTickingMusic();

    // Show the timer element
    // this.timerElement.style.display = "block";
  }
  playBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = 1; // Optional: Set background music volume
      this.backgroundMusic
        .play()
        .catch((error) =>
          console.log("Background music playback failed:", error)
        );
    }
  }
  playTickingMusic() {
    if (this.tickingMusic) {
      this.tickingMusic.volume = 0.15;
      this.tickingMusic
        .play()
        .then(() => {
          this.tickingMusic.playbackRate = 1; // Set playback rate after play starts
        })
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
  }

  updateMusicSpeed() {
    this.tickingMusic.playbackRate =
      0.5 + Math.max(((30 - this.timeLeft) / 30) * 1.5, 0);
    this.tickingMusic.volume =
    0.05 + Math.max((30 - this.timeLeft) / 30, 0) ** 2 * 0.85;
        // this.tickingMusic.muted = false;
  }
  // Show "Game Over" message and hide other elements
  showGameOver() {
    this.timerElement.style.display = "none";
    this.gameOverElement.style.display = "block";
    this.tickingMusic.muted = true;
    this.backgroundMusic.muted = true;

    // Additional game over logic can go here (e.g., stop game updates)
  }

  update(t, dt) {
    this.scene.traverse((node) => {
      if (node.isDynamic) {
        this.scene.traverse((other) => {
          if (node !== other && other.isStatic) {
            this.resolveCollision(node, other);
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

  // a - camera
  // b - object
  resolveCollision(a, b) {
    const aBox = this.getTransformedAABB(a);
    const bBox = this.getTransformedAABB(b);

    const isColliding = this.aabbIntersection(aBox, bBox);
    if (!isColliding) {
      return;
    } else {
      document.getElementById("pickup-text").style.display = "block";
      setTimeout(() => {
        document.getElementById("pickup-text").style.display = "none";
      }, 500);
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

    // If `P` was pressed, hide and make `b` dynamic on collision
    if (this.shouldHideOnCollision) {
      if (b.id == this.items_to_pick_up[this.picked_up_items_counter]) {
        this.picked_up_items_counter++;
        document.getElementById("image-subject").src = `${
          this.items_to_pick_up[this.picked_up_items_counter]
        }.jpeg`;
        b.draw = false;
        b.isStatic = false;
        this.timeLeft += 3;

        this.correctMusic.play(); // Play correct item music once
        document.getElementById("correct-item").style.display = "block";
        setTimeout(() => {
          document.getElementById("correct-item").style.display = "none";
        }, 500);

        this.updateLightColor();
      } else {
        console.log(b.id);
        this.timeLeft -= 1;
        document.getElementById("wrong-item").style.display = "block";
        setTimeout(() => {
          document.getElementById("wrong-item").style.display = "none";
        }, 500);
        console.log("try again");
      }
    }

    vec3.add(transform.translation, transform.translation, minDirection);
  }
  // Cycle through light colors on pressing 'P'
  updateLightColor() {
    this.colorIndex = (this.colorIndex + 1) % this.colorArray.length;
    this.lightComponent.color = this.colorArray[this.colorIndex];
    console.log(this.lightComponent);
  }
}
