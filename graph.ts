export class Node {
  degree: number;
  adj_list: Edge;
}

export class Edge {
  endpoint: number;
  label: number;
  nextedge: Edge;
  prevedge: Edge;
  otheredge: Edge;
}

export class Graph {
  g: Node[];

  constructor(size: number) {
    this.g = [];
    for (let i = 0; i < size + 1; i++) this.g[i] = new Node();

    this.g[0].degree = size;
  }

  addEdge(src: number, dest: number, label: number) {
    let edge1: Edge, edge2: Edge;

    edge1 = new Edge();
    edge2 = new Edge();

    edge1.label = label;
    edge1.endpoint = dest;
    edge1.otheredge = edge2;
    edge1.prevedge = null;
    edge1.nextedge = this.g[src].adj_list;
    if (edge1.nextedge != null) edge1.nextedge.prevedge = edge1;
    this.g[src].adj_list = edge1;
    this.g[src].degree++;

    edge2.label = label;
    edge2.endpoint = src;
    edge2.otheredge = edge1;
    edge2.prevedge = null;
    edge2.nextedge = this.g[dest].adj_list;
    if (edge2.nextedge != null) edge2.nextedge.prevedge = edge2;
    this.g[dest].adj_list = edge2;
    this.g[dest].degree++;
  }

  findEdge(src: number, dest: number): Edge {
    let e = this.g[src].adj_list;
    while (e != null && e.endpoint != dest) e = e.nextedge;

    return e;
  }

  removeEdge(edge: Edge): boolean {
    let other: Edge;
    let i: number, j: number;

    if (edge == null) return false;
    other = edge.otheredge;
    i = other.endpoint;
    j = edge.endpoint;
    this.g[i].degree--;
    this.g[j].degree--;
    if (edge.prevedge == null) {
      this.g[i].adj_list = edge.nextedge;
      if (edge.nextedge != null) edge.nextedge.prevedge = null;
    } else if (edge.nextedge == null) edge.prevedge.nextedge = null;
    else {
      edge.nextedge.prevedge = edge.prevedge;
      edge.prevedge.nextedge = edge.nextedge;
    }
    if (other.prevedge == null) {
      this.g[j].adj_list = other.nextedge;
      if (other.nextedge != null) other.nextedge.prevedge = null;
    } else if (other.nextedge == null) other.prevedge.nextedge = null;
    else {
      other.nextedge.prevedge = other.prevedge;
      other.prevedge.nextedge = other.nextedge;
    }

    return true;
  }

  numEdges(): number {
    let i: number, size: number, edges: number;

    edges = 0;
    size = this.Degree(0);
    for (i = 1; i <= size; i++) edges += this.Degree(i);
    edges /= 2;
    return edges;
  }

  Degree(n: number): number {
    return this.g[n].degree;
  }

  FirstEdge(n: number): Edge {
    return this.g[n].adj_list;
  }
}
