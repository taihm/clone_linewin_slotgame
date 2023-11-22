import { _decorator, Component, Node, tween, Vec3, instantiate, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShowMoneyWin')
export class ShowMoneyWin extends Component {

    @property(Node)
    public lblTextNode: Node;

    // protected onLoad(): void {
    //     this.move(this.node)
    // }

    showText = (moneyText: string) => {
        const defaultPosition: Vec3 = this.node.getPosition();
        let textNode = instantiate(this.lblTextNode);
        textNode.setPosition(defaultPosition);
        // this.button.getChildByName('Label').getComponent(Label).string = "SPIN";
        textNode.getComponent(Label).string = '+' + moneyText
        this.node.addChild(textNode);
        tween(textNode)
        .to(1, {
            position: new Vec3(defaultPosition.x, defaultPosition.y + 200, defaultPosition.z)
        })
        .call(() => {
            // this.lblTextNode.setPosition(defaultPosition);
            // this.lblTextNode.active = false;
            this.node.removeAllChildren();
        })
        .start();
    }
}

