/**
 * Created by AsafMasa on 25/04/2017.
 */
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { ImageryCommunicatorService, ImageryConfig } from './api/imageryCommunicator.service';
import { ImageryProviderService } from './imageryProviderService/imageryProvider.service';
import { IImageryConfig } from './model/model';

@NgModule({
  imports: [CommonModule],
  declarations: [ImageryComponent],
  providers: [ImageryCommunicatorService, ImageryProviderService],
  exports: [ImageryComponent]
})
export class ImageryModule {

	static forRoot(config: IImageryConfig): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [
				ImageryCommunicatorService,
				ImageryProviderService,
				{ provide: ImageryConfig, useValue: config }
			]
		};
	}
}
