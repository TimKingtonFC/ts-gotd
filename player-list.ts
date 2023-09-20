import { Player } from "./external/player";

export class PlayerList {
  players: Player[] = [];
  playersById: Map<number, Player> = new Map<number, Player>();

  // public ArrayList<Player> toArrayList()
  // {
  // 	return new ArrayList<Player>(players);
  // }

  // public void add(Player p)
  // {
  // 	players.add(p);
  // 	if(playersById.put(p.getId(), p) != null)
  // 		assert false;
  // }

  // public int size()
  // {
  // 	return players.size();
  // }

  // public boolean isEmpty()
  // {
  // 	return players.size() == 0;
  // }

  // public Player get(int i)
  // {
  // 	return players.get(i);
  // }

  getById(id: number): Player {
    return this.playersById.get(id);
  }

  // public void remove(int i)
  // {
  // 	Player p = players.remove(i);
  // 	playersById.remove(p.getId());
  // }

  // public void remove(Player p)
  // {
  // 	players.remove(p);
  // 	playersById.remove(p.getId());
  // }

  // @Override
  // public Iterator<Player> iterator() {
  // 	return new PlayerListIterator();
  // }

  // @Override
  // public Object clone() {
  // 	PlayerList clone = new PlayerList();
  // 	clone.players = new ArrayList<Player>(players);
  // 	clone.playersById = new HashMap<Integer, Player>(playersById);
  // 	return clone;
  // }

  // private class PlayerListIterator implements Iterator<Player>
  // {
  // 	Iterator<Player> iter;
  // 	Player lastPlayer;

  // 	public PlayerListIterator()
  // 	{
  // 		iter = players.iterator();
  // 	}

  // 	@Override
  // 	public boolean hasNext() {
  // 		return iter.hasNext();
  // 	}

  // 	@Override
  // 	public Player next() {
  // 		return lastPlayer = iter.next();
  // 	}

  // 	@Override
  // 	public void remove() {
  // 		iter.remove();

  // 		if(playersById.remove(lastPlayer.getId()) == null)
  // 			throw new RuntimeException("Bad iter state");
  // 	}
  // }
}
