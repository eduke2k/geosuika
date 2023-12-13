const fragShader = `
#define SHADER_NAME BARREL_FS

precision mediump float;

uniform sampler2D uMainSampler;
uniform float uBarrelFactor;

varying vec2 outTexCoord;

void main()
{
	vec2 uv = (outTexCoord.xy / outTexCoord.xy) - vec2(0.5);
	float uva = atan(uv.x, uv.y);
  float uvd = sqrt(dot(uv, uv));
  //k = negative for pincushion, positive for barrel
  float k = -1.0;
  uvd = uvd*(1.0 + k*uvd*uvd);
  vec4 texture = texture2D(uMainSampler, vec2(0.5) + vec2(sin(uva), cos(uva))*uvd);

  gl_FragColor = texture;
}
`;

export default class BarrelPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private amount: number;

  constructor (game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader
    });

    this.amount = 0.3;
  }

  onBoot () {
    this.set1i('uMainSampler', 1);
  }

  onPreRender () {
    this.set1f('uBarrelFactor', this.amount);
  }

  getAmount () {
    return this.amount;
  }

  setAmount (value: number) {
    this.amount = value;
  }
}
