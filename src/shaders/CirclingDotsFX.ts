const s1 = `
  precision mediump float;

  uniform float time;
  uniform vec2 resolution;
  uniform float uDistance;

  varying vec2 fragCoord;
  #define iResolution resolution
  #define iTime time

  const float DOTS = 6.0;
  const vec3 COLOR = vec3(1.0, 0.2, 0.2);
  // const float DISTANCE = 0.03;
  
  vec3 getColor(float index) {
    return
      index == 1.0 ? vec3(1.0, 0.0, 1.0) :
      index == 2.0 ? vec3(0.0, 0.0, 1.0) :
      index == 3.0 ? vec3(0.0, 1.0, 1.0) :
      index == 4.0 ? vec3(0.2, 1.0, 0.2) :
      index == 5.0 ? vec3(1.0, 1.0, 0.0) :
      index == 6.0 ? vec3(1.0, 0.05, 0.0) :
      vec3(1.0, 1.0, 1.0);
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (fragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
    vec3 col = vec3(.0, .0, .0);
    
    for(float i = 1.0; i <= DOTS; i++) {
        float s = sin(0.7 * iTime + (i * 0.5) * iTime) * uDistance;
        float c = cos(0.2 * iTime + (i * 0.5) * iTime) * uDistance;
        float f = 0.001 / abs(length(p*0.5 + vec2(c, s)));
        col += COLOR * f;
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
  private distance: number;

  constructor (scene: Phaser.Scene, distance: number, renderWidth: number, renderHeight: number) {
    this.scene = scene;
    this.distance = distance;

    const baseShader1 = new Phaser.Display.BaseShader('BufferA', s1, undefined, {
      uDistance: { key: 'uDistance', type: '1f', value: 0.03 },
    });

    this.shader1 = scene.add.shader(baseShader1, 0, 0, renderWidth, renderHeight);
    this.shader1.setRenderToTexture('circlingDotsFX1');
    this.setDistance(distance);


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


  public setDistance (distance: number): void {
    this.shader1.setUniform('uDistance.value', distance);
    this.distance = distance;
  }

  public getDistance (): number {
    return this.distance;
  }
}
