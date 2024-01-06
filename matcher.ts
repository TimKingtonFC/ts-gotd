import { Edge, Graph } from "./graph";

const MAXWT = 100000000000;

export class Matcher {
  A: number[];
  END: number[];
  NEXTPAIR: number[];
  WEIGHT: number[];
  MATE: number[];
  LINK: number[];
  BASE: number[];
  NEXTVTX: number[];
  LASTVTX: number[];
  NEXTEDGE: number[];
  NEXT_D: number[];
  Y: number[];
  LAST_D: number = 0;
  DELTA: number = 0;

  LASTEDGE: number[] = [0, 0, 0];

  DUMMYVERTEX: number = 0;
  DUMMYEDGE: number = 0;
  U: number = 0;
  V: number = 0;

  newbase: number = 0;
  oldbase: number = 0;
  nextbase: number = 0;
  stopscan: number = 0;
  pairpoint: number = 0;
  neighbor: number = 0;
  nextpoint: number = 0;
  newlast: number = 0;
  newmate: number = 0;
  oldmate: number = 0;
  oldfirst: number = 0;
  firstmate: number = 0;
  secondmate: number = 0;
  f: number = 0;
  nextedge: number = 0;
  nexte: number = 0;
  nextu: number = 0;

  v: number = 0;
  i: number = 0;
  e: number = 0;

  weightedMatch(gptr: Graph, maximize: boolean): number[] {
    let g: number, j: number, w: number, outcome: number;
    let loop: number = 1;

    /* set up internal data structure */
    this.SetUp(gptr);
    this.Initialize(maximize);

    outer: for (; ;) {
      /* printf("Augment #%d\n",loop++); */
      this.DELTA = 0;
      for (this.v = 1; this.v <= this.U; ++this.v)
        if (this.MATE[this.v] == this.DUMMYEDGE)
          this.POINTER(this.DUMMYVERTEX, this.v, this.DUMMYEDGE);
      for (; ;) {
        this.i = 1;
        for (j = 2; j <= this.U; ++j)
          if (this.NEXT_D[this.i] > this.NEXT_D[j]) this.i = j;
        this.DELTA = this.NEXT_D[this.i];
        if (this.DELTA == this.LAST_D) break outer;
        this.v = this.BASE[this.i];
        if (this.LINK[this.v] >= 0) {
          outcome = this.PAIR();
          if (outcome == 1) break;
        } else {
          w = this.BMATE(this.v);
          if (this.LINK[w] < 0) {
            this.POINTER(this.v, w, this.OPPEDGE(this.NEXTEDGE[this.i]));
          } else this.UNPAIR(this.v, w);
        }
      }

      this.LAST_D -= this.DELTA;
      this.SET_BOUNDS();
      g = this.OPPEDGE(this.e);
      this.REMATCH(this.BEND(this.e), g);
      this.REMATCH(this.BEND(g), this.e);
    }

    //done:
    this.SET_BOUNDS();
    this.UNPAIR_ALL();
    for (this.i = 1; this.i <= this.U; ++this.i) {
      this.MATE[this.i] = this.END[this.MATE[this.i]];
      if (this.MATE[this.i] == this.DUMMYVERTEX) this.MATE[this.i] = 0;
    }

    // FreeUp();
    return this.MATE;
  }

  SetUp(g: Graph) {
    let i: number;

    this.U = g.Degree(0);
    this.V = g.numEdges();

    this.A = [];
    this.END = [];
    this.WEIGHT = [];

    for (i = 0; i < this.U + 2 * this.V + 2; i++)
      this.WEIGHT[i] = this.A[i] = this.END[i] = 0;

    this.SetStandard(g);
  }

  /* set up from Type 1 graph. */

  SetStandard(graph: Graph) {
    let adj_node: number, i: number, j: number;
    let elabel: number;
    let u: number, v: number, currentedge: number;
    let edge: Edge;

    currentedge = this.U + 2;
    for (i = 1; i <= this.U; ++i) {
      edge = graph.FirstEdge(i);
      for (j = 1; j <= graph.Degree(i); ++j) {
        adj_node = edge.endpoint;
        if (i < adj_node) {
          elabel = edge.label * 2;
          this.WEIGHT[currentedge - 1] = this.WEIGHT[currentedge] = 2 * elabel;
          this.END[currentedge - 1] = i;
          this.END[currentedge] = adj_node;
          if (this.A[i] == 0) this.A[i] = currentedge;
          else {
            u = i;
            v = this.A[i];
            while (v != 0) {
              if (this.END[v] > adj_node) break;
              u = v;
              v = this.A[v];
            }
            this.A[u] = currentedge;
            this.A[currentedge] = v;
          }
          u = adj_node;
          v = this.A[u];
          while (v != 0) {
            u = v;
            v = this.A[v];
          }
          this.A[u] = currentedge - 1;
          currentedge += 2;
        }
        edge = edge.nextedge;
      }
    }
  }

