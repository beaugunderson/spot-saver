#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';

const response = await axios.get('http://oams.space:18381/spots.json');

const grids = response.data.data;

const SPOT_FILE = './spots.csv';

if (!fs.existsSync(SPOT_FILE)) {
  fs.writeFileSync(SPOT_FILE, 'grid,band,r,t,rS,tS,d\n');
}

function insert(...args) {
  fs.appendFileSync(SPOT_FILE, args.join(',') + '\n');
}

for (const grid of Object.keys(grids).sort()) {
  const bands = JSON.parse(grids[grid]);

  for (const band of Object.keys(bands)) {
    insert(grid, band, bands[band].r, bands[band].t, bands[band].rS, bands[band].tS, bands[band].d);
  }
}
