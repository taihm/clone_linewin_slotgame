import { _decorator, Component, EAxisDirection, Enum, instantiate, Node, Prefab, tween, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import Aux from '../SlotEnum';
import { TResultLine } from './Machine';
import { z } from 'zod';

type TResultLine = z.infer<typeof TResultLine>

@ccclass('Reel')
export default class Reel extends Component {
    @property({type: Node})
    public reelAnchor = null;

    @property({type: Enum(Aux.Direction)})
    public spinDirection = Aux.Direction.Down;

    @property({type: Node, visible: false})
    private tiles = [];

    @property({type: Prefab})
    public _tilePrefab = null;

    @property({type: Prefab})
    get tilePrefab(): Prefab {
        return this._tilePrefab;
    }

    public isFasterSpeed   = false;
    public spinSpeed       = 0.1;
    public spinStartSpeed  = 0.25;
    public spinStopSpeed   = 0.04;
    public spinEndSpeed    = 0.2;
    public slowerSpinSpeed = 0.9;
    public fasterSpinSpeed = 0.04;
    public endOfSpin       = false;
    lines = {
        '1':  [1,1,1,1,1],
        '2':  [0,0,0,0,0],
        '3':  [2,2,2,2,2],
        '4':  [1,1,0,1,1],
        '5':  [1,1,2,1,1],
        '6':  [0,0,1,0,0],
        '7':  [2,2,1,2,2],
        '8':  [0,2,0,2,0],
        '9':  [2,0,2,0,2],
        '10': [1,0,2,1,0],
        '11': [2,1,0,1,2],
        '12': [0,1,2,1,0],
        '13': [1,2,1,0,1],
        '14': [1,0,1,2,1],
        '15': [2,1,1,1,2],
        '16': [0,1,1,1,0],
        '17': [1,2,2,2,1],
        '18': [1,0,0,0,1],
        '19': [2,2,1,0,0],
        '20': [0,0,1,2,2],
    }
    indexCurrentReelStop = 0;

    set tilePrefab(newPrefab: Prefab) {
        this._tilePrefab = newPrefab;
        this.reelAnchor.removeAllChildren();
        this.tiles = [];

        if (newPrefab !== null) {
            this.createReel();
            this.shuffle();
        }
    }

    private result: Array<number> = [];
    private arrLineWin: Array<TResultLine> = [];

    public stopSpinning = false;

    createReel(): void {
        let newTile: Node;
        for (let i = 0; i < 5; i++) {
            newTile = instantiate(this.tilePrefab);
            this.reelAnchor.addChild(newTile);
            this.tiles[i] = newTile;
        }
    }

    shuffle():void {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].getComponent('Tile').setRandom();
        }
    }

    readyStop(newResult: Array<number>, linesWin: TResultLine[], indexCurrentReelStop: number): void {
        const check = this.spinDirection === Aux.Direction.Down || newResult == null;
        this.result = check ? newResult : newResult.reverse();
        this.arrLineWin = linesWin;
        this.stopSpinning = true;
        this.indexCurrentReelStop = indexCurrentReelStop;
    }

    changeCallback(element: Node = null): void {
        // console.log('change callback');
        const el = element;
        const dirModifier = this.spinDirection === Aux.Direction.Down ? -1 : 1;
        if (el.position.y * dirModifier > 288) {
            el.position = new Vec3(0, -288 * dirModifier, 0);

            let pop = null;
            let currentIndexTile = 2;
            if (this.result != null && this.result.length > 0) {
                currentIndexTile = this.result.length - 1;
                pop = this.result.pop();
            }
            
            if (pop != null && pop >= 0) {
                // console.log('set tile index = ' + pop)hâh
                el.getComponent('Tile').setTile(pop);

                // check tile can show sfx if tile is in linewin array
                this.arrLineWin.forEach(item => {
                    // console.log(this.lines[item.line])
                    // console.log(this.lines[item.line][this.indexCurrentReelStop])
                    const isIndexTileInLineWin = currentIndexTile === this.lines[item.line][this.indexCurrentReelStop]
                    if (item.win === pop && isIndexTileInLineWin) {
                        el.getComponent('Tile').showGFX(true);
                    }
                })
                // el.getComponent('Tile').showGFX(true);
            } else {
                el.getComponent('Tile').setRandom();
            }
        }
    }

    checkEndCallback(element: Node = null): void {
        // console.log('check end callback');
        const el = element;
        if (this.stopSpinning) {
            this.doStop(el);
        } else {
            this.doSpinning(el);
        }
    }

    doSpin (windUp: number): void {
        this.stopSpinning = false;

        this.reelAnchor.children.forEach(element => {
            const dirModifier = this.spinDirection === Aux.Direction.Down ? -1 : 1;

            const delay = tween(element).delay(windUp);
            const start = tween(element).by(this.spinStartSpeed, {position: new Vec3(0, 144 * dirModifier, 0)}, {easing: 'backIn'});
            const doChange = tween(element).call(() => this.changeCallback(element));
            const callSpinning = tween(element).call(() => this.doSpinning(element, 5));

            element.getComponent('Tile').showGFX(false);
            delay
            .then(start)
            .then(doChange)
            .then(callSpinning)
            .start();

        });
    }

    doSpinning(element: Node = null, times = 1):void {
        const spinningSpeed = this.isFasterSpeed ? this.fasterSpinSpeed : this.spinSpeed;
        const dirModifier = this.spinDirection === Aux.Direction.Down ? -1 : 1;

        const move = tween().by(spinningSpeed, { position: new Vec3(0, 144 * dirModifier, 0) });
        const doChange = tween().call(() => this.changeCallback(element));
        const repeat = tween(element).repeat(times, move.then(doChange));
        const checkEnd = tween().call(() => this.checkEndCallback(element));

        repeat.then(checkEnd).start();
    }

    doStop(element: Node = null):void {
        const dirModifier = this.spinDirection === Aux.Direction.Down ? -1 : 1;

        const move = tween(element).by(this.spinStopSpeed, { position: new Vec3(0, 144 * dirModifier, 0) });
        const doChange = tween().call(() => this.changeCallback(element));
        const end = tween().by(this.spinEndSpeed, { position: new Vec3(0, 144 * dirModifier, 0) }, { easing: 'bounceOut'});
        
        // console.log('end of spin' + this.endOfSpin)
        move
        .then(doChange)
        .then(move)
        .then(doChange)
        .then(end)
        .then(doChange)
        .start();
        // console.log('end of spin' + this.endOfSpin)

         //start the movement of the bird
        //  tween(this.node.position)
        //  .to(this.jumpDuration, new Vec3(this.node.position.x, this.node.position.y + this.jumpHeight, 0), {easing: "smooth",
        //      onUpdate: (target:Vec3, ratio:number) => {
        //          this.node.position = target;
        //      }
        //  })
        //  .start();
    }

    showGFX(): void{
        this.reelAnchor.children.forEach(element => {
          element.getComponent('Tile').activeGFX();
        });
      }


}