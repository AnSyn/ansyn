import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpModule } from '@angular/http';

import { TimelineComponent } from './timeline/timeline.component';
import { TimelineEmitterService } from './services/timeline-emitter.service';
import { OverlaysContainer } from './container/overlaysContainer.component';

import { OverlaysService } from './services/overlays.service';
import { OverlaysEffects } from "./effects/overlays.effects";
import { EffectsModule } from "@ngrx/effects";

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    EffectsModule.run(OverlaysEffects)
  ],

  declarations: [
    TimelineComponent,
    OverlaysContainer
  ],
  exports: [OverlaysContainer,TimelineComponent],
  providers: [
  	OverlaysService,
  	TimelineEmitterService
  ]
})

export class OverlaysModule {
	constructor(){

	}
}
