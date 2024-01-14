const fragShader = `
#define SHADER_NAME BEND_FS

precision mediump float;

uniform sampler2D uMainSampler;
uniform float uTime;
uniform float uSpeed;
uniform float uBendFactor;

varying vec2 outTexCoord;

void main()
{
    float height = 1.0 - outTexCoord.y;
    float offset = pow(height, 2.5);

    offset *= (sin(uTime * uSpeed) * uBendFactor);

    vec4 texture = texture2D(uMainSampler, fract(vec2(outTexCoord.x + offset, outTexCoord.y)));

    gl_FragColor = texture;
}
`;

export default class BendPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private bend: number;
  private speed: number;

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

    this.bend = 0.3;
    this.speed = 0.003;
  }

  onBoot () {
      this.set1i('uMainSampler', 1);
  }

  onPreRender () {
    this.set1f('uTime', this.game.loop.time);
    this.set1f('uSpeed', this.speed);
    this.set1f('uBendFactor', this.bend);
  }

  getBend () {
      return this.bend;
  }

  setBend (value: number) {
      this.bend = value;
  }

  getSpeed () {
    return this.speed;
  }

  setSpeed (value: number) {
      this.speed = value;
  }
}
