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
  club: string;
  family: string;

  constructor(id: number, initialScore: number, rating: number) {
    this.id = id;
    this.initialScore = initialScore;
    this.games = [];
    this.roundScores = [];
    this.score = initialScore;
    this.rating = rating;
  }

  addGame(g: Game) {
    this.games.push(g);
  }

  countWin(roundNum: number) {
    this.fillScores(roundNum);
    this.score++;
    this.roundScores.push(this.score);
  }

  countDraw(roundNum: number) {
    this.fillScores(roundNum);
    this.score += 0.5;
    this.roundScores.push(this.score);
  }

  countVoluntaryBye(roundNum: number) {
    this.fillScores(roundNum);
    this.roundScores.push(this.score);
  }

  fillScores(roundNum: number) {
    while (this.roundScores.length < roundNum)
      this.roundScores.push(this.score);
  }

  getColorImbalance(): number {
    let imbalance = 0;

    for (let g of this.games) {
      if (!g.isBye()) {
        if (g.getBlackId() == this.id) imbalance++;
        else if (g.getWhiteId() == this.id) imbalance--;
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

    g = new Game(this.id, this.id, 0);
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
      if (g.getBlackId() == p.id || g.getWhiteId() == p.id) return true;
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

  setState(state: string) {
    this.state = state;
  }

  getCity(): string {
    return this.city;
  }

  setCity(city: string) {
    this.city = city;
  }

  getClub(): string {
    return this.club;
  }

  setClub(chapter: string) {
    this.club = chapter;
  }

  getFamily(): string {
    return this.family;
  }

  setFamily(family: string) {
    this.family = family;
  }
}
