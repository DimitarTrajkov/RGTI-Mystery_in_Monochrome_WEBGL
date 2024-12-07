struct VertexInput {
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
    @location(2) normal: vec3f,
    @location(3) tangent: vec3f,
}

struct VertexOutput {
    @builtin(position) clipPosition: vec4f,
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
    @location(2) normal: vec3f,
    @location(3) tangent: vec3f,
    @location(4) shadowPosition: vec4f,
}

struct FragmentInput {
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
    @location(2) normal: vec3f,
    @location(3) tangent: vec3f,
    @location(4) shadowPosition: vec4f,
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
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
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
    normalFactor: f32,
    diffuse: f32,
    specular: f32,
    shininess: f32,
}

@group(0) @binding(0) var<uniform> camera: CameraUniforms;
@group(1) @binding(0) var<uniform> model: ModelUniforms;
@group(2) @binding(0) var<uniform> light: LightUniforms;
@group(2) @binding(1) var shadowTexture: texture_depth_2d;
@group(2) @binding(2) var shadowSampler: sampler_comparison;
@group(3) @binding(0) var<uniform> material: MaterialUniforms;
@group(3) @binding(1) var uBaseTexture: texture_2d<f32>;
@group(3) @binding(2) var uBaseSampler: sampler;
@group(3) @binding(3) var uNormalTexture: texture_2d<f32>;
@group(3) @binding(4) var uNormalSampler: sampler;

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.clipPosition = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);
    output.position = (model.modelMatrix * vec4(input.position, 1)).xyz;
    output.texcoords = input.texcoords;
    output.normal = model.normalMatrix * input.normal;
    output.tangent = model.normalMatrix * input.tangent;

    output.shadowPosition = light.projectionMatrix * light.viewMatrix * vec4(input.position, 1); // FIXED: Use input.position
    return output;
}

@fragment
fn fragment(input: FragmentInput) -> FragmentOutput {
    var output: FragmentOutput;

    let baseColor = textureSample(uBaseTexture, uBaseSampler, input.texcoords);
    let normalColor = textureSample(uNormalTexture, uNormalSampler, input.texcoords);
    let scaledNormal = normalize((normalColor.xyz * 2 - 1) * vec3(vec2(material.normalFactor), 1));

    let shadowPosition = input.shadowPosition.xyz / input.shadowPosition.w;
    let shadowTexcoords = shadowPosition.xy * vec2(0.5, -0.5) + 0.5;
    let shadowFactor = textureSampleCompare(shadowTexture, shadowSampler, shadowTexcoords.xy, shadowPosition.z + 0.005);

    let normal = normalize(input.normal);
    let tangent = normalize(input.tangent);
    let bitangent = normalize(cross(normal, tangent));

    let tangentMatrix = mat3x3(tangent, bitangent, normal);
    let transformedNormal = tangentMatrix * scaledNormal;

    let surfacePosition = input.position;
    let d = distance(surfacePosition, light.position);
    let attenuation = 1 / dot(light.attenuation, vec3(1, d, d * d));

    let N = transformedNormal;
    let L = normalize(light.position - surfacePosition);
    let V = normalize(camera.position - surfacePosition);
    let R = normalize(reflect(-L, N));

    let ambientIntensity = 1.0;
    let ambientLight = light.color * ambientIntensity;


    let lambert = max(dot(N, L), 0.0) * material.diffuse;
    let phong = pow(max(dot(V, R), 0.0), material.shininess) * material.specular;

    let diffuseLight = lambert * attenuation * light.color;
    let specularLight = phong * attenuation * light.color;

    let finalColor = baseColor.rgb * (ambientLight + (diffuseLight + specularLight) * shadowFactor);

    output.color = pow(vec4(finalColor, 1), vec4(1 / 2.2));
    //output.color = vec4((transformedNormal * 0.5) + 0.5, 1.0);

    //test if there are shadows
    //output.color = vec4(shadowFactor, shadowFactor, shadowFactor, 1.0);

    // let depth = textureSample(shadowTexture, shadowSampler, shadowTexcoords.xy).r;
    // output.color = vec4(depth, depth, depth, 1.0);
    // output.color = vec4(shadowTexcoords.xy, 0.0, 1.0);
    // let shadowTexcoordsClamped = clamp(shadowTexcoords, vec2(0.0), vec2(1.0));
    // output.color = vec4(shadowTexcoordsClamped.xy, 0.0, 1.0);
    // output.color = vec4(shadowPosition.z / shadowPosition.w); // Visualize depth

    return output;
}