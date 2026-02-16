/* HLSL (High-Level Shading Language) sample for GitHub language detection
   BarbrickDesign - Complete Language Portfolio */

// Constant buffers
cbuffer PerFrame : register(b0)
{
    float4x4 view;
    float4x4 projection;
    float3 lightPos;
    float3 viewPos;
};

cbuffer PerObject : register(b1)
{
    float4x4 model;
    float4 objectColor;
};

// Structures
struct VertexInput
{
    float3 position : POSITION;
    float3 normal : NORMAL;
    float2 texCoord : TEXCOORD0;
};

struct VertexOutput
{
    float4 position : SV_POSITION;
    float3 worldPos : POSITION;
    float3 normal : NORMAL;
    float2 texCoord : TEXCOORD0;
};

// Textures and samplers
Texture2D mainTexture : register(t0);
SamplerState mainSampler : register(s0);

// Vertex Shader
VertexOutput VS(VertexInput input)
{
    VertexOutput output;
    
    float4 worldPos = mul(float4(input.position, 1.0), model);
    output.worldPos = worldPos.xyz;
    output.position = mul(mul(worldPos, view), projection);
    output.normal = mul(input.normal, (float3x3)model);
    output.texCoord = input.texCoord;
    
    return output;
}

// Pixel Shader
float4 PS(VertexOutput input) : SV_TARGET
{
    // Normalize vectors
    float3 normal = normalize(input.normal);
    float3 lightDir = normalize(lightPos - input.worldPos);
    float3 viewDir = normalize(viewPos - input.worldPos);
    
    // Ambient
    float3 ambient = 0.1 * objectColor.rgb;
    
    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    float3 diffuse = diff * objectColor.rgb;
    
    // Specular
    float3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
    float3 specular = 0.5 * spec * float3(1.0, 1.0, 1.0);
    
    // Combine
    float3 result = ambient + diffuse + specular;
    return float4(result, objectColor.a);
}
