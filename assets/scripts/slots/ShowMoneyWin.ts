import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShowMoneyWin')
export class ShowMoneyWin extends Component {

    @property(Node)
    public textNode: Node;

    protected onLoad(): void {
        this.move(this.node)
    }

    move = (element: Node) => {
        const defaultPosition: Vec3 = this.node.getPosition();
        tween(element)
        .to(1, {
            position: new Vec3(element.position.x, element.position.y + 200, element.position.z)
        })
        .call(() => {
            this.node.setPosition(defaultPosition);
            this.node.active = false;
        })
        .start();
    }
}

