import Phaser from 'phaser'
import {Battle, BattleProperties, Entity, TurnProcessing} from "../../core";

export default class VisibleHero extends Phaser.GameObjects.Container{
    health: Phaser.GameObjects.Arc;
    border: Phaser.GameObjects.Ellipse;
    constructor(scene: Phaser.Scene,x: number, y: number, myData: any) {
        super(scene, x, y);

        const avatar = new Phaser.GameObjects.Sprite(scene, 0, 0, `avatar_${myData.no}`);
        // _avatar.alpha = 0.8;
        const border = this.border =  new Phaser.GameObjects.Ellipse(scene, 0, 0, 120, 120);
        border.strokeColor = Phaser.Display.Color.HexStringToColor('#fff').color32;
        border.lineWidth = 4;
        border.isStroked = true;
        const health = this.health = new Phaser.GameObjects.Arc(scene, 0, 0, 60, 269,  271, true); // 270
        // health.height = health.width = 120;
        health.fillColor =  Phaser.Display.Color.HexStringToColor('#be7428').color32; // ff9538
        health.isFilled = true;
        // health.closePath = true;

        this.addAt(avatar, 1);
        this.addAt(health, 0);
        this.addAt(border, 2);
    }
    update(myData: any, dumData: any) {

        if (myData.dead)  {
            this.health.visible =  false;
            this.alpha = 0.3;
            return;
        }
        const maxHp = myData.maxHp;
        const hp = myData.hp;
        this.health.startAngle = Math.min(270 - ((maxHp - hp) / maxHp) * 180, 270 - 1);
        this.health.endAngle = Math.max(270 + ((maxHp - hp) / maxHp) * 180, 270 + 1);


        if (myData.entityId === dumData.currentId ) {
            this.border.strokeColor = Phaser.Display.Color.HexStringToColor('#2a79ff').color32;
        } else {
            this.border.strokeColor = Phaser.Display.Color.HexStringToColor('#fff').color32;
        }
    }

}
