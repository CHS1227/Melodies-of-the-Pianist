/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  PenLine, 
  Camera, 
  Info, 
  X, 
  Play, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { pianoSynth } from './services/pianoSynth';
import { GameState, RoomId, GameObject } from './types';

// Constants
const ROOM1_IMAGE = '/src/assets/images/room_1_pianist_studio_1779001582260.png';
const ROOM2_IMAGE = '/src/assets/images/room_2_final_violinist_studio_1779007401942.png';
const ROOM3_IMAGE = '/src/assets/images/room_3_concert_hall_1779001706531.png';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentRoom: 'intro',
    inventory: [],
    selectedItem: null,
    room1Puzzles: { trebleClef: false, pianoMelody: false },
    room2Puzzles: { flowerCard: false, portraitBurn: false, metronomeFix: false },
    room3Puzzles: { p1: false, p2: false, p3: false, p4: false, p5: false },
    completedRooms: [],
  });

  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const addToInventory = (item: string) => {
    if (!gameState.inventory.includes(item)) {
      setGameState(prev => ({ ...prev, inventory: [...prev.inventory, item] }));
      setGameState(prev => ({ ...prev, selectedItem: item }));
      
      const itemName = item === 'matchbox' ? 'Matches' : item === 'stray-flower' ? 'Wildflower' : item;
      setToast(`Collected: ${itemName}`);
      pianoSynth.playNote('C', 0.5);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const selectInventoryItem = (item: string) => {
    setGameState(prev => ({ ...prev, selectedItem: prev.selectedItem === item ? null : item }));
  };

  const completePuzzle = (room: RoomId, puzzleId: string) => {
    setGameState(prev => {
      const newState = { ...prev };
      if (room === 'room1') {
        newState.room1Puzzles = { ...prev.room1Puzzles, [puzzleId]: true };
      } else if (room === 'room2') {
        newState.room2Puzzles = { ...prev.room2Puzzles, [puzzleId]: true };
      } else if (room === 'room3') {
        newState.room3Puzzles = { ...prev.room3Puzzles, [puzzleId]: true };
      }
      return newState;
    });
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#ffffff', '#1a1a1c']
    });
  };

  const nextRoom = (roomId: RoomId) => {
    setGameState(prev => ({
      ...prev,
      currentRoom: roomId,
      completedRooms: [...prev.completedRooms, prev.currentRoom]
    }));
    setSelectedObject(null);
  };

  // Check room completion
  const isRoom1Done = gameState.room1Puzzles.trebleClef && gameState.room1Puzzles.pianoMelody;
  const isRoom2Done = gameState.room2Puzzles.flowerCard && gameState.room2Puzzles.portraitBurn && gameState.room2Puzzles.metronomeFix;
  const isRoom3Done = gameState.room3Puzzles.p1 && gameState.room3Puzzles.p2 && gameState.room3Puzzles.p3 && gameState.room3Puzzles.p4 && gameState.room3Puzzles.p5;

  return (
    <div className="relative w-full h-screen bg-background-deep overflow-hidden font-sans text-[#e0e0e0]">
      <AnimatePresence mode="wait">
        {gameState.currentRoom === 'intro' && (
          <IntroScene key="intro" onComplete={() => nextRoom('room1')} />
        )}
        
        {/* Room 2 Transition */}
        {gameState.currentRoom === 'room1' && isRoom1Done && !gameState.completedRooms.includes('room1') && (
           <TransitionScene 
             key="trans1"
             msg="His melody sounds sorrowful. Help him escape the pain."
             onComplete={() => nextRoom('room2')}
           />
        )}

        {(gameState.currentRoom === 'room1' && !isRoom1Done) && (
          <div className="relative w-full h-full flex flex-col">
            <header className="h-16 w-full flex items-center justify-between px-8 z-10 border-b border-border-subtle bg-background-deep/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <span className="text-gold-accent text-[10px] uppercase tracking-[0.3em] font-bold">Room 01</span>
                <h1 className="text-lg font-light tracking-tight font-serif italic">The Pianist's Studio</h1>
              </div>
              <RoomProgress current={parseInt(gameState.currentRoom.replace('room', ''))} total={3} />
            </header>
            <main className="flex-1 relative">
              <Room1Scene key="room1" onObjectSelect={setSelectedObject} />
            </main>
          </div>
        )}

        {gameState.currentRoom === 'room2' && (
          <div className="relative w-full h-full flex flex-col">
            <header className="h-16 w-full flex items-center justify-between px-8 z-10 border-b border-border-subtle bg-background-deep/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <span className="text-blue-400 text-[10px] uppercase tracking-[0.3em] font-bold">Room 02</span>
                <h1 className="text-lg font-light tracking-tight font-serif italic">The Violinist's Study</h1>
              </div>
              <RoomProgress current={2} total={3} />
            </header>
            <main className="flex-1 relative">
              <Room2Scene key="room2" onObjectSelect={setSelectedObject} inventory={gameState.inventory} />
            </main>
          </div>
        )}

        {gameState.currentRoom === 'room3' && (
          <div className="relative w-full h-full flex flex-col">
            <header className="h-16 w-full flex items-center justify-between px-8 z-10 border-b border-border-subtle bg-background-deep/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <span className="text-emerald-400 text-[10px] uppercase tracking-[0.3em] font-bold">Room 03</span>
                <h1 className="text-lg font-light tracking-tight font-serif italic">The Ethereal Hall</h1>
              </div>
              <RoomProgress current={3} total={3} />
            </header>
            <main className="flex-1 relative">
              <Room3Scene key="room3" onObjectSelect={setSelectedObject} />
            </main>
          </div>
        )}

        {gameState.currentRoom === 'ending' && (
          <EndingScene key="ending" />
        )}
      </AnimatePresence>

      {/* Elegant Floating Inventory & Dialogue Bar */}
      {(gameState.currentRoom !== 'intro' && !((gameState.currentRoom === 'room1' && isRoom1Done && !gameState.completedRooms.includes('room1')))) && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-10 flex flex-col gap-6 z-40 pointer-events-none">
          <div className="flex items-end justify-between w-full pointer-events-auto">
             <div className="bg-[#0a0a0b]/90 backdrop-blur-3xl border border-white/10 p-5 rounded-2xl flex items-center gap-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                {/* Inventory Area */}
                <div className="flex gap-4 border-r border-white/5 pr-8 h-12 items-center">
                  {gameState.inventory.length === 0 ? (
                    <div className="w-12 h-12 border border-white/5 bg-white/[0.01] rounded-xl flex items-center justify-center opacity-30">
                        <Camera className="w-4 h-4 text-white/40" />
                    </div>
                  ) : (
                      gameState.inventory.map(item => (
                        <motion.button 
                          key={item} 
                          onClick={() => selectInventoryItem(item)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 border transition-all duration-300 rounded-xl flex items-center justify-center shadow-2xl relative group ${
                            gameState.selectedItem === item 
                            ? 'border-gold-accent bg-gold-accent/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className={`text-[7px] font-black uppercase tracking-tighter transition-colors ${gameState.selectedItem === item ? 'text-gold-accent' : 'text-white/40'}`}>
                              {item === 'matchbox' ? 'Matches' : item === 'stray-flower' ? 'Flower' : item === 'placed-flower' ? 'Ready' : item}
                            </span>
                          </div>
                          {gameState.selectedItem === item && (
                            <motion.div layoutId="selection-glow" className="absolute -inset-1 bg-gold-accent/5 blur-md rounded-xl pointer-events-none" />
                          )}
                        </motion.button>
                      ))
                  )}
                </div>
                
                {/* Dialogue Area */}
                <div className="min-w-[300px]">
                  <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] mb-0.5 font-bold">Observation</p>
                  <p className="text-sm font-light text-white/80 italic leading-relaxed">
                    {selectedObject ? `“${selectedObject.description}”` : "“The silence is heavy, filled with memories.”"}
                  </p>
                </div>
             </div>

             <div className="bg-[#0a0a0b]/90 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <span className="text-[10px] text-gold-accent/40 tracking-[0.3em] uppercase font-black italic">Memory Synchronizing...</span>
             </div>
          </div>
        </div>
      )}

      {/* Object Detail Overlay */}
      <AnimatePresence>
        {selectedObject && (
          <ObjectOverlay 
            object={selectedObject} 
            room={gameState.currentRoom}
            inventory={gameState.inventory}
            selectedItem={gameState.selectedItem}
            onClose={() => setSelectedObject(null)}
            onCollect={addToInventory}
            onPuzzleComplete={(pid) => completePuzzle(gameState.currentRoom, pid)}
            isPuzzleCompleted={
              gameState.currentRoom === 'room1' && selectedObject.puzzleId ? (gameState.room1Puzzles as any)[selectedObject.puzzleId] :
              gameState.currentRoom === 'room2' && selectedObject.puzzleId ? (gameState.room2Puzzles as any)[selectedObject.puzzleId] :
              gameState.currentRoom === 'room3' && selectedObject.puzzleId ? (gameState.room3Puzzles as any)[selectedObject.puzzleId] : false
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRoom2Done && !gameState.completedRooms.includes('room2') && (
          <CompletionModal 
            title="A Soul Revealed" 
            desc="You helped the violinist rediscover himself. His melodies were never accepted by others, but you revealed his true soul." 
            btnText="Unlock the Grand Stage"
            onNext={() => nextRoom('room3')} 
          />
        )}
        {isRoom3Done && !gameState.completedRooms.includes('room3') && (
          <CompletionModal 
            title="The Grand Finale" 
            desc="The pianist's wish is fulfilled. The music will live on forever." 
            btnText="Reclaim the Future"
            onNext={() => nextRoom('ending')} 
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-gold-accent px-8 py-3 rounded-full text-black text-[10px] uppercase tracking-[0.3em] font-black shadow-2xl flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoomProgress({ current, total }: { current: number, total: number }) {
  return (
    <div className="flex items-center gap-8">
      <div className="flex gap-2 items-center">
        {[1, 2, 3].map((r) => (
          <div 
            key={r} 
            className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${
              current >= r ? 'bg-gold-accent shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'bg-white/10'
            }`} 
          />
        ))}
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 ml-2">Progress: {current} / {total}</span>
      </div>
    </div>
  );
}


function CompletionModal({ title, desc, btnText, onNext }: { title: string, desc: string, btnText: string, onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background-deep/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-background-panel border border-white/10 p-12 rounded-3xl text-center shadow-2xl">
        <div className="w-16 h-16 bg-gold-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <Sparkles className="w-8 h-8 text-gold-accent" />
        </div>
        <h2 className="text-2xl font-serif mb-4 italic text-white/95 tracking-tight">{title}</h2>
        <p className="text-zinc-500 mb-10 leading-relaxed italic text-sm">“{desc}”</p>
        <button onClick={onNext} className="w-full py-4 bg-gold-accent hover:bg-[#c4a130] text-black rounded-lg font-bold transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-gold-accent/10 uppercase tracking-widest text-[11px]">
          {btnText} <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

// --- Room Components ---

function Room1Scene({ onObjectSelect }: { onObjectSelect: (obj: GameObject) => void, key?: React.Key }) {
  const objects: GameObject[] = [
    { id: 'piano', name: 'Grand Piano', description: 'The wooden keys are cold, yet the scent of cedar and old paper lingers.', puzzleId: 'pianoMelody' as any, x: 19, y: 22, width: 44, height: 55 },
    { id: 'music-sheets', name: 'Scattered Sheets', description: 'Blank parchment resting near the piano, waiting for a master\'s hand.', puzzleId: 'trebleClef' as any, x: 46, y: 76, width: 22, height: 16 },
    { id: 'flower', name: 'Night Lily', description: 'Beside the window, where the softest moonlight reaches its petals.', x: 82, y: 33, width: 8, height: 25 },
    { id: 'lamp', name: 'Brass Lamp', description: 'Casting a dim focus on the pianist\'s workspace.', x: 90, y: 25, width: 10, height: 35 }
  ];
  return <BaseRoom img={ROOM1_IMAGE} objects={objects} onObjectSelect={onObjectSelect} roomName="Pianist's Room" />;
}

function Room2Scene({ onObjectSelect, inventory = [] }: { onObjectSelect: (obj: GameObject) => void, inventory?: string[], key?: React.Key }) {
  const objects: GameObject[] = [
    { id: 'painting', name: 'Portrait', description: 'A portrait of a woman whose eyes seem to follow you. The frame is thick with dust, but the colors beneath seem unnaturally vibrant.', puzzleId: 'portraitBurn' as any, x: 5, y: 5, width: 22, height: 32 },
    { id: 'fireplace', name: 'Stone Fireplace', description: 'The embers have long since cooled, leaving only ash and the faint scent of vanished warmth.', x: 2, y: 55, width: 28, height: 42 },
    { id: 'violin', name: 'Violin', description: 'Resting on a velvet chair, its strings haven\'t felt a bow in years. It seems to be waiting for a final performance.', x: 44, y: 45, width: 22, height: 48 },
    { id: 'stand', name: 'Music Stand', description: 'A wooden stand, empty save for the dust. It feels as though it was abandoned in the middle of a rehearsal.', x: 28, y: 38, width: 15, height: 58 },
    { id: 'flowers', name: 'Bouquet', description: 'A bouquet of wilting lilies on the table. Something is hidden among the scattered petals.', puzzleId: 'flowerCard' as any, x: 80, y:30 , width: 18, height: 38 },
    { id: 'matchbox', name: 'Matchbox', description: 'A vintage matchbox resting prominently on the table, its wood aged and dry. It bears an insignia of a forgotten opera house.', x: 78, y: 69, width: 12, height: 8 }, 
    { id: 'candle', name: 'Flickering Candle', description: 'A lone candle fights against the encroaching shadows. It seems to be waiting for something.', x: 76, y: 55, width: 6, height: 18 },
    { id: 'window', name: 'Rain-Streaked Window', description: 'The storm outside matches the weeping within these walls. Moonlight barely pierces the gloom.', x: 65, y: 2, width: 20, height: 52 },
    { id: 'metronome', name: 'Broken Metronome', description: 'Its rhythm is jagged and unnatural, as if stuck in a moment of pain.', puzzleId: 'metronomeFix' as any, x: 92, y: 42, width: 6, height: 18 }
  ];

  const visibleObjects = objects.filter(obj => !( (obj.id === 'matchbox') && inventory.includes(obj.id)));

  return <BaseRoom 
    img={ROOM2_IMAGE} 
    objects={visibleObjects} 
    onObjectSelect={onObjectSelect} 
    roomName="The Violinist's Room" 
    extraLayer={
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
            {/* Ambient rain effect simulation */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/[0.05] to-transparent animate-pulse" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/pinstripe-light.png')] rotate-12" />
        </div>
    }
  />;
}

function BaseRoom({ img, objects, onObjectSelect, roomName, extraLayer }: { img: string, objects: GameObject[], onObjectSelect: (o: GameObject) => void, roomName: string, extraLayer?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="relative w-full h-full flex items-center justify-center p-12 bg-background-deep overflow-hidden">
      <div className="absolute inset-0 bg-background-deep pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background-deep via-transparent to-background-deep opacity-90 pointer-events-none z-[2]" />
      {extraLayer}
      <div className="relative aspect-video w-full max-w-6xl shadow-[0_0_200px_rgba(0,0,0,1)] rounded-sm overflow-hidden group border border-white/5 bg-[#050505]">
        <img src={img} alt={roomName} className="w-full h-full object-cover transition-transform duration-[80s] scale-110 group-hover:scale-100 opacity-70 contrast-125 saturate-[0.8]" referrerPolicy="no-referrer" />
        {objects.map(obj => (
          <motion.button 
            key={obj.id} 
            onClick={() => onObjectSelect(obj)}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 0 50px rgba(212,175,55,0.25)",
              borderColor: "rgba(212,175,55,0.4)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute cursor-pointer border border-transparent transition-all rounded-sm group/obj z-[5] outline-none" 
            style={{ left: `${obj.x}%`, top: `${obj.y}%`, width: `${obj.width}%`, height: `${obj.height}%` }}
          >
            <div className="absolute inset-0 border border-transparent group-hover/obj:border-gold-accent/50 group-hover/obj:bg-gold-accent/[0.04] transition-colors rounded-sm" />
            <span className="absolute -top-14 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#0a0a0b]/95 border border-white/10 text-[10px] uppercase tracking-[0.4em] text-gold-accent rounded-sm opacity-0 group-hover/obj:opacity-100 transition-all scale-95 group-hover/obj:scale-100 whitespace-nowrap shadow-2xl backdrop-blur-3xl z-20 pointer-events-none font-bold">
              {obj.name}
            </span>
            {/* Subtle particle effect on hover */}
            <div className="absolute -inset-2 opacity-0 group-hover/obj:opacity-100 transition-opacity pointer-events-none">
               <div className="absolute top-0 left-1/4 w-1 h-1 bg-gold-accent/20 rounded-full animate-ping" />
               <div className="absolute bottom-1/4 right-0 w-1 h-1 bg-gold-accent/20 rounded-full animate-bounce" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ObjectOverlay({ object, room, inventory, selectedItem, onClose, onCollect, onPuzzleComplete, isPuzzleCompleted }: { 
  object: GameObject, 
  room: RoomId, 
  inventory: string[],
  selectedItem: string | null,
  onClose: () => void, 
  onCollect: (item: string) => void,
  onPuzzleComplete: (pid: string) => void, 
  isPuzzleCompleted: boolean 
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background-deep/70 backdrop-blur-2xl">
      <motion.div initial={{ y: 50, scale: 0.95, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 50, scale: 0.95, opacity: 0 }} className="relative max-w-4xl w-full max-h-[90vh] bg-background-panel border border-white/10 rounded-3xl shadow-[0_50px_150px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row">
        
        <div className="absolute top-0 left-0 right-0 h-14 bg-white/[0.04] border-b border-white/10 flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gold-accent animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold-accent font-black">Investigating: {object.name}</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-[10px] uppercase tracking-widest flex items-center gap-2 font-bold">
            Exit Observation <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full md:w-80 p-12 pt-24 border-b md:border-b-0 md:border-r border-white/5 flex flex-col bg-[#0c0c0d]">
          <div className="mb-10">
            <h2 className="text-3xl font-serif italic text-white/95 mb-6 leading-tight">{object.name}</h2>
            <div className="w-16 h-[1.5px] bg-gradient-to-r from-gold-accent/60 to-transparent" />
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mb-auto italic font-light">“{object.description}”</p>
          <div className="mt-16 space-y-4">
            {isPuzzleCompleted ? (
              <div className="flex items-center justify-center gap-3 text-emerald-400 bg-emerald-400/5 px-6 py-4 rounded-xl border border-emerald-400/20 shadow-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">Memory Intact</span>
              </div>
            ) : (object.id === 'matchbox' && !inventory.includes('matchbox')) ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onCollect('matchbox'); onClose(); }}
                  className="w-full py-5 bg-gold-accent font-sans text-black text-[11px] uppercase tracking-[0.3em] font-black rounded-xl hover:bg-[#c4a130] transition-all shadow-xl shadow-gold-accent/10"
                >
                  Collect Matchbox
                </motion.button>
            ) : (object.id === 'stray-flower' && !inventory.includes('stray-flower')) ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onCollect('stray-flower'); onClose(); }}
                  className="w-full py-5 bg-gold-accent font-sans text-black text-[11px] uppercase tracking-[0.3em] font-black rounded-xl hover:bg-[#c4a130] transition-all shadow-xl shadow-gold-accent/10"
                >
                  Collect Flower
                </motion.button>
            ) : (object.id === 'flowers' && selectedItem === 'stray-flower') ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    onCollect('placed-flower'); 
                  }}
                  className="w-full py-5 bg-blue-500 font-sans text-white text-[11px] uppercase tracking-[0.3em] font-black rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20"
                >
                  Place Flower in Arrangement
                </motion.button>
            ) : (object.id === 'painting' && selectedItem === 'matchbox') ? (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                        // This button is just a reminder, the puzzle itself is always accessible but 
                        // hasMatchbox prop is true if selected. The user requested:
                        // "Clicking with selected matches triggers burn animation"
                        // So let's make the BurningPortraitPuzzle triggerable.
                  }}
                  className="w-full py-5 border-2 border-orange-500 bg-orange-500/10 text-orange-400 text-[11px] uppercase tracking-[0.4em] font-black rounded-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-3"
                >
                   <Sparkles className="w-4 h-4 animate-pulse" /> Matches Ready
                </motion.button>
            ) : null}
          </div>
        </div>

        <div className="flex-1 bg-[#050505] p-12 pt-24 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
          {room === 'room1' ? (
            object.id === 'music-sheets' ? <TrebleClefPuzzle onComplete={() => onPuzzleComplete('trebleClef')} isCompleted={isPuzzleCompleted} /> :
            object.id === 'piano' ? <PianoMelodyPuzzle onComplete={() => onPuzzleComplete('pianoMelody')} isCompleted={isPuzzleCompleted} /> :
            <EmptyInspection />
          ) : room === 'room2' ? (
            object.id === 'flowers' ? (
                <FlowerCardPuzzle onComplete={() => onPuzzleComplete('flowerCard')} isCompleted={isPuzzleCompleted} />
            ) :
            object.id === 'painting' ? <BurningPortraitPuzzle hasMatchbox={selectedItem === 'matchbox'} onComplete={() => onPuzzleComplete('portraitBurn')} isCompleted={isPuzzleCompleted} /> :
            object.id === 'metronome' ? <MetronomeFixPuzzle onComplete={() => onPuzzleComplete('metronomeFix')} isCompleted={isPuzzleCompleted} /> :
            <EmptyInspection />
          ) : (
            object.puzzleId ? <GenericPuzzle onComplete={() => onPuzzleComplete(object.puzzleId!)} isCompleted={isPuzzleCompleted} /> : <EmptyInspection />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}


function Room3Scene({ onObjectSelect }: { onObjectSelect: (obj: GameObject) => void, key?: React.Key }) {
  const objects: GameObject[] = [
    { id: 'stand1', name: '1st Stand', description: 'The lead violin part.', puzzleId: 'p1' as any, x: 15, y: 60, width: 8, height: 20 },
    { id: 'stand2', name: '2nd Stand', description: 'Harmony in rhythm.', puzzleId: 'p2' as any, x: 32, y: 56, width: 8, height: 20 },
    { id: 'stand3', name: '3rd Stand', description: 'The cello\'s deep soul.', puzzleId: 'p3' as any, x: 50, y: 53, width: 8, height: 20 },
    { id: 'stand4', name: '4th Stand', description: 'Winds of change.', puzzleId: 'p4' as any, x: 68, y: 56, width: 8, height: 20 },
    { id: 'stand5', name: '5th Stand', description: 'The final brass echo.', puzzleId: 'p5' as any, x: 85, y: 60, width: 8, height: 20 }
  ];
  return <BaseRoom img={ROOM3_IMAGE} objects={objects} onObjectSelect={onObjectSelect} roomName="The Concert Hall" />;
}

function TransitionScene({ msg, onComplete }: { msg: string, onComplete: () => void, key?: React.Key }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background-deep p-12 text-center"
    >
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-2xl md:text-3xl font-serif italic text-white/80 mb-12 max-w-lg leading-relaxed">“{msg}”</p>
        <div className="w-px h-16 bg-gradient-to-b from-blue-500/50 to-transparent mx-auto mb-12" />
        <button 
          onClick={onComplete}
          className="px-10 py-3 border border-blue-500/30 rounded-full text-[10px] uppercase tracking-[0.4em] text-blue-400 font-bold hover:bg-blue-500/5 transition-all"
        >
          Proceed
        </button>
      </motion.div>
    </motion.div>
  );
}

function EmptyInspection() {
  return (
    <div className="text-center text-white/5">
      <Music className="w-20 h-20 mx-auto mb-6 opacity-5" />
      <p className="text-[10px] uppercase tracking-[0.5em] font-light italic">“The silence is heavy here.”</p>
    </div>
  );
}


function GenericPuzzle({ onComplete, isCompleted }: { onComplete: () => void, isCompleted: boolean }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const target = [1, 2, 3];
  
  if (isCompleted) return (
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)] border border-emerald-500/20">
        <CheckCircle2 className="w-12 h-12 text-emerald-500/60" />
      </div>
      <p className="text-emerald-500 font-serif italic text-lg tracking-wide">Resolved</p>
    </motion.div>
  );

  const handleClick = (v: number) => {
    pianoSynth.playNote(['C', 'E', 'G'][v-1]);
    const next = [...sequence, v];
    if (next.length > 3) next.shift();
    setSequence(next);
    if (next.join(',') === target.join(',')) onComplete();
  };

  return (
    <div className="text-center">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4 font-bold">Decipher the Pattern</p>
        <div className="flex justify-center gap-3">
          {target.map((_, i) => <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${sequence[i] ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 'bg-zinc-900 border border-zinc-800'}`} />)}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(v => (
          <button key={v} onClick={() => handleClick(v)} className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-white/20 font-serif italic text-2xl active:scale-90 flex items-center justify-center shadow-xl group">
            <span className="group-hover:text-amber-500/80 transition-colors">{v === 1 ? 'I' : v === 2 ? 'II' : 'III'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EndingScene() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 3 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#f7f3ed] z-[100]"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-accent/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20" />
      </div>

      <div className="relative z-10 text-center max-w-3xl px-12">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1, duration: 2 }}
           className="mb-20"
        >
          <Music className="w-12 h-12 text-[#1a1a1c]/20 mx-auto mb-12" />
          <h1 className="text-4xl md:text-6xl font-serif italic text-[#1a1a1c] mb-12 tracking-tight leading-tight">
            The silence is broken at last.
          </h1>
          <div className="w-16 h-px bg-[#1a1a1c]/10 mx-auto" />
        </motion.div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 3, duration: 2 }}
           className="space-y-8"
        >
          <p className="text-[#1a1a1c]/60 text-lg md:text-xl font-serif italic leading-relaxed italic">
            “The melodies you found served as keys for a cage of shadows. 
            The composer, the pianist, and the violinist... they are now free to play in the halls of eternity.”
          </p>
          <p className="text-[#1a1a1c]/40 text-sm tracking-widest uppercase font-black pt-12">
            Escape Successful
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 6, duration: 2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => location.reload()}
          className="mt-20 px-16 py-5 bg-[#1a1a1c] text-white text-[11px] uppercase tracking-[0.5em] font-black rounded-full shadow-2xl transition-all hover:shadow-gold-accent/20 active:bg-black"
        >
          Return to Reality
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 8, duration: 4 }}
          className="fixed bottom-12 left-0 right-0 text-[10px] uppercase font-black tracking-[0.8em] text-[#1a1a1c]"
        >
          A Memory of Sound
        </motion.div>
      </div>

      {/* Final confetti burst for the win */}
      <motion.div 
        animate={{ opacity: 1 }} 
        onAnimationComplete={() => {
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.8 },
            colors: ['#d4af37', '#000000', '#ffffff']
          });
        }}
      />
    </motion.div>
  );
}

