import { useCurrentRoom } from "./walk";

export interface PlanRoom {
  id: string;
  name: string;
  works: number;
}

// The live thing: the gallery's floor plan. Each room is a block sized by the works hanging in it and
// links to that room; the room the visitor is standing in lights up as they walk (scroll or arrow keys).
// Without JavaScript it is a plain set of links.
export function FloorPlan({ rooms }: { rooms: PlanRoom[] }) {
  const current = useCurrentRoom(rooms.map((room) => room.id));

  return (
    <nav aria-label="Floor plan" data-ui="" className="w-full max-w-[460px]">
      <div className="flex min-h-[260px] gap-2">
        {rooms.map((room) => (
          <a
            key={room.id}
            href={`#${room.id}`}
            aria-current={current === room.id ? "true" : undefined}
            className="ex-room"
            style={{ flex: `${Math.max(room.works, 1)} 1 0` }}
          >
            <span className="font-semibold">{room.name}</span>
            <span className="ex-small">
              {room.works} {room.works === 1 ? "work" : "works"}
            </span>
          </a>
        ))}
      </div>
      <p className="ex-small mt-4 text-ex-dim">Walk the show with the arrow keys, ← and →.</p>
    </nav>
  );
}
