import { vec3, mat4 } from "glm";

import * as WebGPU from "engine/WebGPU.js";

import { Camera } from "engine/core.js";
import { BaseRenderer } from "engine/renderers/BaseRenderer.js";

import {
  getLocalModelMatrix,
  getGlobalModelMatrix,
  getGlobalViewMatrix,
  getProjectionMatrix,
  getModels,
} from "engine/core/SceneUtils.js";

import { Light } from "./Light.js";

const vertexBufferLayout = {
  arrayStride: 48,
  attributes: [
      {
          name: 'position',
          shaderLocation: 0,
          offset: 0,
          format: 'float32x3',
      },
      {
          name: 'texcoords',
          shaderLocation: 1,
          offset: 12,
          format: 'float32x2',
      },
      {
          name: 'normal',
          shaderLocation: 2,
          offset: 20,
          format: 'float32x3',
      },
      {
          name: 'tangent',
          shaderLocation: 3,
          offset: 32,
          format: 'float32x3',
      },
  ],
};

const cameraBindGroupLayout = {
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: {},
    },
  ],
};

const lightBindGroupLayout = {
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: {},
    },
  ],
};

const modelBindGroupLayout = {
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: {},
    },
  ],
};

const materialBindGroupLayout = {
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: {},
    },
    {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {},
    },
    {
      binding: 2,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: {},
    },
    {
      binding: 3,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {},
    },
    {
      binding: 4,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: {},
    },
  ],
};

// Create bitmap for missing texture
const missingTextureBitmap = await fetch("./scene/missing-texture.png")
  .then((response) => response.blob())
  .then((blob) => createImageBitmap(blob));

const missingNormalBitmap = await fetch("./scene/default_missing_normal.png")
  .then((response) => response.blob())
  .then((blob) => createImageBitmap(blob));

// Temporary fix: Teleport
export function teleport(x, y, z) {
  Renderer.temp = 1;
  Renderer.teleportX = x;
  Renderer.teleportY = y;
  Renderer.teleportZ = z;
}
window.teleport = teleport;
// End of Teleport

export class Renderer extends BaseRenderer {
  constructor(canvas) {
    super(canvas);
  }

  async initialize() {
    await super.initialize();

    const codePerFragment = await fetch("phongPerFragment.wgsl").then((response) => response.text());
    // const codePerVertex = await fetch('phongPerVertex.wgsl').then(response => response.text());
    const codeForInstacing = await fetch('particle.wgsl').then(response => response.text());

    const modulePerFragment = this.device.createShaderModule({
      code: codePerFragment,
    });
    // const modulePerVertex = this.device.createShaderModule({ code: codePerVertex });
    const moduleForInstancing = this.device.createShaderModule({ code: codeForInstacing });

    this.cameraBindGroupLayout = this.device.createBindGroupLayout(
      cameraBindGroupLayout
    );
    this.lightBindGroupLayout =
      this.device.createBindGroupLayout(lightBindGroupLayout);
    this.modelBindGroupLayout =
      this.device.createBindGroupLayout(modelBindGroupLayout);
    this.materialBindGroupLayout = this.device.createBindGroupLayout(
      materialBindGroupLayout
    );

    const layout = this.device.createPipelineLayout({
      bindGroupLayouts: [
        this.cameraBindGroupLayout,
        this.lightBindGroupLayout,
        this.modelBindGroupLayout,
        this.materialBindGroupLayout,
      ],
    });

    this.pipelinePerFragment = await this.device.createRenderPipelineAsync({
      vertex: {
        module: modulePerFragment,
        buffers: [vertexBufferLayout],
      },
      fragment: {
        module: modulePerFragment,
        targets: [{ format: this.format }],
      },
      depthStencil: {
        format: "depth24plus",
        depthWriteEnabled: true,
        depthCompare: "less",
      },
      layout,
    });

    await this.initializeParticles(moduleForInstancing);

    this.recreateDepthTexture();
  }

