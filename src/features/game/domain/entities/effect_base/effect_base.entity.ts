import { AttributeType, Effect, EffectType, Saveable } from "../../types";
import { intInRange } from "../../utils";
import { Attribute } from "../attribute/attribute.entity";
import { Character } from "../character/character.entity";

// CLASE PARA LOS EFECTOS
export abstract class EffectBase implements Effect, Saveable {
  private _name: string;
  private _attributesTypes: AttributeType[];
  private _value: number;
  private _duration: number;
  private _probability: number;

  constructor(
    name: string,
    attributes: AttributeType[],
    value: number,
    duration: number,
    probability?: number
  ) {
    this._name = name;
    this._attributesTypes = attributes;
    this._value = value;
    this._duration = duration;
    this._probability = probability || 100;
  }

  get name(): string {
    return this._name;
  }

  get attributes(): Attribute[] {
    return this._attributesTypes.map((attributeType) => {
      return new Attribute(attributeType, this._value);
    });
  }

  get value(): number {
    return this._value;
  }

  get duration(): number {
    return this._duration;
  }

  get probability(): number {
    return this._probability;
  }

  protected decreaseDuration(): void {
    this._duration--;
  }

  protected applyAttributeChange(target: Character): void {
    const random = intInRange(0, 100);
    if (random > this._probability) return;

    this._attributesTypes.forEach((type) => {
      const attribute = target.getAttribute(type);
      attribute.applyChange(this._value);
    });
  }

  // TODO: ver si necesita ser abstracto
  public use(target: Character): void {
    this.applyAttributeChange(target);
    this.decreaseDuration();
  }

  public isActive(): boolean {
    return this._duration > 0;
  }

  public save(): Record<string, unknown> {
    return {
      name: this._name,
      attributes: this._attributesTypes,
      value: this._value,
      duration: this._duration,
      probability: this._probability,
      __class__: this.constructor.name,
    };
  }

  static load(data: Record<string, unknown>): EffectBase {
    const name = data.name as string;
    const attributes = data.attributes as AttributeType[];
    const value = data.value as number;
    const duration = data.duration as number;
    const probability = data.probability as number;

    switch (data.__class__) {
      case "InmediateHPEffect":
        return new InmediateHPEffect(value, duration, probability);
      case "BurnEffect":
        return new BurnEffect(value, duration, probability);
      case "PoisonEffect":
        return new PoisonEffect(value, duration, probability);
      case "CurseEffect":
        return new CurseEffect(value, duration, probability);
      default:
        throw new Error("Effect not found");
    }
  }
}

// EFECTOS - IMPLEMENTACIONES
export class InmediateHPEffect extends EffectBase {
  constructor(value: number, duration: number = 1, probability: number = 100) {
    super(EffectType.HP, [AttributeType.HP], value, duration, probability);
  }
}

export class BurnEffect extends EffectBase {
  constructor(value: number, duration: number, probability: number) {
    super(EffectType.BURN, [AttributeType.HP], value, duration, probability);
  }
}

export class PoisonEffect extends EffectBase {
  constructor(value: number, duration: number, probability: number) {
    super(
      EffectType.POISON,
      [AttributeType.HP, AttributeType.MANA],
      value,
      duration,
      probability
    );
  }
}

export class CurseEffect extends EffectBase {
  constructor(value: number, duration: number, probability: number) {
    super(
      EffectType.CURSE,
      [AttributeType.ATK, AttributeType.MANA, AttributeType.HP],
      value,
      duration,
      probability
    );
  }
}
