import {
  Character,
  CharacterFactory,
} from "./features/game/domain/entities/character/character.entity";
import { AttributeType } from "./features/game/domain/types";

import axios from "axios";
import { createWhatsappServer } from "./features/game/presentation/whatsapp_integration/server/whatsapp_server";
import { initFlow } from "./features/game/presentation/whatsapp_integration/flows/init_flow";
import { BattleSystem } from "./features/game/domain/entities/battle_system/battle_system.entity";
import { randomItemInArray } from "./features/game/domain/utils";

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

const showStats = (player: Character, enemy: Character) => {
  console.log(
    "Player moves: ",
    player.skills.map((s) => s.name)
  );
  showPlayerStats(player);
  console.log("--------------------");
  console.log(
    "Enemy moves: ",
    enemy.skills.map((s) => s.name)
  );
  showEnemyStats(enemy);
};

export const player = CharacterFactory.createWizard("Nico");
export const enemy = CharacterFactory.createWarrior("Enemy");

const bs = new BattleSystem(player, enemy);
player.forgetSkill("Basic Attack");

const testSystem = setInterval(() => {
  const skillPlayer = randomItemInArray(player.skills);
  const skillEnemy = randomItemInArray(enemy.skills);

  bs.executeTurn(skillPlayer.name, true);
  bs.executeTurn(skillEnemy.name, false);

  console.clear();

  console.log("--------------------");
  console.log("Player uses:", skillPlayer.name);
  console.log(skillPlayer.getSkillInfo());
  console.log("--------------------");
  console.log("Enemy uses:", skillEnemy.name);
  console.log(skillEnemy.getSkillInfo());

  console.log(player.activeEffects.map((e) => e.name));
  console.log(enemy.activeEffects.map((e) => e.name));

  showStats(player, enemy);

  if (bs.isBattleOver()) {
    clearInterval(testSystem);

    console.log("Battle is over");
    console.log("Winner is: ", bs.getWinnerCharacter().name);

    const randomSkill = randomItemInArray(enemy.skills);
    console.log("Quieres aprender esta skill? ", randomSkill.name);

    player.learnSkill(randomSkill);

    console.log(
      "Player moves: ",
      player.skills.map((s) => s.name)
    );
  }
}, 1000);

/* createWhatsappServer({
  initFlow: initFlow,
}); */
