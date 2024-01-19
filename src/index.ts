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
export const enemy = CharacterFactory.createWarrior("Enemy", true);

const bs = new BattleSystem(player, enemy);

/* const testSystem = setInterval(() => {
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
    console.table(randomSkill);

    player.learnSkill(randomSkill);
    player.learnSkill(randomSkill);

    console.log(
      "Player moves: ",
      player.skills.map((s) => s.name)
    );
  }
}, 1000); */

/* createWhatsappServer({
  initFlow: initFlow,
}); */

enum SalaTipo {
  VACIA,
  ENEMIGO,
  TESORO,
  PASILLO,
}

class Sala {
  tipo: SalaTipo;
  enemigo: Character | null;

  constructor(tipo: SalaTipo = SalaTipo.VACIA) {
    this.tipo = tipo;
    this.enemigo =
      tipo === SalaTipo.ENEMIGO
        ? CharacterFactory.createRandomCharacter(
            randomItemInArray(namesTribesCharacters)
          )
        : null;
  }
}

class Mazmorra {
  salas: Sala[][];

  constructor(size: number) {
    this.salas = this.inicializarCuadricula(size);
    this.generarSalas();
    this.conectarSalas();
  }

  inicializarCuadricula(size: number): Sala[][] {
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => new Sala())
    );
  }

  generarSalas(): void {
    for (let i = 0; i < this.salas.length; i++) {
      for (let j = 0; j < this.salas[i].length; j++) {
        if (Math.random() < 0.2) {
          // la primer sala no puede ser de tipo ENEMIGO
          if (i === 0 && j === 0) continue;

          this.salas[i][j] = new Sala(SalaTipo.ENEMIGO);
        } else if (Math.random() < 0.1) {
          this.salas[i][j] = new Sala(SalaTipo.TESORO);
        }
      }
    }
  }
  conectarSalas(): void {
    const filas = this.salas.length;
    const columnas = this.salas[0].length;

    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < columnas; x++) {
        const sala = this.salas[y][x];

        // Si la sala actual no es vacía, intenta conectarla con una vecina
        if (sala.tipo !== SalaTipo.VACIA) {
          this.conectarConVecina(x, y);
        }
      }
    }
  }

  private conectarConVecina(x: number, y: number): void {
    const filas = this.salas.length;
    const columnas = this.salas[0].length;

    // Direcciones posibles: arriba, abajo, izquierda, derecha
    const direcciones = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];

    for (const [dx, dy] of direcciones) {
      const nx = x + dx;
      const ny = y + dy;

      // Verifica si la posición vecina está dentro de la mazmorra
      if (nx >= 0 && nx < columnas && ny >= 0 && ny < filas) {
        // Si la sala vecina es vacía, conviértela en pasillo
        if (this.salas[ny][nx].tipo === SalaTipo.VACIA) {
          this.salas[ny][nx] = new Sala(SalaTipo.PASILLO);
        }
      }
    }
  }

  graficarMazmorra(
    playerPosition: { x: number; y: number } = { x: 0, y: 0 }
  ): void {
    const filas = this.salas.length;
    const columnas = this.salas[0].length;
    let representacionGrafica = "";

    for (let y = 0; y < filas; y++) {
      let fila = "";
      for (let x = 0; x < columnas; x++) {
        if (playerPosition.x === x && playerPosition.y === y) {
          fila += "P";
          continue;
        }

        fila += this.caracterParaSala(this.salas[y][x]);
      }
      representacionGrafica += fila + "\n";
    }

    console.log(representacionGrafica);
  }

  private caracterParaSala(sala: Sala): string {
    switch (sala.tipo) {
      case SalaTipo.VACIA:
        return " ";
      case SalaTipo.ENEMIGO:
        return "E";
      case SalaTipo.TESORO:
        return "T";
      case SalaTipo.PASILLO:
        return "-";
      default:
        return " ";
    }
  }
}

class GameSystem {
  jugador: Character;
  mazmorra: Mazmorra;
  posicionActual: { x: number; y: number };

  constructor(jugador: Character) {
    this.jugador = jugador;
    this.mazmorra = new Mazmorra(10);
    this.posicionActual = { x: 0, y: 0 };
  }

  moverJugador(direccion: string): void {
    // Ejemplo básico de movimiento
    switch (direccion) {
      case "norte":
        this.posicionActual.y = Math.max(0, this.posicionActual.y - 1);
        break;
      case "sur":
        this.posicionActual.y = Math.min(
          this.mazmorra.salas.length - 1,
          this.posicionActual.y + 1
        );
        break;
      case "este":
        this.posicionActual.x = Math.min(
          this.mazmorra.salas[0].length - 1,
          this.posicionActual.x + 1
        );
        break;
      case "oeste":
        this.posicionActual.x = Math.max(0, this.posicionActual.x - 1);
        break;
    }

    this.ejecutarTurno();
  }

  ejecutarTurno(): void {
    let salaActual =
      this.mazmorra.salas[this.posicionActual.y][this.posicionActual.x];
    if (salaActual.tipo === SalaTipo.ENEMIGO && salaActual.enemigo) {
      let battleSystem = new BattleSystem(this.jugador, salaActual.enemigo);
      // Aquí se inicia la batalla. Necesitarás implementar la lógica de la batalla.
    }

    // Otras acciones que ocurran en el turno, como encontrar un tesoro, pueden ser manejadas aquí.
  }
}

const game = new GameSystem(player);
game.mazmorra.graficarMazmorra(game.posicionActual);
