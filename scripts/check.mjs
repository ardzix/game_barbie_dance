import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const files = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]);
for (const file of files) {
  assert.ok(!/^(?:https?:)?\/\//.test(file), `External dependency: ${file}`);
  if (/^(?:data:|#)/.test(file)) continue;
  const resolved = path.resolve(dist, file);
  assert.ok(resolved.startsWith(dist + path.sep), `Invalid path: ${file}`);
  assert.ok(fs.statSync(resolved).isFile(), `Missing asset: ${file}`);
}
for (const file of ['game.js', 'characters.js', 'audio.js', 'vendor/three.min.js']) {
  new vm.Script(fs.readFileSync(path.join(dist, file), 'utf8'), { filename: file });
}
const midi = fs.readFileSync(path.join(dist, 'musik-tari.mid'));
assert.equal(midi.subarray(0, 4).toString(), 'MThd');
assert.equal(midi.subarray(14, 18).toString(), 'MTrk');
assert.equal(midi.readUInt32BE(18) + 22, midi.length);
assert.ok(fs.existsSync(path.join(dist, 'vendor/THREE-LICENSE.txt')));
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.equal(config.framework, null);
assert.equal(config.outputDirectory, 'dist');
console.log(`Build ready: ${files.length} local assets, JavaScript syntax, MIDI and Vercel output verified.`);
