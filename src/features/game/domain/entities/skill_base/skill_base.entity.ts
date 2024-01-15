import { AttributeType, SkillType, UsableInPlayerAndEnemy } from "../../types";
import { intInRange, namesRandomAttacks } from "../../utils";
import { Character } from "../character/character.entity";
import { EffectBase, HPEffect } from "../effect_base/effect_base.entity";

export abstract class SkillBase implements UsableInPlayerAndEnemy {
  name: string;
  type: SkillType[];
  force: number;
  effect: EffectBase | null;
  manaCost: number;

  constructor({
    name,
    type,
    force,
    effect,
    manaCost,
  }: {
    name: string;
    type: SkillType[];
    force: number;
    effect?: EffectBase;
    manaCost?: number;
  }) {
    this.name = name;
    this.type = type;
    this.force = force;
    this.effect = effect || null;
    this.manaCost = manaCost || 0;
  }

  protected canUse(player: Character): boolean {
    const mana = player.getAttribute(AttributeType.MANA);
    return mana.value >= this.manaCost;
  }

  protected useMana(player: Character): void {
    const mana = player.getAttribute(AttributeType.MANA);
    mana.applyChange(-this.manaCost);
  }

  protected applySpecialEffect(target: Character): void {
    if (this.effect) this.effect.use(target);
  }

  public use(player: Character, targets: Character[]) {
    if (!this.canUse(player)) return;
    this.useMana(player);

    if (this.type.includes(SkillType.SPECIAL_EFFECT_PLAYER)) {
      this.applySpecialEffect(player);
    }

    if (this.type.includes(SkillType.SPECIAL_EFFECT_ENEMY)) {
      targets.forEach((t) => {
        this.applySpecialEffect(t);
      });
    }

    if (this.type.includes(SkillType.GENERIC)) {
      targets.forEach((t) => {
        const playerBaseForce = player.getAttribute(AttributeType.ATK);
        const hp = t.getAttribute(AttributeType.HP);

        hp.applyChange(-this.force * playerBaseForce.value * 0.01);
      });
    }
  }
}

export class Fireball extends SkillBase {
  constructor() {
    super({
      name: "Fireball",
      type: [SkillType.GENERIC, SkillType.SPECIAL_EFFECT_ENEMY],
      force: intInRange(20, 50),
      manaCost: 1,
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
    });
  }
}

export class RandomAttackWithoutSpecialEffect extends SkillBase {
  constructor() {
    super({
      name: namesRandomAttacks[intInRange(0, namesRandomAttacks.length - 1)],
      type: [SkillType.GENERIC],
      force: intInRange(20, 50),
    });
  }
}
