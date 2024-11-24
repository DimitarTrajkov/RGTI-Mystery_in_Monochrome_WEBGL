////////////////////////////////////////////////////////////////////////////////
// Utilities
////////////////////////////////////////////////////////////////////////////////
var<private> rand_seed : vec2f;

fn init_rand(invocation_id : u32, seed : vec4f) {
  rand_seed = seed.xz;
  rand_seed = fract(rand_seed * cos(35.456+f32(invocation_id) * seed.yw));
  rand_seed = fract(rand_seed * cos(41.235+f32(invocation_id) * seed.xw));
}

fn rand() -> f32 {
  rand_seed.x = fract(cos(dot(rand_seed, vec2f(23.14077926, 232.61690225))) * 136.8168);
  rand_seed.y = fract(cos(dot(rand_seed, vec2f(54.47856553, 345.84153136))) * 534.7645);
  return rand_seed.y;
}

////////////////////////////////////////////////////////////////////////////////
// Vertex shader
////////////////////////////////////////////////////////////////////////////////
struct RenderParams {
  modelViewProjectionMatrix : mat4x4f,
  right : vec3f,
  up : vec3f
}
@binding(0) @group(0) var<uniform> render_params : RenderParams;

struct VertexInput {
  @location(0) position : vec3f,
  @location(1) color : vec4f,
  @location(2) quad_pos : vec2f, // -1..+1
}

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) color : vec4f,
  @location(1) quad_pos : vec2f, // -1..+1
}

// @vertex
// fn vs_main(in : VertexInput) -> VertexOutput {
//   var quad_pos = mat2x3f(render_params.right, render_params.up) * in.quad_pos;
//   var position = in.position + quad_pos * 0.4; // Last parameter is the particle size
//   var out : VertexOutput;
//   out.position = vec4f(position, 1.0);
//   out.color = in.color;
//   out.quad_pos = in.quad_pos;
//   return out;
// }

@vertex
fn vs_main(in : VertexInput) -> VertexOutput {
  var quad_pos = mat2x3f(render_params.right, render_params.up) * in.quad_pos;
  var position = in.position + quad_pos * 0.1;
  var out : VertexOutput;
  out.position = render_params.modelViewProjectionMatrix * vec4f(position, 1.0);
  out.color = in.color;
  out.quad_pos = in.quad_pos;
  return out;
}

////////////////////////////////////////////////////////////////////////////////
// Fragment shader
////////////////////////////////////////////////////////////////////////////////
@fragment
fn fs_main(in : VertexOutput) -> @location(0) vec4f {
  var color = in.color;
  // Apply a circular particle alpha mask
  return color;
}
// @fragment
// fn fs_main(in : VertexOutput) -> @location(0) vec4f {
//     return vec4f(1.0, 0.0, 0.0, 1.0); // Solid red particles for debugging
// }

////////////////////////////////////////////////////////////////////////////////
// Simulation Compute shader
////////////////////////////////////////////////////////////////////////////////
struct SimulationParams {
  deltaTime : f32,
  brightnessFactor : f32,
  seed : vec4f,
}

struct Particle {
  position : vec3f,
  lifetime : f32,
  color    : vec4f,
  velocity : vec3f,
  emitter_index : f32,
}

struct Particles {
  particles : array<Particle>,
}

struct Emitter {
  position : vec3f,
  lifetime : f32,
  color : vec4f,
  velocity : vec3f,
  size : f32,
  spread : f32,
}

struct Emitters {
  emitters : array<Emitter>,
}

@binding(0) @group(0) var<uniform> sim_params : SimulationParams;
@binding(1) @group(0) var<storage, read_write> data : Particles;
@binding(2) @group(0) var<storage, read> emitters : Emitters;

