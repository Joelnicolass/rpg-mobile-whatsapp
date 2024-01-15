import {
  Attribute,
  AttributesFactory,
} from "./features/game/domain/entities/attribute/attribute.entity";
import { Character } from "./features/game/domain/entities/character/character.entity";
import { HPEffect } from "./features/game/domain/entities/effect_base/effect_base.entity";
import { ExperienceSystem } from "./features/game/domain/entities/experience_system/experience_system_base.entity";
import {
  Fireball,
  Heal,
  RandomAttackWithoutSpecialEffect,
} from "./features/game/domain/entities/skill_base/skill_base.entity";
import { AttributeType, CharacterType } from "./features/game/domain/types";

const showPlayerStats = (player: Character) => {
  console.log("PLAYER STATS: ");
  player.attributes.forEach((attr) => {
    console.log(attr.name, attr.value);
  });
};

const showEnemyStats = (enemy: Character) => {
  console.log("ENEMY STATS: ");
  enemy.attributes.forEach((attr) => {
    console.log(attr.name, attr.value);
  });
};

// test

export const player = new Character({
  name: "Player",
  type: CharacterType.WIZARD,
  attributes: AttributesFactory.createDefaultAttributes(),
  objectsEquipped: [],
  skills: [new Fireball(), new Heal()],
});

export const enemy = new Character({
  name: "Enemy",
  type: CharacterType.WARRIOR,
  attributes: AttributesFactory.createAttributesEasy(),
  objectsEquipped: [],
  skills: [
    new RandomAttackWithoutSpecialEffect(),
    new RandomAttackWithoutSpecialEffect(),
  ],
});

// fight

const testSystem = setInterval(() => {
  const skill = player.skills[Math.floor(Math.random() * player.skills.length)];

  player.useSkill(skill.name, [enemy]);
  if (enemy.isDead()) {
    clearInterval(testSystem);
    console.log("WINNER: PLAYER");
    return;
  }

  const enemySkill =
    enemy.skills[Math.floor(Math.random() * enemy.skills.length)];

  enemy.useSkill(enemySkill.name, [player]);

  if (player.isDead()) {
    clearInterval(testSystem);
    console.log("WINNER: ENEMY");
    return;
  }

  // clear console
  console.clear();
  console.log("PLAYER USE SKILL: ", skill.name);
  console.log("ENEMY USE SKILL: ", enemySkill.name);
  console.log("--------------------");
  showPlayerStats(player);
  console.log("--------------------");
  showEnemyStats(enemy);
  console.log("--------------------");

  // recuperar mana
  player.getAttribute(AttributeType.MANA).applyChange(1);
  enemy.getAttribute(AttributeType.MANA).applyChange(1);
}, 500);
