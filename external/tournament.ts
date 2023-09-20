import { PlayerList } from "../player-list";
import { Game } from "./game";
import { Player } from "./player";

export enum HandicapType {
  FullHandicap,
  MinusOne,
  MinusTwo,
  None,
}

export class Tournament {
  balanceColors: boolean = true;
  intraStateGap: number = 0;
  intraCityGap: number = 0.6;
  intraClubGap: number = 0.75;
  handicapGap: number = 0;
  totalRounds: number = 3;
  noHandicapAboveBar: boolean = true;
  handicapType: HandicapType = HandicapType.MinusOne;
  players: PlayerList = new PlayerList();
  komi = 6.5;
  bar = 0;

  calculateHandicap(black: Player, white: Player): number {
    if (
      this.noHandicapAboveBar &&
      (black.getRating() >= this.bar || white.getRating() >= this.bar)
    )
      return 0;

    let wr = white.getRating();
    let br = black.getRating();
    let diff = Math.round(wr - br);
    let size = Math.floor(Math.abs(diff));
    let neg = diff < 0;

    if (wr > 0 !== br > 0) size -= 2;

    switch (this.handicapType) {
      case HandicapType.FullHandicap:
        break;
      case HandicapType.MinusOne:
        size -= 1;
        break;
      case HandicapType.MinusTwo:
        size -= 2;
        break;
      case HandicapType.None:
        return 0;
    }

    size = Math.max(0, Math.min(9, size));

    return neg ? -size : size;
  }

  createMatch(black: Player, white: Player): Game {
    let handicap = this.calculateHandicap(black, white);
    if (handicap < 0) {
      handicap *= -1;
      let tmp = black;
      black = white;
      white = tmp;
    }

    let k: number;
    if (handicap == 0) k = this.komi;
    else if (handicap == 1) k = -0.5;
    else k = 0.5;

    if (this.balanceColors && handicap == 0) {
      let mustSwitch = false;
      let cantSwitch = false;

      //	Try not to get same color three in a row
      let lastTwo = black.getLastGames(2);
      if (lastTwo != null) {
        mustSwitch =
          mustSwitch ||
          (lastTwo[0].getBlack() == black && lastTwo[1].getBlack() == black);
        cantSwitch =
          cantSwitch ||
          (lastTwo[0].getWhite() == black && lastTwo[1].getWhite() == black);
      }

      lastTwo = white.getLastGames(2);
      if (lastTwo != null) {
        mustSwitch =
          mustSwitch ||
          (lastTwo[0].getWhite() == white && lastTwo[1].getWhite() == white);
        cantSwitch =
          cantSwitch ||
          (lastTwo[0].getBlack() == white && lastTwo[1].getBlack() == white);
      }

      //	Possibly switch to maintain 50-50 ratio
      if (!mustSwitch) {
        //	Positive number means more games as black
        let colorImbalance = black.getColorImbalance();
        let colorImbalance2 = white.getColorImbalance();

        if (Math.abs(colorImbalance) > Math.abs(colorImbalance2)) {
          //	Black has played black too much
          if (colorImbalance > 0) mustSwitch = true;
        } else {
          //	White has played white too much
          if (colorImbalance2 < 0) mustSwitch = true;
        }
      }

      if (mustSwitch && !cantSwitch) {
        let t = black;
        black = white;
        white = t;
      }
    }

    return new Game(black, white, handicap, k);
  }

  getHandicapGap(): number {
    return this.handicapGap;
  }

  getIntraStateGap(): number {
    return this.intraStateGap;
  }

  getIntraCityGap(): number {
    return this.intraCityGap;
  }

  getIntraClubGap(): number {
    return this.intraClubGap;
  }

  getPlayers(): PlayerList {
    return this.players;
  }

  getTotalRounds(): number {
    return this.totalRounds;
  }

  isBalanceColors(): boolean {
    return this.balanceColors;
  }
}