@compute @workgroup_size(64)
fn simulate(@builtin(global_invocation_id) global_invocation_id : vec3u) {
  let idx = global_invocation_id.x;

  init_rand(idx, sim_params.seed);

  var particle = data.particles[idx];
  var emitter = emitters.emitters[i32(particle.emitter_index)];

  // Apply gravity
  // particle.velocity.z = particle.velocity.z - sim_params.deltaTime * 0.5;

  // Basic velocity integration
  particle.position = particle.position + sim_params.deltaTime * particle.velocity;

  // Age each particle. Fade out before vanishing.
  particle.lifetime = particle.lifetime - sim_params.deltaTime;
  // particle.color.a = smoothstep(0.0, 0.5, particle.lifetime);

  // If the lifetime has gone negative, then the particle is dead and should be
  // respawned.
  if (particle.lifetime < 0.0) {
    
    // Lifetime +- 10%
    particle.lifetime = emitter.lifetime + rand() * emitter.lifetime * 0.1;

    // Randomly spawn within position +- size/2
    particle.position.x = emitter.position.x + rand() * emitter.size - emitter.size * 0.5;
    particle.position.y = emitter.position.y + rand() * emitter.size - emitter.size * 0.5;
    particle.position.z = emitter.position.z + rand() * emitter.size - emitter.size * 0.5;

    // Spread - Get direction of velocity, then make cone around it
    particle.velocity = emitter.velocity + vec3f(rand() * emitter.spread, rand() * emitter.spread, rand() * emitter.spread) - 0.5 * emitter.spread;

    particle.color = emitter.color + vec4f(rand() * 0.1, rand() * 0.1, rand() * 0.1, rand() * 0.1);
  }

  // Store the new particle value
  data.particles[idx] = particle;
}

// @compute @workgroup_size(64)
// fn simulate(@builtin(global_invocation_id) global_invocation_id : vec3u) {
//   let idx = global_invocation_id.x;

//   init_rand(idx, sim_params.seed);

//   var particle = data.particles[idx];

//   // Apply gravity
//   particle.velocity.y = 1;

//   // Basic velocity integration
//   particle.position = particle.position + 0.1 * particle.velocity;

//   // Age each particle. Fade out before vanishing.
//   // particle.lifetime = particle.lifetime - sim_params.deltaTime;
//   // particle.color.a = smoothstep(0.0, 0.5, particle.lifetime);

//   // If the lifetime has gone negative, then the particle is dead and should be
//   // respawned.
//   if (particle.lifetime < 0.0) {
//     // Use the probability map to find where the particle should be spawned.
//     // Starting with the 1x1 mip level.
//     var coord : vec2i;
//     // for (var level = u32(textureNumLevels(texture) - 1); level > 0; level--) {
//     //   // Load the probability value from the mip-level
//     //   // Generate a random number and using the probabilty values, pick the
//     //   // next texel in the next largest mip level:
//     //   //
//     //   // 0.0    probabilites.r    probabilites.g    probabilites.b   1.0
//     //   //  |              |              |              |              |
//     //   //  |   TOP-LEFT   |  TOP-RIGHT   | BOTTOM-LEFT  | BOTTOM_RIGHT |
//     //   //
//     //   let probabilites = textureLoad(texture, coord, level);
//     //   let value = vec4f(rand());
//     //   let mask = (value >= vec4f(0.0, probabilites.xyz)) & (value < probabilites);
//     //   coord = coord * 2;
//     //   coord.x = coord.x + select(0, 1, any(mask.yw)); // x  y
//     //   coord.y = coord.y + select(0, 1, any(mask.zw)); // z  w
//     // }
//     // let uv = vec2f(coord) / vec2f(textureDimensions(texture));
//     // particle.position = vec3f(2.0 * 3.0 * vec2f(1.0, -1.0), 0.0);

//     // particle.color = textureLoad(texture, coord, 0);
//   }

//   // Store the new particle value
//   particle.color.r -= 0.1;
//   particle.color.a = 1.0;
//   data.particles[idx] = particle;
// }
