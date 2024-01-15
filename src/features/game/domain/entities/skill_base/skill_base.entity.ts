import {
  AttributeType,
  CharacterType,
  SkillType,
  UsableInPlayerAndEnemy,
} from "../../types";
import { intInRange, namesRandomAttacks } from "../../utils";
import { Character } from "../character/character.entity";
import { EffectBase, HPEffect } from "../effect_base/effect_base.entity";

export abstract class SkillBase implements UsableInPlayerAndEnemy {
  private _name: string;
  private _type: SkillType[];
  private _force: number;
  private _effect: EffectBase | null;
  private _manaCost: number;
  private _admittedCharacterTypes: CharacterType[];

  constructor({
    name,
    type,
    force,
    effect,
    manaCost,
    admittedCharacterTypes,
  }: {
    name: string;
    type: SkillType[];
    force: number;
    admittedCharacterTypes?: CharacterType[];
    effect?: EffectBase;
    manaCost?: number;
  }) {
    this._name = name;
    this._type = type;
    this._force = force;
    this._effect = effect || null;
    this._manaCost = manaCost || 0;
    this._admittedCharacterTypes = admittedCharacterTypes || [
      CharacterType.WARRIOR,
      CharacterType.WIZARD,
      CharacterType.ARCHER,
    ];
  }

  get name(): string {
    return this._name;
  }

  get force(): number {
    return this._force;
  }

  get manaCost(): number {
    return this._manaCost;
  }

  get type(): SkillType[] {
    return this._type;
  }

  get effect(): EffectBase | null {
    return this._effect;
  }

  get admittedCharacterTypes(): CharacterType[] {
    return this._admittedCharacterTypes;
  }

  protected canUse(player: Character): boolean {
    const mana = player.getAttribute(AttributeType.MANA);
    return mana.value >= this._manaCost;
  }

  protected useMana(player: Character): void {
    const mana = player.getAttribute(AttributeType.MANA);
    mana.applyChange(-this._manaCost);
  }

  protected applySpecialEffect(target: Character): void {
    if (this._effect) this._effect.use(target);
  }

  public use(player: Character, targets: Character[]) {
    if (!this.canUse(player)) return;
    this.useMana(player);

    if (this._type.includes(SkillType.SPECIAL_EFFECT_PLAYER)) {
      this.applySpecialEffect(player);
    }

    if (this._type.includes(SkillType.SPECIAL_EFFECT_ENEMY)) {
      targets.forEach((t) => {
        this.applySpecialEffect(t);
      });
    }

    if (this._type.includes(SkillType.GENERIC)) {
      targets.forEach((t) => {
        const playerBaseForce = player.getAttribute(AttributeType.ATK);
        const targetHP = t.getAttribute(AttributeType.HP);
        const targetDEF = t.getAttribute(AttributeType.DEF);

        const damage = this._force * playerBaseForce.value * 0.05;
        const damageReduction = damage * (targetDEF.value * 0.01);
        const damageFinal = damage - damageReduction;

        if (damageFinal < 0) return;
        targetHP.applyChange(-damageFinal);
      });
    }
  }

  public canBeUsedBy(character: Character): boolean {
    return this._admittedCharacterTypes.includes(character.type);
  }
}

export class BasicAttack extends SkillBase {
  constructor() {
    super({
      name: "Basic Attack",
      type: [SkillType.GENERIC],
      force: 20,
      manaCost: 0,
    });
  }
}

export class Arrow extends SkillBase {
  constructor() {
    super({
      name: "Arrow",
      type: [SkillType.GENERIC],
      force: 30,
      manaCost: 0,
    });
  }
}

export class Fireball extends SkillBase {
  constructor() {
    super({
      name: "Fireball",
      type: [SkillType.GENERIC, SkillType.SPECIAL_EFFECT_ENEMY],
      force: intInRange(20, 100),
      admittedCharacterTypes: [CharacterType.WIZARD],
    });
  }
}

export class Heal extends SkillBase {
  constructor() {
    super({
      name: "Heal",
      type: [SkillType.SPECIAL_EFFECT_PLAYER],
      force: 0,
      manaCost: 40,
      effect: new HPEffect(50),
      admittedCharacterTypes: [CharacterType.WIZARD],
    });
  }
}

export class RandomAttackWithoutSpecialEffect extends SkillBase {
  constructor() {
    super({
      name: namesRandomAttacks[intInRange(0, namesRandomAttacks.length - 1)],
      type: [SkillType.GENERIC],
      force: intInRange(20, 100),
    });
  }
}
