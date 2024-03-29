import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('selectLines')
export class selectLines extends Component {

    private lines = null;

    init() {
        this.lines = {
            '1':  [1,4,7,10,13],
            '2':  [0,3,6,9,12],
            '3':  [2,5,8,11,14],
            '4':  [1,4,6,10,13],
            '5':  [1,4,8,10,13],
            '6':  [0,3,7,9,12],
            '7':  [2,5,7,11,14],
            '8':  [0,5,6,11,12],
            '9':  [2,3,8,9,14],
            '10': [1,3,8,9,13],
            '11': [2,4,6,10,14],
            '12': [0,4,8,10,12],
            '13': [1,5,7,9,13],
            '14': [1,3,1,11,13],
            '15': [2,4,7,10,14],
            '16': [0,4,7,10,12],
            '17': [1,5,8,11,13],
            '18': [1,3,6,9,13],
            '19': [2,5,7,9,12],
            '20': [0,3,7,11,14]
        }

        // this.lines = {
        //     '1':  [1,1,1,1,1],
        //     '2':  [0,0,0,0,0],
        //     '3':  [2,2,2,2,2],
        //     '4':  [1,1,0,1,1],
        //     '5':  [1,1,2,1,1],
        //     '6':  [0,0,1,0,0],
        //     '7':  [2,2,1,2,2],
        //     '8':  [0,2,0,2,0],
        //     '9':  [2,0,2,0,2],
        //     '10': [1,0,2,1,0],
        //     '11': [2,1,0,1,2],
        //     '12': [0,1,2,1,0],
        //     '13': [1,2,1,0,1],
        //     '14': [1,0,1,2,1],
        //     '15': [2,1,1,1,2],
        //     '16': [0,1,1,1,0],
        //     '17': [1,2,2,2,1],
        //     '18': [1,0,0,0,1],
        //     '19': [2,2,1,0,0],
        //     '20': [0,0,1,2,2],
        // }
    }
}

