import { Camera, Transform } from "engine/core.js";
import { vec3, mat4 } from "glm";
import { FirstPersonController } from "../engine/controllers/FirstPersonController.js";

export class GameLogic {
    constructor(
        camera,
        items_to_pick_up,
        animation_up,
        animation_down,
        death_rotation,
        death_translation,
        button_press_in_animation,
        colorArray,
        lightComponent,
    ) {
        this.camera = camera;
        this.items_to_pick_up = items_to_pick_up;

        // Animations
        this.death_rotation = death_rotation;
        this.death_translation = death_translation;
        this.animation_up = animation_up;
        this.animation_down = animation_down;
        this.button_press_in_animation = button_press_in_animation;

        // Light color
        this.colorArray = colorArray;
        this.colorIndex = 0;
        this.lightComponent = lightComponent;

        // when start button is pressed the timer starts
        document.getElementById("start-button").addEventListener("click", () => {
            this.startGame();
        });

        this.startingTime = 30;
        this.timeLeft = this.startingTime;
        this.completed_the_game = false;

        this.picked_up_items_counter = 0;

        this.animate_lift_doors = false;

        // all screens
        this.eyelidTop = document.getElementById("eyelid-top");
        this.eyelidBottom = document.getElementById("eyelid-bottom");
        this.timerElement = document.getElementById("timer");
        this.gameOverElement = document.getElementById("game-over");
        this.gameWinElement = document.getElementById("game-win");
        this.gameIntroElement = document.getElementById("game-intro");
        this.circleTimer = document.getElementById("timer-circle");

        // Load audio elements without autoplay
        // so when you reset it the music stops before you press start again
        this.backgroundMusic = document.getElementById("background-music");
        this.correctMusicFiles = ["correct_0.MP3", "correct_1.MP3"];
        this.wrongMusicFiles = ["wrong_0.MP3", "wrong_1.MP3", "wrong_2.MP3", "wrong_3.MP3"];
        this.tickingMusic = document.getElementById("ticking-music");
        this.lift_text_blocked = false;

        // Reload page so restart game
        document.getElementById("refresh-button1").onclick = function () {
            location.reload();
        };
        document.getElementById("refresh-button2").onclick = function () {
            location.reload();
        };

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

        if (this.timeLeft <= 10) {
            // document.getElementById("full_screen").style.display = "block";
            const eyelidCloseFactor = Math.max(0, (10 - this.timeLeft) / 10);
            this.eyelidTop.style.opacity = 0.7 + 0.2 * eyelidCloseFactor;
            this.eyelidBottom.style.opacity = 0.7 + 0.2 * eyelidCloseFactor;
            // document.getElementById("full_screen").style.opacity = 0.7*eyelidCloseFactor;
            this.eyelidTop.style.height = `${30 * eyelidCloseFactor * (Math.max(3 - (this.timeLeft + 1.5) % 3, (this.timeLeft + 1.5) % 3) - 1.5)}vh`;
            this.eyelidBottom.style.height = `${30 * eyelidCloseFactor * (Math.max(3 - (this.timeLeft + 1.5) % 3, (this.timeLeft + 1.5) % 3) - 1.5)}vh`;
        }
    }

    updateMusicSpeed() {
        this.tickingMusic.playbackRate =
            0.5 + Math.max(((30 - this.timeLeft) / 30) * 1.5, 0);
        this.tickingMusic.volume =
            0.15 + Math.max((30 - this.timeLeft) / 30, 0) ** 2 * 0.75;
    }

    showGameOver() {
        // this.timerElement.style.display = "none";
        // this.circleTimer.style.disply = "none";
        document.getElementById("circle-timer-container").style.display = "none";
        if (this.completed_the_game) {
            setTimeout(() => {
                this.gameWinElement.style.display = "block"; // delay of 0.2 seconds
            }, 200);
        } else {
            const controller = this.camera.getComponentOfType(FirstPersonController);
            controller.active_controller = false;
            this.death_rotation.play();
            this.death_translation.play();
            setTimeout(() => {
                document.getElementById(
                    "game-over-p"
                ).innerText = `You found: ${this.picked_up_items_counter} of the ${this.items_to_pick_up.length}`;
                this.gameOverElement.style.display = "block";
            }, 1700);
        }
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        // document.getElementById("/-subject").style.display = "none";
        // document.getElementById("image-subject").style.display = "none";
        // this.timerElement.style.color = "black";
        this.tickingMusic.muted = true;
        this.backgroundMusic.muted = true;
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
        // logic for wrong pick
        this.timeLeft -= 1;
        this.timerElement.style.color = "red";
        this.circleTimer.style.stroke = "red";

        // Play the wrong music
        const wrongMusicIndex = Math.floor(Math.random() * this.correctMusicFiles.length);
        this.wrongMusic = new Audio(`./sounds/${this.wrongMusicFiles[correctMusicIndex]}`);
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

        // Play the correct music
        const correctMusicIndex = Math.floor(Math.random() * this.correctMusicFiles.length);
        this.correctMusic = new Audio(`./sounds/${this.correctMusicFiles[correctMusicIndex]}`);
        this.correctMusic.play();

        document.getElementById("correct-item").style.display = "block";
        setTimeout(() => {
            document.getElementById("correct-item").style.display = "none";
            this.timerElement.style.color = "black";
            this.circleTimer.style.stroke = "black";
            this.correctMusic.pause();
        }, 5000);
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
}