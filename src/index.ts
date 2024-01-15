import {
  Character,
  CharacterFactory,
} from "./features/game/domain/entities/character/character.entity";
import { AttributeType } from "./features/game/domain/types";

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

export const player = CharacterFactory.createWizard("Nico");
export const enemy = CharacterFactory.createWarrior("Enemy");

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

  player.getAttribute(AttributeType.MANA).applyChange(1);
  enemy.getAttribute(AttributeType.MANA).applyChange(1);

  // LOGS
  console.clear();

  console.log(
    "Player moves: ",
    player.skills.map((s) => s.name)
  );
  console.log(
    "Enemy moves: ",
    enemy.skills.map((s) => s.name)
  );

  console.log("PLAYER USE SKILL: ", skill.name);
  console.log("ENEMY USE SKILL: ", enemySkill.name);
  console.log("--------------------");
  showPlayerStats(player);
  console.log("--------------------");
  showEnemyStats(enemy);
  console.log("--------------------");
}, 500);
