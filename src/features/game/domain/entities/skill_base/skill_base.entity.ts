import {
  AttributeType,
  CharacterType,
  SkillType,
  UsableInPlayerAndEnemy,
} from "../../types";
import { intInRange, namesRandomAttacks, namesTribesSkills } from "../../utils";
import { Character } from "../character/character.entity";
import {
  BurnEffect,
  EffectBase,
  HPBaseEffect,
} from "../effect_base/effect_base.entity";

export abstract class SkillBase implements UsableInPlayerAndEnemy {
  private _name: string;
  private _type: SkillType[];
  private _force: number;
  private _effects: EffectBase[];
  private _manaCost: number;
  private _admittedCharacterTypes: CharacterType[];

  constructor({
    name,
    type,
    force,
    effects,
    manaCost,
    admittedCharacterTypes,
  }: {
    name: string;
    type: SkillType[];
    force: number;
    admittedCharacterTypes?: CharacterType[];
    effects?: EffectBase[];
    manaCost?: number;
  }) {
    this._name = name;
    this._type = type;
    this._force = force;
    this._effects = effects || [];
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

  get effects(): EffectBase[] | null {
    return this._effects;
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
    this._effects.forEach((effect) => {
      target.addEffect(effect);
    });
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
    const types = character.types;
    const canUse = this._admittedCharacterTypes.some((t) => types.includes(t));

    return canUse;
  }

  public getSkillInfo(): string {
    return `${this._name} - ${this._force} force - ${
      this._manaCost
    } mana cost - ${this._type.join(", ")} - ${this._effects.map(
      (e) => `${e.name} (${e.duration} turns)`
    )}`;
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
      effects: [new BurnEffect(5, intInRange(1, 5))],
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
      effects: [new HPBaseEffect(50)],
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

export class RandomTribesAttack extends SkillBase {
  constructor() {
    super({
      name: namesTribesSkills[intInRange(0, namesTribesSkills.length - 1)],
      type: [SkillType.GENERIC],
      force: intInRange(0, 200),
      manaCost: intInRange(0, 100),
    });
  }
}
