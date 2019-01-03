import { Team } from './team';
import { RoundBase } from './round/round_base';
import { RoundNormal } from './round/round_normal';
import { feq } from './common/util';
import * as _ from 'lodash';
import { SkillBase } from './skill/skill_base';
import { Member } from './member';
import { DAMAGE_TYPE_CRI, DAMAGE_TYPE_JIANJIE, DAMAGE_TYPE_NORMAL } from './common/constant';
import { BuffBase } from './buff/buff_base';
import { TurnBar } from './turn_bar';

export class Game {
     teams: Team[] = [ null, null ]; // 队伍
     event = [];
     turnBar: TurnBar = new TurnBar();

     constructor(team1: Team, team2: Team) {
        this.teams[0] = team1;
        this.teams[1] = team2;
        team1.enemy = team2;
        team2.enemy = team1;
        team1.game = this;
        team2.game = this;

        team1.members.forEach(m => { this.turnBar.addMember(m); });
        team2.members.forEach(m => { this.turnBar.addMember(m); });

     }

     actionUseSkill(source: Member, skill: SkillBase, targetType: number, target: Member) {
         if (targetType === 0) { // 单体
             console.log(`[技能结算]: ${source.name} 对 ${target.name} 使用技能(${skill.name})`);
         } else if (targetType === 1) { // 敌方全体
             console.log(`[技能结算]: ${source.name} 对 敌方全体 使用技能(${skill.name})`);
         } else if (targetType === 2) { // 我方全体
             console.log(`[技能结算]: ${source.name} 对 我全体 使用技能(${skill.name})`);
         }

         skill.action(this, source, source.team, source.team.enemy, targetType, target);

    }

     actionGiveDamage(source: Member /* 伤害来源*/, target: Member, initDamage: number, damageType: number) {
         let finalDamage = initDamage;
         const isCri = damageType & DAMAGE_TYPE_CRI;
         const FR = Math.random() * 0.02 + 0.9; // 伤害浮动，在-1% ~ + 1%
         if ((DAMAGE_TYPE_NORMAL & damageType) === 0) { // 普通伤害
             finalDamage = Math.floor(finalDamage * 300 / (target.def + 300) * FR);
         }
         target.hp = Math.max(0, target.hp - finalDamage);
         console.log(`[伤害]: ${source.name} 对 ${target.name} 造成${finalDamage}点伤害，生命值剩余${target.hp}`, isCri ? '[暴击]' : '');

     }

     actionAddBuff(source: Member, target: Member, buff: BuffBase) {
         buff.source = source;
         buff.target = target;
         target.buffList.push(buff);

         console.log(`[附加buff]: ${source.name} 对 ${target.name} 附加buff ${buff.name}`);

     }

     actionRemoveBuff(source: Member, target: Member, buff: BuffBase) {

        target.buffList = target.buffList.filter(b => b !== buff);

        console.log(`[移除buff]: ${source.name} 对 ${target.name} 移除buff ${buff.name}`);

    }

     actionTurnBarPercentRaise(source: Member, target: Member, precent: number) {
        this.turnBar.percentRaise(target, precent);
        console.log(`[拉条]: ${source.name} 对 ${target.name} 拉条 ${precent}%(当前${this.turnBar.getPosition(target)})`);

     }

     turn() {
         console.log();
         console.log(`[回合开始] 队伍1  鬼火${this.teams[0].energy.value}  鬼火格: ${this.teams[0].energy.progress}`);
         console.log(`[回合开始] 队伍2  鬼火${this.teams[1].energy.value}  鬼火格: ${this.teams[1].energy.progress}`);

         const member = this.turnBar.getNext();
         if (!member) return;
         console.log(`[回合开始] ${member.name} 的回合`);

         const round = new RoundNormal(this, member);
         round.run();
    }

     run() {
        console.log('游戏启动.');
        while (this.teams[0].members.some(member => member.hp !== 0) && this.teams[1].members.some(member => member.hp !== 0)) {
             this.turn();
         }

     }
}
