import {
  Character,
  CharacterFactory,
} from "./features/game/domain/entities/character/character.entity";
import { Direction, HallType } from "./features/game/domain/types";

import { createWhatsappServer } from "./features/game/presentation/whatsapp_integration/server/whatsapp_server";
import { initFlow } from "./features/game/presentation/whatsapp_integration/flows/init_flow";
import { BattleSystem } from "./features/game/domain/entities/battle_system/battle_system.entity";
import { intInRange } from "./features/game/domain/utils";

import { keyIn } from "readline-sync";
import { Hall } from "./features/game/domain/entities/hall/hall.entity";
import { GameSystem } from "./features/game/domain/entities/game_system/game_system.entity";
import { DrawConsole } from "./features/game/presentation/console_integration/draw_console";

/* createWhatsappServer({
  initFlow: initFlow,
}); */

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

export const player = CharacterFactory.createWizard("Nico", true);

//console.log(game.dungeon.saveDungeon());

// ------------------------------ TEST DE CONSOLA

// TEST DE BATALLA

const game = new GameSystem(player);
const draw = new DrawConsole(game.dungeon.halls);

const shouldInitBattle = (hall: Hall) => hall.type === HallType.ENEMY;

const battle = async (game: GameSystem, hall: Hall) => {
  let inBattle = true;
  const player = game.player;
  const enemy = hall.enemy!;

  draw.__SHOWINCONSOLE__(game.playerPosition);
  showStats(player, enemy);

  const battleSystem = new BattleSystem(player, enemy);

  while (inBattle) {
    const key = keyIn("", {
      hideEchoBack: true,
      mask: "",
    });

    const enemySkill = enemy.skills[intInRange(0, enemy.skills.length - 1)];

    switch (key) {
      case "1":
        console.clear();

        const playerSkill = player.skills.length > 0 ? player.skills[0] : null;

        if (!playerSkill) {
          console.log("Player has no skills");
          break;
        }

        try {
          console.log("Player uses: ", playerSkill.name);
          battleSystem.executeTurn(player.skills[0].name, true);
        } catch (error) {
          console.log((error as Error).message);
        }

        try {
          console.log("Enemy uses: ", enemySkill.name);
          battleSystem.executeTurn(enemySkill.name, false);
        } catch (error) {
          console.log((error as Error).message);
        }

        draw.__SHOWINCONSOLE__(game.playerPosition);
        showStats(player, enemy);

        break;

      default:
        console.clear();

        draw.__SHOWINCONSOLE__(game.playerPosition);
        showStats(player, enemy);
        break;
    }

    if (battleSystem.isBattleOver()) {
      console.clear();
      inBattle = false;

      if (!player.isDead()) {
        hall.type = HallType.WAY;
        return true;
      } else {
        return false;
      }
    }
  }
};

// TEST DE MOVIMIENTO
(async () => {
  let jugando = true;

  draw.__SHOWINCONSOLE__(game.playerPosition);

  while (jugando) {
    // mover presionando una tecla
    const key = keyIn("", {
      hideEchoBack: true,
      mask: "",
    });
    console.clear();

    let hall;
    let battleResult;

    switch (key) {
      case "w":
        hall = game.movePlayer(Direction.UP);

        if (shouldInitBattle(hall)) {
          battleResult = await battle(game, hall);
        }

        draw.__SHOWINCONSOLE__(game.playerPosition);

        break;
      case "s":
        hall = game.movePlayer(Direction.DOWN);

        if (shouldInitBattle(hall)) {
          battleResult = await battle(game, hall);
        }

        draw.__SHOWINCONSOLE__(game.playerPosition);
        console.log(battleResult);
        break;
      case "a":
        hall = game.movePlayer(Direction.LEFT);

        if (shouldInitBattle(hall)) {
          battleResult = await battle(game, hall);
        }

        draw.__SHOWINCONSOLE__(game.playerPosition);
        console.log(battleResult);
        break;
      case "d":
        hall = game.movePlayer(Direction.RIGHT);

        if (shouldInitBattle(hall)) {
          battleResult = await battle(game, hall);
        }

        draw.__SHOWINCONSOLE__(game.playerPosition);
        console.log(battleResult);
        break;
      case "q":
        jugando = false;
        break;
      default:
        draw.__SHOWINCONSOLE__(game.playerPosition);
        break;
    }
  }

  console.log("GAME OVER");
})();
