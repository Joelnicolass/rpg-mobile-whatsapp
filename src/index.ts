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
  EMPTY,
  ENEMY,
  TREASURE,
  WAY,
  EXIT,
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
  halls: Hall[][];
  private _rateEnemy: number = 0.2;
  private _rateTreasure: number = 0.05;

  constructor(size: number) {
    this.halls = this._initDungeon(size);
    this._generateHalls();
    this._addDoorToNextHall();
  }

  private _initDungeon(size: number): Hall[][] {
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => new Hall())
    );
  }

  private _generateHalls(): void {
    for (let i = 0; i < this.halls.length; i++) {
      for (let j = 0; j < this.halls[i].length; j++) {
        if (Math.random() < this._rateEnemy) {
          // la primer sala no puede ser de tipo ENEMIGO
          if (i === 0 && j === 0) continue;

          this.halls[i][j] = new Hall(HallType.ENEMY);
        } else if (Math.random() < this._rateTreasure) {
          this.halls[i][j] = new Hall(HallType.TREASURE);
        }
      }
    }
  }

  private _addDoorToNextHall(): void {
    const randomX = Math.floor(Math.random() * this.halls[0].length);
    const randomY = Math.floor(Math.random() * this.halls.length);

    this.halls[randomY][randomX] = new Hall(HallType.EXIT);
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
        return " ";
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

  private _getCoordToExit(): { x: number; y: number } {
    let coords = this._getCoordTo(HallType.EXIT);
    return coords[0];
  }

  private _getCoordToEnemy(): { x: number; y: number }[] {
    return this._getCoordTo(HallType.ENEMY);
  }

  private _getCoordToTreasure(): { x: number; y: number }[] {
    return this._getCoordTo(HallType.TREASURE);
  }

  private _getCoordToWay(): { x: number; y: number }[] {
    return this._getCoordTo(HallType.WAY);
  }

  private _getCoordToEmpty(): { x: number; y: number }[] {
    return this._getCoordTo(HallType.EMPTY);
  }

  saveDungeon(): void {
    const data = {
      enemies: this._getCoordToEnemy(),
      treasures: this._getCoordToTreasure(),
      ways: this._getCoordToWay(),
      empty: this._getCoordToEmpty(),
      exit: this._getCoordToExit(),
    };

    console.log(data);
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
    this.dungeon = new Dungeon(10);
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

game.dungeon.saveDungeon();
