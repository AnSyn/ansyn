import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpModule } from '@angular/http';

import { TimelineComponent } from './timeline/timeline.component';
import { TimelineService } from './services/timeline.service';
import { TimelineEmitterService } from './services/timeline-emitter.service';
import { ContainerComponent } from './container/container.component';

import { StoreModule } from '@ngrx/store';

import * as timelineReducer from './reducers/timeline.reducer';
import { OverlayEffects } from './effects/timeline.effects';
import { EffectsModule } from '@ngrx/effects';

export const TimelineReducer = timelineReducer.reducer;

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    EffectsModule.run(OverlayEffects)
  ],
  
  declarations: [TimelineComponent,ContainerComponent],
  exports: [ContainerComponent],
  providers: [TimelineService,TimelineEmitterService]
})

export class TimelineModule { 
	constructor(){

	}
}
