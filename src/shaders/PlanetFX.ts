const s1 = `
  precision mediump float;

  uniform float time;
  uniform vec2 resolution;
  uniform sampler2D iChannel0;
  uniform sampler2D iChannel1;
  uniform sampler2D iChannel2;
  uniform float uPlanetSize;

  varying vec2 fragCoord;
  #define iResolution resolution
  #define iTime time

  // rendering params
  const float dist=.27; // distance for glow and distortion
  const float perturb=.6; // distortion amount of the flow around the planet
  const float displacement=.005; // hot air effect
  const float windspeed=.2; // speed of wind flow
  const float steps=110.; // number of steps for the volumetric rendering
  const float stepsize=.025; 
  const float brightness=.43;
  const vec3 planetcolor=vec3(1.,.5,.7);
  const float fade=.01; // fade by distance
  const float glow=16.; // glow amount, mainly on hit side
  const float earthAmbientLight=0.1;

  // fractal params
  const int iterations=12; 
  const float fractparam=.7;
  const vec3 offset=vec3(1.5,2.,-1.5);

  float wind(vec3 p) {
    float d=max(0.,dist-max(0.,length(p)-uPlanetSize)/uPlanetSize)/dist; // for distortion and glow area
    float x=max(0.2,p.x*2.); // to increase glow on left side
    p.y*=1.+max(0.,-p.x-uPlanetSize*.25)*1.5; // left side distortion (cheesy)
    p-=d*normalize(p)*perturb; // spheric distortion of flow
    p+=vec3(iTime*windspeed,0.,0.); // flow movement
    p=abs(fract((p+offset)*.1)-.5); // tile folding 
    for (int i=0; i<iterations; i++) {  
      p=abs(p)/dot(p,p)-fractparam; // the magic formula for the hot flow
    }
    return length(p)*(1.+d*glow*x)+d*glow*x; // return the result with glow applied
  }

  void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    // get ray dir	
    vec2 uv = fragCoord.xy / iResolution.xy - .5;
    vec3 dir = vec3(uv.x, uv.y, 1.);
    dir.x *= iResolution.x / iResolution.y;
    vec3 from = vec3(0., 0., -2. + texture2D(iChannel1, uv * .5 + iTime).x * stepsize); //from + dither
  
    // volumetric rendering
    float v=0., l=-0.0001, t=iTime*windspeed*.2;

    for (float r=10.;r<steps;r++) {
      vec3 p = from + r * dir * stepsize;
      float tx=texture2D(iChannel1,uv*.2+vec2(t,0.)).x*displacement; // hot air effect

      if (length(p)-uPlanetSize-tx>0.)
      // outside planet, accumulate values as ray goes, applying distance fading
        v+=min(50.,wind(p))*max(0.,1.-r*fade);
      else if (l<0.) 
      //inside planet, get planet shading if not already 
      //loop continues because of previous problems with breaks and not always optimizes much
        l=pow(max(earthAmbientLight, dot(normalize(p), normalize(vec3(-1., 0., 0)))), 8.)
        * (.5 + texture2D(iChannel2, 0.5 + (uv) * vec2(1.2,1.2) * (1. + p.z * .5) + vec2(tx + t * .5, 0.)).x * 2.);
      }
    v/=steps; v*=brightness; // average values and apply bright factor
    vec3 col = vec3(v*v,v*v*v*v,v*v*v*v) + l * planetcolor; // set color
    col*=1.-length(pow(abs(uv),vec2(5.)))*14.; // vignette (kind of)
    fragColor = vec4(col,1.0);
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

export default class PlanetFX {
  private scene: Phaser.Scene;
  private planetSize: number;
  private shader1: Phaser.GameObjects.Shader;

  constructor (scene: Phaser.Scene, planetSize: number, renderWidth: number, renderHeight: number) {
    this.scene = scene;
    
    this.planetSize = planetSize;
    const baseShader1 = new Phaser.Display.BaseShader('BufferA', s1, undefined, {
      uPlanetSize: { key: 'uPlanetSize', type: '1f', value: 0.3 }
    });

    this.shader1 = scene.add.shader(baseShader1, 0, 0, renderWidth, renderHeight);
    this.shader1.setRenderToTexture('planetFX1');
    this.setPlanetSize(this.planetSize);

    const baseShader2 = new Phaser.Display.BaseShader('BufferB', s2);
    const shader2 = scene.add.shader(baseShader2, 0, 0, renderWidth, renderHeight);
    shader2.setRenderToTexture('planetFX2');

    this.shader1.setSampler2D('iChannel0', 'planetFX2');
    this.shader1.setSampler2D('iChannel1', 'texture:noise');
    this.shader1.setSampler2D('iChannel2', 'texture:earth');
    shader2.setSampler2D('iChannel0', 'planetFX1');
  }

  public createShaderImage (): Phaser.GameObjects.Image {
    return this.scene.add.image(0, 0, 'planetFX2').setBlendMode(Phaser.BlendModes.ADD);
  }

  public setPlanetSize (size: number): void {
    this.shader1.setUniform('uPlanetSize.value', size);
    this.planetSize = size;
  }

  public getPlanetSize (): number {
    return this.planetSize;
  }
}
