import { AttributeType } from "../../types";

// CLASE PARA LOS ATRIBUTOS
export class Attribute {
  private _name: AttributeType;
  private _value: number;
  private _maxValue: number;

  constructor(name: AttributeType, value: number) {
    this._name = name;
    this._value = value;
    this._maxValue = value;
  }

  get name(): AttributeType {
    return this._name;
  }

  get value(): number {
    return this._value;
  }

  set value(value: number) {
    this._value = value;
  }

  applyChange(value: number) {
    if (this._value + value > this._maxValue) {
      this._value = this._maxValue;
      return;
    }

    this._value += Math.ceil(value);
  }

  resetValue() {
    this._value = this._maxValue;
  }

  updateMaxValue(value: number) {
    this._maxValue = value;
  }

  public save(): Record<string, unknown> {
    return {
      name: this._name,
      value: this._value,
      maxValue: this._maxValue,
    };
  }

  public static load(data: Record<string, unknown>): Attribute {
    return new Attribute(data.name as AttributeType, data.value as number);
  }
}

export class AttributesFactory {
  static createAttributes(
    attributes: AttributeType[],
    value: number
  ): Attribute[] {
    return attributes.map((attr) => new Attribute(attr, value));
  }

  static createDefaultAttributes(): Attribute[] {
    return [
      new Attribute(AttributeType.HP, 100),
      new Attribute(AttributeType.MANA, 100),
      new Attribute(AttributeType.ATK, 10),
      new Attribute(AttributeType.DEF, 10),
    ];
  }

  static createAttributesEasy(): Attribute[] {
    return [
      new Attribute(AttributeType.HP, 50),
      new Attribute(AttributeType.MANA, 50),
      new Attribute(AttributeType.ATK, 5),
      new Attribute(AttributeType.DEF, 0),
    ];
  }

  static createAttributesMedium(): Attribute[] {
    return [
      new Attribute(AttributeType.HP, 200),
      new Attribute(AttributeType.MANA, 200),
      new Attribute(AttributeType.ATK, 15),
      new Attribute(AttributeType.DEF, 15),
    ];
  }

  static createAttributesHard(): Attribute[] {
    return [
      new Attribute(AttributeType.HP, 300),
      new Attribute(AttributeType.MANA, 300),
      new Attribute(AttributeType.ATK, 20),
      new Attribute(AttributeType.DEF, 20),
    ];
  }

  static createAttributesVeryHard(): Attribute[] {
    return [
      new Attribute(AttributeType.HP, 400),
      new Attribute(AttributeType.MANA, 400),
      new Attribute(AttributeType.ATK, 55),
      new Attribute(AttributeType.DEF, 45),
    ];
  }

  static createAttributesWizard(): Attribute[] {
    return [
      new Attribute(AttributeType.HP, 100),
      new Attribute(AttributeType.MANA, 300),
      new Attribute(AttributeType.ATK, 30),
      new Attribute(AttributeType.DEF, 5),
    ];
  }

  static createAttributesWarrior(): Attribute[] {
    return [
      new Attribute(AttributeType.HP, 300),
      new Attribute(AttributeType.MANA, 50),
      new Attribute(AttributeType.ATK, 10),
      new Attribute(AttributeType.DEF, 30),
    ];
  }

  static createAttributesArcher(): Attribute[] {
    return [
      new Attribute(AttributeType.HP, 50),
      new Attribute(AttributeType.MANA, 100),
      new Attribute(AttributeType.ATK, 100),
      new Attribute(AttributeType.DEF, 0),
    ];
  }
}
