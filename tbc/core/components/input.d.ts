import { EventID, TypedEvent } from '/tbc/core/typed_event.js';
import { Component } from './component.js';
/**
 * Data for creating a new input UI element.
 */
export interface InputConfig<ModObject, T> {
    label?: string;
    labelTooltip?: string;
    extraCssClasses?: Array<string>;
    defaultValue?: T;
    changedEvent: (obj: ModObject) => TypedEvent<any>;
    getValue: (obj: ModObject) => T;
    setValue: (eventID: EventID, obj: ModObject, newValue: T) => void;
    enableWhen?: (obj: ModObject) => boolean;
    showWhen?: (obj: ModObject) => boolean;
    rootElem?: HTMLElement;
}
export declare abstract class Input<ModObject, T> extends Component {
    private readonly inputConfig;
    readonly modObject: ModObject;
    readonly changeEmitter: TypedEvent<void>;
    constructor(parent: HTMLElement, cssClass: string, modObject: ModObject, config: InputConfig<ModObject, T>);
    private update;
    init(): void;
    abstract getInputElem(): HTMLElement;
    abstract getInputValue(): T;
    abstract setInputValue(newValue: T): void;
    inputChanged(eventID: EventID): void;
    setValue(eventID: EventID, newValue: T): void;
}
