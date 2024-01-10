const fragShader = `
#define SHADER_NAME SMOKE_TRANSITION

precision mediump float;

uniform sampler2D uMainSampler;
uniform float uTime;

varying vec2 outTexCoord;

vec3 texCol(vec2 p, float b)
{
    vec3 col = texture2D(uMainSampler, p, b).xyz; //b selects mip level
    // col *= (col.x+col.y+col.z)/3.0; //gamma
    return col;
}

vec2 perlin(vec2 p)
{
    vec2 x = vec2(0.0);
    for (int i = 0; i < 6; ++i)
    {
        float j = pow(2.0, float(i));
        x += (texture2D(uMainSampler, p * j * 0.001).xy-0.5) / j;
    }
    return x;
}

//p = uv, o = random offset for per-pixel noise variation, t = time
vec3 smoke(vec2 p, vec2 o, float t)
{
    const int steps = 10;
    vec3 col = vec3(0.0);
    for (int i = 1; i < steps; ++i)
    {
        //step along a random path that grows in size with time
        p += perlin(p + o) * t * 0.01 / float(i);
        p.y -= t * 0.0001; //drift upwards
        
        //sample colour at each point, using mipmaps for blur
        col += texCol(p, float(steps-i) * t * 0.2);
    }
    return col.xyz / float(steps);
}

void main()
{
	vec2 uv = outTexCoord.xy;
  float t = fract(uTime / 10000.0) * 6.0;
  t = max(0.0, t - uv.x - 0.5 + (uv.y + 0.5)); //start from top left
  t *= t; //start slow and get faster
	gl_FragColor = vec4(smoke(uv, outTexCoord.xy/2.0, t), 1.0);
}
`;

export default class SmokeTransition extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
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
