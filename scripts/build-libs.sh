#!/bin/bash

ng build @ansyn/core
ng build @ansyn/menu
ng build @ansyn/overlays
ng build @ansyn/status-bar
ng build @ansyn/imagery
ng build @ansyn/map-facade
ng build @ansyn/context
ng build @ansyn/menu-items
ng build @ansyn/plugins
ng build @ansyn/ansyn
cp -rf /src/app/@ansyn/assets /dist/ansyn/assets
