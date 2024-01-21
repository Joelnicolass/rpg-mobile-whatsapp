import { keyIn } from "readline-sync";
import { BattleSystem } from "../../domain/entities/battle_system/battle_system.entity";
import {
  Character,
  CharacterFactory,
} from "../../domain/entities/character/character.entity";
import { GameSystem } from "../../domain/entities/game_system/game_system.entity";
import { Hall } from "../../domain/entities/hall/hall.entity";
import { Direction, HallType } from "../../domain/types";
import { DrawConsole } from "./draw_console";
import { intInRange } from "../../domain/utils";
import { namesTribesCharacters } from "../../domain/utils/index";

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
  console.log(
    "effects: ",
    player.activeEffects.map((e) => e.name)
  );
  console.log("--------------------");
  console.log(
    "Enemy moves: ",
    enemy.skills.map((s) => s.name)
  );
  showEnemyStats(enemy);
  console.log(
    "effects: ",
    enemy.activeEffects.map((e) => e.name)
  );
};

export const player = CharacterFactory.createWizard("Nico", true);
console.log(player.skills.map((s) => `${s.name} ${s.manaCost} - ${s.force}`));

const saved =
  '{"name":"Nico","type":["wizard"],"attributes":[{"name":"health","value":100,"maxValue":100},{"name":"mana","value":300,"maxValue":300},{"name":"attack","value":30,"maxValue":30},{"name":"defense","value":5,"maxValue":5}],"experienceSystem":{"experience":0,"level":10},"skills":[{"name":"Pureza de Santa Cruz","type":["generic","special_effect_player"],"force":81,"effects":[{"name":"HP","attributes":["health"],"value":18,"duration":1,"__class__":"InmediateHPEffect"}],"manaCost":0,"admittedCharacterTypes":["warrior","wizard","archer"],"__class__":"RandomTribesAttack"},{"name":"Vuelo del Cóndor","type":["generic"],"force":180,"effects":[],"manaCost":0,"admittedCharacterTypes":["warrior","wizard","archer"],"__class__":"RandomTribesAttack"}],"activeEffects":[]}';

const game = new GameSystem(player);
const draw = new DrawConsole(game.dungeon.halls);

console.log("GAME STARTED");
console.log("------------");

const shouldInitBattle = (hall: Hall) => hall.type === HallType.ENEMY;

const battle = async (game: GameSystem, hall: Hall) => {
  let inBattle = true;
  const player = game.player;
  const enemy = CharacterFactory.createRandomCasualEnemy();

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
export const playInConsole = async () => {
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
};
