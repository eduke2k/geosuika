const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform float uTime;
uniform float uAmount;
uniform float uAlpha;
const vec4 waterColor = vec4(0.5, 0.5, 1.0, 1.0);

varying vec2 outTexCoord;
const float iterations = 40.;

void main() {
  vec4 originalTexture = texture2D(uMainSampler, outTexCoord.xy);

  vec4 scaledCol = vec4(0., 0., 0., 0.);
  for (float i=0.; i<iterations; i++) {
    float amount = (uAmount + ((1. - (uAmount)) / iterations) * i); // (uAmount + ((1. - uAmount) / 5.) * i
    vec4 scaledTexture = texture2D(uMainSampler, (outTexCoord.xy - 0.5) * amount + 0.5);
    scaledCol += scaledTexture * ((i + 1.) / (iterations + 1.)) / (iterations / 2.) * uAlpha;
  }

  gl_FragColor = waterColor;
}
`;

export default class ScalePostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private amount: number;
  private alpha: number;

  constructor (game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader
    });

    this.amount = 0.8;
    this.alpha = 1;
  }

  onBoot () {
    this.set1i('uMainSampler', 1);
  }

  onPreRender () {
    this.set1f('uTime', this.game.loop.time);
    this.set1f('uAmount', this.amount);
    this.set1f('uAlpha', this.alpha);  }

  getAmount () {
    return this.amount;
  }

  setAmount (value: number) {
    this.amount = value;
  }

  getAlpha () {
    return this.amount;
  }

  setAlpha (value: number) {
    this.alpha = value;
  }
}
