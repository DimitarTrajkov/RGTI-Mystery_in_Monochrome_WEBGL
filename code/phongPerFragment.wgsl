struct VertexInput {
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
    @location(2) normal: vec3f,
}

struct VertexOutput {
    @builtin(position) clipPosition: vec4f,
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
    @location(2) normal: vec3f,
}

struct FragmentInput {
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
    @location(2) normal: vec3f,
}

struct FragmentOutput {
    @location(0) color: vec4f,
}

struct CameraUniforms {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    position: vec3f,
}

struct LightUniforms {
    color: vec3f,
    position: vec3f,
    attenuation: vec3f,
}

struct ModelUniforms {
    modelMatrix: mat4x4f,
    normalMatrix: mat3x3f,
}

struct MaterialUniforms {
    baseFactor: vec4f,
    diffuse: f32,
    specular: f32,
    shininess: f32,
}

@group(0) @binding(0) var<uniform> camera: CameraUniforms;
@group(1) @binding(0) var<uniform> light: LightUniforms;
@group(2) @binding(0) var<uniform> model: ModelUniforms;
@group(3) @binding(0) var<uniform> material: MaterialUniforms;
@group(3) @binding(1) var baseTexture: texture_2d<f32>;
@group(3) @binding(2) var baseSampler: sampler;

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.clipPosition = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);
    output.position = (model.modelMatrix * vec4(input.position, 1)).xyz;
    output.texcoords = input.texcoords;
    output.normal = model.normalMatrix * input.normal;
    return output;
}

// @fragment
// fn fragment(input: FragmentInput) -> FragmentOutput {
//     var output: FragmentOutput;

//     let surfacePosition = input.position;
//     let d = distance(surfacePosition, light.position);
//     let attenuation = 1 / dot(light.attenuation, vec3(1, d, d * d));

//     let N = normalize(input.normal);
//     let L = normalize(light.position - surfacePosition);
//     let V = normalize(camera.position - surfacePosition);
//     let R = normalize(reflect(-L, N));

//     let lambert = max(dot(N, L), 0.0) * material.diffuse;
//     let phong = pow(max(dot(V, R), 0.0), material.shininess) * material.specular;

//     let diffuseLight = lambert * attenuation * light.color;
//     let specularLight = phong * attenuation * light.color;

//     let baseColor = textureSample(baseTexture, baseSampler, input.texcoords) * material.baseFactor;
//     let finalColor = baseColor.rgb * diffuseLight + specularLight;

//     output.color = pow(vec4(finalColor, 1), vec4(1 / 2.2));

//     return output;
// }


// @fragment
// fn fragment(input: FragmentInput) -> FragmentOutput {
//     var output: FragmentOutput;

//     // Define a constant for light size
//     let lightSize: f32 = 10.0; // Adjust this value to the desired light size

//     // The rest of the shader code...
//     let lightCenter = light.position;
//     let numSamples = 4u;

//     // World-space position
//     let surfacePosition = input.position;

//     var accumulatedDiffuse: vec3<f32> = vec3<f32>(0.5);
//     var accumulatedSpecular: vec3<f32> = vec3<f32>(0.0);

//     for (var i: u32 = 0u; i < numSamples; i = i + 1u) {
//         for (var j: u32 = 0u; j < numSamples; j = j + 1u) {
//             let offsetX: f32 = f32(i) / f32(numSamples - 1u) - 0.5;
//             let offsetY: f32 = f32(j) / f32(numSamples - 1u) - 0.5;
//             let offset = vec2<f32>(offsetX, offsetY) * lightSize;
//             let samplePosition = lightCenter + vec3<f32>(offset, 0.0);

//             let L = normalize(samplePosition - surfacePosition);
//             let d = distance(surfacePosition, samplePosition);
//             let attenuation = 1.0 / dot(light.attenuation, vec3<f32>(1.0, d, d * d));

//             let N = normalize(input.normal);
//             let V = normalize(camera.position - surfacePosition);
//             let R = reflect(-L, N);

//             let lambert = max(dot(N, L), 0.0) * material.diffuse;
//             let phong = pow(max(dot(V, R), 0.0), material.shininess) * material.specular;

//             accumulatedDiffuse = accumulatedDiffuse + lambert * attenuation * light.color;
//             accumulatedSpecular = accumulatedSpecular + phong * attenuation * light.color;
//         }
//     }

//     let totalSamples = f32(numSamples * numSamples);
//     let diffuseLight = accumulatedDiffuse / totalSamples;
//     let specularLight = accumulatedSpecular / totalSamples;

//     let baseColor = textureSample(baseTexture, baseSampler, input.texcoords) * material.baseFactor;
//     let finalColor = baseColor.rgb * diffuseLight + specularLight;
//     output.color = pow(vec4(finalColor, 1.0), vec4(1.0 / 2.2));

//     return output;
// }

@fragment
fn fragment(input: FragmentInput) -> FragmentOutput {
    var output: FragmentOutput;

    // Calculate surface position and light distance/attenuation for area light
    let surfacePosition = input.position;
    let d = distance(surfacePosition, light.position);
    let attenuation = 1 / dot(light.attenuation, vec3(1, d, d * d));

    // Normal, light, view, and reflection vectors
    let N = normalize(input.normal);
    let L = normalize(light.position - surfacePosition);
    let V = normalize(camera.position - surfacePosition);
    let R = normalize(reflect(-L, N));

    // Lambertian (diffuse) and Phong (specular) components
    let lambert = max(dot(N, L), 0.0) * material.diffuse;
    let phong = pow(max(dot(V, R), 0.0), material.shininess) * material.specular;

    // Accumulated light contributions
    let diffuseLight = lambert * attenuation * light.color;
    let specularLight = phong * attenuation * light.color;

    // Ambient light component with the same color as the main light source
    let ambientIntensity = 0.3; // Adjust ambient intensity as needed
    let ambientLight = light.color * ambientIntensity;

    // Base color and final color calculation
    let baseColor = textureSample(baseTexture, baseSampler, input.texcoords) * material.baseFactor;
    let finalColor = baseColor.rgb * (diffuseLight + ambientLight) + specularLight;

    // Apply gamma correction to the final color
    output.color = pow(vec4(finalColor, 1.0), vec4(1 / 2.2));

    return output;
}
