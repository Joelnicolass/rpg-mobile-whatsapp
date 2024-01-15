import { AttributeType } from "../../types";
import { Character } from "../character/character.entity";

export interface LevelUpCallback {
  (newLevel: number): void;
}

export class ExperienceSystem {
  private _experience: number = 0;
  private _level: number;
  private _levelUpCallback: LevelUpCallback;

  constructor(levelUpCallback: LevelUpCallback, level = 1) {
    this._levelUpCallback = levelUpCallback;
    this._level = level;
  }

  gainExperience(amount: number): void {
    this._experience += amount;

    if (this._experience >= this.experienceNeededForLevelUp()) {
      while (this._experience >= this.experienceNeededForLevelUp()) {
        this._experience -= this.experienceNeededForLevelUp();
        this._level++;
        this._levelUpCallback(this._level);
      }
    }
  }

  private experienceNeededForLevelUp(): number {
    return 100 * this._level;
  }

  get level(): number {
    return this._level;
  }

  get experience(): number {
    return this._experience;
  }

  get nextLevelExperience(): number {
    return this.experienceNeededForLevelUp();
  }

  static customLevelUpCallback(
    newLevel: number,
    character: Character,
    boostRates: Record<AttributeType, number>
  ): void {
    character.attributes.forEach((attr) => {
      attr.value += Math.ceil(newLevel * attr.value * boostRates[attr.name]);

      const newMaxValue = (attr.value += Math.ceil(
        newLevel * attr.value * boostRates[attr.name]
      ));

      attr.updateMaxValue(newMaxValue);
    });
  }

  static defaultLevelUpCallback(newLevel: number, character: Character): void {
    character.attributes.forEach((attr) => {
      attr.value += Math.ceil(newLevel * attr.value * 0.01);

      const newMaxValue = (attr.value += Math.ceil(
        newLevel * attr.value * 0.01
      ));

      attr.updateMaxValue(newMaxValue);
    });
  }
}
