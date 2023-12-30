const s1 = `
  precision mediump float;

  uniform float time;
  uniform vec2 resolution;

  varying vec2 fragCoord;
  #define iResolution resolution
  #define iTime time

  const float DOTS = 6.0;
  const vec3 COLOR = vec3(0.3, 0.6, 1.0);
  
  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (fragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

    vec3 COLORS[7];
    COLORS[0] = vec3(1.0, 0.0, 1.0);
    COLORS[1] = vec3(0.0, 0.0, 1.0);
    COLORS[2] = vec3(0.0, 1.0, 1.0);
    COLORS[3] = vec3(0.2, 1.0, 0.2);
    COLORS[4] = vec3(1.0, 1.0, 0.0);
    COLORS[5] = vec3(1.0, 0.05, 0.0);
    COLORS[6] = vec3(1.0, 0.05, 0.0);

    vec3 col = vec3(.0, .0, .0);
    
    for(float i = 1.0; i <= DOTS; i++)
    {
        highp int index = int(i);
        float s = sin(0.7 * iTime + (4.0 - (i * 0.5)) * iTime) * (0.05 + (i * 0.01));
        float c = cos(0.2 * iTime + (4.0 - (i * 0.5)) * iTime) * (0.05 + (i * 0.01));
        float f = 0.002 / abs(length(p*0.5 + vec2(c, s)));
        col += COLORS[i] * f;
    }
    
    fragColor = vec4(col, 1.0);
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

export default class CirclingDotsFX {
  private scene: Phaser.Scene;
  private shader1: Phaser.GameObjects.Shader;

  constructor (scene: Phaser.Scene, renderWidth: number, renderHeight: number) {
    this.scene = scene;
  
    const baseShader1 = new Phaser.Display.BaseShader('BufferA', s1);

    this.shader1 = scene.add.shader(baseShader1, 0, 0, renderWidth, renderHeight);
    this.shader1.setRenderToTexture('circlingDotsFX1');

    const baseShader2 = new Phaser.Display.BaseShader('BufferB', s2);
    const shader2 = scene.add.shader(baseShader2, 0, 0, renderWidth, renderHeight);
    shader2.setRenderToTexture('circlingDotsFX2');

    this.shader1.setSampler2D('iChannel0', 'circlingDotsFX2');
    this.shader1.setSampler2D('iChannel1', 'texture:noise');
    this.shader1.setSampler2D('iChannel2', 'texture:earth');
    shader2.setSampler2D('iChannel0', 'circlingDotsFX1');
  }

  public createShaderImage (): Phaser.GameObjects.Image {
    return this.scene.add.image(0, 0, 'circlingDotsFX2').setBlendMode(Phaser.BlendModes.ADD);
  }
}
