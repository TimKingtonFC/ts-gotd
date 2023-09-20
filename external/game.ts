import { Player } from "./player";

export enum Result {
  BlackWin,
  WhiteWin,
  Draw,
  Void,
  BlackForfeit,
  WhiteForfeit,
  DoubleLoss,
  DoubleForfeit,
  VoluntaryBye,
  InvoluntaryBye,
  Unknown,
  NoGame,
}

export class Game {
  black: Player;
  white: Player;
  handicap: number;
  komi: number;
  roundNum: number;
  result: Result;

  constructor(b: Player, w: Player, h: number, k: number) {
    this.black = b;
    this.white = w;
    this.handicap = h;
    this.komi = k;
  }

  getFloat(p: Player): number {
    let scoreDiff = Math.floor(
      this.white.getScore(this.roundNum - 1) -
        this.black.getScore(this.roundNum - 1)
    );
    if (p == this.white) scoreDiff = -scoreDiff;
    return scoreDiff;
  }

  isBye(): boolean {
    return (
      this.result == Result.InvoluntaryBye ||
      this.result == Result.VoluntaryBye ||
      this.result == Result.NoGame
    );
  }

  getWhite(): Player {
    return this.white;
  }

  getBlack(): Player {
    return this.black;
  }

  setResult(r: Result) {
    this.result = r;
  }

  setRoundNum(n: number) {
    this.roundNum = n;
  }
}