function IntroScene({ onComplete }: { onComplete: () => void, key?: React.Key }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, transition: { duration: 1.5 } }} 
      className="absolute inset-0 flex flex-col items-center justify-center bg-background-deep p-12"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5, duration: 1.5 }} 
        className="text-center relative z-10"
      >
        <Music className="w-10 h-10 text-gold-accent/40 mx-auto mb-10" />
        <p className="text-3xl md:text-5xl font-serif italic text-white/90 mb-16 tracking-tight max-w-2xl leading-tight">
          “You need to fulfill the pianist's wish. Find the melodies.”
        </p>
        <div className="w-px h-24 bg-gradient-to-b from-gold-accent/50 to-transparent mx-auto mb-16" />
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }} 
          whileTap={{ scale: 0.98 }} 
          onClick={onComplete} 
          className="px-12 py-4 border border-white/10 rounded-full text-[11px] uppercase tracking-[0.4em] text-gold-accent font-bold transition-all shadow-xl backdrop-blur-sm"
        >
          Enter Memory
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function TrebleClefPuzzle({ onComplete, isCompleted }: { onComplete: () => void, isCompleted: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isCompleted) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0,0, canvas.width, canvas.height);
    }
  }, [isCompleted]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCompleted) return;
    setIsDrawing(true);
    setStatus(null);
    const pos = getPos(e);
    setPoints([pos]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isCompleted) return;
    const pos = getPos(e);
    setPoints(prev => [...prev, pos]);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1a1a1c'; // Pure black pen
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const lastPoint = points[points.length - 1];
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Accuracy validation logic (simplified similarity check)
    // We expect some coverage and enough points representing the curve
    const accuracy = checkAccuracy(points);
    
    if (accuracy >= 70) {
      pianoSynth.playNote('C', 0.8);
      onComplete();
    } else {
      setStatus("The melody is incomplete...");
      setTimeout(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          setPoints([]);
      }, 1000);
    }
  };

  const checkAccuracy = (pts: {x: number, y: number}[]) => {
      if (pts.length < 50) return 30;
      // Heuristic for similarity: spread and count
      const minX = Math.min(...pts.map(p => p.x));
      const maxX = Math.max(...pts.map(p => p.x));
      const minY = Math.min(...pts.map(p => p.y));
      const maxY = Math.max(...pts.map(p => p.y));
      const spreadX = maxX - minX;
      const spreadY = maxY - minY;
      
      if (spreadX > 80 && spreadY > 150 && pts.length > 80) return 85; 
      return 50;
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  return (
    <div className="relative w-full max-w-sm aspect-[3/4] bg-[#fdfaf5] p-12 rounded shadow-2xl overflow-hidden border border-white/10">
      <div className="absolute inset-0 flex flex-col justify-around py-20 px-8 pointer-events-none opacity-20">
        {[1,2,3,4,5].map(i => <div key={i} className="h-0.5 bg-black w-full" />)}
      </div>
      
      {/* Treble Clef Guide */}
      {!isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]">
             <Music className="w-56 h-56 text-black" />
          </div>
      )}

      {isCompleted ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-30">
           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
             <div className="w-16 h-16 bg-gold-accent/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-gold-accent" />
             </div>
             <p className="text-black font-serif italic text-sm tracking-widest font-bold">CLEF RESTORED</p>
           </motion.div>
        </div>
      ) : (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] text-black/40 uppercase tracking-[0.4em] font-black z-20">Trace the Clef</div>
      )}
      
      {status && !isCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-6 left-0 right-0 text-center text-red-500/80 text-[10px] uppercase font-bold tracking-widest z-20">
              {status}
          </motion.div>
      )}

      <canvas ref={canvasRef} width={300} height={400} className="relative z-10 w-full h-full cursor-crosshair touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={endDrawing} onMouseLeave={endDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={endDrawing} />
    </div>
  );
}

