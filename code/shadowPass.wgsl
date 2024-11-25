struct VertexInput {
    @location(0) position: vec3f,
}

struct VertexOutput {
    @builtin(position) clipPosition: vec4f,
}

struct LightUniforms {
    lightViewProjectionMatrix: mat4x4f,
}

struct ModelUniforms {
    modelMatrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> light: LightUniforms;
@group(1) @binding(0) var<uniform> model: ModelUniforms;

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.clipPosition = light.lightViewProjectionMatrix * model.modelMatrix * vec4(input.position, 1);
    return output;
}

@fragment
fn fragment() -> @builtin(frag_depth) f32 {
    return 0.0; // Placeholder for depth output handled automatically.
}
