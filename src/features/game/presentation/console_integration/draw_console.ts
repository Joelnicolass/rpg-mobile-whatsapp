import { Hall } from "../../domain/entities/hall/hall.entity";
import { HallType } from "../../domain/types";

export class DrawConsole {
  private _halls: Hall[][] = [];
  private _rateVisibility = 3;
  private _fog = true;

  constructor(halls: Hall[][]) {
    this._halls = halls;
  }

  get rateVisibility(): number {
    return this._rateVisibility;
  }

  set rateVisibility(value: number) {
    this._rateVisibility = value;
  }

  showFog() {
    this._fog = true;
  }

  hideFog() {
    this._fog = false;
  }

  __SHOWINCONSOLE__(
    playerPosition: { x: number; y: number } = { x: 0, y: 0 }
  ): void {
    const rows = this._halls.length;
    const columns = this._halls[0].length;
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
          this._fog &&
          (Math.abs(playerPosition.x - x) > this._rateVisibility ||
            Math.abs(playerPosition.y - y) > this._rateVisibility)
        ) {
          row += "  ";
          continue;
        }

        row += this._screenSymbol(this._halls[y][x]);
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
