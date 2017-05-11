import { NgModule ,ModuleWithProviders , OpaqueToken} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISourceProvider } from './models/models'
import { sourceMapProviders,MapSourceProviderContainer } from './services/map-source-provider-container.service';

@NgModule({
    imports: [CommonModule],
    exports: [MapSourceProviderContainer],
    providers: [MapSourceProviderContainer],
})
export class MapSourceProviderModule { 
    static forRoot(mapProviders : ISourceProvider[]) : ModuleWithProviders{
        return {
            ngModule : MapSourceProviderModule,
            providers : [
                {provide: sourceMapProviders , useValue: mapProviders}
            ]
        }
    }
}
