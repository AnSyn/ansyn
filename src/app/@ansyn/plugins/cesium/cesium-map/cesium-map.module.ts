import { NgModule } from '@angular/core';
import { CesiumMapComponent } from './cesium-map/cesium-map.component';
import { ImageryModule } from '@ansyn/imagery/imagery.module';

@NgModule({
	imports: [ImageryModule.provideMapComponents([CesiumMapComponent])],
	declarations: [CesiumMapComponent]
})
export class CesiumMapModule {
}
