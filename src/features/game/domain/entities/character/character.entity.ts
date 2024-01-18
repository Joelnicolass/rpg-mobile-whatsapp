import { AttributeType, CharacterType } from "../../types";
import { Attribute, AttributesFactory } from "../attribute/attribute.entity";
import { EffectBase, HPBaseEffect } from "../effect_base/effect_base.entity";
import { ExperienceSystem } from "../experience_system/experience_system_base.entity";
import { ItemBase } from "../item/item.entity";
import {
  BasicAttack,
  Fireball,
  Heal,
  RandomTribesAttack,
  SkillBase,
} from "../skill_base/skill_base.entity";

// CLASE PARA PERSONAJES Y ENEMIGOS
export class Character {
  private _name: string;
  private _type: CharacterType[];
  private _attributes: Attribute[];
  private _objectsEquipped: ItemBase[];
  private _experienceSystem: ExperienceSystem;
  private _attributeMap: Map<AttributeType, Attribute>;
  private _skills: SkillBase[];
  private _skillsLimit: number = 4;
  private _activeEffects: EffectBase[] = [];

  constructor({
    name,
    type,
    attributes,
    objectsEquipped,
    experienceSystem,
    skills,
    activeEffects,
  }: {
    name: string;
    type: CharacterType[];
    attributes: Attribute[];
    objectsEquipped: ItemBase[];
    skills: SkillBase[];
    experienceSystem?: ExperienceSystem;
    activeEffects?: EffectBase[];
  }) {
    this._name = name;
    this._type = type;
    this._attributes = attributes;
    this._objectsEquipped = objectsEquipped;
    this._experienceSystem =
      experienceSystem ||
      new ExperienceSystem(
        (newLevel) => ExperienceSystem.defaultLevelUpCallback(newLevel, this),
        1
      );

    this._skills = skills;

    this._attributeMap = new Map();
    attributes.forEach((attr) => this._attributeMap.set(attr.name, attr));

    this._activeEffects = activeEffects || [];
  }

  get name(): string {
    return this._name;
  }

  get level(): number {
    return this._experienceSystem.level;
  }

  get experience(): number {
    return this._experienceSystem.experience;
  }

  get nextLevelExperience(): number {
    return this._experienceSystem.nextLevelExperience;
  }

  get types(): CharacterType[] {
    return this._type;
  }

  get attributes(): Attribute[] {
    return this._attributes;
  }

  get objectsEquipped(): ItemBase[] {
    return this._objectsEquipped;
  }

  set experienceSystem(experienceSystem: ExperienceSystem) {
    this._experienceSystem = experienceSystem;
  }

  get skills(): SkillBase[] {
    return this._skills;
  }

  get activeEffects(): EffectBase[] {
    return this._activeEffects;
  }

  public getAttribute(type: AttributeType): Attribute {
    const attribute = this._attributeMap.get(type);

    if (!attribute) throw new Error("Attribute not found");
    return attribute;
  }

  public gainExperience(amount: number): void {
    this._experienceSystem.gainExperience(amount);
  }

  public useSkill(skillName: string, targets: Character[]): void {
    const skill = this._skills.find((s) => s.name === skillName);
    if (!skill) throw new Error("Skill not found");

    skill.use(this, targets);
  }

  public isDead(): boolean {
    return this.getAttribute(AttributeType.HP).value <= 0;
  }

  public learnSkill(skill: SkillBase): void {
    if (this._skills.length >= this._skillsLimit)
      throw new Error("Skills limit reached");

    if (!skill.canBeUsedBy(this))
      throw new Error("Skill can't be used by this character");

    this._skills.push(skill);
  }

  public forgetSkill(skillName: string): void {
    this._skills = this._skills.filter((s) => s.name !== skillName);
  }

  public addEffect(effect: EffectBase): void {
    this._activeEffects.push(effect);
  }

  public applyEffects(): void {
    this._activeEffects.forEach((effect) => {
      if (effect.isActive()) {
        effect.use(this);
      }
    });

    this._activeEffects = this._activeEffects.filter((effect) =>
      effect.isActive()
    );
  }
}

export class CharacterFactory {
  static createWizard(name: string, randomSkills: boolean = false): Character {
    const skills = randomSkills
      ? [new RandomTribesAttack(), new RandomTribesAttack()]
      : [new Fireball(), new Heal()];

    return new Character({
      name,
      type: [CharacterType.WIZARD],
      attributes: AttributesFactory.createAttributesWizard(),
      objectsEquipped: [],
      skills,
    });
  }

  static createWarrior(name: string, randomSkills: boolean = false): Character {
    const skills = randomSkills
      ? [new RandomTribesAttack(), new RandomTribesAttack()]
      : [new BasicAttack()];

    return new Character({
      name,
      type: [CharacterType.WARRIOR],
      attributes: AttributesFactory.createAttributesWarrior(),
      objectsEquipped: [],
      skills,
    });
  }

  static createArcher(name: string, randomSkills: boolean = false): Character {
    const skills = randomSkills
      ? [new RandomTribesAttack(), new RandomTribesAttack()]
      : [new BasicAttack()];

    return new Character({
      name,
      type: [CharacterType.ARCHER],
      attributes: AttributesFactory.createAttributesArcher(),
      objectsEquipped: [],
      skills,
    });
  }
}
