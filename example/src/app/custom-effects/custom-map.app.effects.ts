import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Case, MapAppEffects, StartMapShadowAction, ToolsActionsTypes } from 'ansyn';

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
