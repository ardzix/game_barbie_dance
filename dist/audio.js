/* Original music and sound effects for Putaran Pesta Persahabatan.
 * No network requests, recordings, microphone access, or external audio files.
 * The downloadable MIDI is generated from this exact SCORE data.
 */
(function () {
  'use strict';
  const SCORE = {"title":"Putaran Pesta Persahabatan","bpm":112,"beats":32,"notes":[[0,0.44,72,0,0.82],[0,0.65,60,1,0.52],[0,1.5,36,2,0.64],[0.5,0.44,76,0,0.82],[1.0,0.88,79,0,0.82],[1,0.65,64,1,0.52],[2.0,0.44,76,0,0.82],[2,0.65,67,1,0.52],[2,1.5,36,2,0.64],[2.5,0.44,74,0,0.82],[3.0,0.88,72,0,0.82],[3,0.65,60,1,0.52],[4,0.88,69,0,0.82],[4,0.65,57,1,0.52],[4,1.5,33,2,0.64],[5,0.44,72,0,0.82],[5,0.65,60,1,0.52],[5.5,0.44,76,0,0.82],[6.0,0.88,74,0,0.82],[6,0.65,64,1,0.52],[6,1.5,33,2,0.64],[7.0,0.88,72,0,0.82],[7,0.65,57,1,0.52],[8,0.44,77,0,0.82],[8,0.65,53,1,0.52],[8,1.5,29,2,0.64],[8.5,0.44,76,0,0.82],[9.0,0.88,74,0,0.82],[9,0.65,57,1,0.52],[10.0,0.44,72,0,0.82],[10,0.65,60,1,0.52],[10,1.5,29,2,0.64],[10.5,0.44,69,0,0.82],[11.0,0.88,72,0,0.82],[11,0.65,53,1,0.52],[12,0.44,74,0,0.82],[12,0.65,55,1,0.52],[12,1.5,31,2,0.64],[12.5,0.44,79,0,0.82],[13.0,0.88,77,0,0.82],[13,0.65,59,1,0.52],[14.0,0.88,74,0,0.82],[14,0.65,62,1,0.52],[14,1.5,31,2,0.64],[15.0,0.88,71,0,0.82],[15,0.65,55,1,0.52],[16,0.44,72,0,0.82],[16,0.65,60,1,0.52],[16,1.5,36,2,0.64],[16.5,0.44,74,0,0.82],[17.0,0.44,76,0,0.82],[17,0.65,64,1,0.52],[17.5,0.44,79,0,0.82],[18.0,0.88,81,0,0.82],[18,0.65,67,1,0.52],[18,1.5,36,2,0.64],[19.0,0.88,79,0,0.82],[19,0.65,60,1,0.52],[20,0.88,76,0,0.82],[20,0.65,57,1,0.52],[20,1.5,33,2,0.64],[21,0.44,72,0,0.82],[21,0.65,60,1,0.52],[21.5,0.44,69,0,0.82],[22.0,0.88,72,0,0.82],[22,0.65,64,1,0.52],[22,1.5,33,2,0.64],[23.0,0.88,76,0,0.82],[23,0.65,57,1,0.52],[24,0.44,77,0,0.82],[24,0.65,55,1,0.52],[24,1.5,31,2,0.64],[24.5,0.44,76,0,0.82],[25.0,0.88,74,0,0.82],[25,0.65,59,1,0.52],[26.0,0.44,71,0,0.82],[26,0.65,62,1,0.52],[26,1.5,31,2,0.64],[26.5,0.44,74,0,0.82],[27.0,0.88,79,0,0.82],[27,0.65,55,1,0.52],[28,0.88,76,0,0.82],[28,0.65,60,1,0.52],[28,1.5,36,2,0.64],[29,0.44,74,0,0.82],[29,0.65,64,1,0.52],[29.5,0.44,71,0,0.82],[30.0,1.584,72,0,0.82],[30,0.65,67,1,0.52],[30,1.5,36,2,0.64],[31,0.65,60,1,0.52]]};
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master = null, timer = null;
  let playing = false, muted = false, volume = 0.22;
  let origin = 0, cursor = 0, loops = 0, starts = 0, epoch = 0;
  const voices = new Set();
  const beatSeconds = 60 / SCORE.bpm;
  const loopSeconds = SCORE.beats * beatSeconds;

  function ensureContext() {
    if (!AudioCtor) return false;
    if (!ctx || ctx.state === 'closed') {
      ctx = new AudioCtor();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : volume;
      master.connect(ctx.destination);
    }
    return true;
  }
  function applyVolume() {
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.025);
  }
  function tone(pitch, when, duration, instrument, velocity) {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = instrument === 1 ? 'triangle' : 'sine';
    osc.frequency.value = 440 * Math.pow(2, (pitch - 69) / 12);
    const level = [0.22, 0.105, 0.18, 0.24][instrument] * velocity;
    const attack = Math.min(0.025, duration / 4);
    const end = when + Math.max(0.07, duration);
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(level, when + attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, level * 0.48), Math.max(when + attack, end - 0.045));
    gain.gain.linearRampToValueAtTime(0, end + 0.035);
    osc.connect(gain); gain.connect(master);
    const voice = {osc, gain};
    voices.add(voice);
    osc.onended = () => { voices.delete(voice); osc.disconnect(); gain.disconnect(); };
    osc.start(when); osc.stop(end + 0.05);
  }
  function schedule() {
    if (!playing || !ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    // A suspended tab never produces a backlog of notes on return.
    if (origin + loopSeconds < now) { origin = now + 0.035; cursor = 0; }
    while (playing) {
      const note = SCORE.notes[cursor];
      const when = origin + note[0] * beatSeconds;
      if (when > now + 0.22) break;
      if (when >= now - 0.035) {
        tone(note[2], Math.max(when, now), note[1] * beatSeconds, note[3], note[4]);
      }
      cursor++;
      if (cursor >= SCORE.notes.length) { cursor = 0; origin += loopSeconds; loops++; }
    }
  }
  async function start() {
    if (!ensureContext()) return false;
    const requestEpoch = epoch;
    try { if (ctx.state !== 'running') await ctx.resume(); }
    catch (_) { return false; }
    if (ctx.state !== 'running' || requestEpoch !== epoch) return false;
    if (playing) return true;
    playing = true; starts++; cursor = 0; origin = ctx.currentTime + 0.045;
    schedule();
    timer = window.setInterval(schedule, 80);
    return true;
  }
  function stop() {
    playing = false; epoch++;
    if (timer !== null) { window.clearInterval(timer); timer = null; }
    voices.forEach(({osc,gain}) => {
      try { gain.gain.cancelScheduledValues(ctx.currentTime); gain.gain.setValueAtTime(0,ctx.currentTime); osc.stop(); }
      catch (_) { /* The oscillator may already have ended. */ }
    });
    voices.clear(); cursor = 0;
  }
  const FX = {
    step: [[55,0,.065,.26]],
    slip: [[76,0,.09,.55],[72,.08,.11,.5],[67,.17,.15,.45]],
    dress: [[72,0,.16,.6],[76,.10,.18,.55],[79,.20,.25,.5]],
    dance: [[72,0,.12,.5],[76,.12,.12,.5],[79,.24,.2,.55]],
    eat: [[65,0,.10,.4],[69,.12,.12,.4],[72,.25,.18,.45]],
    win: [[72,0,.18,.6],[76,.15,.18,.6],[79,.30,.20,.6],[84,.49,.45,.65]]
  };
  async function sfx(name) {
    if (!FX[name] || !ensureContext()) return false;
    const requestEpoch = epoch;
    try { if (ctx.state !== 'running') await ctx.resume(); } catch (_) { return false; }
    if (ctx.state !== 'running' || requestEpoch !== epoch) return false;
    const now = ctx.currentTime + 0.01;
    FX[name].forEach(n => tone(n[0], now+n[1], n[2], 3, n[3]));
    return true;
  }
  window.GameAudio = Object.freeze({
    start, stop, sfx,
    setMuted(value) { muted = Boolean(value); applyVolume(); },
    setVolume(value) { const number = Number(value); if (Number.isFinite(number)) volume = Math.max(0,Math.min(1,number)); applyVolume(); },
    getDebug() { return {playing, muted, volume, contextState:ctx ? ctx.state : 'uninitialized',
      activeVoices:voices.size, schedulerCount:timer === null ? 0 : 1, starts, loops,
      bpm:SCORE.bpm, loopSeconds, scoreNotes:SCORE.notes.length, title:SCORE.title}; }
  });
})();
