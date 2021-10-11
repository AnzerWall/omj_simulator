import {EntityConfig} from "@/entity";

function createNormal(): EntityConfig {
    return {
        name: '123',
        properties: {
            attack: 3500,
            defense: 300,
            speed: 115,
            maxHp: 8000,
        },
        skills: [{
            name: 'normal-attack',
            config: {
                rate: 1.2,
                count: 1
            }
        }],
        decisionFunction: 'selectNormalAttack',
    }
}
export const Templates: Record<string, () => EntityConfig> = {
    normal: createNormal
}
export function getTemplate(name: string, config: Record<string, any> = {}): EntityConfig | undefined {
    return Templates[name]()
}
