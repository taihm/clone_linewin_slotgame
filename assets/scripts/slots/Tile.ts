import { _decorator, Component, Node, loader, SpriteFrame, Prefab, Sprite, instantiate, resources, EffectAsset, Material } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export default class Tile extends Component {
  @property({type: [SpriteFrame], visible: true})
  private textures: SpriteFrame[] = [];

  @property(EffectAsset)
  private effect: EffectAsset = null;

  private gfx = null;
  private mat = null;

  async onLoad(): Promise<void> {
    // await this.loadTextures();
    await this.loadGFX();
    await this.loadEffect();
  }

  async resetInEditor(): Promise<void> {
    await this.loadTextures();
    await this.loadGFX();
    this.setRandom();
  }

  async loadTextures(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      resources.loadDir('gfx/SquareArrange', SpriteFrame, (err, loadedTextures: SpriteFrame[]) => {
        if (err) {
          console.error('Error loading textures:', err);
          resolve(false);
          return;
        }
        this.textures = loadedTextures;
        resolve(true);
      });
    });
  }

  async loadGFX(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resources.load('glow', Prefab, (err, loadedGFX: Prefab) => {
        if (err) {
          console.error('Error loading GFX:', err);
          resolve(false);
          return;
        }
        this.gfx = instantiate(loadedGFX);
        resolve(true);
      });
    });
  }

  setTile(index: number): void {
    this.node.getComponent(Sprite).spriteFrame = this.textures[index];
  }

  setRandom(): void {
    const randomIndex = Math.floor(Math.random() * this.textures.length);
    // console.log('random index = ' + randomIndex);
    this.setTile(randomIndex);
  }

  showGFX(option: boolean): void {
    if (option) {
      this.node.addChild(this.gfx);
      this.gfx.setPosition(0, 0);
    } else {
      this.gfx.parent = null;
      this.deactiveEffect();
    }
    this.gfx.active = false;
  }

  activeGFX(): void {
    this.gfx.active = true;
    if (!!this.gfx.parent) {
      this.activeEffect();
    } else {
      this.deactiveEffect();
    }
  }

  activeEffect(): void {
    this.mat.setProperty('_speed', 1.5);
    this.mat.setProperty('_lineWidth', 0.2);
    this.mat.setProperty('_radian', 0.52);
    this.node.getComponent(Sprite).customMaterial = this.mat;
  }

  deactiveEffect(): void {
    this.node.getComponent(Sprite).customMaterial = null;
  }

  async loadEffect(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.mat = new Material();
        this.mat.initialize({
          effectAsset: this.effect,
          technique: 1,
          defines: {
            USE_TEXTURE: true
          }
        });
        
        // this.node.getComponent(Sprite).customMaterial = mat;
  
        resolve(true);
    })
  }
}