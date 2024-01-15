import { AttributeType, Effect } from "../../types";
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

  public abstract use(target: Character): void;

  protected applyAttributeChange(target: Character): void {
    this._attributesTypes.forEach((type) => {
      const attribute = target.getAttribute(type);
      attribute.applyChange(this._value);
    });
  }
}

// EFECTOS - IMPLEMENTACIONES
export class HPEffect extends EffectBase {
  constructor(value: number) {
    super("DamageEffect", [AttributeType.HP], value, 0);
  }

  use(target: Character): void {
    this.applyAttributeChange(target);
  }
}
