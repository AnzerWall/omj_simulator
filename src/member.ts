import { Team } from './team';
import { Game } from './game';
import { SkillBase } from './skill/skill_base';
import * as _ from 'lodash';
import { BuffBase } from './buff/buff_base';
import { feq } from './common/util';
import { BuffCountDown } from './buff/buff_count_down';
export class Member {
    team: Team = null;
    speed: number = 100;
    name: string;

    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    cri: number;
    criDM: number;
    ctrlRate: number;
    anitCtrlRate: number;
    skills: SkillBase[] = []; // 基本列表
    buffList: BuffBase[] = [];

    isLive(): boolean {
        return !feq(this.hp, 0);
    }

    constructor(name: string, // 名称
                maxHp: number, // 最大生命值
                speed: number, // 速度
                atk: number, // 攻击
                def: number, // 防御
                cri: number, // 暴击
                criDM: number, // 暴击伤害
                ctrlRate: number, // 效果命中
                anitCtrlRate: number, // 效果抵抗
    ) {
        this.name = name;
        this.maxHp = maxHp;
        this.speed = speed;
        this.atk = atk;
        this.def = def;
        this.cri = cri;
        this.criDM = criDM;
        this.ctrlRate = ctrlRate;
        this.anitCtrlRate = anitCtrlRate;
        this.hp = maxHp;
    }

    get normalAttack() {
        return this.skills[0];
    }

    get game(): Game {
        if (this.team) return this.team.game;

        return null;
    }

    addSkill(skill: SkillBase, index?: number) {
        if (index) {
            this.skills.push(skill);
            return;
        }

        this.skills[index] = skill;
    }

    addAndSetNormalAttack(skill: SkillBase) {
        this.skills[0] = skill;
    }

    addBuff(buff: BuffBase) {
        this.buffList.push(buff);
    }

    removeBuff(buff: BuffBase) {
        this.buffList = this.buffList.filter(b => b !== buff);
    }

    processBuffCountDown() {
        for (const buff of this.buffList) {
            if (buff instanceof BuffCountDown) {
                buff.countDown();
            }
        }
    }
    // tslint:disable-next-line
    haveThisTypeBuff(type: Function): boolean {
        for (const buff of this.buffList) {
            if (buff instanceof type) {
                return true;
            }
        }
        return false;
    }

    haveThisNameBuff(name: string): boolean {
        for (const buff of this.buffList) {
            if (buff.name === name) {
                return true;
            }
        }
        return false;
    }

    action(): void {
        // 通用逻辑， 使用普通攻击攻击随机地方目标

        if (!this.normalAttack) {
            console.log(`[${this.name}]: 没有普通攻击, 跳过回合`);
            return;
        }

        const availEnemies = this.team.enemy.members.filter(member => member.isLive);

        if (!availEnemies.length) {
            console.log(`[${this.name}]: 没有有效的敌方目标，跳过回合`);
            return;
        }

        this.game.actionUseSkill(this, this.normalAttack, 0, _.sample(availEnemies));
    }

}
