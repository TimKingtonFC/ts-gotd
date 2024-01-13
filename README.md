# go-pairer

`go-pairer` is a library for pairing Go tournaments.  It efficiently computes an optimal weighted pairing.

## Tournament Settings

```typescript
let t = new Tournament();
t.setHandicapType(HandicapType.FullHandicap);
```

The `Tournament` object holds the tournament settings.  The most important setting is handicap type, which defaults to rank difference - 1.

`go-pairer` assigns penalties when possible matches are not optimal for one reason or another, and then finds the set of matches for the next rounds that minimizes the penalties.  The size of some penalties can be adjusted in the `Tournament` object, e.g. `t.setIntraStateGap(0.2)`  The penalties and defaults are:

```plaintext
Playing someone whose tournament score is different: 10000 * <score difference>^2
Playing the same color three times in a row: 15000
Playing someone with a different score in the same direction twice in a row: 17500
Playing a game that requires a handicap: <handicap size>^2 * 10000 * <handicap gap>
Playing someone from the same family/club/city/state: 1000 * <intraFamily/Club/City/State gap>

Defaults:
  handicapGap: 0.3;
  intraStateGap: 0;
  intraCityGap: 0.36;
  intraClubGap: 0.56;
  intraFamilyGap: 0.81;
```

## Players

```typescript
let p = new Player(id, initialScore, rating);
```

`Player` objects are created with a unique id, an initial score, and a rating.  The initial score can be used to give stronger players an advantage in the tournament.  The rating is an AGA rating: -1.9 to -1 is 1k, 1 to 1.9 is 1d, etc.  You can also set the state/city/club/family to avoid matchups with familiar players, e.g. `p.setState("Ohio")`.

## Games

```typescript
let g = new Game(blackId, whiteId, handicap);
```

`Game` objects are created with their player ids and the handicap.  Each game's result should also be set, e.g. `g.setResult(Result.WhiteWin)`.  If a player had a bye, create a game with that player as both Black and White, and a result of `Result.VoluntaryBye` or `Result.InvoluntaryBye`.  An involuntary bye counts as a win for the purposes of scoring.  A voluntary bye counts as a loss (doesn't increase the players score).

## Pairing Example

Here's an example of how to compute the pairing for the next round.  This is a tournament for six players, in which two rounds have already been played.

```typescript
let alg = new WeightedPairingAlgorithm();
let t = new Tournament();
t.setHandicapType(HandicapType.FullHandicap);

// Create player list.  There must be an even number of players.  If a player has a bye this round,
// don't include them in the list.
// new Player(id, initialScore, rating)
let p1 = new Player(1, 0, 6.5); // 6d
let p2 = new Player(2, 0, 5.5); // 5d
let p3 = new Player(3, 0, 2.3); // 2d
let p4 = new Player(4, 0, 2.1); // 2d
let p5 = new Player(5, 0, 1.7); // 1d
let p6 = new Player(6, 0, 1.1); // 1d
let players = [p1, p2, p3, p4, p5, p6];

// Create games from previous rounds.
let round1Games = [
    // new Game(blackId, whiteId, handicap, result)
    new Game(2, 1, 1, Result.BlackWin),
    new Game(3, 4, 0, Result.BlackWin),
    new Game(5, 6, 0, Result.WhiteWin)
];
let round2Games = [
    new Game(3, 1, 0, Result.WhiteWin),
    new Game(2, 6, 0, Result.WhiteWin),
    new Game(4, 5, 0, Result.BlackWin)
];
let games = [round1Games, round2Games];

// Create array to hold new games, and do pairing.
let newGames = [];
alg.doPairing(t, players, games, newGames);

// newGames now contains game objects for next round with blackId, whiteId, and handicap populated.
```
