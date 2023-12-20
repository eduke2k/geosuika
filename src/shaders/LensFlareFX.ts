const s1 = `
  precision mediump float;

  uniform float time;
  uniform vec2 resolution;
  uniform sampler2D iChannel0;
  uniform float uCenterX;
  uniform float uCenterY;
  uniform float uStrength;

  varying vec2 fragCoord;

  #define iResolution resolution

  const vec3 suncolor = vec3(1.0,1.0,1.0);
  const float c2 = 250.0;

  float getSun(vec2 uv){
    return length(uv) < 0.009 ? 1.0 : 0.0;
  }

  vec3 lensflares(vec2 uv, vec2 pos, out vec3 sunflare, out vec3 lensflare) {
    vec2 main = uv-pos;
    vec2 uvd = uv*(length(uv));
  
    float ang = atan(main.y, main.x);
    float dist = length(main);
      dist = pow(dist, 0.1);
  
    float f0 = 1.0/(length(uv-pos)*25.0+1.0);
    f0 = pow(f0, 2.0);
  
    f0 = f0+f0*(sin((ang+1.0/18.0)*12.0)*.1+dist*.1+.8);
    f0*=uStrength;
  
    float f2 = max(1.0/(1.0+32.0*pow(length(uvd+0.8*pos),2.0)),.0)*00.25*uStrength;
    float f22 = max(1.0/(1.0+32.0*pow(length(uvd+0.85*pos),2.0)),.0)*00.23*uStrength;
    float f23 = max(1.0/(1.0+32.0*pow(length(uvd+0.9*pos),2.0)),.0)*00.21*uStrength;
  
    vec2 uvx = mix(uv,uvd,-0.5);
  
    float f4 = max(0.01-pow(length(uvx+0.4*pos),2.4),.0)*6.0*uStrength;
    float f42 = max(0.01-pow(length(uvx+0.45*pos),2.4),.0)*5.0*uStrength;
    float f43 = max(0.01-pow(length(uvx+0.5*pos),2.4),.0)*3.0*uStrength;
  
    uvx = mix(uv,uvd,-.4);
  
    float f5 = max(0.01-pow(length(uvx+0.2*pos),5.5),.0)*2.0*uStrength;
    float f52 = max(0.01-pow(length(uvx+0.4*pos),5.5),.0)*2.0*uStrength;
    float f53 = max(0.01-pow(length(uvx+0.6*pos),5.5),.0)*2.0*uStrength;
  
    uvx = mix(uv,uvd,-0.5);
  
    float f6 = max(0.01-pow(length(uvx-0.3*pos),1.6),.0)*6.0*uStrength;
    float f62 = max(0.01-pow(length(uvx-0.325*pos),1.6),.0)*3.0*uStrength;
    float f63 = max(0.01-pow(length(uvx-0.35*pos),1.6),.0)*5.0*uStrength;
  
    sunflare = vec3(f0);
    lensflare = vec3(f2+f4+f5+f6, f22+f42+f52+f62, f23+f43+f53+f63);
    return sunflare+lensflare;
  }
  
  vec3 anflares(vec2 uv, float threshold, float intensity, float stretch, float brightness) {
    threshold = 1.0 - threshold;
  
    vec3 hdr = vec3(getSun(uv));
    hdr = vec3(floor(threshold+pow(hdr.r, 1.0)));
  
    float d = intensity;
    float c = intensity*stretch;
  
    for (float i=c2; i>-1.0; i--){
      float texL = getSun(uv+vec2(i/d, 0.0));
      float texR = getSun(uv-vec2(i/d, 0.0));
      hdr += floor(threshold+pow(max(texL,texR), 4.0))*(1.0-i/c);
    }
    
    return hdr*brightness*uStrength;
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy - 0.5;
    vec2 center = vec2(uCenterX, uCenterY) - 0.5;

    uv.x *= iResolution.x/iResolution.y;
    center.x *= iResolution.x/iResolution.y;

    vec3 col;
    vec3 sun, sunflare, lensflare;
    vec3 flare = lensflares(uv * 1.5, center * 1.5, sunflare, lensflare);
    vec3 anflare = pow(anflares(uv-center, 0.5, 400.0, 0.9, 0.1), vec3(4.0));
    sun += getSun(uv-center) + (flare + anflare) * suncolor * 2.0;
    col += sun;
    // col = pow(col, vec3(1.0 / 2.2));

    fragColor = vec4(col, 1.0);
  }

  void main(void) {
    mainImage(gl_FragColor, fragCoord.xy);
  }
`;

const s2 = `
precision mediump float;

uniform vec2 resolution;
uniform sampler2D iChannel0;

varying vec2 fragCoord;

vec4 texture(sampler2D s, vec2 c) {
  return texture2D(s,c);
}

vec4 texture(sampler2D s, vec2 c, float b) {
  return texture2D(s,c,b);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / resolution.xy;
  fragColor = texture(iChannel0,uv);
}

void main(void) {
  mainImage(gl_FragColor, fragCoord.xy);
}`;

export default class LensFlareFX {
  private scene: Phaser.Scene;
  private shader1: Phaser.GameObjects.Shader;
  private center: { x: number, y: number } = {
    x: 0,
    y: 0
  };

  constructor (scene: Phaser.Scene, renderWidth: number, renderHeight: number) {
    this.scene = scene;
  
    const baseShader1 = new Phaser.Display.BaseShader('BufferA', s1, undefined, {
      uCenterX: { key: 'uCenterX', type: '1f', value: 0.0 },
      uCenterY: { key: 'uCenterY', type: '1f', value: 0.0 },
      uStrength: { key: 'uStrength', type: '1f', value: 1.0 }
    });
    this.shader1 = scene.add.shader(baseShader1, 0, 0, renderWidth, renderHeight);
    this.shader1.setRenderToTexture('lensFlareFX1');

    const baseShader2 = new Phaser.Display.BaseShader('BufferB', s2);
    const shader2 = scene.add.shader(baseShader2, 0, 0, renderWidth, renderHeight);
    shader2.setRenderToTexture('lensFlareFX2');

    this.shader1.setSampler2D('iChannel0', 'lensFlareFX2');
    shader2.setSampler2D('iChannel0', 'lensFlareFX1');
  }

  public createShaderImage (): Phaser.GameObjects.Image {
    return this.scene.add.image(0, 0, 'lensFlareFX2').setOrigin(0, 0).setDisplaySize(this.scene.game.canvas.width, this.scene.game.canvas.height).setBlendMode(Phaser.BlendModes.ADD);
  }

  setStrength (strength: number): void {
    this.shader1.setUniform('uStrength.value', strength);
  }

  getCenter (): { x: number; y: number } {
    return this.center;
  }

  setCenter (x: number, y: number) {
    this.center = { x, y };
    this.shader1.setUniform('uCenterX.value', x);
    this.shader1.setUniform('uCenterY.value', 1 - y);
  }
}
