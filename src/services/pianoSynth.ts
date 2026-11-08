/**
 * Simple piano sound synthesizer using Web Audio API
 */
class PianoSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private getFrequency(note: string): number {
    const notes: Record<string, number> = {
      'C': 261.63,
      'D': 293.66,
      'E': 329.63,
      'F': 349.23,
      'G': 392.00,
      'A': 440.00,
      'B': 493.88,
      'C5': 523.25
    };
    return notes[note] || 440;
  }

  playNote(note: string, duration: number = 0.5) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.getFrequency(note), this.ctx.currentTime);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSequence(sequence: string[], interval: number = 0.5) {
    sequence.forEach((note, i) => {
      setTimeout(() => this.playNote(note), i * interval * 1000);
    });
  }
}

export const pianoSynth = new PianoSynth();
