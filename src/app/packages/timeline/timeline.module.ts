import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpModule } from '@angular/http';

import { TimelineComponent } from './timeline/timeline.component';
import { TimelineService } from './services/timeline.service';
import { TimelineEmitterService } from './services/timeline-emitter.service';
import { OverlayContainerComponent } from './container/container.component';

import { StoreModule } from '@ngrx/store';

import * as timelineReducer from './reducers/timeline.reducer';
import { OverlayEffects } from './effects/timeline.effects';
import { EffectsModule } from '@ngrx/effects';



@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    EffectsModule.run(OverlayEffects)
  ],
  
  declarations: [TimelineComponent,OverlayContainerComponent],
  exports: [OverlayContainerComponent],
  providers: [TimelineService,TimelineEmitterService]
})

export class TimelineModule { 
	constructor(){

	}
}