function FlowerCardPuzzle({ onComplete, isCompleted }: { onComplete: () => void, isCompleted: boolean }) {
  const [val, setVal] = useState('');
  const petalCount = 7; 
  const [showInput, setShowInput] = useState(false);

  // Fixed set of 7 petals with specific random-ish offsets and varied properties
  const petals = useMemo(() => {
    return [
      { r: 45, x: -160, y: -180, s: 1.1, d: 0 },
      { r: 120, x: 180, y: -150, s: 0.9, d: 0.2 },
      { r: 210, x: 160, y: 190, s: 1.2, d: 0.4 },
      { r: 300, x: -180, y: 170, s: 1.0, d: 0.6 },
      { r: 15, x: 20, y: -220, s: 0.8, d: 0.8 },
      { r: 160, x: -220, y: -40, s: 1.1, d: 1.0 },
      { r: 340, x: 220, y: 120, s: 1.0, d: 1.2 }
    ];
  }, []);

  if (isCompleted) return (
      <div className="text-center p-12">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-12">
             <div className="w-28 h-28 bg-gold-accent/10 rounded-full flex items-center justify-center mx-auto border border-gold-accent/30 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                <CheckCircle2 className="w-12 h-12 text-gold-accent" />
             </div>
          </motion.div>
          <p className="text-gold-accent font-serif italic text-2xl tracking-[0.3em] font-medium uppercase">Card Deciphered</p>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-4">The arrangement feels whole once more.</p>
      </div>
  );

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[600px]">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* The 7 Petals - Scattered around the card */}
        {petals.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={{ 
                scale: p.s, 
                opacity: 1, 
                rotate: p.r,
                y: [p.y, p.y - 10, p.y]
            }}
            transition={{ 
                scale: { delay: p.d, duration: 1.2, type: "spring" },
                opacity: { delay: p.d, duration: 1.2 },
                y: { repeat: Infinity, duration: 3 + Math.random() * 2, ease: "easeInOut" }
            }}
            style={{ 
              x: p.x, 
              y: p.y,
            }}
            className="absolute w-16 h-28 bg-gradient-to-br from-pink-200/40 via-pink-100/20 to-white/10 rounded-[50%_50%_40%_40%] blur-[0.5px] border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-0"
          />
        ))}
      </div>

      {/* Vintage Card / Envelope */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-[380px] h-[480px] bg-[#fdfaf5] shadow-[0_60px_120px_rgba(0,0,0,0.9)] rounded-sm p-12 flex flex-col border border-[#d4c5b0] cursor-default group overflow-hidden z-10"
      >
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-40 pointer-events-none" />
        <div className="absolute inset-0 border-[16px] border-double border-[#d4af37]/20 pointer-events-none m-4" />
        
        <div className="relative h-full border border-[#d4af37]/10 flex flex-col p-8 items-center text-center justify-between">
          <div className="opacity-40">
             <PenLine className="w-8 h-8 text-[#1a1a1c] mx-auto" />
          </div>
          
          {!showInput ? (
            <div className="space-y-8 py-8">
               <p className="text-3xl font-serif italic text-[#1a1a1c]/80 leading-relaxed font-light">
                 “Count the blooms that were once our shared dream...”
               </p>
               <div className="w-16 h-px bg-black/10 mx-auto" />
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setShowInput(true)}
                 className="text-[11px] uppercase tracking-[0.5em] text-[#1a1a1c]/40 font-black mt-8 hover:text-gold-accent transition-colors"
               >
                 [ Respond to the Note ]
               </motion.button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center gap-12 w-full">
               <div className="space-y-4">
                  <p className="text-[12px] uppercase tracking-[0.6em] text-[#1a1a1c]/50 font-black">Memory Key</p>
                  <div className="w-full h-px bg-black/5" />
               </div>
               <div className="relative">
                 <input 
                   autoFocus
                   type="number" 
                   value={val}
                   onChange={(e) => {
                       setVal(e.target.value);
                       if (parseInt(e.target.value) === petalCount) {
                           onComplete();
                       }
                   }}
                   placeholder="?"
                   className="w-full bg-transparent border-b-2 border-[#d4af37]/20 text-center text-8xl font-serif text-[#1a1a1c]/90 focus:outline-none focus:border-gold-accent transition-all placeholder:text-black/5 pb-6"
                 />
                 <motion.div 
                   animate={{ scaleX: val.length > 0 ? 1 : 0 }} 
                   className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-gold-accent origin-center" 
                 />
               </div>
               <p className="text-[10px] text-[#1a1a1c]/40 italic leading-relaxed font-medium">Use the scattered petals to find the truth.</p>
            </motion.div>
          )}

          <div className="text-[10px] text-[#d4af37]/50 tracking-[0.4em] uppercase font-black font-serif">
            L'Académie de Musique
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BurningPortraitPuzzle({ hasMatchbox, onComplete, isCompleted }: { hasMatchbox: boolean, onComplete: () => void, isCompleted: boolean }) {
  const [burning, setBurning] = useState(false);

  if (isCompleted) return (
      <div className="text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="w-56 h-72 mx-auto bg-background-panel border border-gold-accent/40 rounded shadow-[0_0_80px_rgba(212,175,55,0.3)] flex flex-col items-center justify-center relative overflow-hidden p-10"
          >
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10" />
               <div className="text-[10px] uppercase tracking-[0.5em] text-gold-accent/60 mb-8 font-black">Score Revealed</div>
               <Music className="w-20 h-20 text-gold-accent mb-8 shadow-xl" />
               <div className="w-full h-px bg-gold-accent/30 mb-4" />
               <div className="w-full flex flex-col gap-2">
                   {[1,2,3,4].map(i => <div key={i} className="h-[1px] bg-gold-accent/10 w-full" />)}
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-gold-accent/[0.08] via-transparent to-transparent pointer-events-none" />
               <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 shadow-[inset_0_0_40px_rgba(212,175,55,0.2)] pointer-events-none" />
          </motion.div>
          <p className="text-[12px] uppercase tracking-[0.6em] text-gold-accent font-black mt-12 animate-pulse">Memory Reclaimed</p>
      </div>
  );

  return (
    <div className="text-center w-full max-w-sm">
      {!hasMatchbox ? (
          <div className="space-y-10 py-12">
              <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto opacity-30 shadow-inner">
                  <Camera className="w-10 h-10 text-white/20" />
              </div>
              <div className="space-y-4">
                <p className="text-zinc-500 text-lg italic font-light max-w-xs mx-auto leading-relaxed">
                  “Layers of oil and regret. Only fire can reveal the truth that she hid beneath the colors.”
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/10 font-black pt-4">Requires item: Matches (Selected)</p>
              </div>
          </div>
      ) : (
          <div className="space-y-16">
              <div className="relative w-64 h-80 mx-auto bg-background-panel border border-white/10 rounded-sm overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-0 bg-[url('/src/assets/images/vintage_violinist_portrait_1779005441971.png')] bg-cover bg-center opacity-70 grayscale transition-opacity duration-[2000ms] pointer-events-none" style={{ opacity: burning ? 0 : 0.7 }} />
                  
                  {burning && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-[#020202] z-10 flex flex-col items-center justify-center overflow-hidden"
                      >
                          <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: '-50%' }}
                            transition={{ duration: 6, ease: "linear" }}
                            onAnimationComplete={() => {
                                pianoSynth.playSequence(['G', 'B', 'D', 'G5'], 0.15);
                                onComplete();
                            }}
                            className="absolute inset-0"
                          >
                              {/* Fire particles simulation */}
                              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-orange-600 via-orange-500/40 to-transparent animate-pulse blur-2xl" />
                              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around py-8 h-full">
                                  {[1,2,3,4,5,6,7,8].map(i => (
                                      <motion.div 
                                        key={i}
                                        animate={{ 
                                            height: [60, 160, 80], 
                                            y: [0, -300, -600], 
                                            opacity: [1, 1, 0],
                                            x: [0, (Math.random()-0.5)*100, (Math.random()-0.5)*200]
                                        }}
                                        transition={{ repeat: Infinity, duration: 1.5 + Math.random(), delay: Math.random() }}
                                        className="w-1.5 bg-gradient-to-t from-orange-500 via-amber-400 to-white/20 rounded-full blur-[1px]"
                                      />
                                  ))}
                              </div>
                              {/* Glowing burning edge */}
                              <div className="absolute top-0 w-full h-8 bg-gradient-to-b from-white via-orange-400 to-transparent blur-md opacity-60" />
                              <div className="absolute top-0 w-full h-[2px] bg-white shadow-[0_0_30px_#fff]" />
                          </motion.div>

                          <div className="relative z-20 flex flex-col items-center gap-6">
                             <div className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black animate-pulse">Structural Incineration...</div>
                             <div className="w-12 h-px bg-white/5" />
                          </div>
                      </motion.div>
                  )}
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(234,88,12,0.15)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    setBurning(true);
                    pianoSynth.playNote('B');
                }}
                disabled={burning}
                className="px-16 py-5 bg-orange-600/10 border-2 border-orange-500/30 text-orange-400 text-[11px] uppercase tracking-[0.5em] font-black hover:bg-orange-500/20 hover:border-orange-500/60 transition-all disabled:opacity-50 active:scale-95 shadow-2xl rounded-sm"
              >
                Strike the Match
              </motion.button>
          </div>
      )}
    </div>
  );
}

