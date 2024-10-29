import { vec3 } from 'glm';
import { Transform } from '../core/Transform.js';

export class LinearAnimator {
    constructor(nodes, {
        dx = 0,
        dy = 0,
        dz = 0,
        duration = 1,
        loop = false,
    } = {}) {
        this.nodes = nodes;  // Array of nodes to animate
        this.deltaPosition = [dx, dy, dz];  // The incremental position changes
        this.duration = duration;
        this.loop = loop;
        this.playing = false;
        this.animationStartTime = null;  // Track animation start time
        this.nextAnimation = null;       // Placeholder for follow-up animation
        this.startPositions = new Map(); // Store start positions for each node
        this.endPositions = new Map();   // Store end positions for each node
    }

    play() {
        if (!this.playing) {
            this.animationStartTime = performance.now() / 1000;  // Record the start time in seconds
            
            // Set start and end positions for each node
            for (const node of this.nodes) {
                const transform = node.getComponentOfType(Transform);
                if (transform) {
                    const startPosition = vec3.clone(transform.translation);
                    const endPosition = vec3.add(vec3.create(), startPosition, this.deltaPosition);
                    
                    this.startPositions.set(node, startPosition);
                    this.endPositions.set(node, endPosition);
                }
            }
            this.playing = true;
        }
    }

    pause() {
        this.playing = false;
    }

    // Set the next animation to run after the current one completes
    setNextAnimation(animation) {
        this.nextAnimation = animation;
    }

    update(t, dt) {
        if (!this.playing) {
            return;
        }

        const elapsed = t - this.animationStartTime;  // Calculate elapsed time
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

        const startPosition = this.startPositions.get(node);
        const endPosition = this.endPositions.get(node);
        
        // Interpolate the node's position from start to end
        vec3.lerp(transform.translation, startPosition, endPosition, interpolation);
    }
}
