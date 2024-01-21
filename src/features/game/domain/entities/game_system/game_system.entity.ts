import { Direction, HallType } from "../../types";
import { intInRange } from "../../utils";
import { Character } from "../character/character.entity";
import { Dungeon } from "../dungeon/dungeon.entity";
import { Hall } from "../hall/hall.entity";
import { ExperienceSystem } from "../experience_system/experience_system_base.entity";

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

  save(): Record<string, unknown> {
    return this.player.save();
  }

  static load(data: Record<string, unknown>): GameSystem {
    const player = Character.load(data);
    const experienceSystem = ExperienceSystem.load(
      data.experienceSystem as Record<string, unknown>,
      player
    );

    player.experienceSystem = experienceSystem;
    return new GameSystem(player);
  }
}
