import { _decorator, Component, Node, loader, SpriteFrame, Prefab, Sprite, instantiate, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export default class Tile extends Component {
  @property({type: [SpriteFrame], visible: true})
  private textures: SpriteFrame[] = [];

  private gfx = null;

  async onLoad(): Promise<void> {
    // await this.loadTextures();
    await this.loadGFX();
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
    }
    this.gfx.active = false;
  }

  activeGFX(): void {
    this.gfx.active = true;
  }
}