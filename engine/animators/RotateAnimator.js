// import { quat } from 'glm';

// import { Transform } from '../core/Transform.js';

// export class RotateAnimator {

//     constructor(node, {
//         startRotation = [0, 0, 0, 1],
//         endRotation = [0, 0, 0, 1],
//         startTime = 0,
//         duration = 1,
//         loop = false,
//     } = {}) {
//         this.node = node;

//         this.startRotation = startRotation;
//         this.endRotation = endRotation;

//         this.startTime = startTime;
//         this.duration = duration;
//         this.loop = loop;

//         this.playing = true;
//     }

//     play() {
//         this.playing = true;
//     }

//     pause() {
//         this.playing = false;
//     }

//     update(t, dt) {
//         if (!this.playing) {
//             return;
//         }

//         const linearInterpolation = (t - this.startTime) / this.duration;
//         const clampedInterpolation = Math.min(Math.max(linearInterpolation, 0), 1);
//         const loopedInterpolation = ((linearInterpolation % 1) + 1) % 1;
//         this.updateNode(this.loop ? loopedInterpolation : clampedInterpolation);
//     }

//     updateNode(interpolation) {
//         const transform = this.node.getComponentOfType(Transform);
//         if (!transform) {
//             return;
//         }

//         quat.slerp(transform.rotation, this.startRotation, this.endRotation, interpolation);
//     }

// }



import { vec3, quat } from 'glm';
import { Transform } from '../core/Transform.js';
export class RotateAnimator {
    constructor(nodes, {
        dx = 0,
        dy = 0,
        dz = 0,
        duration = 1,
        loop = false,
    } = {}) {
        this.nodes = nodes; // Array of nodes to animate
        this.deltaRotation = quat.fromEuler(quat.create(), dx, dy, dz); // Incremental rotation as quaternion
        this.duration = duration;
        this.loop = loop;
        this.playing = false;
        this.animationStartTime = null; // Track animation start time
        this.startRotations = new Map(); // Store start rotations for each node
        this.endRotations = new Map();   // Store end rotations for each node
        this.nextAnimation = null;       // Placeholder for follow-up animation
    }

    play() {
        if (!this.playing) {
            this.animationStartTime = performance.now() / 1000; // Record the start time in seconds

            // Set start and end rotations for each node
            for (const node of this.nodes) {
                const transform = node.getComponentOfType(Transform);
                if (transform) {
                    const startRotation = quat.clone(transform.rotation);
                    const endRotation = quat.mul(quat.create(), startRotation, this.deltaRotation);

                    this.startRotations.set(node, startRotation);
                    this.endRotations.set(node, endRotation);
                }
            }
            this.playing = true;
        }
    }

    pause() {
        this.playing = false;
    }

    setNextAnimation(animation) {
        this.nextAnimation = animation;
    }

    update(t, dt) {
        if (!this.playing) {
            return;
        }

        const elapsed = t - this.animationStartTime; // Calculate elapsed time
        const linearInterpolation = elapsed / this.duration;
        const clampedInterpolation = Math.min(Math.max(linearInterpolation, 0), 1);
        const loopedInterpolation = ((linearInterpolation % 1) + 1) % 1;
        const interpolation = this.loop ? loopedInterpolation : clampedInterpolation;

        for (const node of this.nodes) {
            this.updateNode(node, interpolation);
        }

        // Stop playing if animation completes and looping is off
        if (!this.loop && linearInterpolation >= 1) {
            this.playing = false;

            // Start the next animation if available
            if (this.nextAnimation) {
                this.nextAnimation.play();
            }
        }
    }

    updateNode(node, interpolation) {
        const transform = node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }
    
        const startRotation = this.startRotations.get(node);
        const endRotation = this.endRotations.get(node);
    
        // Perform spherical linear interpolation (SLERP) between start and end rotations.
        const interpolatedRotation = quat.slerp(quat.create(), startRotation, endRotation, interpolation);
    
        // Apply the interpolated rotation directly to the node's transform.
        transform.rotation = interpolatedRotation;
        // console.log(transform.rotation);
    }
    
}
