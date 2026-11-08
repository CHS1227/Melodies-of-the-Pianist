export type RoomId = 'intro' | 'room1' | 'room2' | 'room3' | 'ending';

export interface GameState {
  currentRoom: RoomId;
  inventory: string[];
  selectedItem: string | null;
  room1Puzzles: {
    trebleClef: boolean;
    pianoMelody: boolean;
  };
  room2Puzzles: {
    flowerCard: boolean;
    portraitBurn: boolean;
    metronomeFix: boolean;
  };
  room3Puzzles: {
    p1: boolean;
    p2: boolean;
    p3: boolean;
    p4: boolean;
    p5: boolean;
  };
  completedRooms: RoomId[];
}

export type PuzzleId = 'trebleClef' | 'pianoMelody';

export interface GameObject {
  id: string;
  name: string;
  description: string;
  puzzleId?: PuzzleId;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
}
