import {
  Character,
  CharacterFactory,
} from "./features/game/domain/entities/character/character.entity";
import { AttributeType } from "./features/game/domain/types";

import axios from "axios";
import { createWhatsappServer } from "./features/game/presentation/whatsapp_integration/server/whatsapp_server";
import { initFlow } from "./features/game/presentation/whatsapp_integration/flows/init_flow";
import { BattleSystem } from "./features/game/domain/entities/battle_system/battle_system.entity";
import {
  intInRange,
  namesTribesCharacters,
  randomItemInArray,
} from "./features/game/domain/utils";

import { keyIn } from "readline-sync";

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

export enum HallType {
  EMPTY = "empty",
  ENEMY = "enemy",
  TREASURE = "treasure",
  WAY = "way",
  EXIT = "exit",
}

export class Hall {
  private _type: HallType;
  private _enemy: Character | null;
  private _treasure: any | null; // TODO implementar tesoros

  constructor(tipo: HallType = HallType.WAY) {
    this._type = tipo;
    this._enemy =
      tipo === HallType.ENEMY
        ? CharacterFactory.createRandomCharacter(
            randomItemInArray(namesTribesCharacters)
          )
        : null;
  }

  get type(): HallType {
    return this._type;
  }

  set type(tipo: HallType) {
    this._type = tipo;
  }

  get enemy(): Character | null {
    return this._enemy;
  }
}

export class DrawConsole {
  private halls: Hall[][] = [];

  constructor(halls: Hall[][]) {
    this.halls = halls;
  }

  __SHOWINCONSOLE__(
    playerPosition: { x: number; y: number } = { x: 0, y: 0 }
  ): void {
    const rows = this.halls.length;
    const columns = this.halls[0].length;
    let screen = "";

    for (let y = 0; y < rows; y++) {
      let row = "";
      for (let x = 0; x < columns; x++) {
        if (playerPosition.x === x && playerPosition.y === y) {
          row += "🧍🏻‍♂️";
          continue;
        }

        // si esta mas lejano a 3 casillas, no mostrar
        if (
          Math.abs(playerPosition.x - x) > 3 ||
          Math.abs(playerPosition.y - y) > 3
        ) {
          row += ". ";
          continue;
        }

        row += this._screenSymbol(this.halls[y][x]);
      }
      screen += row + "\n";
    }

    console.log("\x1b[36m%s\x1b[0m", "DUNGEON");
    console.log("\x1b[36m%s\x1b[0m", "-------");
    console.log(screen);
    console.log("\x1b[36m%s\x1b[0m", "-------");
  }

  private _screenSymbol(sala: Hall): string {
    switch (sala.type) {
      case HallType.EMPTY:
        return "  ";
      case HallType.ENEMY:
        return "👹";
      case HallType.TREASURE:
        return "💰";
      case HallType.WAY:
        return "👣";
      case HallType.EXIT:
        return "🚪";
      default:
        return " ";
    }
  }
}

export class Dungeon {
  halls: Hall[][] = [];
  private _rateEnemy: number = 0.2;
  private _rateTreasure: number = 0.05;

  init(size: number) {
    this.halls = this._initDungeon(size);
    this._generateHalls();
    this._addDoorToNextHall();
  }

