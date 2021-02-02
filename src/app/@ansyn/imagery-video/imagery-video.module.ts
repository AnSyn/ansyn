import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryVideoComponent } from './components/imagery-video/imagery-video.component';
import { ImageryModule } from '@ansyn/imagery';
import { ImageryVideoMap } from './map/imagery-video-map';
import { ImageryVideoProvider } from './providers/imagery-video-provider';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ImageryVideoComponent],
	imports: [
		CommonModule,
		TranslateModule,
		ImageryModule.provide({
			mapSourceProviders: [ImageryVideoProvider],
			plugins: [],
			maps: [ImageryVideoMap]
		})
	]
})
export class ImageryVideoModule {
}
