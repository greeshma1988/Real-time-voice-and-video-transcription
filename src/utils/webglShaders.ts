export const createWaveformShader = (gl: WebGL2RenderingContext) => {
  const vertexShaderSource = `#version 300 es
    in vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0, 1);
    }
  `;

  const fragmentShaderSource = `#version 300 es
    precision highp float;
    
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_active;
    
    out vec4 fragColor;
    
    #define NUM_WAVES 5.0
    #define PI 3.14159265359
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      
      float amplitude = u_active * (0.3 + 0.1 * sin(u_time));
      float finalColor = 0.0;
      
      for(float i = 0.0; i < NUM_WAVES; i++) {
        float offset = i / NUM_WAVES;
        float t = u_time * (1.0 + offset * 0.3);
        float wave = sin(uv.x * 8.0 + t + offset * PI * 2.0);
        
        float envelope = smoothstep(1.0, 0.3, abs(uv.x));
        wave *= envelope;
        
        float thickness = 0.02 * (1.0 + 0.5 * sin(t * 2.0));
        float waveMask = smoothstep(thickness, 0.0, abs(uv.y - wave * amplitude));
        
        float hue = offset + u_time * 0.1;
        vec3 color = 0.5 + 0.5 * cos(2.0 * PI * (hue + vec3(0.0, 0.33, 0.67)));
        
        finalColor += waveMask;
      }
      
      vec3 baseColor = vec3(0.7, 0.8, 1.0);
      vec3 finalRGB = baseColor * finalColor;
      
      // Add glow effect
      float glow = finalColor * 0.5;
      finalRGB += glow * vec3(0.3, 0.4, 1.0);
      
      // Fade out when inactive
      finalRGB *= mix(0.2, 1.0, u_active);
      
      fragColor = vec4(finalRGB, finalColor * 0.95);
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return program;
};