  Initialize(maximize: boolean) {
    let i: number;
    let max_wt: number = -MAXWT,
      min_wt: number = MAXWT;

    this.DUMMYVERTEX = this.U + 1;
    this.DUMMYEDGE = this.U + 2 * this.V + 1;
    this.END[this.DUMMYEDGE] = this.DUMMYVERTEX;

    for (i = this.U + 2; i <= this.U + 2 * this.V; i += 2) {
      if (this.WEIGHT[i] > max_wt) max_wt = this.WEIGHT[i];
      if (this.WEIGHT[i] < min_wt) min_wt = this.WEIGHT[i];
    }
    if (!maximize) {
      if (this.U % 2 != 0) {
        throw "Must have an even number of vertices to do a minimum complete matching.\n";
      }
      max_wt += 2; /* Don't want all zero weight */
      for (i = this.U + 1; i <= this.U + 2 * this.V; i++)
        this.WEIGHT[i] = max_wt - this.WEIGHT[i];
      max_wt = max_wt - min_wt;
    }
    this.LAST_D = max_wt / 2;

    let array = (size) => {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(0);
      }
      return a;
    }
    let allocsize = this.U + 2;
    this.MATE = array(allocsize);
    this.LINK = array(allocsize);
    this.BASE = array(allocsize);
    this.NEXTVTX = array(allocsize);
    this.LASTVTX = array(allocsize);
    this.Y = array(allocsize);
    this.NEXT_D = array(allocsize);
    this.NEXTEDGE = array(allocsize);
    allocsize = (this.U + 2 * this.V + 2);
    this.NEXTPAIR = array(allocsize);

