import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpModule } from '@angular/http';

import { TimelineComponent } from './timeline/timeline.component';
import { TimelineService } from './services/timeline.service';
import { TimelineEmitterService } from './services/timeline-emitter.service';
import { ContainerComponent } from './container/container.component';

@NgModule({
  imports: [
    CommonModule,HttpModule
  ],
  declarations: [TimelineComponent, ContainerComponent],
  exports: [ContainerComponent],
  providers: [TimelineService,TimelineEmitterService]
})
export class TimelineModule { 
	constructor(){

	}
}
