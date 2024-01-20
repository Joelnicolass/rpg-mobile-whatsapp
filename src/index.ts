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
  type: HallType;
  enemy: Character | null;

  constructor(tipo: HallType = HallType.WAY) {
    this.type = tipo;
    this.enemy =
      tipo === HallType.ENEMY
        ? CharacterFactory.createRandomCharacter(
            randomItemInArray(namesTribesCharacters)
          )
        : null;
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
      const coord = randomCoords[i];
      this.halls[coord.y][coord.x] = new Hall(HallType.ENEMY);
    }

    const totalTreasures = Math.floor(coords.length * this._rateTreasure);

    for (let i = 0; i < totalTreasures; i++) {
      const coord = randomCoords[i];
      this.halls[coord.y][coord.x] = new Hall(HallType.TREASURE);
    }
  }

  private _addDoorToNextHall(): void {
    const randomWay = randomItemInArray(this._getCoordTo(HallType.WAY));

    this.halls[randomWay.y][randomWay.x] = new Hall(HallType.EXIT);
  }

  __SHOWINCONSOLE__(
    playerPosition: { x: number; y: number } = { x: 0, y: 0 }
  ): void {
    const filas = this.halls.length;
    const columnas = this.halls[0].length;
    let representacionGrafica = "";

    for (let y = 0; y < filas; y++) {
      let fila = "";
      for (let x = 0; x < columnas; x++) {
        if (playerPosition.x === x && playerPosition.y === y) {
          fila += "🧍🏻‍♂️";
          continue;
        }

        fila += this.caracterParaSala(this.halls[y][x]);
      }
      representacionGrafica += fila + "\n";
    }

    console.log(representacionGrafica);
  }

  private caracterParaSala(sala: Hall): string {
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
}

export enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

export class GameSystem {
  player: Character;
  dungeon: Dungeon;
  playerPosition: { x: number; y: number };

  constructor(jugador: Character) {
    this.player = jugador;
    this.dungeon = new Dungeon();
    this.dungeon.init(intInRange(12, 30));
    this.playerPosition = { x: 0, y: 0 };
  }

  movePlayer(direction: Direction): void {
    switch (direction) {
      case Direction.UP:
        this.playerPosition.y = Math.max(0, this.playerPosition.y - 1);
        break;
      case Direction.DOWN:
        this.playerPosition.y = Math.min(
          this.dungeon.halls.length - 1,
          this.playerPosition.y + 1
        );
        break;
      case Direction.RIGHT:
        this.playerPosition.x = Math.min(
          this.dungeon.halls[0].length - 1,
          this.playerPosition.x + 1
        );
        break;
      case Direction.LEFT:
        this.playerPosition.x = Math.max(0, this.playerPosition.x - 1);
        break;
    }

    this._play();
  }

  // TODO implementar turnos
  private _play(): void {
    let currentHall =
      this.dungeon.halls[this.playerPosition.y][this.playerPosition.x];

    if (currentHall.type === HallType.ENEMY && currentHall.enemy) {
      let bs = new BattleSystem(this.player, currentHall.enemy);

      console.log("Batalla contra: ", currentHall.enemy.name);
    }

    // TODO: Implementar el resto de acciones
  }
}

const game = new GameSystem(player);
game.dungeon.__SHOWINCONSOLE__(game.playerPosition);
game.movePlayer(Direction.RIGHT);

//console.log(game.dungeon.saveDungeon());
