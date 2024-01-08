import assert = require("assert");
import { Player } from "../external/player";
import { HandicapType, Tournament } from "../external/tournament";
import { WeightedPairingAlgorithm } from "../weighted-pairing";
import { Game, Result } from "../external/game";
import exp = require("constants");

type ExpectedMatch = {
  p1: number;
  p2: number;
  h: number;
}

function p(id: number, rating?: number): Player {
  if (!rating) {
    rating = 5;
  }
  return new Player(id, 0, rating);
}

function g(bid: number, wid: number, res: Result): Game {
  let game = new Game(bid, wid, 0, 0);
  game.setResult(res);
  return game;
}

function m(p1: number, p2: number, h: number): ExpectedMatch {
  return { p1: p1, p2: p2, h: h };
}

function checkPairing(actual: Game[], expected: ExpectedMatch[]) {
  assert.equal(actual.length, expected.length, "wrong # of games");
  for (let i = 0; i < actual.length; i++) {
    let act = actual[i];
    if (act.handicap == -0) {
      act.handicap = 0;
    }
    let exp = expected[i];
    assert.deepEqual({ p1: act.black, p2: act.white, h: act.handicap }, exp);
  }
}

describe("Pairings", () => {
  it("should pair a game", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [p(1), p(2)];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(1, 2, 0)]);
  });

  it("should set handicaps correctly", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    // Make white stronger player, default handicap is diff-1.
    let players = [p(1, -1), p(2, -8)];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(2, 1, 6)]);

    newGames = [];
    players = [p(1, -8), p(2, -1)];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(1, 2, 6)]);

    // dan vs kyu
    newGames = [];
    players = [p(1, -2.5), p(2, 1.5)];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(1, 2, 1)]);

    // Full handicap
    t.setHandicapType(HandicapType.FullHandicap);
    players = [p(1, -8), p(2, -1)];
    newGames = [];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(1, 2, 7)]);

    // Diff - 2
    t.setHandicapType(HandicapType.MinusTwo);
    players = [p(1, -8), p(2, -1)];
    newGames = [];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(1, 2, 5)]);

    // No handicap
    t.setHandicapType(HandicapType.None);
    players = [p(1, -8), p(2, -1)];
    newGames = [];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(1, 2, 0)]);
  });


  it("should pair multiple games", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [p(1), p(2), p(3), p(4), p(5), p(6)];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(1, 4, 0), m(2, 5, 0), m(3, 6, 0)]);
  });

  it("should minimize handicaps", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [p(1, 5), p(2, 5), p(3, 3), p(4, 3), p(5, 7), p(6, 7)];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(1, 2, 0), m(3, 4, 0), m(5, 6, 0)]);
  });

  it("should handle sparse ids", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [p(11, 5), p(22, 5), p(33, 3), p(44, 3), p(55, 7), p(66, 7)];
    assert(alg.doPairing(t, players, [], newGames));
    checkPairing(newGames, [m(11, 22, 0), m(33, 44, 0), m(55, 66, 0)]);
  });

  it("shouldn't allow replays", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [p(1, 5), p(2, 5), p(3, 3), p(4, 3), p(5, 8), p(6, 8)];
    let games = [
      [g(1, 2, Result.BlackWin), g(3, 4, Result.BlackWin), g(5, 6, Result.WhiteWin)]
    ];
    assert(alg.doPairing(t, players, games, newGames));
    checkPairing(newGames, [m(3, 1, 1), m(2, 6, 2), m(4, 5, 4)]);

    players = [p(1, 5), p(2, 5), p(3, 3), p(4, 3), p(5, 8), p(6, 8)];
    games.push([g(3, 1, Result.WhiteWin), g(2, 6, Result.WhiteWin), g(4, 5, Result.BlackWin)]);
    newGames = [];
    assert(alg.doPairing(t, players, games, newGames));
    checkPairing(newGames, [m(1, 6, 2), m(4, 2, 1), m(3, 5, 4)]);
  });

  // TODO: Fix todos
});
