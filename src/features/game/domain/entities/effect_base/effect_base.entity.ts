import { AttributeType, Effect, EffectType } from "../../types";
import { Attribute } from "../attribute/attribute.entity";
import { Character } from "../character/character.entity";

// CLASE PARA LOS EFECTOS
export abstract class EffectBase implements Effect {
  private _name: string;
  private _attributesTypes: AttributeType[];
  private _value: number;
  private _duration: number;

  constructor(
    name: string,
    attributes: AttributeType[],
    value: number,
    duration: number
  ) {
    this._name = name;
    this._attributesTypes = attributes;
    this._value = value;
    this._duration = duration;
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

  protected decreaseDuration(): void {
    this._duration--;
  }

  protected applyAttributeChange(target: Character): void {
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
}

// EFECTOS - IMPLEMENTACIONES
export class HPBaseEffect extends EffectBase {
  constructor(value: number) {
    super(EffectType.HP, [AttributeType.HP], value, 1);
  }
}

export class BurnEffect extends EffectBase {
  constructor(value: number, duration: number) {
    super(EffectType.BURN, [AttributeType.HP], value, duration);
  }
}
