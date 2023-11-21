import { _decorator, Component, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('itemLines')
export class itemLines extends Component {

    protected onEnable(): void {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onHover, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.offHover, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.MOUSE_ENTER, this.onHover, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.offHover, this);
    }

    onHover() {
        this.node.children[0].active = true;
    }

    offHover() {
        this.node.children[0].active = false;
    }

    onEf() {
        this.onHover();
        this.node.pauseSystemEvents(true);
    }

    offEf() {
        this.offHover();
        this.node.pauseSystemEvents(false);
    }
}

