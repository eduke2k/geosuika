const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform float uTime;

// const float minx = 0.0;
// const float miny = 0.0;
// const float maxx = 1.0;
// const float maxy = 1.0;
const vec4 waterColor = vec4(0.5, 0.5, 1.0, 1.0);

varying vec2 outTexCoord;

void main() {
  // vec2 uv = outTexCoord.xy;

  // vec4 colorMultiplier = vec4(1.0);
  
  // if(uv.x >= minx && uv.x <= maxx && uv.y <= (1. - miny) && uv.y >= 1.0 - maxy) {        
  //   float oy = uv.y;
  //   float ox = uv.x;
  //   uv.y = 2.0*(1. - miny) - uv.y;
  //   uv.x = uv.x - ((uv.x-0.5)*0.2) * (1.0-oy/1. - miny);
  //   uv.y = uv.y + sin(1./(oy-(1. - miny))+uTime*10.0)*0.003;
  //   colorMultiplier = waterColor;
  // }

  gl_FragColor = waterColor;
}
`;

export default class WaterFX extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
  public static readonly KEY = "TestPipeline";

  constructor (game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader
    });
  }

  onBoot () {
    this.set1i('uMainSampler', 1);
  }

  onPreRender () {
    this.set1f('uTime', this.game.loop.time);
  }
}
