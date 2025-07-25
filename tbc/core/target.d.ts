import { MobType } from '/tbc/core/proto/common.js';
import { SpellSchool } from '/tbc/core/proto/common.js';
import { Target as TargetProto } from '/tbc/core/proto/common.js';
import { PresetTarget } from '/tbc/core/proto/api.js';
import { Stats } from '/tbc/core/proto_utils/stats.js';
import { Sim } from './sim.js';
import { EventID, TypedEvent } from './typed_event.js';
export declare class Target {
    readonly sim: Sim;
    private id;
    private name;
    private level;
    private mobType;
    private tankIndex;
    private stats;
    private swingSpeed;
    private minBaseDamage;
    private dualWield;
    private dualWieldPenalty;
    private canCrush;
    private suppressDodge;
    private parryHaste;
    private spellSchool;
    readonly idChangeEmitter: TypedEvent<void>;
    readonly nameChangeEmitter: TypedEvent<void>;
    readonly levelChangeEmitter: TypedEvent<void>;
    readonly mobTypeChangeEmitter: TypedEvent<void>;
    readonly propChangeEmitter: TypedEvent<void>;
    readonly statsChangeEmitter: TypedEvent<void>;
    readonly changeEmitter: TypedEvent<void>;
    constructor(sim: Sim);
    getId(): number;
    setId(eventID: EventID, newId: number): void;
    getName(): string;
    setName(eventID: EventID, newName: string): void;
    getLevel(): number;
    setLevel(eventID: EventID, newLevel: number): void;
    getMobType(): MobType;
    setMobType(eventID: EventID, newMobType: MobType): void;
    getTankIndex(): number;
    setTankIndex(eventID: EventID, newTankIndex: number): void;
    getSwingSpeed(): number;
    setSwingSpeed(eventID: EventID, newSwingSpeed: number): void;
    getMinBaseDamage(): number;
    setMinBaseDamage(eventID: EventID, newMinBaseDamage: number): void;
    getDualWield(): boolean;
    setDualWield(eventID: EventID, newDualWield: boolean): void;
    getDualWieldPenalty(): boolean;
    setDualWieldPenalty(eventID: EventID, newDualWieldPenalty: boolean): void;
    getCanCrush(): boolean;
    setCanCrush(eventID: EventID, newCanCrush: boolean): void;
    getSuppressDodge(): boolean;
    setSuppressDodge(eventID: EventID, newSuppressDodge: boolean): void;
    getParryHaste(): boolean;
    setParryHaste(eventID: EventID, newParryHaste: boolean): void;
    getSpellSchool(): SpellSchool;
    setSpellSchool(eventID: EventID, newSpellSchool: SpellSchool): void;
    getStats(): Stats;
    setStats(eventID: EventID, newStats: Stats): void;
    matchesPreset(preset: PresetTarget): boolean;
    applyPreset(eventID: EventID, preset: PresetTarget): void;
    toProto(): TargetProto;
    fromProto(eventID: EventID, proto: TargetProto): void;
    clone(eventID: EventID): Target;
    static defaultProto(): TargetProto;
    static fromDefaults(eventID: EventID, sim: Sim): Target;
}
