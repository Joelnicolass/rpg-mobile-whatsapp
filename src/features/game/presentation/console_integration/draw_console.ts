import { Hall } from "../../domain/entities/hall/hall.entity";
import { HallType } from "../../domain/types";

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
