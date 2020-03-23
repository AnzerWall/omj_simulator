import Phaser from 'phaser'
import {Battle, BattleProperties, Entity, TurnProcessing} from "../../core";

export default class VisibleHero extends Phaser.GameObjects.Container{
    health: Phaser.GameObjects.Arc;
    border: Phaser.GameObjects.Ellipse;
    entity: Entity;
    battle: Battle;
    constructor(scene: Phaser.Scene,x: number, y: number, entity: Entity, battle: Battle) {
        super(scene, x, y);
        this.entity = entity;
        this.battle = battle;

        const avatar = new Phaser.GameObjects.Sprite(scene, 0, 0, `avatar_${entity.no}`);
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
    u() {
        const battle = this.battle;
        const entity = this.entity;

        if (entity.dead)  {
            this.health.visible =  false;
            this.alpha = 0.3;
            return;
        }
        const maxHp = battle.getComputedProperty(entity.entityId, BattleProperties.MAX_HP);
        const hp = entity.hp;
        this.health.startAngle = Math.min(270 - ((maxHp - hp) / maxHp) * 180, 270 - 1);
        this.health.endAngle = Math.max(270 + ((maxHp - hp) / maxHp) * 180, 270 + 1);

        let t = battle.currentTask;
        while (t.parent) {
            if (t.type === 'Turn') break;
            t = t.parent;
        }

        if (t.type === 'Turn' && (t.data as TurnProcessing).currentId === entity.entityId ) {
            this.border.strokeColor = Phaser.Display.Color.HexStringToColor('#2a79ff').color32;
        } else {
            this.border.strokeColor = Phaser.Display.Color.HexStringToColor('#fff').color32;
        }
    }

}
