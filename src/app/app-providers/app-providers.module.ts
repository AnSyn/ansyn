import { BaseOverlaySourceProvider } from '@ansyn/overlays';
import { IIdahoOverlaySourceConfig, IdahoSourceProvider, IdahoOverlaysSourceConfig } from './overlay-source-providers/idaho-source-provider';
import { OpenLayerBingSourceProvider } from './map-source-providers/open-layers-BING-source-provider';
import { OpenLayerIDAHOSourceProvider } from './map-source-providers/open-layers-IDAHO-source-provider';
import { OpenLayerOSMSourceProvider } from './map-source-providers/open-layers-OSM-source-provider';
import { OpenLayerTileWMSSourceProvider } from './map-source-providers/open-layers-TileWMS-source-provider';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { BaseMapSourceProvider, BaseMapVectorLayerProvider } from '@ansyn/imagery';
import { FilterMetadata, EnumFilterMetadata, SliderFilterMetadata } from '@ansyn/menu-items/filters';
import { OpenLayerOSMVectorLayerProvider } from './map-vector-layer-providers/open-layers-OSM-vector-layer-provider';

@NgModule({
    providers: [{ provide: BaseMapSourceProvider, useClass: OpenLayerTileWMSSourceProvider, multi: true },
    { provide: BaseMapSourceProvider, useClass: OpenLayerOSMSourceProvider, multi: true },
    { provide: BaseMapSourceProvider, useClass: OpenLayerIDAHOSourceProvider, multi: true },
    { provide: BaseMapSourceProvider, useClass: OpenLayerBingSourceProvider, multi: true },
    { provide: BaseOverlaySourceProvider, useClass: IdahoSourceProvider },
    { provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true },
    { provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true },
    { provide: BaseMapVectorLayerProvider, useClass: OpenLayerOSMVectorLayerProvider, multi: true },
],

})
export class AppProvidersModule {
    static forRoot(idahoOverlaySourceConfig: IIdahoOverlaySourceConfig): ModuleWithProviders {
        return {
            ngModule: AppProvidersModule,
            providers: [
                { provide: IdahoOverlaysSourceConfig, useValue: idahoOverlaySourceConfig }
            ]
        };
    }
}

