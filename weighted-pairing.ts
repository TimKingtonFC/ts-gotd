import { Game, Result } from "./external/game";
import { Player } from "./external/player";
import { Tournament } from "./external/tournament";
import { Graph } from "./graph";
import { Matcher } from "./matcher";

export class WeightedPairingAlgorithm {
  public addGames(players: Player[], games: Game[][]) {
    let playersById = new Map<Number, Player>();
    for (let p of players) {
      playersById.set(p.id, p);
    }

    for (let [roundNum, roundGames] of games.entries()) {
      for (let g of roundGames) {
        let black = playersById.get(g.getBlackId());
        if (!black) {
          throw new Error(`Couldn't find black player from game ${JSON.stringify(g)}`)
        }

        let white = playersById.get(g.getWhiteId());
        if (!white) {
          throw new Error(`Couldn't find white player in game ${JSON.stringify(g)}`)
        }

        black.addGame(g);
        if (white != black) {
          white.addGame(g);
        }

        switch (g.getResult()) {
          case Result.BlackWin:
          case Result.WhiteForfeit:
            black.countWin(roundNum);
            break;
          case Result.WhiteWin:
          case Result.BlackForfeit:
            white.countWin(roundNum);
            break;
          case Result.Draw:
            white.countDraw(roundNum);
            black.countDraw(roundNum);
            break;
          case Result.InvoluntaryBye:
            black.countWin(roundNum);
            break;
          case Result.DoubleForfeit:
            black.countVoluntaryBye(roundNum);
            white.countVoluntaryBye(roundNum);
            break;
          case Result.DoubleLoss:
          case Result.Void:
          case Result.VoluntaryBye:
            black.countVoluntaryBye(roundNum);
            break;
          case Result.NoGame:
          case Result.Unknown:
            break;
        }
      }
    }
  }

  public doPairing(
    tournament: Tournament,
    players: Player[],
    games: Game[][],
    newGames: Game[]
  ): boolean {
    let roundNum = games.length;
    this.addGames(players, games);

    players.sort(scoreAndRatingComparator);

    this.createEdges(players);

    //	Assign penalty for cross-band play
    for (let i = 0; i < players.length; i++) {
      let p = players[i];
      for (let j = i + 1; j < players.length; j++) {
        let p2 = players[j];
        let e = this.getEdge(p, p2);
        let deltaScore = Math.abs(p.getScore() - p2.getScore());
        e.weight -= 10000 * deltaScore * deltaScore;
      }
    }

    if (tournament.isBalanceColors() && roundNum > 1) {
      //    Assign penalty to avoid pairings that force same color three in a row
      for (let i = 0; i < players.length; i++) {
        let p = players[i];
        let lastTwo = p.getLastGames(2);
        if (lastTwo == null) continue;

        let prev = lastTwo[0];
        let twoBack = lastTwo[1];
        let pMustBeBlack = prev.getWhiteId() == p.id && twoBack.getWhiteId() == p.id;
        let pMustBeWhite = prev.getBlackId() == p.id && twoBack.getBlackId() == p.id;

        for (let j = i + 1; j < players.length; j++) {
          let p2 = players[j];
          lastTwo = p2.getLastGames(2);
          if (lastTwo == null) continue;

          prev = lastTwo[0];
          twoBack = lastTwo[1];
          let p2MustBeBlack = prev.getWhiteId() == p2.id && twoBack.getWhiteId() == p2.id;
          let p2MustBeWhite = prev.getBlackId() == p2.id && twoBack.getBlackId() == p2.id;

          if (
            (pMustBeBlack && p2MustBeBlack) ||
            (pMustBeWhite && p2MustBeWhite)
          ) {
            let e = this.getEdge(p, p2);
            e.weight -= 15000;
          }
        }
      }
    }

    //	Avoid floating in same direction twice in a row
    let numRounds = tournament.getTotalRounds();
    if (
      (numRounds > 5 && roundNum < numRounds - 2) ||
      (numRounds < 6 && roundNum < numRounds - 1)
    ) {
      for (let i = 0; i < players.length; i++) {
        let p = players[i];
        let prevList = p.getLastGames(1);
        if (prevList == null) continue;

        let prev = prevList[0];
        let floatDir = prev.getFloat(p, players);
        if (floatDir == 0) continue;

        for (let j = 0; j < players.length; j++) {
          if (j == i) continue;

          let p2 = players[j];
          let diff = Math.floor(p2.getScore() - p.getScore());

          if (Math.sign(diff) == Math.sign(floatDir)) {
            let e = this.getEdge(p, p2);
            e.weight -= 17500;
          }
        }
      }
    }

    if (roundNum < tournament.getTotalRounds() / 2) {
      //	Assign penalty for intra-state/city/club/family play
      let statePenalty =
        tournament.getIntraStateGap() * 10000;
      let cityPenalty =
        tournament.getIntraCityGap() * 10000;
      let clubPenalty =
        tournament.getIntraClubGap() * 10000;
      let familyPenalty =
        tournament.getIntraFamilyGap() * 10000;

      for (let i = 0; i < players.length; i++) {
        let p = players[i];
        for (let j = i + 1; j < players.length; j++) {
          let p2 = players[j];
          let e = this.getEdge(p, p2);

          let state = p.getState();
          let city = p.getCity();
          let club = p.getClub();
          let family = p.getFamily();
          let state2 = p2.getState();
          let city2 = p2.getCity();
          let club2 = p2.getClub();
          let family2 = p2.getFamily();

          if (family && family === family2) {
            e.weight -= familyPenalty;
          } else if (club && club.toLowerCase() !== "none" && club === club2)
            e.weight -= clubPenalty;
          else if (state === state2) {
            if (city && city === city2) e.weight -= cityPenalty;
            else e.weight -= statePenalty;
          }
        }
      }

      //	Minimize Handicap
      for (let i = 0; i < players.length; i++) {
        let p = players[i];
        for (let j = i + 1; j < players.length; j++) {
          let p2 = players[j];
          let e = this.getEdge(p, p2);

          let handi = Math.abs(tournament.calculateHandicap(p, p2));
          let penalty = Math.floor(
            handi * handi * 10000 * tournament.getHandicapGap()
          );
          e.weight -= penalty;
        }
      }
    }

    //	Group by score
    let groups: Player[][] = [[]];
    let curGroupScore = Number.MIN_VALUE;
    let curGroup: Player[] = [];
    for (let p of players) {
      if (p.getScore() != curGroupScore) {
        curGroup = [];
        groups.push(curGroup);
        curGroupScore = p.getScore();
      }

      curGroup.push(p);
    }

    this.doSlidePairing(groups);

    //	Make sure players don't play twice
    for (let i = 0; i < players.length; i++) {
      let p = players[i];
      for (let j = i + 1; j < players.length; j++) {
        let p2 = players[j];
        if (p.hasPlayed(p2)) this.removeEdge(p, p2);
      }
    }

    let maxId = -1;
    for (let p of players) maxId = Math.max(maxId, p.getId());

    let g = new Graph(maxId);
    let edges = [];
    for (let id in this.edges) {
      let e: Edge = this.edges[id];
      g.addEdge(e.srcId, e.destId, e.weight);
    }

    let matcher = new Matcher();
    let matches = matcher.weightedMatch(g, true);

    for (let i = 1; i < matches.length - 1; i++) {
      if (i > matches[i]) continue;

      let black = players.find((p) => p.id === i);
      let white = players.find((p) => p.id === matches[i]);
      newGames.push(tournament.createMatch(black, white));
    }

    return newGames.length == players.length / 2;
  }

