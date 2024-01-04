const fragShader = `
#define SHADER_NAME BEND_FS

precision mediump float;

uniform sampler2D uMainSampler;
uniform float uStrength;
uniform vec2 uCenter;
varying vec2 outTexCoord;

vec2 computeUV( vec2 uv, float k, float kcube) {
  vec2 t = vec2(uv.x - uCenter.x, uv.y - uCenter.y);
  float r2 = t.x * t.x + t.y * t.y;
  float f = 0.;
  
  f = kcube == 0.0 ? 1. + r2 * k : 1. + r2 * (k + kcube * sqrt( r2 ));
  
  vec2 nUv = vec2(f * t.x + uCenter.x, f * t.y + uCenter.y);

  return nUv;
}

void main() {
  vec2 uv = outTexCoord;
  
  float k = -.1 * uStrength;
  float kcube = -.1 * uStrength;
  
  float offset = .01 * uStrength;
  
  float red = texture2D(uMainSampler, computeUV(uv, k + offset, kcube ) ).r; 
  float green = texture2D(uMainSampler, computeUV(uv, k, kcube ) ).g; 
  float blue = texture2D(uMainSampler, computeUV(uv, k - offset, kcube ) ).b; 
  
  gl_FragColor = vec4(red, green, blue, 1.);
}
`;

export const CHROMATIC_BASE_STRENGTH = 0.5;

export default class ChromaticPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private strength: number;
  private center: {x: number, y: number};

  constructor (game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader
    });

    this.strength = CHROMATIC_BASE_STRENGTH;
    this.center = { x: 0.5, y: 0.5 };
  }

  onBoot () {
    this.set1i('uMainSampler', 1);
  }

  onPreRender () {
    this.set1f('uStrength', this.strength);
    this.set2f('uCenter', this.center.x, this.center.y);
  }

  public getStrength () {
    return this.strength;
  }

  public setStrength (value: number) {
      this.strength = value;
  }

  public getCenter () {
    return this.center;
  }

  public setCenter (x: number, y: number) {
      this.center.x = x;
      this.center.y = y;
      this.set2f('uCenter', this.center.x, this.center.y);
  }
}
