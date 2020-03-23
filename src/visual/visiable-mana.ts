import Phaser from "phaser";
import {Mana} from "../../core";

export default class VisibleMana extends Phaser.GameObjects.Container{
    mana: Mana;
    text: Phaser.GameObjects.Text;
    rects: Phaser.GameObjects. Rectangle[];
    constructor(scene: Phaser.Scene, mana: Mana) {
        super(scene);
        this.mana = mana;
        this.rects = [];

        this.text = new Phaser.GameObjects.Text(scene, 200, -8, '0', { color: '#fff' , fontSize: '20px'});
        this.add(this.text);
        for (let i = 0; i < 8; i++ ) {
            const rect = new Phaser.GameObjects. Rectangle(scene, i * 25, 0, 20, 10, Phaser.Display.Color.HexStringToColor('#fff').color32);
            this.add(rect);
            this.rects.push(rect);
        }
        this.u();
    }

    u() {
        this.text.text = String(this.mana.progress);
        for (let i = 0; i < 8; i++ ) {
            const rect = this.rects[i];
            if (i + 1 <= this.mana.num) {
                rect.isFilled = true;
                rect.isStroked = false;
                rect.fillColor = Phaser.Display.Color.HexStringToColor('#fff').color32;
            } else {
                rect.isStroked = true;
                rect.isFilled = false;
                rect.strokeColor = Phaser.Display.Color.HexStringToColor('#fff').color32;
            }

        }
    }


}