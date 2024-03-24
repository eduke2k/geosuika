const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 resolution;
uniform float x[3];
uniform float y[3];
uniform int amount;
varying vec2 outTexCoord;

const int maxHoles = 3;

void main() {
  if (amount == 0) {
    gl_FragColor = texture2D(uMainSampler, outTexCoord);
  } else {
    vec2 uv = outTexCoord.xy;
    vec2 fragCoord = outTexCoord.xy * resolution.xy;
    uv.y = -uv.y;
  
    float lights = 1.0;
  
    for(int i = 0; i < maxHoles; i++) {
      // CALCULATE DISTORTION
      if (i == amount) break;
      vec2 center = vec2(0.5, 0.5);
      vec2 warp = normalize((vec2(x[i], y[i]).xy * resolution.xy) - fragCoord.xy) * pow(distance(vec2(x[i], y[i]) * resolution.xy, fragCoord.xy), -2.0) * 30.;
      warp.y = -warp.y;
      uv = uv + warp;
  
      //CACULATE BLACK HOLE
      lights -= 1. - clamp((0.1*distance(vec2(x[i], y[i]).xy * resolution.xy, fragCoord.xy)) - 2.0, 0.0, 1.0);
    }
  
    uv.y = -uv.y;
    vec4 color = texture2D(uMainSampler, uv);
    gl_FragColor = color * lights;
  }
}
`;

export default class BlackHoleFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private centers: { x: number, y: number }[];
  private amount: number;

  constructor (game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader
    });

    this.centers = [];
    this.amount = 0;
  }

  onBoot () {
    this.set1i('uMainSampler', 1);
    this.set2f('resolution', this.game.canvas.width, this.game.canvas.height);
  }

  onPreRender () {
    this.set1i('amount', this.amount);
    this.set1fv('x', [0.5, 0.2, 0.7]);
    this.set1fv('y', [0.5, 0.2, 0.7]);
  }

  getAmount () {
    return this.amount;
  }

  setAmount (value: number) {
    this.amount = value;
  }

  getCenters (): { x: number, y: number }[] {
    return this.centers;
  }

  setCenters (centers: { x: number, y: number }[]) {
    this.centers = centers;
  }
}
