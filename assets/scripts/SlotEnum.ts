import { Component, _decorator } from "cc";

const { ccclass } = _decorator;

enum Direction {
  Up,
  Down,
}

@ccclass
export default class SlotEnum extends Component {
  static Direction = Direction;
}
