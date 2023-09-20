import { Game, Result } from "./game";

export class Player {
  id: number;
  rating: number;
  games: Game[];
  initialScore: number;
  roundScores: number[];
  score: number;
  state: string;
  city: string;
  chapter: string;

  getColorImbalance(): number {
    let imbalance = 0;

    for (let g of this.games) {
      if (!g.isBye()) {
        if (g.getBlack() == this) imbalance++;
        else if (g.getWhite() == this) imbalance--;
        else throw "Error";
      }
    }

    return imbalance;
  }

  getScore(roundNum?: number): number {
    if (roundNum == undefined) {
      return this.score;
    }

    if (roundNum < 0) return this.initialScore;
    if (roundNum >= this.roundScores.length) {
      if (this.roundScores.length == 0) return this.initialScore;
      return this.roundScores[this.roundScores.length - 1];
    }
    return this.roundScores[roundNum];
  }

  getGame(round: number): Game {
    let g = this.games[round];
    if (g != null) return g;

    g = new Game(this, this, 0, 0);
    g.setRoundNum(round);
    g.setResult(Result.NoGame);
    return g;
  }

  getLastGames(num: number): Game[] {
    let lastGames = [];
    for (let round = this.games.length - 1; round >= 0; round--) {
      let g = this.getGame(round);
      if (!g.isBye()) {
        lastGames.push(g);
        if (lastGames.length == num) return lastGames;
      }
    }

    return null;
  }

  hasPlayed(p: Player): boolean {
    for (let g of this.games) {
      if (g.getBlack() == p || g.getWhite() == p) return true;
    }

    return false;
  }

  getId(): number {
    return this.id;
  }

  getRating(): number {
    return this.rating;
  }

  getState(): string {
    return this.state;
  }

  getCity(): string {
    return this.city;
  }

  getChapter(): string {
    return this.chapter;
  }
}
