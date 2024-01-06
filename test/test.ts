import assert = require("assert");
import { Player } from "../external/player";
import { HandicapType, Tournament } from "../external/tournament";
import { WeightedPairingAlgorithm } from "../weighted-pairing";
import { Game } from "../external/game";
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

function g(p1: number, p2: number, h: number): ExpectedMatch {
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
    assert.deepEqual({ p1: act.black.id, p2: act.white.id, h: act.handicap }, exp);
  }
}

describe("Pairings", () => {
  it("should pair a game", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [p(1), p(2)];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(1, 2, 0)]);
  });

  it("should set handicaps correctly", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    // Make white stronger player, default handicap is diff-1.
    let players = [p(1, -1), p(2, -8)];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(2, 1, 6)]);

    newGames = [];
    players = [p(1, -8), p(2, -1)];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(1, 2, 6)]);

    // dan vs kyu
    newGames = [];
    players = [p(1, -2.5), p(2, 1.5)];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(1, 2, 1)]);

    // Full handicap
    t.setHandicapType(HandicapType.FullHandicap);
    players = [p(1, -8), p(2, -1)];
    newGames = [];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(1, 2, 7)]);

    // Diff - 2
    t.setHandicapType(HandicapType.MinusTwo);
    players = [p(1, -8), p(2, -1)];
    newGames = [];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(1, 2, 5)]);

    // No handicap
    t.setHandicapType(HandicapType.None);
    players = [p(1, -8), p(2, -1)];
    newGames = [];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(1, 2, 0)]);
  });


  it("should pair multiple games", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [p(1), p(2), p(3), p(4), p(5), p(6)];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(1, 4, 0), g(2, 5, 0), g(3, 6, 0)]);
  });

  it("should minimize handicaps", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [p(1, 5), p(2, 5), p(3, 3), p(4, 3), p(5, 7), p(6, 7)];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(1, 2, 0), g(3, 4, 0), g(5, 6, 0)]);
  });

  it("should handle sparse ids", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [p(11, 5), p(22, 5), p(33, 3), p(44, 3), p(55, 7), p(66, 7)];
    assert(alg.doPairing(t, players, 0, newGames));
    checkPairing(newGames, [g(11, 22, 0), g(33, 44, 0), g(55, 66, 0)]);
  });

  // TODO: Fix todos
});
