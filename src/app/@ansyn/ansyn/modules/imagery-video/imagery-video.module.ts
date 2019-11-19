import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryVideoComponent } from './components/imagery-video/imagery-video.component';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImageryModule } from '@ansyn/imagery';
import { ImageryVideoMap } from './map/imagery-video-map';
import { ImageryVideoProvider } from './providers/imagery-video-provider';
import { OverlaysModule } from '../overlays/overlays.module';
import { ImageryVideoOverlaySourceProvider } from './providers/imagery-video-overlay-source-provider';

@NgModule({
	declarations: [ImageryVideoComponent],
	entryComponents: [ImageryVideoComponent],
	imports: [
		CommonModule,
		MapFacadeModule,
		ImageryModule.provide({
			mapSourceProviders: [ImageryVideoProvider],
			plugins: [],
			maps: [ImageryVideoMap]
		}),
		OverlaysModule.provide({
			overlaySourceProviders: [ImageryVideoOverlaySourceProvider]
		})
	]
})
export class ImageryVideoModule {
}
