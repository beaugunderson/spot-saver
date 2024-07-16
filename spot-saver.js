#!/usr/bin/env node

import axios from 'axios';
import Database from 'better-sqlite3';

const db = new Database('./spots.sqlite');

db.pragma('journal_mode = wal');

process.on('exit', () => db.close());

// r is the number of recievers reporting
// t is the number of transmitters
// d is decodes
// rS = recieverSpot count
// the rS count, is the number of other GT users spotted by r's in that grid
// tS = txSpot count, from other GT users
// rS, tS are total counts, last 5 minutes

const migrations = [
  `CREATE TABLE IF NOT EXISTS spots (
     timestamp INTEGER,

     grid TEXT,
     band INTEGER,

     receivers INTEGER,
     transmitters INTEGER,

     receiver_spots INTEGER,
     transmitter_spots INTEGER,

     decodes INTEGER,

     UNIQUE(timestamp, grid, band) ON CONFLICT REPLACE
   )`
];

for (const statement of migrations) {
  db.prepare(statement).run();
}

function insert(...row) {
  db.prepare(`INSERT INTO spots
              (timestamp, grid, band, receivers, transmitters, receiver_spots, transmitter_spots, decodes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(row);
}

const response = await axios.get('http://oams.space:18381/spots.json');
const grids = response.data.data;

for (const grid of Object.keys(grids).sort()) {
  const bands = JSON.parse(grids[grid]);

  for (const band of Object.keys(bands)) {
    insert(response.data.time, grid, parseInt(band, 10), bands[band].r, bands[band].t, bands[band].rS, bands[band].tS, bands[band].d);
  }
}
