const s1 = `
  precision mediump float;
  #define M_PI 3.1415926535897932384626433832795
  #define M_TWO_PI (2.0 * M_PI)

  uniform float time;
  uniform vec2 resolution;
  uniform sampler2D iChannel0;
  uniform float uInvRadius;

  varying vec2 fragCoord;
  #define iResolution resolution
  #define iTime time

  float rand(vec2 n) {
      return fract(sin(dot(n, vec2(12.9898,12.1414))) * 83758.5453);
  }
  
  float noise(vec2 n) {
      const vec2 d = vec2(0.0, 1.0);
      vec2 b = floor(n);
      vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
      return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
  }
  
  vec3 ramp(float t) {
    return t <= .5 ? vec3( 1. - t * 1.4, .2, 1.05 ) / t : vec3( .3 * (1. - t) * 2., .2, 1.05 ) / t;
  }

  vec2 polarMap(vec2 uv, float shift, float inner) {
      uv = vec2(0.5) - uv;
      
      float px = 1.0 - fract(atan(uv.y, uv.x) / 6.28 + 0.25) + shift;
      float py = (sqrt(uv.x * uv.x + uv.y * uv.y) * (1.0 + inner * uInvRadius) - inner) * 2.0;
      
      return vec2(px, py);
  }

  float fire(vec2 n) {
      return noise(n) + noise(n * 2.1) * .6 + noise(n * 5.4) * .42;
  }
  
  float shade(vec2 uv, float t) {
      uv.x += uv.y < .5 ? 23.0 + t * .035 : -11.0 + t * .03;    
      uv.y = abs(uv.y - .5);
      uv.x *= 35.0;
      
      float q = fire(uv - t * .013) / 2.0;
      vec2 r = vec2(fire(uv + q / 2.0 + t - uv.x - uv.y), fire(uv + q - t));
      
      return pow((r.y + r.y) * max(.0, uv.y) + .1, 4.0);
  }
  
  vec3 color(float grad) {
      float m2 = 1.15;
      grad =sqrt( grad);
      vec3 color = vec3(1.0 / (pow(vec3(0.5, 0.0, .1) + 2.61, vec3(2.0))));
      vec3 color2 = color;
      color = ramp(grad);
      color /= (m2 + max(vec3(0), color));
      
      return color;
  }
  
  void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
      float m1 = 10.0;
      
      float t = iTime;
      vec2 uv = fragCoord / iResolution.yy;
      float ff = 1.0 - uv.y;
      uv.x -= (iResolution.x / iResolution.y - 1.0) / 2.0;
      vec2 uv2 = uv;
      uv2.y = 1.0 - uv2.y;
       uv = polarMap(uv, 1.3, m1);
       uv2 = polarMap(uv2, 1.9, m1);
  
      vec3 c1 = color(shade(uv, t)) * ff;
      vec3 c2 = color(shade(uv2, t)) * (1.0 - ff);
      
      fragColor = vec4(c1 + c2, 1.0);
  }

  void main(void) {
    mainImage(gl_FragColor, fragCoord.xy);
  }
`;

const s2 = `
precision mediump float;
uniform vec2 resolution;
uniform sampler2D iChannel0;
varying vec2 fragCoord;

vec4 texture(sampler2D s, vec2 c) {
  return texture2D(s,c);
}

vec4 texture(sampler2D s, vec2 c, float b) {
  return texture2D(s,c,b);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / resolution.xy;
  fragColor = texture(iChannel0,uv);
}

void main(void) {
  mainImage(gl_FragColor, fragCoord.xy);
}`;

export default class GlowRingFX {
  private scene: Phaser.Scene;
  private invRadius: number;
  private shader1: Phaser.GameObjects.Shader;

  constructor (scene: Phaser.Scene, invRadius: number, renderWidth: number, renderHeight: number) {
    this.scene = scene;
    
    this.invRadius = invRadius;
    const baseShader1 = new Phaser.Display.BaseShader('BufferA', s1, undefined, {
      uInvRadius: { key: 'uInvRadius', type: '1f', value: 2.0 },
    });

    this.shader1 = scene.add.shader(baseShader1, 0, 0, renderWidth, renderHeight);
    this.shader1.setRenderToTexture('glowRingFX1');
    this.setInvRadius(this.invRadius);

    const baseShader2 = new Phaser.Display.BaseShader('BufferB', s2);
    const shader2 = scene.add.shader(baseShader2, 0, 0, renderWidth, renderHeight);
    shader2.setRenderToTexture('glowRingFX2');

    this.shader1.setSampler2D('iChannel0', 'glowRingFX2');
    shader2.setSampler2D('iChannel0', 'glowRingFX1');
  }

  public createShaderImage (): Phaser.GameObjects.Image {
    return this.scene.add.image(0, 0, 'glowRingFX2').setBlendMode(Phaser.BlendModes.ADD);
  }

  public setInvRadius (invRadius: number): void {
    this.shader1.setUniform('uInvRadius.value', invRadius);
    this.invRadius = invRadius;
  }

  public getInvRadius (): number {
    return this.invRadius;
  }
}
