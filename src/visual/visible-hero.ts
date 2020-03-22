import Phaser from 'phaser'
type HeroData = {
    hp: number;
    shield: number;
    maxHp: number;
    isDead: boolean;
    teamId: number;
    entityId: number;
    pos: number;
    no: number;
}
export default class VisibleHero extends Phaser.GameObjects.Container{
    constructor(scene: Phaser.Scene, heroData: HeroData) {
        super(scene);
        const sp = new Phaser.GameObjects.Sprite(scene, 100 + heroData.pos  * 140, 100 + heroData.teamId * 140, `avatar_${heroData.no}`)
        this.add(sp);
        console.log(sp)
    }
}
