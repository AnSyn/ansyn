import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { AnaglyphSensorPlugin } from './plugin/anaglyph-sensor.plugin';
import { AnaglyphSensorService } from './service/anaglyph-sensor.service';
import { AnaglyphSensorAlertComponent } from './alert-component/anaglyph-sensor-alert.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	imports: [
		CommonModule,
		ImageryModule.provide({
			plugins: [
				AnaglyphSensorPlugin
			],
			maps: [],
			mapSourceProviders: []
		}),
		TranslateModule
	],
	providers: [AnaglyphSensorService],
	entryComponents: [AnaglyphSensorAlertComponent],
	declarations: [AnaglyphSensorAlertComponent]
})
export class OpenlayersAnaglyphSensorModule {

}
