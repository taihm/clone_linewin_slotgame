import { _decorator, AudioClip, AudioSource, Button, CCInteger, Component, instantiate, Label, Layout, Node, Prefab, Widget } from 'cc';
const { ccclass, property } = _decorator;

import Aux from '../SlotEnum';
import { AudioMgr } from '../AudioMgr';

export type ILineWin = {
    line: number,
    win: number,
    type: number | null
}

@ccclass('Machine')
export class Machine extends Component {
    @property(Node)
    public button: Node = null;

    @property(Node)
    public buttonFast: Node = null;

    @property(Node)
    public buttonAuto: Node = null;

    @property(Node)
    public mainLine: Node = null;

    @property(Node)
    public textMoneyWin: Node = null;

    @property(Prefab)
    public _reelPrefab = null;

    @property({type: Prefab})
    get reelPrefab(): Prefab {
        return this._reelPrefab;
    }

    @property(AudioClip)
    public audioClickSpin: AudioClip = null;

    @property(AudioClip)
    public audioClick: AudioClip = null;

    @property(AudioClip)
    public audioWin: AudioClip = null;

    @property(AudioClip)
    public audioBigWin: AudioClip = null;

    audioBG: AudioSource;

    public isFasterSpeed = false;
    public moneyWin = 0;

    arrLineWin: ILineWin[] = [];

    set reelPrefab(newPrefab: Prefab) {
        this._reelPrefab = newPrefab;
        this.node.removeAllChildren();

        if (newPrefab !== null) {
            this.createMachine();
        }
    }

    @property({type: CCInteger})
    public _numberOfReels = 3;

    @property({type: CCInteger, range: [3,6], slide: true})
    get numberOfReels(): number {
        return this._numberOfReels;
    }

    set numberOfReels(newNumber: number) {
        this._numberOfReels = newNumber;

        if (this.reelPrefab !== null) {
            this.createMachine();
        }
    } 

    private reels = [];

    public spinning = false;

    private _audioManager: AudioMgr = null;

    protected onLoad(): void {
        this._audioManager = new AudioMgr();
    }

    createMachine(): void {
        this.node.destroyAllChildren();
        this.reels = [];

        let newReel: Node;
        for (let i = 0; i < this.numberOfReels; i++) {
            newReel = instantiate(this.reelPrefab);
            this.node.addChild(newReel);
            this.reels[i] = newReel;

            const reelScript = newReel.getComponent('Reel');
            // console.log('shuffle reel index: ' + i);
            reelScript.shuffle();
            reelScript.reelAnchor.getComponent(Layout).active = false;
        }

        this.node.getComponent(Widget).updateAlignment();
    }

    spin(): void {
        this.spinning = true;
        if (this.isFasterSpeed) {
            // this.buttonFast.getChildByName('Label').getComponent(Label).string = 'Stop';
        } else {
            // this.button.getChildByName('Label').getComponent(Label).string = 'Stop';
        }
        
        
        for (let i = 0; i < this.numberOfReels; i++) {
            const theReel = this.reels[i].getComponent('Reel');
            // if (i % 2) {
            //     theReel.spinDirection = Aux.Direction.Down;
            // } else {
            //     theReel.spinDirection = Aux.Direction.Up;
            // }
            theReel.isFasterSpeed = this.isFasterSpeed;
            theReel.doSpin(0.03 * i);
            
        }
    }

    lockOtherButton = () => {
        console.log('lockOtherButton')
        this.buttonAuto.getComponent(Button).interactable = false;
        if (this.isFasterSpeed) {
            this.button.getComponent(Button).interactable = false;
        } else {
            this.buttonFast.getComponent(Button).interactable = false;
        }
    }

    lock(): void {
        if (this.isFasterSpeed) {
            this.button.getComponent(Button).interactable = false;
        } else {
            this.buttonFast.getComponent(Button).interactable = false;
        }
        
        
        this.buttonAuto.getComponent(Button).interactable = false;
        // this.button.getComponent(Button).active = false;
    }

    async stop(result: any, lineWin: ILineWin[]): Promise<boolean> {
        this.arrLineWin = lineWin;
        this.moneyWin = result.win;
        const arrayCel: Array<Array<number>> = result.cel
        await setTimeout(() => {
            this.spinning = false;
            this.button.getComponent(Button).interactable = true;
            this.buttonFast.getComponent(Button).interactable = true;
            this.buttonAuto.getComponent(Button).interactable = true;
            // this.button.getChildByName('Label').getComponent(Label).string = "SPIN";
            // this.buttonFast.getChildByName('Label').getComponent(Label).string = "FAST SPIN";
            this.showGFX();
        }, 2500);

        // await Promise.all([
        //     const rngMod = Math.random() / 2;
        // for (let i = 0; i < this.numberOfReels; i++) {
        //     const spinDelay = i < 2 + rngMod ? i / 4 : rngMod * (i - 2) + i / 4;
        //     const theReel = this.reels[i].getComponent('Reel');
        //     this.stopReel(theReel, result[i], spinDelay);
        // }
        // ]);
        const rngMod = Math.random() / 2;
        for (let i = 0; i < this.numberOfReels; i++) {
            const spinDelay = i < 2 + rngMod ? i / 4 : rngMod * (i - 2) + i / 4;
            // console.log('spin delay: ' + spinDelay);
            const theReel = this.reels[i].getComponent('Reel');
            this.stopReel(theReel, arrayCel[i], spinDelay, i);
        }
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 3000);
        });
    }

    private stopReel(theReel: any, result: number[], spinDelay: number, indexReel: number): Promise<void> {
        if (result) {
            // cel[0] cel[1] cel[2] cel[3] cel[4]
            var res = result.slice();
        } else {
            res = null;
        }
        const linesWin = this.arrLineWin;
        const indexCurrentReelStop = indexReel;
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                theReel.readyStop(res, linesWin, indexCurrentReelStop);
                // console.log('after spinDelay stop reel: ' + (spinDelay * 1000));
                resolve();
            }, spinDelay * 1000);
        });
    }

    showGFX(): void {
        for (let i = 0; i < this.numberOfReels; i++) {
            this.reels[i].getComponent('Reel').showGFX();
        }
    }

    _playSFX = (clip: AudioClip) => {
        this._audioManager.playOneShot(clip);
    }

    playClick = () => {
        this._playSFX(this.audioClick);
    }

    playWin = () => {
        this._playSFX(this.audioWin);
    }

    playBigWin = () => {
        this._playSFX(this.audioBigWin);
    }

    showLinesWin = () => {
        this.arrLineWin.forEach(element => {
            if (element.line <= 10) {
                this.mainLine.children[0].getChildByName(String(element.line)).getComponent('itemLines').onEf();
            } else {
                this.mainLine.children[1].getChildByName(String(element.line)).getComponent('itemLines').onEf();
            }
        });
    }

    hideLinesWin = () => {
        for (let i = 1; i <= 20; i++) {
            if (i <= 10) {
                this.mainLine.children[0].getChildByName(String(i)).getComponent('itemLines').offEf();
            } else {
                this.mainLine.children[1].getChildByName(String(i)).getComponent('itemLines').offEf();
            }
        }
    }

    showTextMoneyWin = () => {
        this.textMoneyWin.active = true;
        // if (this.moneyWin > 0) {
        //     console.log(this.moneyWin)
        //     this.textMoneyWin.active = true;
        // }
    }
}