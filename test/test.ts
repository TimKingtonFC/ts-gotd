import assert = require("assert");
import { Player } from "../external/player";
import { Tournament } from "../external/tournament";
import { WeightedPairingAlgorithm } from "../weighted-pairing";

describe("Pairings", () => {
  it("should be able to pair some players", () => {
    let alg = new WeightedPairingAlgorithm();
    let newGames = [];
    let t = new Tournament();

    let players = [new Player(1, 0), new Player(2, 0)];
    assert(alg.doPairing(t, players, 0, newGames));
    assert.equal(newGames, []);
  });
});
