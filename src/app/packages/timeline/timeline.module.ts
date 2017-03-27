import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule }   from '@angular/router';


import { Ng2MobxModule } from 'ng2-mobx';
import { HttpModule } from '@angular/http';

import { TimelineComponent } from './timeline/timeline.component';
import { TimelineService } from './services/timeline.service';
import { TimelineEmitterService } from './services/timeline-emitter.service';
import { ContainerComponent } from './container/container.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{
    	path: 'event-drops',component:ContainerComponent
    }])
  ],
  declarations: [TimelineComponent, ContainerComponent],
  providers: [TimelineService,TimelineEmitterService]
})
export class TimelineModule { 
	constructor(){

	}
}
