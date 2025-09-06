import { Spec } from '/tbc/core/proto/common.js';
import { Player } from '/tbc/core/player.js';
import { IndividualSimUI } from '/tbc/core/individual_sim_ui.js';
import { EventID, TypedEvent } from '/tbc/core/typed_event.js';
import { Rogue_Rotation_Builder as Builder } from '/tbc/core/proto/rogue.js';
export declare const RogueRotationConfig: {
    inputs: ({
        type: "enum";
        cssClass: string;
        getModObject: (simUI: IndividualSimUI<any>) => Player<any>;
        config: {
            label: string;
            values: ({
                name: string;
                value: Builder;
                tooltip: string;
            } | {
                name: string;
                value: Builder;
                tooltip?: undefined;
            })[];
            changedEvent: (player: Player<Spec.SpecRogue>) => TypedEvent<void>;
            getValue: (player: Player<Spec.SpecRogue>) => Builder;
            setValue: (eventID: EventID, player: Player<Spec.SpecRogue>, newValue: number) => void;
            labelTooltip?: undefined;
            enableWhen?: undefined;
        };
    } | {
        type: "boolean";
        cssClass: string;
        getModObject: (simUI: IndividualSimUI<any>) => Player<any>;
        config: {
            label: string;
            labelTooltip: string;
            changedEvent: (player: Player<Spec.SpecRogue>) => TypedEvent<void>;
            getValue: (player: Player<Spec.SpecRogue>) => boolean;
            setValue: (eventID: EventID, player: Player<Spec.SpecRogue>, newValue: boolean) => void;
            values?: undefined;
            enableWhen?: undefined;
        };
    } | {
        type: "boolean";
        cssClass: string;
        getModObject: (simUI: IndividualSimUI<any>) => Player<any>;
        config: {
            label: string;
            labelTooltip: string;
            changedEvent: (player: Player<Spec.SpecRogue>) => TypedEvent<void>;
            getValue: (player: Player<Spec.SpecRogue>) => boolean;
            setValue: (eventID: EventID, player: Player<Spec.SpecRogue>, newValue: boolean) => void;
            enableWhen: (player: Player<Spec.SpecRogue>) => boolean;
            values?: undefined;
        };
    } | {
        type: "number";
        cssClass: string;
        getModObject: (simUI: IndividualSimUI<any>) => Player<any>;
        config: {
            label: string;
            labelTooltip: string;
            changedEvent: (player: Player<Spec.SpecRogue>) => TypedEvent<void>;
            getValue: (player: Player<Spec.SpecRogue>) => number;
            setValue: (eventID: EventID, player: Player<Spec.SpecRogue>, newValue: number) => void;
            values?: undefined;
            enableWhen?: undefined;
        };
    })[];
};