function MetronomeFixPuzzle({ onComplete, isCompleted }: { onComplete: () => void, isCompleted: boolean }) {
    const [rate, setRate] = useState(1);
    const targetRate = 3;

    if (isCompleted) return (
        <div className="text-center">
            <motion.div animate={{ rotate: [-20, 20] }} transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse" }} className="w-1 h-24 bg-gold-accent/40 mx-auto mb-6" />
            <p className="text-gold-accent font-serif italic text-sm tracking-widest font-bold">Rhythm Synchronized</p>
        </div>
    );

    return (
        <div className="text-center w-full max-w-xs">
            <p className="text-zinc-500 text-xs italic mb-10">“Find the alignment. Restore the pace.”</p>
            <div className="relative h-32 flex items-center justify-center mb-10">
                <motion.div animate={{ rotate: [-10 * rate, 10 * rate] }} transition={{ repeat: Infinity, duration: 1/rate, repeatType: "reverse" }} className="w-1 h-32 bg-white/20 origin-bottom rounded-full" />
            </div>
            <input 
              type="range" min="1" max="5" step="1" value={rate} onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setRate(val);
                  if (val === targetRate) {
                      pianoSynth.playNote('A');
                      onComplete();
                  }
              }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold-accent"
            />
            <div className="flex justify-between mt-4 text-[8px] text-white/20 uppercase font-bold">
                <span>Slow</span>
                <span>Perfect</span>
                <span>Fast</span>
            </div>
        </div>
    );
}


