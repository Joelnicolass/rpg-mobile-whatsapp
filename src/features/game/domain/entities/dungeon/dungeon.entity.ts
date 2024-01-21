import { HallType } from "../../types";
import { randomItemInArray } from "../../utils";
import { Hall } from "../hall/hall.entity";

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

  // TODO! Hay que testear si funciona este metodo de guardado
  save(): Record<HallType, string> {
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

  // TODO! todavia no esta completamente implementado
  load(data: Record<HallType, string>): void {
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