  doSlidePairing(groups: Player[][]) {
    for (let i = 0; i < groups.length; i++) {
      let group = groups[i];
      let split = group.length / 2;

      for (let j = 0; j < group.length; j++) {
        let p = group[j];
        let pLeft = j < split;
        let pIndex = j;
        if (!pLeft) pIndex -= split;

        for (let k = 0; k < group.length; k++) {
          if (j == k) continue;

          let p2 = group[k];
          let p2Left = k < split;
          let p2Index = k;
          if (!p2Left) p2Index -= split;

          let penalty;
          if (pLeft != p2Left) {
            let deltaPos = Math.abs(pIndex - p2Index);
            penalty = deltaPos * deltaPos;
          } else {
            //	Max penalty for shifts on right is less than (n/2) ^ 2
            penalty = split * split;
          }

          let e = this.getEdge(p, p2);
          e.weight -= penalty;
        }
      }
    }
  }

  createEdges(players: Player[]) {
    this.edges = [];

    for (let i = 0; i < players.length; i++) {
      let p = players[i];
      for (let j = i + 1; j < players.length; j++) {
        let p2 = players[j];

        let e = new Edge(p, p2);
        let id = makeId(p, p2);
        if (this.edges[id] != null) throw "Error";
        this.edges[id] = e;
      }
    }
  }

  edges: Edge[];

  getEdge(p: Player, p2: Player): Edge {
    if (p.getId() == p2.getId()) throw "Error";
    return this.edges[makeId(p, p2)];
  }

  removeEdge(p: Player, p2: Player) {
    let id = makeId(p, p2);
    if (this.edges[id] == null) throw "Error";
    delete this.edges[id];
  }
}

class Edge {
  public srcId: number;
  public destId: number;
  public weight: number = 2000000000;

  public constructor(p: Player, p2: Player) {
    this.srcId = p.getId();
    this.destId = p2.getId();
  }
}

function makeId(p: Player, p2: Player): number {
  let id1 = p.getId();
  let id2 = p2.getId();
  return Math.min(id1, id2) + 100000 * Math.max(id1, id2);
}

function scoreAndRatingComparator(arg0: Player, arg1: Player): number {
  let diff = arg1.getScore() - arg0.getScore();
  if (diff < 0) return -1;
  if (diff > 0) return 1;

  diff = arg1.getRating() - arg0.getRating();
  if (diff < 0) return -1;
  if (diff > 0) return 1;
  return 0;
}
