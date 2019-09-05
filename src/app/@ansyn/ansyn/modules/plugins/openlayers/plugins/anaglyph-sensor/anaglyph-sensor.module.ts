import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { AnaglyphSensorPlugin } from './anaglyph-sensor-plugin/anaglyph-sensor.plugin';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/ol';
import { ansynConfig } from '../../../../../config/ansyn.config';
import { AnaglyphSensorService } from './anaglyph-sensor-service/anaglyph-sensor.service';
import { AnaglyphSensorAlertComponent } from './anaglyph-sensor-alert/anaglyph-sensor-alert.component';
import { TranslateModule } from '@ngx-translate/core';

ansynConfig.ansynAlerts.push(
	{
		key: 'anaglyphSensor',
		component: AnaglyphSensorAlertComponent
	}
);

@NgModule({
	imports: [
		CommonModule,
		ImageryModule.provide({
			plugins: [
				AnaglyphSensorPlugin
			],
			maps: [OpenLayersMap, OpenLayersDisabledMap],
			mapSourceProviders: []
		}),
		TranslateModule.forRoot()
	],
	providers: [AnaglyphSensorService],
	entryComponents: [AnaglyphSensorAlertComponent],
	declarations: [AnaglyphSensorAlertComponent]
})
export class OpenlayersAnaglyphSensorModule {

}
