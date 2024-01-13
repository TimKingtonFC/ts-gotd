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
  blackId: number;
  whiteId: number;
  handicap: number;
  roundNum: number;
  result: Result;

  constructor(blackId: number, whiteId: number, handicap: number, result?: Result) {
    this.blackId = blackId;
    this.whiteId = whiteId;
    this.handicap = handicap;
    this.result = result;
  }

  getFloat(p: Player, players: Player[]): number {
    let black = players.find(p => p.id == this.blackId);
    let white = players.find(p => p.id == this.whiteId);

    let scoreDiff = Math.floor(
      white.getScore(this.roundNum - 1) -
      black.getScore(this.roundNum - 1)
    );
    if (p.id == this.whiteId) scoreDiff = -scoreDiff;
    return scoreDiff;
  }

  isBye(): boolean {
    return (
      this.result == Result.InvoluntaryBye ||
      this.result == Result.VoluntaryBye ||
      this.result == Result.NoGame
    );
  }

  getWhiteId(): number {
    return this.whiteId;
  }

  getBlackId(): number {
    return this.blackId;
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
