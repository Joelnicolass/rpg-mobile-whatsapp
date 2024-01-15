import { Character } from "../entities/character/character.entity";

export interface UsableInCharacter {
  use(target: Character): void;
}

export interface Effect extends UsableInCharacter {}

export interface UsableInPlayerAndEnemy {
  use: (player: Character, enemies: Character[]) => void;
}

export enum CharacterType {
  WARRIOR = "warrior",
  WIZARD = "wizard",
  ARCHER = "archer",
}

export enum AttributeType {
  HP = "health",
  MANA = "mana",
  ATK = "attack",
  DEF = "defense",
}

export enum SkillType {
  GENERIC = "generic",
  SPECIAL_EFFECT_PLAYER = "special_effect_player",
  SPECIAL_EFFECT_ENEMY = "special_effect_enemy",
}
