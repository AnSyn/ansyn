import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpModule } from '@angular/http';

import { TimelineComponent } from './timeline/timeline.component';
import { TimelineEmitterService } from './services/timeline-emitter.service';
import { OverlaysContainer } from './container/overlays-container.component';
import { IOverlaysConfig } from './models/overlays.config';

import { OverlaysService, OverlaysConfig } from './services/overlays.service';
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
    exports: [OverlaysContainer, TimelineComponent],
    providers: [
        OverlaysService,
        TimelineEmitterService 
    ]

})

export class OverlaysModule {
    static forRoot(config: IOverlaysConfig): ModuleWithProviders {
        return {
            ngModule: OverlaysModule,
            providers: [
                OverlaysService,
                TimelineEmitterService, 
                { provide: OverlaysConfig, useValue: config }
            ]
        }
    }
}
