const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 resolution;
varying vec2 outTexCoord;

void main() {
	vec2 uv = outTexCoord.xy;
  vec2 fragCoord = outTexCoord.xy * resolution.xy;
	uv.y = -uv.y;
  vec2 center = vec2(0.5, 0.5);
	vec2 warp = normalize((center.xy * resolution.xy) - fragCoord.xy) * pow(distance(center.xy * resolution.xy, fragCoord.xy), -2.0) * 30.;
  warp.y = -warp.y;
	uv = uv + warp;
  
  uv.y = -uv.y;
	
	float light = clamp((0.1*distance(center.xy * resolution.xy, fragCoord.xy)) - 1.5, 0.0, 1.0);

	vec4 color = texture2D(uMainSampler, uv);

  // Output
  gl_FragColor = color * light;
  //gl_FragColor = color;
}
`;

export default class BlackHoleFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor (game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader
    });
  }

  onBoot () {
    this.set1i('uMainSampler', 1);
    this.set2f('resolution', this.game.canvas.width, this.game.canvas.height);
  }
}