  createEmitters() {
    // Create emitters here
    this.addEmitter([
      8.8,
      2.7,
      -4.5
  ], 1, [0.3,0.3,0.3,0.3], [0, -0.5, 0], 0.1, 1, 5000);
  this.addEmitter([10.4, 2, -0.3], 20, [0.3,0.3,0.3,0.3], [0, 0, 0], 10, 0.1, 10000);
  //   this.addEmitter([
  //     8.8,
  //     2.7,
  //     -4.5
  // ], 2, [0.3,0.3,0.3,0.3], [0, -0.5, 0], 0.1, 1, 2000);
    // this.addEmitter([0, 1, 1.5], 0.1, [0.1, 0.1, 0.1, 0.1], [0, 20, 0], 0.1, 10, 10000);

    this.initializeEmitters();
}

addEmitter(position, lifetime, color, velocity, size, spread, numParticles) {
    // Set the default values
    this.numParticles += numParticles;
    this.emitters.push({ position, lifetime, color, velocity, size, spread, numParticles });
}

initializeEmitters() {
    this.emitterByteSize =
    3 * 4 + // position
    1 * 4 + // lifetime
    4 * 4 + // color
    3 * 4 + // velocity
    1 * 4 + // size : f32,
    1 * 4 + // spread : f32,
    3 * 4 + // padding
    0;

    this.emittersBuffer = this.device.createBuffer({
        label: 'emittersBuffer',
        size: this.emitters.length * this.emitterByteSize,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // Create the emitters buffer
    const singleEmmiterSize = this.emitterByteSize/4;
    const emitterData = new Float32Array(this.emitters.length * singleEmmiterSize);
    for (let i = 0; i < this.emitters.length; i++) {
        const baseIndex = i * singleEmmiterSize;
        const emitter = this.emitters[i];
        emitterData.set(emitter.position, baseIndex);
        emitterData[baseIndex + 3] = emitter.lifetime;
        emitterData.set(emitter.color, baseIndex + 4);
        emitterData.set(emitter.velocity, baseIndex + 8);
        emitterData[baseIndex + 11] = emitter.size;
        emitterData[baseIndex + 12] = emitter.spread;
    }
    this.device.queue.writeBuffer(this.emittersBuffer, 0, emitterData);

    // Create the particles buffer

    this.particlesBuffer = this.device.createBuffer({
        label: 'particlesBuffer',
        size: this.numParticles * this.particleInstanceByteSize,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    /*
    this.particleInstanceByteSize =
    3 * 4 + // position
    1 * 4 + // lifetime
    4 * 4 + // color
    3 * 4 + // velocity
    1 * 4 + // emitter_index
    0;
    */
    const floatsPerParticle = this.particleInstanceByteSize / 4; // 12 floats
    
    let particleData = new Float32Array(this.numParticles * floatsPerParticle);
    let particlesBuffered = 0;
    for (let i = 0; i < this.emitters.length; i++) {
        const emitter = this.emitters[i];
        for (let j = 0; j < emitter.numParticles; j++) {
            const baseIndex = particlesBuffered * (floatsPerParticle);
            particleData.set(emitter.position, baseIndex);
            particleData[baseIndex + 3] = j / emitter.numParticles * emitter.lifetime * 5;
            particleData.set(emitter.color, baseIndex + 4);
            particleData.set(emitter.velocity, baseIndex + 8);
            particleData.set([i], baseIndex + 11);
            particlesBuffered++;
        }
    }
    this.device.queue.writeBuffer(this.particlesBuffer, 0, particleData);

}

async initializeParticles(moduleForInstancing) {
    this.numParticles = 0;
    this.particlePositionOffset = 0;
    this.particleColorOffset = 4 * 4;
    this.particleInstanceByteSize =
    3 * 4 + // position
    1 * 4 + // lifetime
    4 * 4 + // color
    3 * 4 + // velocity
    1 * 4 + // emitter_index
    0;
    this.pipelineForInstancing = await this.device.createRenderPipelineAsync({
        layout: 'auto',
        label: 'instacingPipeline',
        vertex: {
            module: moduleForInstancing,
            buffers: [
                {
                    // instanced particles buffer
                    arrayStride: this.particleInstanceByteSize,
                    stepMode: 'instance',
                    attributes: [
                        {
                            // position
                            shaderLocation: 0,
                            offset: this.particlePositionOffset,
                            format: 'float32x3',
                        },
                        {
                            // color
                            shaderLocation: 1,
                            offset: this.particleColorOffset,
                            format: 'float32x4',
                        },
                    ],
                },
                {
                    // quad vertex buffer
                    arrayStride: 2 * 4, // vec2f
                    stepMode: 'vertex',
                    attributes: [
                        {
                            // vertex positions
                            shaderLocation: 2,
                            offset: 0,
                            format: 'float32x2',
                        },
                    ],
                },
            ],
        },
        fragment: {
            module: moduleForInstancing,
            targets: [
                {
                    format: 'bgra8unorm',
                    blend: {
                        color: { // finalColor = (srcFactor * srcColor) + (dstFactor * dstColor) where src is the color from this shader
                            srcFactor: 'src-alpha',
                            dstFactor: 'one-minus-src-alpha',
                            operation: 'add',
                        },
                        alpha: {
                            srcFactor: 'zero',
                            dstFactor: 'one',
                            operation: 'add',
                        },
                    },
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    
        depthStencil: {
            format: 'depth24plus',
            depthWriteEnabled: false,
            depthCompare: 'less',
        },
    });

    this.particleComputePipeline = await this.device.createComputePipeline({
        layout: 'auto',
        compute: {
            module: moduleForInstancing,
            entryPoint: 'simulate',
        },
    });


    this.emitters = [];
    this.createEmitters();

    // Quad vertex buffer - Define shape of the particles -------------------------------------------------
    this.quadVertexBuffer = this.device.createBuffer({
        label: 'quadVertexBuffer',
        size: 6 * 2 * 4, // 6x vec2f
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    // prettier-ignore
    const vertexData = [
        -1.0, -1.0, 
        +1.0, -1.0, 
        -1.0, +1.0, 
        -1.0, +1.0, 
        +1.0, -1.0, 
        +1.0, +1.0,
    ];
    new Float32Array(this.quadVertexBuffer.getMappedRange()).set(vertexData);
    this.quadVertexBuffer.unmap();

    // Simulation UBO buffer - How simulation should run ---------------------------------------------------
    // const simulationParams = {
    //     simulate: true,
    //     deltaTime: 0.04,
    //     toneMappingMode: 'standard',
    //     brightnessFactor: 1.0,
    // };

    const simulationUBOBufferSize =
    1 * 4 + // deltaTime
    1 * 4 + // brightnessFactor
    2 * 4 + // padding
    4 * 4 + // seed
    0;
    this.simulationUBOBuffer = this.device.createBuffer({
        size: simulationUBOBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.particleComputeBindGroup = this.device.createBindGroup({
        label: 'particleComputeBindGroup',
        layout: this.particleComputePipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: this.simulationUBOBuffer,
                },
            },
            {
                binding: 1,
                resource: {
                    buffer: this.particlesBuffer,
                    offset: 0,
                    size: this.numParticles * this.particleInstanceByteSize,
                },
            },
            {
                binding: 2,
                resource: {
                    buffer: this.emittersBuffer,
                    offset: 0,
                    size: this.emitters.length * this.emitterByteSize,
                },
            },
        ],
    });

    // For putting particles in 3D space -------------------------------------------------------------------
    const particleUniformBufferSize =
    4 * 4 * 4 + // modelViewProjectionMatrix : mat4x4f
    3 * 4 + // right : vec3f
    4 + // padding
    3 * 4 + // up : vec3f
    4 + // padding
    0;
    this.particleUniformBuffer = this.device.createBuffer({
        size: particleUniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.uniformBindGroup = this.device.createBindGroup({
        label: 'uniformBindGroup',
        layout: this.pipelineForInstancing.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: this.particleUniformBuffer,
                },
            },
        ],
    });
}

  recreateDepthTexture() {
    this.depthTexture?.destroy();
    this.depthTexture = this.device.createTexture({
      format: "depth24plus",
      size: [this.canvas.width, this.canvas.height],
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  prepareNode(node) {
    if (this.gpuObjects.has(node)) {
      return this.gpuObjects.get(node);
    }

    const modelUniformBuffer = this.device.createBuffer({
      size: 128,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const modelBindGroup = this.device.createBindGroup({
      layout: this.modelBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: modelUniformBuffer } }],
    });

    const gpuObjects = { modelUniformBuffer, modelBindGroup };
    this.gpuObjects.set(node, gpuObjects);
    return gpuObjects;
  }

  prepareCamera(camera) {
    if (this.gpuObjects.has(camera)) {
      return this.gpuObjects.get(camera);
    }

    const cameraUniformBuffer = this.device.createBuffer({
      size: 144,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const cameraBindGroup = this.device.createBindGroup({
      layout: this.cameraBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: cameraUniformBuffer } }],
    });

    const gpuObjects = { cameraUniformBuffer, cameraBindGroup };
    this.gpuObjects.set(camera, gpuObjects);
    return gpuObjects;
  }

  prepareLight(light) {
    if (this.gpuObjects.has(light)) {
      return this.gpuObjects.get(light);
    }

    const lightUniformBuffer = this.device.createBuffer({
      size: 48,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const lightBindGroup = this.device.createBindGroup({
      layout: this.lightBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: lightUniformBuffer } }],
    });

    const gpuObjects = { lightUniformBuffer, lightBindGroup };
    this.gpuObjects.set(light, gpuObjects);
    return gpuObjects;
  }

  prepareTexture(texture) {
    if (this.gpuObjects.has(texture)) {
      return this.gpuObjects.get(texture);
    }
    const { gpuTexture } = this.prepareImage(texture.image, texture.isSRGB);
    const { gpuSampler } = this.prepareSampler(texture.sampler);
    const gpuObjects = { gpuTexture, gpuSampler };
    this.gpuObjects.set(texture, gpuObjects);
    return gpuObjects;
  }

  createMonocolorBitmap(color) {
    // Make an HTML canvas with a single pixel of the desired color
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    context.fillStyle = `rgb(${color
      .map((c) => Math.round(c * 255))
      .join(",")})`;
    context.fillRect(0, 0, 1, 1);
    return canvas;
  }

  prepareMaterial(material) {
    if (this.gpuObjects.has(material)) {
      return this.gpuObjects.get(material);
    }
    if (!material) {
      return;
    }
    if (!material.baseTexture && !material.baseFactor) {
      // If material has no texture and no color, use missing texture
      console.log("Missing texture for material", material);
      material.baseTexture = { image: missingTextureBitmap, sampler: {} };
    } else if (!material.baseTexture && material.baseFactor) {
      // If material has no texture but has color, create a monochromatic texture
      let colorCanvas = this.createMonocolorBitmap(material.baseFactor);
      material.baseTexture = { image: colorCanvas, sampler: {} };
    }
    if(!material.normalTexture){
      // console.log("Missing normal texture for material",material.baseTexture);
      material.normalTexture = { image: missingNormalBitmap, sampler: {} };
    }else{
      // console.log("YESIt has normal texture");
    }

    const baseTexture = this.prepareTexture(material.baseTexture);
    const normalTexture = this.prepareTexture(material.normalTexture);

    const materialUniformBuffer = this.device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const materialBindGroup = this.device.createBindGroup({
      layout: this.materialBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: materialUniformBuffer } },
        { binding: 1, resource: baseTexture.gpuTexture.createView() },
        { binding: 2, resource: baseTexture.gpuSampler },
        { binding: 3, resource: normalTexture.gpuTexture.createView() },
        { binding: 4, resource: normalTexture.gpuSampler },
      ],
    });

    const gpuObjects = { materialUniformBuffer, materialBindGroup };
    this.gpuObjects.set(material, gpuObjects);
    return gpuObjects;
  }

  previousTime = performance.now();
    renderParticles(encoder, projectionMatrix, viewMatrix) {
        
        const renderPassDescriptor = {
            colorAttachments: [
                {
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: [0, 0, 0, 1],
                    loadOp: 'load',
                    storeOp: 'store',
                }
            ],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
            },
        };

        const currentTime = performance.now();
        var deltaTime = (currentTime - this.previousTime) / 1000; // Convert to seconds
        deltaTime = Math.min(deltaTime, 0.1); // Cap to 0.1 seconds
        this.previousTime = currentTime;

        this.device.queue.writeBuffer(
            this.simulationUBOBuffer,
            0,
            new Float32Array([
                deltaTime, // Delta time
                1.0, // Brightness factor
                0.0,
                0.0, // padding
                Math.random() * 100,
                Math.random() * 100, // seed.xy
                1 + Math.random(),
                1 + Math.random(), // seed.zw
            ])
        );

        const mvp = mat4.multiply(mat4.create(), projectionMatrix, viewMatrix);
        this.device.queue.writeBuffer(
            this.particleUniformBuffer,
            0,
            new Float32Array([
                // modelViewProjectionMatrix
                mvp[0], mvp[1], mvp[2], mvp[3],
                mvp[4], mvp[5], mvp[6], mvp[7],
                mvp[8], mvp[9], mvp[10], mvp[11],
                mvp[12], mvp[13], mvp[14], mvp[15],
            
                viewMatrix[0], viewMatrix[4], viewMatrix[8], // right
            
                0, // padding
            
                viewMatrix[1], viewMatrix[5], viewMatrix[9], // up
            
                0, // padding
            ])
        );
        
        {
            const passEncoder = encoder.beginComputePass();
            passEncoder.setPipeline(this.particleComputePipeline);
            passEncoder.setBindGroup(0, this.particleComputeBindGroup);
            passEncoder.dispatchWorkgroups(Math.ceil(this.numParticles / 64));
            passEncoder.end();
        }
        {
            const passEncoder = encoder.beginRenderPass(renderPassDescriptor);
            passEncoder.setPipeline(this.pipelineForInstancing);
            passEncoder.setBindGroup(0, this.uniformBindGroup);
            passEncoder.setVertexBuffer(0, this.particlesBuffer);
            passEncoder.setVertexBuffer(1, this.quadVertexBuffer);
            passEncoder.draw(6, this.numParticles, 0, 0);
            passEncoder.end();
        }
    }

  render(scene, camera) {
    if (Renderer.temp !== 0) {
      // Temporary fix: Teleport
      let matrix = camera.components[0].translation;
      matrix[0] += Renderer.teleportX;
      matrix[1] += Renderer.teleportY;
      matrix[2] += Renderer.teleportZ;

      camera.components[0].translation = matrix;
      Renderer.temp = 0;
    }

    if (
      this.depthTexture.width !== this.canvas.width ||
      this.depthTexture.height !== this.canvas.height
    ) {
      this.recreateDepthTexture();
    }

    const encoder = this.device.createCommandEncoder();
    this.renderPass = encoder.beginRenderPass({
      colorAttachments: [
          {
              view: this.context.getCurrentTexture().createView(),
              clearValue: [0, 0, 0, 1],
              loadOp: 'clear',
              storeOp: 'store',
          }
      ],
      depthStencilAttachment: {
          view: this.depthTexture.createView(),
          depthClearValue: 1,
          depthLoadOp: 'clear',
          depthStoreOp: 'store',
      },
    });
    this.renderPass.setPipeline(this.pipelinePerFragment);

    const cameraComponent = camera.getComponentOfType(Camera);
    const viewMatrix = getGlobalViewMatrix(camera);
    const projectionMatrix = getProjectionMatrix(camera);
    const cameraPosition = mat4.getTranslation(vec3.create(),getGlobalModelMatrix(camera));
    const { cameraUniformBuffer, cameraBindGroup } = this.prepareCamera(cameraComponent);
    this.device.queue.writeBuffer(cameraUniformBuffer, 0, viewMatrix);
    this.device.queue.writeBuffer(cameraUniformBuffer, 64, projectionMatrix);
    this.device.queue.writeBuffer(cameraUniformBuffer, 128, cameraPosition);
    this.renderPass.setBindGroup(0, cameraBindGroup);

    const light = scene.find((node) => node.getComponentOfType(Light));
    const lightComponent = light.getComponentOfType(Light);
    const lightColor = vec3.scale(
      vec3.create(),
      lightComponent.color,
      lightComponent.intensity / 255
    );
    const lightPosition = mat4.getTranslation(
      vec3.create(),
      getGlobalModelMatrix(light)
    );
    const lightAttenuation = vec3.clone(lightComponent.attenuation);
    const { lightUniformBuffer, lightBindGroup } =
      this.prepareLight(lightComponent);
    this.device.queue.writeBuffer(lightUniformBuffer, 0, lightColor);
    this.device.queue.writeBuffer(lightUniformBuffer, 16, lightPosition);
    this.device.queue.writeBuffer(lightUniformBuffer, 32, lightAttenuation);
    this.renderPass.setBindGroup(1, lightBindGroup);

    this.renderNode(scene);

    this.renderPass.end();

    // Particles ------------------------------------------------------------------------------------------------------
    this.renderParticles(encoder, projectionMatrix, viewMatrix);
    // End of particles

    this.device.queue.submit([encoder.finish()]);
  }

  renderNode(node, modelMatrix = mat4.create()) {
    if (node.draw === false) return; // Skip nodes with `draw` set to false

    const localMatrix = getLocalModelMatrix(node);
    modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);
    const normalMatrix = mat4.normalFromMat4(mat4.create(), modelMatrix);

    const { modelUniformBuffer, modelBindGroup } = this.prepareNode(node);
    this.device.queue.writeBuffer(modelUniformBuffer,0,new Float32Array(modelMatrix));
    this.device.queue.writeBuffer(modelUniformBuffer,64,new Float32Array(normalMatrix));
    this.renderPass.setBindGroup(2, modelBindGroup);

    for (const model of getModels(node)) {
      this.renderModel(model);
    }

    for (const child of node.children) {
      this.renderNode(child, modelMatrix);
    }
  }

  renderModel(model) {
    for (const primitive of model.primitives) {
      this.renderPrimitive(primitive);
    }
  }

  renderPrimitive(primitive) {
    const material = primitive.material;
    if (!material) return;

    const { materialUniformBuffer, materialBindGroup } =
      this.prepareMaterial(material);
    this.device.queue.writeBuffer(
      materialUniformBuffer,
      0,
      new Float32Array([
        ...material.baseFactor,
        material.normalFactor,
        material.diffuse,
        material.specular,
        material.shininess,
      ])
    );
    this.renderPass.setBindGroup(3, materialBindGroup);

    const { vertexBuffer, indexBuffer } = this.prepareMesh(
      primitive.mesh,
      vertexBufferLayout
    );
    this.renderPass.setVertexBuffer(0, vertexBuffer);
    this.renderPass.setIndexBuffer(indexBuffer, "uint32");

    this.renderPass.drawIndexed(primitive.mesh.indices.length);
  }
}

// Temporary fix: Teleport
Renderer.temp = 0;
Renderer.teleportX = 0;
Renderer.teleportY = 0;
Renderer.teleportZ = 0;
