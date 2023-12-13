// vec2 computeUV( vec2 uv, float k, float kcube ){
    
//   vec2 t = uv - .5;
//   float r2 = t.x * t.x + t.y * t.y;
// float f = 0.;
  
//   if( kcube == 0.0){
//       f = 1. + r2 * k;
//   }else{
//       f = 1. + r2 * ( k + kcube * sqrt( r2 ) );
//   }
  
//   vec2 nUv = f * t + .5;
//   nUv.y = 1. - nUv.y;

//   return nUv;
  
// }

// void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  
// vec2 uv = fragCoord.xy / iResolution.xy;
  
//   float k = -1.0;
//   float kcube = -1.0;
  
//   float offset = .05;
  
//   float red = texture( iChannel0, computeUV( uv, k + offset, kcube ) ).r; 
//   float green = texture( iChannel0, computeUV( uv, k, kcube ) ).g; 
//   float blue = texture( iChannel0, computeUV( uv, k - offset, kcube ) ).b; 
  
//   fragColor = vec4( red, green,blue, 1. );

// }

const fragShader = `
#define SHADER_NAME BEND_FS

precision mediump float;

uniform sampler2D uMainSampler;
uniform float uTime;
uniform float uSpeed;
uniform float uBendFactor;

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
  
    float k = -.1;
    float kcube = -.1;
    
    float offset = .01;
    
    float red = texture2D(uMainSampler, computeUV(uv, k + offset, kcube ) ).r; 
    float green = texture2D(uMainSampler, computeUV(uv, k, kcube ) ).g; 
    float blue = texture2D(uMainSampler, computeUV(uv, k - offset, kcube ) ).b; 
    
    gl_FragColor = vec4( red, green, blue, 1.);
  
  // vec2 uvRed = outTexCoord * 2.0 - 1.0;
  // uvRed *= 1.005;
  // uvRed = uvRed * 0.5 + 0.5;
  // vec4 red = texture2D(uMainSampler, uvRed);

  // vec2 uvGreen = outTexCoord * 2.0 - 1.0;
  // uvGreen *= 1.0;
  // uvGreen = uvGreen * 0.5 + 0.5;
  // vec4 green = texture2D(uMainSampler, uvGreen);

  // vec2 uvBlue = outTexCoord * 2.0 - 1.0;
  // uvBlue *= 0.995;
  // uvBlue = uvBlue * 0.5 + 0.5;
  // vec4 blue = texture2D(uMainSampler, uvBlue);

  // vec4 color = vec4(red.r, green.g, blue.b, 1.0);
  // gl_FragColor = color;
}
`;

export default class ChromaticPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
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
