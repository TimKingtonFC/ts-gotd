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
  intraCityGap: number = 0.36;
  intraClubGap: number = 0.56;
  intraFamilyGap: number = 0.81;
  handicapGap: number = 0.3;
  totalRounds: number = 3;
  handicapType: HandicapType = HandicapType.MinusOne;

  calculateHandicap(black: Player, white: Player): number {
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

    if (this.balanceColors && handicap == 0) {
      let mustSwitch = false;
      let cantSwitch = false;

      //	Try not to get same color three in a row
      let lastTwo = black.getLastGames(2);
      if (lastTwo != null) {
        mustSwitch =
          mustSwitch ||
          (lastTwo[0].getBlackId() == black.id && lastTwo[1].getBlackId() == black.id);
        cantSwitch =
          cantSwitch ||
          (lastTwo[0].getWhiteId() == black.id && lastTwo[1].getWhiteId() == black.id);
      }

      lastTwo = white.getLastGames(2);
      if (lastTwo != null) {
        mustSwitch =
          mustSwitch ||
          (lastTwo[0].getWhiteId() == white.id && lastTwo[1].getWhiteId() == white.id);
        cantSwitch =
          cantSwitch ||
          (lastTwo[0].getBlackId() == white.id && lastTwo[1].getBlackId() == white.id);
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

    return new Game(black.id, white.id, handicap);
  }

  getHandicapGap(): number {
    return this.handicapGap;
  }
  setHandicapGap(gap: number) {
    this.handicapGap = gap;
  }

  getHandicapType(): HandicapType {
    return this.handicapType;
  }
  setHandicapType(handicapType: HandicapType) {
    this.handicapType = handicapType;
  }

  getIntraStateGap(): number {
    return this.intraStateGap;
  }
  setIntraStateGap(gap: number) {
    this.intraStateGap = gap;
  }

  getIntraCityGap(): number {
    return this.intraCityGap;
  }
  setIntraCityGap(gap: number) {
    this.intraCityGap = gap;
  }

  getIntraClubGap(): number {
    return this.intraClubGap;
  }
  setIntraClubGap(gap: number) {
    this.intraClubGap = gap;
  }

  getIntraFamilyGap(): number {
    return this.intraClubGap;
  }
  setIntraFamilyGap(gap: number) {
    this.intraFamilyGap = gap;
  }

  getTotalRounds(): number {
    return this.totalRounds;
  }
  setTotalRounds(totalRounds: number) {
    this.totalRounds = totalRounds;
  }

  isBalanceColors(): boolean {
    return this.balanceColors;
  }
  setBalanceColors(balanceColors: boolean) {
    this.balanceColors = balanceColors;
  }
}
