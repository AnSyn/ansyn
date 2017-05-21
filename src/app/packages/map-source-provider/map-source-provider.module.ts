import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapSourceProviderContainerService } from './services/map-source-provider-container.service';

@NgModule({
	imports: [CommonModule],
	providers: [MapSourceProviderContainerService],
})

export class MapSourceProviderModule {
}