  private _initDungeon(size: number): Hall[][] {
    const halls = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => new Hall(HallType.EMPTY))
    );

    // Crear el inicio
    halls[0][0] = new Hall(HallType.WAY);

    // Crear un camino principal
    this.createMainPath(halls, size, 0, 0);

    return halls;
  }

  private createMainPath(
    halls: Hall[][],
    size: number,
    initialX: number,
    initialY: number
  ): void {
    let currentX = initialX;
    let currentY = initialY;
    let previousX = initialX;
    let previousY = initialY;

    // Crear un camino lineal
    for (let i = 0; i < size * 10; i++) {
      halls[currentY][currentX].type = HallType.WAY;

      previousX = currentX;
      previousY = currentY;
      currentX += Math.random() > 0.5 ? 1 : -1;
      currentY += Math.random() > 0.5 ? 1 : -1;

      // si se mueve en diagonal, rellenar el espacio
      if (previousX < currentX) {
        const isValid = currentX < size && currentY < size;

        if (isValid) halls[previousY][previousX + 1].type = HallType.WAY;
      }

      if (previousX > currentX) {
        const isValid = currentX >= 0 && currentY < size;

        if (isValid) halls[previousY][previousX - 1].type = HallType.WAY;
      }

      // Si se sale del mapa, volver a entrar
      if (currentX >= size) {
        currentX = size - 1;
        currentY = previousY;
      }
      if (currentY < 0) currentY = 0;

      if (currentY >= size) {
        currentY = size - 10;
        currentX = previousX;
      }
      if (currentX < 0) currentX = 0;
    }
  }

  private _generateHalls(): void {
    // generar enemigos y tesoros en las salas de tipo WAY
    const coords = this._getCoordTo(HallType.WAY);
    const randomCoords = coords.sort(() => Math.random() - 0.5);

    const totalEnemies = Math.floor(coords.length * this._rateEnemy);

    for (let i = 0; i < totalEnemies; i++) {
      if (randomCoords[i].x === 0 && randomCoords[i].y === 0) continue;

      const coord = randomCoords[i];
      this.halls[coord.y][coord.x] = new Hall(HallType.ENEMY);
    }

    const totalTreasures = Math.floor(coords.length * this._rateTreasure);

    for (let i = 0; i < totalTreasures; i++) {
      if (randomCoords[i].x === 0 && randomCoords[i].y === 0) continue;

      const coord = randomCoords[i];
      this.halls[coord.y][coord.x] = new Hall(HallType.TREASURE);
    }
  }

  private _addDoorToNextHall(): void {
    const randomWay = randomItemInArray(this._getCoordTo(HallType.WAY));

    this.halls[randomWay.y][randomWay.x] = new Hall(HallType.EXIT);
  }

  private _getCoordTo(hallType: HallType): { x: number; y: number }[] {
    let coords: {
      x: number;
      y: number;
    }[] = [];

    for (let y = 0; y < this.halls.length; y++) {
      for (let x = 0; x < this.halls[y].length; x++) {
        if (this.halls[y][x].type === hallType) {
          coords.push({ x, y });
        }
      }
    }

    return coords;
  }

  saveDungeon(): Record<HallType, string> {
    const elements = Object.values(HallType);

    const data = elements.reduce((acc, element) => {
      const coords = this._getCoordTo(element);
      const coordsString = coords
        .map((coord) => `${coord.x},${coord.y}`)
        .join(";");
      return {
        ...acc,
        [element]: coordsString,
      };
    }, {} as Record<HallType, string>);

    return data;
  }

  loadDungeon(data: Record<HallType, string>): void {
    Object.entries(data).forEach(([key, value]) => {
      const coords = value.split(";").map((coord) => {
        const [x, y] = coord.split(",");
        return { x: parseInt(x), y: parseInt(y) };
      });

      coords.forEach((coord) => {
        this.halls[coord.y][coord.x] = new Hall(key as HallType);
      });
    });
  }

  getHall(x: number, y: number): Hall {
    return this.halls[y][x];
  }
}

export enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

export class GameSystem {
  private _player: Character;
  private _dungeon: Dungeon;
  private _playerPosition: { x: number; y: number };

  constructor(jugador: Character) {
    this._player = jugador;
    this._dungeon = new Dungeon();
    this._dungeon.init(intInRange(21, 40));
    this._playerPosition = { x: 0, y: 0 };
  }

  get dungeon(): Dungeon {
    return this._dungeon;
  }

  get playerPosition(): { x: number; y: number } {
    return this._playerPosition;
  }

  get player(): Character {
    return this._player;
  }

  // TODO refactorizar
  movePlayer(direction: Direction): Hall {
    const currentHall = this._currentHall();

    switch (direction) {
      case Direction.UP:
        const nextHall = this._dungeon.getHall(
          this._playerPosition.x,
          Math.max(0, this._playerPosition.y - 1)
        );

        if (nextHall.type === HallType.EMPTY) return currentHall;

        this._playerPosition.y = Math.max(0, this._playerPosition.y - 1);

        break;
      case Direction.DOWN:
        const nextHallDown = this._dungeon.getHall(
          this._playerPosition.x,
          Math.min(this._dungeon.halls.length - 1, this._playerPosition.y + 1)
        );

        if (nextHallDown.type === HallType.EMPTY) return currentHall;

        this._playerPosition.y = Math.min(
          this._dungeon.halls.length - 1,
          this._playerPosition.y + 1
        );

        break;
      case Direction.RIGHT:
        const nextHallRight = this._dungeon.getHall(
          Math.min(
            this._dungeon.halls[0].length - 1,
            this._playerPosition.x + 1
          ),
          this._playerPosition.y
        );

        if (nextHallRight.type === HallType.EMPTY) return currentHall;

        this._playerPosition.x = Math.min(
          this._dungeon.halls[0].length - 1,
          this._playerPosition.x + 1
        );

        break;
      case Direction.LEFT:
        const nextHallLeft = this._dungeon.getHall(
          Math.max(0, this._playerPosition.x - 1),
          this._playerPosition.y
        );

        if (nextHallLeft.type === HallType.EMPTY) return currentHall;

        this._playerPosition.x = Math.max(0, this._playerPosition.x - 1);

        break;
    }

    return this._currentHall();
  }

  private _currentHall(): Hall {
    return this._dungeon.getHall(
      this._playerPosition.x,
      this._playerPosition.y
    );
  }
}

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
