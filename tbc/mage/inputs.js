import { ActionId } from '/tbc/core/proto_utils/action_id.js';
import { TypedEvent } from '/tbc/core/typed_event.js';
import { Mage_Rotation_Type as RotationType, Mage_Rotation_ArcaneRotation as ArcaneRotation, Mage_Rotation_FireRotation as FireRotation, Mage_Rotation_FrostRotation as FrostRotation, Mage_Rotation_AoeRotation as AoeRotation } from '/tbc/core/proto/mage.js';
import { Mage_Rotation_FireRotation_PrimarySpell as PrimaryFireSpell } from '/tbc/core/proto/mage.js';
import { Mage_Rotation_AoeRotation_Rotation as AoeRotationSpells } from '/tbc/core/proto/mage.js';
import { Mage_Rotation_ArcaneRotation_Filler as ArcaneFiller } from '/tbc/core/proto/mage.js';
import { Mage_Options_ArmorType as ArmorType } from '/tbc/core/proto/mage.js';
import * as Presets from './presets.js';
// Configuration for spec-specific UI elements on the settings tab.
// These don't need to be in a separate file but it keeps things cleaner.
export const MageArmor = {
    id: ActionId.fromSpellId(27125),
    states: 2,
    extraCssClasses: [
        'mage-armor-picker',
    ],
    changedEvent: (player) => player.specOptionsChangeEmitter,
    getValue: (player) => player.getSpecOptions().armor == ArmorType.MageArmor,
    setValue: (eventID, player, newValue) => {
        const newOptions = player.getSpecOptions();
        newOptions.armor = newValue ? ArmorType.MageArmor : ArmorType.NoArmor;
        player.setSpecOptions(eventID, newOptions);
    },
};
export const MoltenArmor = {
    id: ActionId.fromSpellId(30482),
    states: 2,
    extraCssClasses: [
        'molten-armor-picker',
    ],
    changedEvent: (player) => player.specOptionsChangeEmitter,
    getValue: (player) => player.getSpecOptions().armor == ArmorType.MoltenArmor,
    setValue: (eventID, player, newValue) => {
        const newOptions = player.getSpecOptions();
        newOptions.armor = newValue ? ArmorType.MoltenArmor : ArmorType.NoArmor;
        player.setSpecOptions(eventID, newOptions);
    },
};
export const EvocationTicks = {
    type: 'number',
    getModObject: (simUI) => simUI.player,
    config: {
        extraCssClasses: [
            'evocation-ticks-picker',
        ],
        label: '# Evocation Ticks',
        labelTooltip: 'The number of ticks of Evocation to use, or 0 to use the full duration.',
        changedEvent: (player) => player.specOptionsChangeEmitter,
        getValue: (player) => player.getSpecOptions().evocationTicks,
        setValue: (eventID, player, newValue) => {
            const newOptions = player.getSpecOptions();
            newOptions.evocationTicks = newValue;
            player.setSpecOptions(eventID, newOptions);
        },
    },
};
export const MageRotationConfig = {
    inputs: [
        {
            type: 'enum',
            getModObject: (simUI) => simUI.player,
            config: {
                extraCssClasses: [
                    'rotation-type-enum-picker',
                ],
                label: 'Spec',
                labelTooltip: 'Switches between spec rotation settings. Will also update talents to defaults for the selected spec.',
                values: [
                    {
                        name: 'Arcane', value: RotationType.Arcane,
                    },
                    {
                        name: 'Fire', value: RotationType.Fire,
                    },
                    {
                        name: 'Frost', value: RotationType.Frost,
                    },
                ],
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => player.getRotation().type,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    newRotation.type = newValue;
                    TypedEvent.freezeAllAndDo(() => {
                        if (newRotation.type == RotationType.Arcane) {
                            player.setTalentsString(eventID, Presets.ArcaneTalents.data);
                            if (!newRotation.arcane) {
                                newRotation.arcane = ArcaneRotation.clone(Presets.DefaultArcaneRotation.arcane);
                            }
                        }
                        else if (newRotation.type == RotationType.Fire) {
                            player.setTalentsString(eventID, Presets.FireTalents.data);
                            if (!newRotation.fire) {
                                newRotation.fire = FireRotation.clone(Presets.DefaultFireRotation.fire);
                            }
                        }
                        else {
                            player.setTalentsString(eventID, Presets.DeepFrostTalents.data);
                            if (!newRotation.frost) {
                                newRotation.frost = FrostRotation.clone(Presets.DefaultFrostRotation.frost);
                            }
                        }
                        player.setRotation(eventID, newRotation);
                    });
                },
            },
        },
        // ********************************************************
        //                        AOE INPUTS
        // ********************************************************
        {
            type: 'boolean',
            cssClass: 'multi-target-rotation-picker',
            getModObject: (simUI) => simUI.player,
            config: {
                label: 'AOE Rotation',
                labelTooltip: 'Use multi-target spells.',
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => player.getRotation().multiTargetRotation,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    newRotation.multiTargetRotation = newValue;
                    player.setRotation(eventID, newRotation);
                },
            },
        },
        {
            type: 'enum',
            getModObject: (simUI) => simUI.player,
            config: {
                extraCssClasses: [
                    'aoe-rotation-picker',
                ],
                label: 'Primary Spell',
                values: [
                    {
                        name: 'Arcane Explosion', value: AoeRotationSpells.ArcaneExplosion,
                    },
                    {
                        name: 'Flamestrike', value: AoeRotationSpells.Flamestrike,
                    },
                    {
                        name: 'Blizzard', value: AoeRotationSpells.Blizzard,
                    },
                ],
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => player.getRotation().aoe?.rotation || 0,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.aoe) {
                        newRotation.aoe = AoeRotation.create();
                    }
                    newRotation.aoe.rotation = newValue;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().multiTargetRotation,
            },
        },
        // ********************************************************
        //                       FIRE INPUTS
        // ********************************************************
        {
            type: 'enum',
            getModObject: (simUI) => simUI.player,
            config: {
                extraCssClasses: [
                    'rotation-type-enum-picker',
                ],
                label: 'Primary Spell',
                values: [
                    {
                        name: 'Fireball', value: PrimaryFireSpell.Fireball,
                    },
                    {
                        name: 'Scorch', value: PrimaryFireSpell.Scorch,
                    },
                ],
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => player.getRotation().fire?.primarySpell || PrimaryFireSpell.Fireball,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.fire) {
                        newRotation.fire = FireRotation.clone(Presets.DefaultFireRotation.fire);
                    }
                    newRotation.fire.primarySpell = newValue;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().type == RotationType.Fire && !player.getRotation().multiTargetRotation,
            },
        },
        {
            type: 'boolean',
            cssClass: 'maintain-improved-scorch-picker',
            getModObject: (simUI) => simUI.player,
            config: {
                label: 'Maintain Imp. Scorch',
                labelTooltip: 'Always use Scorch when below 5 stacks, or < 5.5s remaining on debuff.',
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => player.getRotation().fire?.maintainImprovedScorch || false,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.fire) {
                        newRotation.fire = FireRotation.clone(Presets.DefaultFireRotation.fire);
                    }
                    newRotation.fire.maintainImprovedScorch = newValue;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().type == RotationType.Fire,
            },
        },
        {
            type: 'boolean',
            cssClass: 'weave-fire-blast-picker',
            getModObject: (simUI) => simUI.player,
            config: {
                label: 'Weave Fire Blast',
                labelTooltip: 'Use Fire Blast whenever its off CD.',
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => player.getRotation().fire?.weaveFireBlast || false,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.fire) {
                        newRotation.fire = FireRotation.clone(Presets.DefaultFireRotation.fire);
                    }
                    newRotation.fire.weaveFireBlast = newValue;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().type == RotationType.Fire && !player.getRotation().multiTargetRotation,
            },
        },
        // ********************************************************
        //                       FROST INPUTS
        // ********************************************************
        {
            type: 'number',
            cssClass: 'water-elemental-disobey-chance-picker',
            getModObject: (simUI) => simUI.player,
            config: {
                label: 'Water Ele Disobey %',
                labelTooltip: 'Percent of Water Elemental actions which will fail. This represents the Water Elemental moving around or standing still instead of casting.',
                changedEvent: (player) => TypedEvent.onAny([player.rotationChangeEmitter, player.talentsChangeEmitter]),
                getValue: (player) => (player.getRotation().frost?.waterElementalDisobeyChance || 0) * 100,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.frost) {
                        newRotation.frost = FrostRotation.clone(Presets.DefaultFrostRotation.frost);
                    }
                    newRotation.frost.waterElementalDisobeyChance = newValue / 100;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().type == RotationType.Frost,
                enableWhen: (player) => player.getTalents().summonWaterElemental,
            },
        },
        // ********************************************************
        //                      ARCANE INPUTS
        // ********************************************************
        {
            type: 'enum',
            getModObject: (simUI) => simUI.player,
            config: {
                extraCssClasses: [
                    'filler-enum-picker',
                ],
                label: 'Filler',
                labelTooltip: 'Spells to cast while waiting for Arcane Blast stacks to drop.',
                values: [
                    {
                        name: 'Frostbolt', value: ArcaneFiller.Frostbolt,
                    },
                    {
                        name: 'Arcane Missiles', value: ArcaneFiller.ArcaneMissiles,
                    },
                    {
                        name: 'Scorch', value: ArcaneFiller.Scorch,
                    },
                    {
                        name: 'Fireball', value: ArcaneFiller.Fireball,
                    },
                    {
                        name: 'AM + FrB', value: ArcaneFiller.ArcaneMissilesFrostbolt,
                    },
                    {
                        name: 'AM + Scorch', value: ArcaneFiller.ArcaneMissilesScorch,
                    },
                    {
                        name: 'Scorch + 2xFiB', value: ArcaneFiller.ScorchTwoFireball,
                    },
                ],
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => player.getRotation().arcane?.filler || ArcaneFiller.Frostbolt,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.arcane) {
                        newRotation.arcane = ArcaneRotation.clone(Presets.DefaultArcaneRotation.arcane);
                    }
                    newRotation.arcane.filler = newValue;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().type == RotationType.Arcane && !player.getRotation().multiTargetRotation,
            },
        },
        {
            type: 'number',
            cssClass: 'arcane-blasts-between-fillers-picker',
            getModObject: (simUI) => simUI.player,
            config: {
                label: '# ABs between Fillers',
                labelTooltip: 'Number of Arcane Blasts to cast once the stacks drop.',
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => player.getRotation().arcane?.arcaneBlastsBetweenFillers || 0,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.arcane) {
                        newRotation.arcane = ArcaneRotation.clone(Presets.DefaultArcaneRotation.arcane);
                    }
                    newRotation.arcane.arcaneBlastsBetweenFillers = newValue;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().type == RotationType.Arcane && !player.getRotation().multiTargetRotation,
            },
        },
        {
            type: 'number',
            cssClass: 'start-regen-rotation-percent-picker',
            getModObject: (simUI) => simUI.player,
            config: {
                label: 'Start regen rotation at mana %',
                labelTooltip: 'Percent of mana pool, below which the regen rotation should be used (alternate fillers and a few ABs).',
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => (player.getRotation().arcane?.startRegenRotationPercent || 0) * 100,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.arcane) {
                        newRotation.arcane = ArcaneRotation.clone(Presets.DefaultArcaneRotation.arcane);
                    }
                    newRotation.arcane.startRegenRotationPercent = newValue / 100;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().type == RotationType.Arcane && !player.getRotation().multiTargetRotation,
            },
        },
        {
            type: 'number',
            cssClass: 'stop-regen-rotation-percent-picker',
            getModObject: (simUI) => simUI.player,
            config: {
                label: 'Stop regen rotation at mana %',
                labelTooltip: 'Percent of mana pool, above which will go back to AB spam.',
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => (player.getRotation().arcane?.stopRegenRotationPercent || 0) * 100,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.arcane) {
                        newRotation.arcane = ArcaneRotation.clone(Presets.DefaultArcaneRotation.arcane);
                    }
                    newRotation.arcane.stopRegenRotationPercent = newValue / 100;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().type == RotationType.Arcane && !player.getRotation().multiTargetRotation,
            },
        },
        {
            type: 'boolean',
            cssClass: 'disable-dps-cooldowns-during-regen-picker',
            getModObject: (simUI) => simUI.player,
            config: {
                label: 'Disable DPS cooldowns during regen',
                labelTooltip: 'Prevents the usage of any DPS cooldowns during regen rotation. Mana CDs are still allowed.',
                changedEvent: (player) => player.rotationChangeEmitter,
                getValue: (player) => player.getRotation().arcane?.disableDpsCooldownsDuringRegen || false,
                setValue: (eventID, player, newValue) => {
                    const newRotation = player.getRotation();
                    if (!newRotation.arcane) {
                        newRotation.arcane = ArcaneRotation.clone(Presets.DefaultArcaneRotation.arcane);
                    }
                    newRotation.arcane.disableDpsCooldownsDuringRegen = newValue;
                    player.setRotation(eventID, newRotation);
                },
                showWhen: (player) => player.getRotation().type == RotationType.Arcane && !player.getRotation().multiTargetRotation,
            },
        },
    ],
};
//function makeBooleanMageBuffInput(id: ActionId, optionsFieldName: keyof MageOptions): IconPickerConfig<Player<any>, boolean> {
//	return {
//		id: id,
//		states: 2,
//		changedEvent: (player: Player<Spec.SpecMage>) => player.specOptionsChangeEmitter,
//		getValue: (player: Player<Spec.SpecMage>) => player.getSpecOptions()[optionsFieldName] as boolean,
//		setValue: (eventID: EventID, player: Player<Spec.SpecMage>, newValue: boolean) => {
//			const newOptions = player.getSpecOptions();
//			(newOptions[optionsFieldName] as boolean) = newValue;
//			player.setSpecOptions(eventID, newOptions);
//		},
//	}
//}
