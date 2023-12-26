const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform float uStrength;
varying vec2 outTexCoord;

void main() {
  float amount = uStrength / 2.;

  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv = outTexCoord.xy;

  // Pixel colour
  vec4 Color = (uv.y < amount || uv.y > 1.0-amount) ? vec4(.0,.0,.0,1.) : texture2D(uMainSampler, uv);

  // Outputt
  gl_FragColor = Color;
}
`;

export default class CinematicBarsFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private strength: number;

  constructor (game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader
    });

    this.strength = 0.;
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
