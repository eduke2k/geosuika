const fragShader = `
#define SHADER_NAME BEND_FS

precision mediump float;

uniform sampler2D uMainSampler;
uniform float uStrength;
varying vec2 outTexCoord;

vec2 computeUV( vec2 uv, float k, float kcube) {
  vec2 t = uv - .5;
  float r2 = t.x * t.x + t.y * t.y;
  float f = 0.;
  
  if(kcube == 0.0) {
    f = 1. + r2 * k;
  } else {
    f = 1. + r2 * (k + kcube * sqrt( r2 ));
  }
  
  vec2 nUv = f * t + .5;
  // nUv.y = 1. - nUv.y;

  return nUv;
}

void main() {
  vec2 uv = outTexCoord;
  
    float k = -.1 * uStrength;
    float kcube = -.1 * uStrength;
    
    float offset = .01;
    
    float red = texture2D(uMainSampler, computeUV(uv, k + offset, kcube ) ).r; 
    float green = texture2D(uMainSampler, computeUV(uv, k, kcube ) ).g; 
    float blue = texture2D(uMainSampler, computeUV(uv, k - offset, kcube ) ).b; 
    
    gl_FragColor = vec4( red, green, blue, 1.);
}
`;

export default class ChromaticPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private strength: number;

  constructor (game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader
      // uniforms: [
      //   'uProjectionMatrix',
      //   'uMainSampler',
      //   'uTime',
      //   'uSpeed',
      //   'uBendFactor'
      // ]
    });

    this.strength = 1;
  }

  onBoot () {
    this.set1i('uMainSampler', 1);
  }

  onPreRender () {
    this.set1f('uStrength', this.strength);
  }

  public getStrength () {
    return this.strength;
  }

  public setStrength (value: number) {
      this.strength = value;
  }
}
