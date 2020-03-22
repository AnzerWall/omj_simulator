import Phaser from 'phaser'
type HeroData = {
    hp: number;
    shield: number;
    maxHp: number;
    isDead: boolean;
    teamId: number;
    entityId: number;
    no: number;
}
export default class VisibleHero extends Phaser.GameObjects.Container{
    health: Phaser.GameObjects.Arc;
    constructor(scene: Phaser.Scene,x: number, y: number, heroData: HeroData) {
        super(scene, x, y);
        this.setDataEnabled();
        this.setData('heroData', heroData);
        const _avatar = new Phaser.GameObjects.Sprite(scene, 0, 0, `avatar_${heroData.no}`);
        // _avatar.alpha = 0.8;
        const _border = new Phaser.GameObjects.Ellipse(scene, 0, 0, 120, 120);
        _border.strokeColor = Phaser.Display.Color.HexStringToColor('#fff').color32;
        _border.lineWidth = 2;
        _border.isStroked = true;
        const _health = this.health = new Phaser.GameObjects.Arc(scene, 0, 0, 60, 269,  271, true); // 270
        // health.height = health.width = 120;
        _health.fillColor =  Phaser.Display.Color.HexStringToColor('#be7428').color32; // ff9538
        _health.isFilled = true;
        // health.closePath = true;

        this.addAt(_avatar, 1);
        this.addAt(_health, 0);
        this.addAt(_border, 2);
    }

    updateData(heroData: HeroData): void {
        if (heroData.isDead)  {
            this.health.visible =  false;
            this.alpha = 0.3;
            return;
        }
        this.health.startAngle = Math.min(270 - ((heroData.maxHp - heroData.hp) / heroData.maxHp) * 180, 270 - 1);
        this.health.endAngle = Math.max(270 + ((heroData.maxHp - heroData.hp) / heroData.maxHp) * 180, 270 + 1)
    }
}