    for (i = 1; i <= this.U + 1; ++i) {
      this.MATE[i] = this.DUMMYEDGE;
      this.NEXTEDGE[i] = this.DUMMYEDGE;
      this.NEXTVTX[i] = 0;
      this.LINK[i] = -this.DUMMYEDGE;
      this.BASE[i] = i;
      this.LASTVTX[i] = i;
      this.Y[i] = this.LAST_D;
      this.NEXT_D[i] = this.LAST_D;
    }
  }

  /* Assign a this.pointer link to a vertex. Edge e joins a vertex in blossom */
  /* u to a linked vertex. */

  POINTER(u: number, v: number, e: number) {
    let i: number;
    let del: number;

    // printf("this.Pointer u,v,e=%d %d %d-%d\n",u,v,END[OPPEDGE(e)],END[e]);

    this.LINK[u] = -this.DUMMYEDGE;
    this.NEXTVTX[this.LASTVTX[u]] = this.DUMMYVERTEX;
    this.NEXTVTX[this.LASTVTX[v]] = this.DUMMYVERTEX;

    if (this.LASTVTX[u] != u) {
      i = this.MATE[this.NEXTVTX[u]];
      del = -this.SLACK(i) / 2;
    } else del = this.LAST_D;

    i = u;
    while (i != this.DUMMYVERTEX) {
      this.Y[i] += del;
      this.NEXT_D[i] += del;
      i = this.NEXTVTX[i];
    }
    if (this.LINK[v] < 0) {
      this.LINK[v] = e;
      this.NEXTPAIR[this.DUMMYEDGE] = this.DUMMYEDGE;
      this.SCAN(v, this.DELTA);
      return;
    } else {
      this.LINK[v] = e;
      return;
    }
  }

  /* Scan each vertex in the blossom whose base is x */

  SCAN(x: number, del: number) {
    let u: number;
    let del_e: number;

    // printf("Scan del=%d x=%d\n",del,x);

    this.newbase = this.BASE[x];
    this.stopscan = this.NEXTVTX[this.LASTVTX[x]];
    while (x != this.stopscan) {
      this.Y[x] += del;
      this.NEXT_D[x] = this.LAST_D;
      this.pairpoint = this.DUMMYEDGE;
      this.e = this.A[x];
      while (this.e != 0) {
        this.neighbor = this.END[this.e];
        u = this.BASE[this.neighbor];
        if (this.LINK[u] < 0) {
          if (this.LINK[this.BMATE(u)] < 0 || this.LASTVTX[u] != u) {
            del_e = this.SLACK(this.e);
            if (this.NEXT_D[this.neighbor] > del_e) {
              this.NEXT_D[this.neighbor] = del_e;
              this.NEXTEDGE[this.neighbor] = this.e;
            }
          }
        } else if (u != this.newbase) {
          this.INSERT_PAIR();
        }
        this.e = this.A[this.e];
      }
      x = this.NEXTVTX[x];
    }
    this.NEXTEDGE[this.newbase] = this.NEXTPAIR[this.DUMMYEDGE];
  }

  /* Process an edge linking two linked vertices */
  /* Note: global variable v set to the base of one end of the linking edge */

  PAIR(): number {
    let u: number, w: number, temp: number;

    // console.log("pair " + this.v);

    this.e = this.NEXTEDGE[this.v];
    while (this.SLACK(this.e) != 2 * this.DELTA) this.e = this.NEXTPAIR[this.e];
    w = this.BEND(this.e);
    this.LINK[this.BMATE(w)] = -this.e;
    u = this.BMATE(this.v);
    while (this.LINK[u] != -this.e) {
      this.LINK[u] = -this.e;
      if (this.MATE[w] != this.DUMMYEDGE) {
        temp = this.v;
        this.v = w;
        w = temp;
      }
      this.v = this.BLINK(this.v);
      u = this.BMATE(this.v);
    }
    if (u == this.DUMMYVERTEX && this.v != w) {
      // *outcome = 1;
      return 1;
    }
    this.newlast = this.v;
    this.newbase = this.v;
    this.oldfirst = this.NEXTVTX[this.v];
    this.LINK_PATH(this.e);
    this.LINK_PATH(this.OPPEDGE(this.e));
    this.NEXTVTX[this.newlast] = this.oldfirst;
    if (this.LASTVTX[this.newbase] == this.newbase)
      this.LASTVTX[this.newbase] = this.newlast;
    this.NEXTPAIR[this.DUMMYEDGE] = this.DUMMYEDGE;
    this.MERGE_PAIRS(this.newbase);
    this.i = this.NEXTVTX[this.newbase];
    do {
      this.MERGE_PAIRS(this.i);
      this.i = this.NEXTVTX[this.LASTVTX[this.i]];
      this.SCAN(this.i, 2 * this.DELTA - this.SLACK(this.MATE[this.i]));
      this.i = this.NEXTVTX[this.LASTVTX[this.i]];
    } while (this.i != this.oldfirst);
    // *outcome = 0;
    return 0;
  }

  /* merges a subblossom's pair list into a new blossom's pair list */
  /* v is the base of the previously unlinked subblossom */
  /* Note: global variable newbase set to the base of the new blossom */
  /* called with NEXTPAIR[this.DUMMYEDGE] pointing to the first edge */
  /* on newbase's pair list */

  MERGE_PAIRS(v: number) {
    // printf("Merge Pairs v=%d\n",v);

    this.NEXT_D[v] = this.LAST_D;
    this.pairpoint = this.DUMMYEDGE;
    this.f = this.NEXTEDGE[v];
    while (this.f != this.DUMMYEDGE) {
      this.e = this.f;
      this.neighbor = this.END[this.e];
      this.f = this.NEXTPAIR[this.f];
      if (this.BASE[this.neighbor] != this.newbase) this.INSERT_PAIR();
    }
  }

  /* links the unlinked vertices in the path P(END[e],newbase) */
  /*
   * Note: global variable newbase is set to the base vertex of the new
   * blossom
   */
  /* newlast is set to the last vertex in newbase's current blossom */

  LINK_PATH(e: number) {
    let u: number;

    // printf("Link Path e=%d-%d\n", END[OPPEDGE(e)], END[e]);

    this.v = this.BEND(e);
    while (this.v != this.newbase) {
      u = this.BMATE(this.v);
      this.LINK[u] = this.OPPEDGE(e);
      this.NEXTVTX[this.newlast] = this.v;
      this.NEXTVTX[this.LASTVTX[this.v]] = u;
      this.newlast = this.LASTVTX[u];
      this.i = this.v;
      this.BASE[this.i] = this.newbase;
      this.i = this.NEXTVTX[this.i];
      while (this.i != this.DUMMYVERTEX) {
        this.BASE[this.i] = this.newbase;
        this.i = this.NEXTVTX[this.i];
      }
      e = this.LINK[this.v];
      this.v = this.BEND(e);
    }
  }

  /* Update a blossom's pair list. */
  /* Note: called with global variable e set to the edge to be inserted. */
  /* neighbor set to the vertex at the end of e */
  /* pairpoint set to the next pair on the pair list */

  INSERT_PAIR() {
    let del_e: number;

    // printf("Insert Pair e=%d-%d\n",END[OPPEDGE(e)],END[e]);

    del_e = this.SLACK(this.e) / 2;
    this.nextpoint = this.NEXTPAIR[this.pairpoint];

    while (this.END[this.nextpoint] < this.neighbor) {
      this.pairpoint = this.nextpoint;
      this.nextpoint = this.NEXTPAIR[this.nextpoint];
    }
    if (this.END[this.nextpoint] == this.neighbor) {
      if (del_e >= this.SLACK(this.nextpoint) / 2) return;
      this.nextpoint = this.NEXTPAIR[this.nextpoint];
    }
    this.NEXTPAIR[this.pairpoint] = this.e;
    this.pairpoint = this.e;
    this.NEXTPAIR[this.e] = this.nextpoint;
    if (this.NEXT_D[this.newbase] > del_e) this.NEXT_D[this.newbase] = del_e;
  }

  /* Expands a blossom. Fixes up LINK and MATE. */

  UNPAIR(oldbase: number, oldmate: number) {
    let e: number, newbase: number, u: number;

    // printf("Unpair oldbase, oldmate=%d %d\n",oldbase, oldmate);

    this.UNLINK(oldbase);
    newbase = this.BMATE(oldmate);
    if (newbase != oldbase) {
      this.LINK[oldbase] = -this.DUMMYEDGE;
      this.REMATCH(newbase, this.MATE[oldbase]);
      if (this.f == this.LASTEDGE[1])
        this.LINK[this.secondmate] = -this.LASTEDGE[2];
      else this.LINK[this.secondmate] = -this.LASTEDGE[1];
    }
    e = this.LINK[oldmate];
    u = this.BEND(this.OPPEDGE(e));
    if (u == newbase) {
      this.POINTER(newbase, oldmate, e);
      return;
    }
    this.LINK[this.BMATE(u)] = -e;
    do {
      e = -this.LINK[u];
      this.v = this.BMATE(u);
      this.POINTER(u, this.v, -this.LINK[this.v]);
      u = this.BEND(e);
    } while (u != newbase);
    e = this.OPPEDGE(e);
    this.POINTER(newbase, oldmate, e);
  }

  /* changes the matching along an alternating path */
  /* firstmate is the first base vertex on the path */
  /* edge e is the new matched edge for firstmate */

  REMATCH(firstmate: number, e: number) {
    // printf("this.Rematch firstmate=%d e=%d-%d\n",firstmate, END[OPPEDGE(e)],
    // END[e]);

    this.MATE[firstmate] = e;
    this.nexte = -this.LINK[firstmate];
    while (this.nexte != this.DUMMYEDGE) {
      e = this.nexte;
      this.f = this.OPPEDGE(e);
      firstmate = this.BEND(e);
      this.secondmate = this.BEND(this.f);
      this.nexte = -this.LINK[firstmate];
      this.LINK[firstmate] = -this.MATE[this.secondmate];
      this.LINK[this.secondmate] = -this.MATE[firstmate];
      this.MATE[firstmate] = this.f;
      this.MATE[this.secondmate] = e;
    }
  }

  /* unlinks subblossoms in a blossom. oldbase is the base of the blossom to */
  /* be unlinked. */

  UNLINK(oldbase: number) {
    let k: number,
      j: number = 1;

    // printf("Unlink oldbase=%d\n",oldbase);

    this.i = this.NEXTVTX[oldbase];
    this.newbase = this.NEXTVTX[oldbase];
    this.nextbase = this.NEXTVTX[this.LASTVTX[this.newbase]];
    this.e = this.LINK[this.nextbase];

    UL2: do {
      do {
        this.nextedge = this.OPPEDGE(this.LINK[this.newbase]);
        for (k = 1; k <= 2; ++k) {
          this.LINK[this.newbase] = -this.LINK[this.newbase];
          this.BASE[this.i] = this.newbase;
          this.i = this.NEXTVTX[this.i];
          while (this.i != this.nextbase) {
            this.BASE[this.i] = this.newbase;
            this.i = this.NEXTVTX[this.i];
          }
          this.newbase = this.nextbase;
          this.nextbase = this.NEXTVTX[this.LASTVTX[this.newbase]];
        }
      } while (this.LINK[this.nextbase] == this.nextedge);

      if (j == 1) {
        this.LASTEDGE[1] = this.nextedge;
        j++;
        this.nextedge = this.OPPEDGE(this.e);
        if (this.LINK[this.nextbase] == this.nextedge) {
          continue UL2;
        }
      }
    } while (false);
    this.LASTEDGE[2] = this.nextedge;

    if (this.BASE[this.LASTVTX[oldbase]] == oldbase)
      this.NEXTVTX[oldbase] = this.newbase;
    else {
      this.NEXTVTX[oldbase] = this.DUMMYVERTEX;
      this.LASTVTX[oldbase] = oldbase;
    }
  }

  /* updates numerical bounds for linking paths. */
  /* called with this.LAST_D set to the bound on DELTA for the next search */

  SET_BOUNDS() {
    let del: number;

    for (this.v = 1; this.v <= this.U; ++this.v) {
      if (this.LINK[this.v] < 0 || this.BASE[this.v] != this.v) {
        this.NEXT_D[this.v] = this.LAST_D;
        continue;
      }
      this.LINK[this.v] = -this.LINK[this.v];
      this.i = this.v;
      while (this.i != this.DUMMYVERTEX) {
        this.Y[this.i] -= this.DELTA;
        this.i = this.NEXTVTX[this.i];
      }
      this.f = this.MATE[this.v];
      if (this.f != this.DUMMYEDGE) {
        this.i = this.BEND(this.f);
        del = this.SLACK(this.f);
        while (this.i != this.DUMMYVERTEX) {
          this.Y[this.i] -= del;
          this.i = this.NEXTVTX[this.i];
        }
      }
      this.NEXT_D[this.v] = this.LAST_D;
    }
  }

  /* undoes all blossoms to get the final matching */

  UNPAIR_ALL() {
    let u: number;

    for (this.v = 1; this.v <= this.U; ++this.v) {
      if (this.BASE[this.v] != this.v || this.LASTVTX[this.v] == this.v)
        continue;
      this.nextu = this.v;
      this.NEXTVTX[this.LASTVTX[this.nextu]] = this.DUMMYVERTEX;
      while (true) {
        u = this.nextu;
        this.nextu = this.NEXTVTX[this.nextu];
        this.UNLINK(u);
        if (this.LASTVTX[u] != u) {
          this.f =
            this.LASTEDGE[2] == this.OPPEDGE(this.e)
              ? this.LASTEDGE[1]
              : this.LASTEDGE[2];
          this.NEXTVTX[this.LASTVTX[this.BEND(this.f)]] = u;
        }
        this.newbase = this.BMATE(this.BMATE(u));
        if (this.newbase != this.DUMMYVERTEX && this.newbase != u) {
          this.LINK[u] = -this.DUMMYEDGE;
          this.REMATCH(this.newbase, this.MATE[u]);
        }
        while (
          this.LASTVTX[this.nextu] == this.nextu &&
          this.nextu != this.DUMMYVERTEX
        )
          this.nextu = this.NEXTVTX[this.nextu];
        if (
          this.LASTVTX[this.nextu] == this.nextu &&
          this.nextu == this.DUMMYVERTEX
        )
          break;
      }
    }
  }

  /* the number of the blossom entered by edge e */
  // #define BEND(e) (BASE[END[e]])
  BEND(e: number): number {
    return this.BASE[this.END[e]];
  }

  /* the blossom matched with v's blossom */
  // #define BMATE(v) (BASE[END[MATE[this.v]]])
  BMATE(v: number): number {
    return this.BASE[this.END[this.MATE[v]]];
  }

  /* the blossom entered by the edge that links v's blossom */
  // #define BLINK(v) (BASE[END[LINK[this.v]]])
  BLINK(v: number): number {
    return this.BASE[this.END[this.LINK[v]]];
  }

  /* the edge e with it's direction reversed */
  // #define OPPEDGE(e) (((e - U) % 2 == 0) ? (e - 1) : (e + 1))
  OPPEDGE(e: number): number {
    return (e - this.U) % 2 == 0 ? e - 1 : e + 1;
  }

  /* the slack of edge e */
  // #define SLACK(e) (Y[END[e]] + Y[END[OPPEDGE(e)]] - WEIGHT[e])
  SLACK(e: number): number {
    return (
      this.Y[this.END[e]] + this.Y[this.END[this.OPPEDGE(e)]] - this.WEIGHT[e]
    );
  }
}
