#!/bin/sh
cd src/app/\@ansyn/imagery-submodules;
npm i;
npm run lint;
npm run test:single-run;
npm run build:libs;
npm run rm:nodemodules;

