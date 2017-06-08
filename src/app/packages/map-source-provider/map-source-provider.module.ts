import { BaseSourceProvider } from './models/models';
import { NgModule,Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapSourceProviderContainerService } from './services/map-source-provider-container.service';

@NgModule({
	imports: [CommonModule],
	providers: [
		MapSourceProviderContainerService,
	]
})
export class MapSourceProviderModule {
	// static register(type : Function) : {
    //     ngModule: typeof MapSourceProviderModule;
    //     providers: (Function | {
    //         provide: typeof BaseSourceProvider;
    //         useClass: Function;
    //         multi: boolean;
    //     })[];
    // } {
	static register(type : Type<any>){
        return {
            ngModule : MapSourceProviderModule,
            providers : [
                 { provide: BaseSourceProvider, useClass: type, multi: true }
            ]
        }
    }
}
