import { Effect, UsableInCharacter } from "../../types";
import { Character } from "../character/character.entity";

// CLASE PARA LOS OBJETOS
export class ItemBase implements UsableInCharacter {
  name: string;
  effect: Effect;

  constructor(name: string, effect: Effect) {
    this.name = name;
    this.effect = effect;
  }

  use(target: Character): void {}
}