function PianoMelodyPuzzle({ onComplete, isCompleted }: { onComplete: () => void, isCompleted: boolean }) {
  const [sequence, setSequence] = useState<string[]>([]);
  const target = ['C', 'D', 'G', 'F', 'E'];
  const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C5'];

  const handleKeyPress = (note: string) => {
    if (isCompleted) return;
    pianoSynth.playNote(note);
    const newSeq = [...sequence, note];
    if (newSeq.length > target.length) newSeq.shift();
    setSequence(newSeq);
    if (newSeq.join(',') === target.join(',')) {
      setTimeout(() => {
        pianoSynth.playSequence(['C', 'E', 'G', 'C5'], 0.2);
        onComplete();
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-10 text-center">
        <h3 className="text-lg font-serif italic text-white/70 mb-6 tracking-wide">“A sequence lost in time...”</h3>
        <button 
          onClick={() => pianoSynth.playSequence(target, 0.6)} 
          className="px-10 py-3 border border-gold-accent/30 text-gold-accent text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-gold-accent/5 transition-all mb-8 mx-auto flex items-center gap-3 active:scale-95"
        >
          <Volume2 className="w-4 h-4" /> Recall Melody
        </button>
        <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-4">Focus on: C • D • G • F • E</div>
      </div>
      <div className="flex justify-center gap-1 h-56 relative">
        {keys.map((note) => (
          <motion.button 
            key={note} 
            whileHover={{ y: 2 }}
            whileTap={{ y: 4 }} 
            onClick={() => handleKeyPress(note)} 
            className={`relative flex-1 max-w-[50px] rounded-b-md transition-all ${
              isCompleted ? 'bg-gold-accent/20 border-gold-accent/30' : 
              'bg-[#e0e0e0] border-[#999] hover:bg-white active:bg-zinc-300'
            } border-b-4 shadow-xl`}
          >
            <div className="absolute bottom-3 left-0 right-0 text-center text-black/30 font-sans font-bold text-[9px]">{note.replace('5', '')}</div>
            {['C', 'D', 'F', 'G', 'A'].includes(note) && (
              <div className="absolute top-0 -right-[12px] z-10 w-[24px] h-32 bg-[#1a1a1c] rounded-b-sm border-b-2 border-white/10 pointer-events-none" />
            )}
          </motion.button>
        ))}
      </div>
      <div className="mt-12 flex justify-center gap-4">
        {target.map((_, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${
            isCompleted ? 'bg-gold-accent shadow-[0_0_15px_#d4af37]' : 
            sequence[i] ? 'bg-white/40 shadow-[0_0_10px_white]' : 'bg-white/5 border border-white/10'
          }`} />
        ))}
      </div>
    </div>
  );
}

