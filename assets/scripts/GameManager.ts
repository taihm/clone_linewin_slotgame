import { _decorator, AudioClip, CCInteger, Component, math, Node, Vec2 } from 'cc';
import { AudioMgr } from './AudioMgr';
import { z } from 'zod';
import { DataBet, DataClient, TResult } from './slots/Machine';
const { ccclass, property } = _decorator;

const TRequest = z.object({
    data: DataBet,
    client: DataClient
  })
type TRequest = z.infer<typeof TRequest>
  
const TResponse = z.object({
data: z.object({
    SlotGame: z.object({
    status: z.number(),
    result: z.nullable(TResult),
    message: z.string()
    })
})
})
type TResponse = z.infer<typeof TResponse>

type TResult = z.infer<typeof TResult>

@ccclass('GameManager')
export class GameManager extends Component {

    @property(WebSocket)
    webSocket: WebSocket = null;

    @property(Node)
    machine = null;

    @property(Node)
    bigWin = null;

    @property(CCInteger)
    tileCount = 30;

    @property(Vec2)
    machineSize: Vec2 = new Vec2(3, 5);

    @property(AudioClip)
    public musicBG: AudioClip = null;

    private block = false;

    private result = null;

    private lineWin = [];

    private probability = [50, 33, 10, 7];

    private isSpeed = false;

    private isAuto = false;

    private isBigWin = false;

    private equalLines = [];

    private _audiOManager: AudioMgr = null;

    protected onLoad(): void {
        this._audiOManager = new AudioMgr();
        this.connect();
    }

    start() {
        this.machine.getComponent('Machine').createMachine();

        this._audiOManager.play(this.musicBG);
    }

    update(deltaTime: number) {
        if (this.block && this.result != null) {
            this.informStop();
            this.result = null;
        }
    }

    connect = () => {
        // this.webSocket = new WebSocket("wss://game.hmtai.net/client");
        this.webSocket = new WebSocket("ws://localhost:8080/client");
        // this.webSocket = new WebSocket("ws://bunserver.hmtai.net/client");

        this.webSocket.onopen = () => {
            console.log('on open web socket');
        }

        this.webSocket.onmessage = (message) => {
            // let data = message.data;
            let data: TResponse = this._decodeMessage(message.data);
            this.onData(data);
        }

        this.webSocket.onclose = (event) => {
            this._onSocketDisconnect(event);
            // this.webSocket.close();
        }

        this.webSocket.onerror = (error) => {
            console.log(error);
        }
	}

    reconnect = () => {
        console.log('reconnect socket')
		this.connect();
	}

    _onSocketDisconnect = (event) => {
        console.log('Ngat ket noi may chu')
        console.log('Socket disconnect', JSON.stringify(event))
        this.reconnect();
    }


    /**
     * Sends a message through the WebSocket connection.
     * 
     * @param message - The message to be sent.
     */
    send = (message) => {
		try {
			if (this.webSocket && this.webSocket.readyState === 1) {
				this.webSocket.send(this._encodeMessage(message));
			} else {
				console.log("connect send message");
			}
		} catch(err) {
			console.log("Khong the ket noi toi may chu");
		}
	}

    _decodeMessage = (message) => {
		return JSON.parse(message)
	}
	_encodeMessage = (message) => {
		return JSON.stringify(message)
	}

    onData = (dataFetch: TResponse) => {
        let message = ''
        if (!!dataFetch) {
            if (void 0 !== dataFetch.data.SlotGame.status) {
                if (dataFetch.data.SlotGame.status === 1) {
                    this.result = dataFetch.data.SlotGame.result;
                    this.lineWin = dataFetch.data.SlotGame.result.sieuxe.line_win;
                    this.isBigWin = dataFetch.data.SlotGame.result.sieuxe.isBigWin;
                    message = dataFetch.data.SlotGame.message;
                } else {
                    message = dataFetch.data.SlotGame.message
                    console.error(message);
                }
            } else {
                console.error('error status undefied');
            }
        } else {
            console.error('error data SlotGame not found');
        }
    }

    sendRequestResult = () => {
        let request: TRequest = {
            "data": {
                "status": 1,
                "cuoc": 100,
                "line": [1,2,3,4,5,6,7,8,9,10]
            },
            "client": {
                "profile": {
                    "name": "tai111",
                    "amount": 100000
                },
                "SieuXe" : {
                    "id": "kjahsd9871298371298u3",
                    "bet": 100,
                    "bonus": null,
                    "bonusX": 0,
                    "bonusL": 0,
                    "bonusWin": 0,
                    "free": 0,
                    "lastBet": 100
                }
            }
        }

        this.send(request);
    }

    click(): void {
        if (this.machine.getComponent('Machine').spinning === false) {
            this.block = false;
            this.machine.getComponent('Machine').isFasterSpeed = false;
            this.machine.getComponent('Machine').spin();
            this.machine.getComponent('Machine').hideLinesWin();
            this.sendRequestResult();
            setTimeout(() => {
                this.block = true;
                this.machine.getComponent('Machine').lock();
            }, 1200);
        } 
        // else if (!this.block) {
        //     this.block = true;
        //     this.machine.getComponent('Machine').lock();
        // }
        this.machine.getComponent('Machine').playClick();
    }

    clickFastSpin(): void {
        if (this.machine.getComponent('Machine').spinning === false) {
            this.block = false;
            this.machine.getComponent('Machine').isFasterSpeed = true;
            this.machine.getComponent('Machine').spin();
            this.machine.getComponent('Machine').lockOtherButton();
            this.sendRequestResult();
            setTimeout(() => {
                this.block = true;
                this.machine.getComponent('Machine').lock();
            }, 1200);
        }
        this.machine.getComponent('Machine').playClick();
    }

    clickAutoSpin(): void {
        if (this.machine.getComponent('Machine').spinning === false) {
            this.block = false;
            this.machine.getComponent('Machine').isFasterSpeed = false;
            this.machine.getComponent('Machine').spin();
            this.machine.getComponent('Machine').hideLinesWin();
            this.sendRequestResult();
            setTimeout(() => {
                this.block = true;
                this.machine.getComponent('Machine').lock();
            }, 1200);
        }
    }

    async informStop(): Promise<void> {
        let resultRelayed = this.result;
        let lineWinResult = this.lineWin;
        let isEndSpin = await this.machine.getComponent('Machine').stop(resultRelayed, lineWinResult);
        if (isEndSpin) {
            if (lineWinResult.length > 0) {
                // show line win, text money win
                this.machine.getComponent('Machine').showLinesWin();
                this.machine.getComponent('Machine').showTextMoneyWin();
            }
            if (this.isBigWin) {
                this.bigWin.active = true;
                this.machine.getComponent('Machine').playBigWin();
                setTimeout(() => {
                    this.bigWin.active = false;
                }, 3000);
            } else if (this.equalLines.length >= 1) {
                this.machine.getComponent('Machine').playWin();
            }
            this.isBigWin = false;
        }
    }
}