import { Spec } from '/tbc/core/proto/common.js';
import { Player } from '/tbc/core/player.js';
import { TalentsConfig, TalentsPicker } from './talents_picker.js';
export declare class HunterTalentsPicker extends TalentsPicker<Spec.SpecHunter> {
    constructor(parent: HTMLElement, player: Player<Spec.SpecHunter>);
}
export declare const hunterTalentsConfig: TalentsConfig<Spec.SpecHunter>;
