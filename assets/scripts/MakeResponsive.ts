import { _decorator, Canvas, Component, Node, ResolutionPolicy, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MakeResponsive')
export class MakeResponsive extends Component {

    makeResponsive = () => {
        let deviceResolution = view.getViewportRect();
        let deviceResolutionHeight = screen.height;
        let deviceRatio = deviceResolution.width / deviceResolution.height;

        let canvasResolution = view.getDesignResolutionSize();
        let canvasRatio = canvasResolution.width / canvasResolution.height;
        console.log("canvasRatio: " + canvasRatio);
        if (deviceRatio > canvasRatio) {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
            console.log('FIXED_HEIGHT');
        } else {
            view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
            console.log('FIXED_WIDTH');
        }
    }
    
    onLoad() {
        this.makeResponsive();
    }
}

