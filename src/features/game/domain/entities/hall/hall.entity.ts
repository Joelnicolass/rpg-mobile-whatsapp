import { HallType } from "../../types";
import { namesTribesCharacters, randomItemInArray } from "../../utils";
import { Character, CharacterFactory } from "../character/character.entity";

export class Hall {
  private _type: HallType;
  //private _enemy: Character | null; // TODO ver si uso inyección de dependencias
  private _treasure: any | null; // TODO implementar tesoros

  constructor(tipo: HallType = HallType.WAY) {
    this._type = tipo;
    /* this._enemy =
      tipo === HallType.ENEMY
        ? CharacterFactory.createRandomCharacter(
            randomItemInArray(namesTribesCharacters)
          )
        : null; */
  }

  get type(): HallType {
    return this._type;
  }

  set type(tipo: HallType) {
    this._type = tipo;
  }

  /*   get enemy(): Character | null {
    return this._enemy;
  } */
}
