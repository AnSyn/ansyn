import { NgModule } from '@angular/core';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { CesiumMap } from './cesium-map';

@NgModule({
	imports: [ImageryModule.provideIMaps([CesiumMap])]
})
export class CesiumMapModule {
}
