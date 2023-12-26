const fragShader = `
#define SHADER_NAME BLUR_FX

precision mediump float;

#define PI2 6.2831853072 // PI * 2
#define PI_O_2 1.5707963268 // PI / 2

const float passes = 64.0;
const float radius = 32.0;
const float lossiness = 1.0;
const float preserveOriginal = 0.0;

uniform sampler2D uMainSampler;
uniform float uRadius;
uniform vec4 uColor;
uniform float uMix;

varying vec2 outTexCoord;

void main() {
  vec2 pixel = 1.0 / outTexCoord.xy;
  vec2 uv = outTexCoord;

  float count = 1.0 + preserveOriginal;
  vec4 color = texture2D(uMainSampler, uv) * count;
  const float directionStep = PI2 / passes;

  vec2 off;
  float c, s, dist, dist2, weight;
  for(float d = 0.0; d < PI2; d += directionStep) {
    c = cos(d);
    s = sin(d);
    dist = 1.0 / max(abs(c), abs(s));
    dist2 = dist * (2.0 + lossiness);
    off = vec2(c, s);
    for(float i= dist * 1.5; i <= radius; i += dist2) {
      weight = i / radius; // 1.0 - cos(i / radius * PI_O_2);
      count += weight;
      color += texture2D( uMainSampler, uv + off * pixel * i) * weight;
    }
  }

  gl_FragColor = mix(color / count, vec4(0.1), 0.8);
}

`;

export default class BlurPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private radius: number;
  private color: [number, number, number, number];
  private mix: number;

  constructor (game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader
    });

    this.radius = 64;
    this.color = [0, 0, 0, 0];
    this.mix = 0;
  }

  onBoot () {
    this.set1i('uMainSampler', 1);
  }

  onPreRender () {
    this.set1f('uRadius', this.radius);
    this.set4iv('uColor', this.color);
    this.set1f('uMix', this.mix);
  }

  getRadius () {
    return this.radius;
  }

  setRadius (value: number) {
    this.radius = value;
  }

  getColor () {
    return this.color;
  }

  setColor (value: [number, number, number, number]) {
    this.color = value;
  }

  getMix () {
    return this.mix;
  }

  setMix (value: number) {
    this.mix = value;
  }
}
