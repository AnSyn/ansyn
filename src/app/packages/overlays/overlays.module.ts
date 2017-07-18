import {BaseOverlaySourceProvider} from './models/base-overlay-source-provider.model';
import { NgModule, ModuleWithProviders, Type } from '@angular/core';
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
    static forRoot(config: IOverlaysConfig,overlaySourceProviderType?: Type<BaseOverlaySourceProvider>): ModuleWithProviders {
        let providers : Array<any> = [
                OverlaysService,
                TimelineEmitterService,
                { provide : OverlaysConfig, useValue: config }
            ];
        if (overlaySourceProviderType && overlaySourceProviderType !== null){
            providers.push({ provide : BaseOverlaySourceProvider, useClass: overlaySourceProviderType })
        }
        return {
            ngModule: OverlaysModule,
            providers: providers
        }
    }
}
