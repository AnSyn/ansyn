import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BaseMapSourceProvider } from 'ansyn/node_modules/@ansyn/imagery';
import { Case } from 'ansyn/node_modules/@ansyn/menu-items/cases';
import { StartMapShadowAction } from 'ansyn/node_modules/@ansyn/map-facade/actions/map.actions';
import { CenterMarkerPlugin } from 'ansyn/node_modules/@ansyn/open-layer-center-marker-plugin';
import { MapAppEffects } from 'ansyn/src/app/app-reducers/effects/map.app.effects';
import { ToolsActionsTypes } from 'ansyn/node_modules/@ansyn/menu-items/tools';

@Injectable()
export class CustomMapAppEffect extends MapAppEffects {

  // Use super(this) for onDisplayOverlay$ add filter, map, do etc.
  onDisplayOverlay$: Observable<any> = this.onDisplayOverlay$
    .filter(() => true)
    .map(data => data)
    .do(() => {
      console.log('Do whatever you want onDisplayOverlay$');
    });

  // Override (=) onStartMapShadow$
  onStartMapShadow$: Observable<StartMapShadowAction> = this.actions$
    .ofType(ToolsActionsTypes.START_MOUSE_SHADOW)
    .map(() => new StartMapShadowAction())
    .do(() => {
      console.log('Override onStartMapShadow$');
    });
}
