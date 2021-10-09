import Battle from './battle';
import {forEach, isNil, values} from 'lodash';
import Skill, {SelectableSkill, SkillSelection} from './skill';
import {BattleProperties} from './constant';
import {TurnProcessing} from "./tasks";
import {Mana} from "./index";

let entityCounter = 0;

export type AI = (battle: Battle, turnData: TurnProcessing, mana: Mana | null, selections: SelectableSkill[]) =>  SkillSelection| null
export default class Entity {
    static no: number = 0;
    no: number;

    entityId: number;
    teamId: number; // 队伍id

    tags: string[]; // 实体标志，用于识别实体

    properties: Map<string, number>; // 基础属性，最大生命 攻击等
    hp: number; // 生命值
    name: string;
    dead: boolean;
    lv: number; // 等级
    skills: Skill[];
    rank: string;
    battleData: Map<string, string>;
    turnData: Map<string, string>;
    summonToken: boolean; // 是否是召唤物
    waitInput: boolean; // 手动单位

    constructor() {
        this.entityId = ++entityCounter;
        this.properties = new Map();
        this.teamId = -1;
        this.tags = [];
        this.hp = 1;
        this.no = 0;
        this.name = '<Unknown>';
        this.dead = false;
        this.lv = 40;
        this.skills = [];
        this.rank = 'X';
        this.battleData = new Map<string, string>();
        this.turnData = new Map<string, string>();
        this.summonToken = false;
        this.waitInput = false;

        forEach(values(BattleProperties), key => {
            this.setProperty(key, 0);
        });
        this.setProperty(BattleProperties.MAX_HP, 1);
    }

    /**
     * 获得实体存储的附加数据，详见setBattleData
     * @param {string} key
     * @return {string|null} 返回数据，对应key不存在返回null
     */
    getBattleData(key: string): string | null {
        return this.battleData.get(key) || null;
    }

    /**
     * 设置实体存储的附加数据，主要用于式神记录一些临时数据
     * @param key
     * @param value
     */
    setData(key: string, value: string | null): boolean {
        if (value === null) {
            return this.battleData.delete(key);
        }
        this.battleData.set(key, value);
        return true;
    }

    /**
     * 获得实体存储的附加数据，该数据表会在每次正式回合开始时被清空，详见setTurnData
     * @param {string} key
     * @return {string|null} 返回数据，对应key不存在返回null
     */
    getTurnData(key: string): string | null {
        return this.turnData.get(key) || null;
    }

    /**
     * 设置实体存储的附加数据，该数据表会在每次正式回合开始时被清空，主要用于式神记录一些临时数据
     * 比如记录本回合内是否有人死亡，比如犬神记录本回合有没有人砍了队友
     * @param key
     * @param value
     */
    setTurnData(key: string, value: string | null): boolean {
        if (value === null) {
            return this.turnData.delete(key);
        }
        this.turnData.set(key, value);
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
    // 同步hp到原始最大生命值
    syncHp() {
        this.hp = this.getProperty(BattleProperties.MAX_HP);
    }



    ai: AI = () =>({ no: 0, targetId: 0});


    getSkill(no: number): Skill {
        const ret = this.skills.find(s => s.no === no);
        if(!ret) throw Error('Cannot found skill, no = ' + no);
        return ret;
    }

}
