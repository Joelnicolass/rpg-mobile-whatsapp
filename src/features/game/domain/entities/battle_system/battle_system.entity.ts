import { Character } from "../character/character.entity";

export class BattleSystem {
  private _player: Character;
  private _enemy: Character;

  constructor(player: Character, enemy: Character) {
    this._player = player;
    this._enemy = enemy;
  }

  public executeTurn(skillName: string, userIsPlayer: boolean): void {
    if (this.isBattleOver()) return;

    const user = userIsPlayer ? this._player : this._enemy;
    const target = userIsPlayer ? this._enemy : this._player;

    this._useSkill(user, target, skillName);

    this._player.applyEffects();
    this._enemy.applyEffects();
  }

  private _useSkill(
    user: Character,
    target: Character,
    skillName: string
  ): void {
    const skill = user.skills.find((s) => s.name === skillName);
    if (!skill) {
      console.error("Skill not found:", skillName);
      return;
    }

    skill.use(user, [target]);
  }

  public isBattleOver(): boolean {
    return this._player.isDead() || this._enemy.isDead();
  }

  public getWinnerCharacter(): Character {
    if (!this.isBattleOver()) throw new Error("Battle is not over yet");

    if (this._player.isDead()) return this._enemy;
    else return this._player;
  }

  public escape(): boolean {
    const random = Math.random();
    const chance = 0.5;

    return random < chance;
  }
}
