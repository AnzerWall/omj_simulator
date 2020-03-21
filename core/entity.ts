import Game from './game';
import Buff from './buff';

import {filter, find, forEach, isNil, values} from 'lodash';
import Skill from './skill';
import {BattleProperties, BuffParams, Control} from './constant';
import TurnData from './turn-data';

let entityCounter = 0;
export default class Entity {
    static no: number = 0;
    no: number;

    entityId: number;
    teamId: number; // 队伍id

    tags: string[]; // 实体标志，用于识别实体

    properties: Map<string, number>; // 基础属性，最大生命 攻击等
    buffs: Buff[]; // 附加效果，影响基础属性
    hp: number; // 生命值
    name: string;
    dead: boolean;
    lv: number; // 等级
    skills: Skill[];
    rank: string;
    keyValueTable: Map<string, string>;

    constructor() {
        this.entityId = ++entityCounter;
        this.properties = new Map();
        this.buffs = [];
        this.teamId = -1;
        this.tags = [];
        this.hp = 1;
        this.no = 0;
        this.name = '<Unknown>';
        this.dead = false;
        this.lv = 40;
        this.skills = [];
        this.rank = 'X';
        this.keyValueTable = new Map<string, string>();

        forEach(values(BattleProperties), key => {
            this.setProperty(key, 0);
        });
        this.setProperty(BattleProperties.MAX_HP, 1);
    }

    /**
     * 获得实体存储的附加数据，详见setData
     * @param {string} key
     * @return {string|null} 返回数据，对应key不存在返回null
     */
    getData(key: string): string | null {
        return this.keyValueTable.get(key) || null;
    }

    /**
     * 设置实体存储的附加数据，主要用于式神记录一些临时数据
     * 比如记录本回合内是否有人死亡，比如犬神记录本回合有没有人砍了队友
     * @param key
     * @param value
     */
    setData(key: string, value: string | null): boolean {
        if (value === null) {
            return this.keyValueTable.delete(key);
        }
        this.keyValueTable.set(key, value);
        return true;
    }

    addSkill(skill: Skill) {
        this.skills.push(skill);
    }

    addTags(tag: string) {
        if (!this.hasTag(tag)) {
            this.tags.push(tag);
        }
    }

    removeTags(tag: string) {
        const index = this.tags.indexOf(tag);

        if (index !== -1) {
            this.tags.splice(index, 1);
        }
    }

    hasTag(tag: string): boolean {
        return this.tags.includes(tag);
    }

    addBuff(buff: Buff) {
        this.buffs.push(buff);
    }

    removeBuff(buff: Buff) {
        const index = this.buffs.indexOf(buff);

        if (index !== -1) {
            this.buffs.splice(index, 1);
        }
    }

    getProperty(name: string): number {
        const origin = this.properties.get(name);

        if (isNil(origin)) return 0;
        return origin;
    }


    hasProperty(name: string): boolean {
        return this.properties.has(name);
    }

    setProperty(name: string, value = 0) {
        this.properties.set(name, value);
    }

    setTeam(teamId: number) {
        this.teamId = teamId;
    }

    setName(name: string) {
        this.name = name;
    }

    filterBuff(name: string): Buff[] {
        return filter(this.buffs, buff => buff.name === name);
    }

    hasBuff(buf: Buff): boolean {
        return !!find(this.buffs, buff => buff === buf);
    }

    hasBuffNamed(name: string): boolean {
        return !!find(this.buffs, buff => buff.name === name);
    }
    getBuffNamed(name: string): Buff | null {
        return find(this.buffs, buff => buff.name === name) || null;
    }

    ai: (game: Game, turnData: TurnData) => boolean = () => true;

    /**
     * 是否处于无法动作状态
     */
    cannotAction(): boolean {
        return this.buffs.some(buff => {
            return buff.control === Control.FROZEN ||
                buff.control === Control.SLEEP ||
                buff.control === Control.DIZZY ||
                buff.control === Control.POLYMORPH;
        });
    }

    /**
     * 是否被控制
     */
    beControlled(): boolean {
        return this.buffs.some(buff => {
            return buff.control !== Control.NONE;
        });
    }

    /**
     * 是否被指定控制类型控制
     * @param controls
     */
    beControlledBy(...controls: Control[]): boolean {
        return this.buffs.some(buff => {
            if (!buff.hasParam(BuffParams.CONTROL) || !buff.control) return false;
            return controls.includes(buff.control);
        });
    }

    filterControlByType(...controls: Control[]): Buff[] {
        return this.buffs.filter(buff => {
            if (!buff.hasParam(BuffParams.CONTROL) || !buff.control) return false;
            return controls.includes(buff.control);
        });

    }


    getSkill(no: number): Skill {
        const ret = this.skills.find(s => s.no === no);
        if(!ret) throw Error('Cannot found skill, no = ' + no);
        return ret;
    }

}
