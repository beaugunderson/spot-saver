#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';

const response = await axios.get('http://oams.space:18381/spots.json');

const grids = response.data.data;

const SPOT_FILE = './spots.csv';

if (!fs.existsSync(SPOT_FILE)) {
  fs.writeFileSync(SPOT_FILE, 'timestamp,grid,band,r,t,rS,tS,d\n');
}

function insert(...args) {
  fs.appendFileSync(SPOT_FILE, args.join(',') + '\n');
}

const timestamp = response.data.time;

// r is the number of recievers reporting
// t is the number of transmitters
// d is decodes
// rS = recieverSpot count
// the rS count, is the number of other GT users spotted by r's in that grid
// tS = txSpot count, from other GT users
// rS, tS are total counts, last 5 minutes

for (const grid of Object.keys(grids).sort()) {
  const bands = JSON.parse(grids[grid]);

  for (const band of Object.keys(bands)) {
    insert(timestamp, grid, band, bands[band].r, bands[band].t, bands[band].rS, bands[band].tS, bands[band].d);
  }
}
