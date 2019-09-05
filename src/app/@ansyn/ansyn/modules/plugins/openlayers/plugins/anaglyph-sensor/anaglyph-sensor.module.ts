import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { AnaglyphSensorPlugin } from './plugin/anaglyph-sensor.plugin';
import { ansynConfig } from '../../../../../config/ansyn.config';
import { AnaglyphSensorService } from './service/anaglyph-sensor.service';
import { AnaglyphSensorAlertComponent } from './alert-component/anaglyph-sensor-alert.component';
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
			maps: [],
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
