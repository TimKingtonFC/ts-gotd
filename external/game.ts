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
  black: number;
  white: number;
  handicap: number;
  komi: number;
  roundNum: number;
  result: Result;

  constructor(b: number, w: number, h: number, k: number) {
    this.black = b;
    this.white = w;
    this.handicap = h;
    this.komi = k;
  }

  getFloat(p: Player, players: Player[]): number {
    let black = players.find(p => p.id == this.black);
    let white = players.find(p => p.id == this.white);

    let scoreDiff = Math.floor(
      white.getScore(this.roundNum - 1) -
      black.getScore(this.roundNum - 1)
    );
    if (p.id == this.white) scoreDiff = -scoreDiff;
    return scoreDiff;
  }

  // TODO: Document how to make a bye
  isBye(): boolean {
    return (
      this.result == Result.InvoluntaryBye ||
      this.result == Result.VoluntaryBye ||
      this.result == Result.NoGame
    );
  }

  getWhite(): number {
    return this.white;
  }

  getBlack(): number {
    return this.black;
  }

  getResult(): Result {
    return this.result;
  }

  setResult(r: Result) {
    this.result = r;
  }

  setRoundNum(n: number) {
    this.roundNum = n;
  }
}
