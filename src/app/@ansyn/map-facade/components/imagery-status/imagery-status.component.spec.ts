import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { EntryComponentDirective } from "../../directives/entry-component.directive";
import { ENTRY_COMPONENTS_PROVIDER } from "../../models/entry-components-provider";
import { ImageryStatusComponent } from './imagery-status.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ALERTS } from '../../alerts/alerts.model';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { imageryStatusFeatureKey, ImageryStatusReducer } from '../../reducers/imagery-status.reducer';
import { MockComponent } from '../../test/mock-component';
import { FormsModule } from '@angular/forms';
import { AlertsModule } from '../../alerts/alerts.module';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';

describe('ImageryStatusComponent', () => {
	let component: ImageryStatusComponent;
	let fixture: ComponentFixture<ImageryStatusComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				FormsModule,
				AlertsModule,
				EffectsModule.forRoot([]),
				StoreModule.forRoot({
					[imageryStatusFeatureKey]: ImageryStatusReducer,
					[mapFeatureKey]: MapReducer
				})
			],
			declarations: [
				ImageryStatusComponent,
				MockComponent({
					selector: 'ansyn-popover',
					inputs: ['text', 'icon', 'popDirection']
				})
			],
			providers: [
				ImageryCommunicatorService,
				{ provide: ALERTS, useValue: [] },
				{
					provide: TranslateService, useValue: {
						get: () => EMPTY, setDefaultLang(arg) {
						}
					}
				},
				{ provide: ENTRY_COMPONENTS_PROVIDER, useValue: [] }
			]
		}).compileComponents();
	}));

	beforeEach(inject([], () => {
		fixture = TestBed.createComponent(ImageryStatusComponent);
		component = fixture.componentInstance;
		component.mapId = 'test';
		component.displayLayers = true;
		component.overlay = {} as any;
		component.mapsAmount = 2;
		fixture.detectChanges();
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('check click on toggleMapSynchronization', () => {
		spyOnProperty(component, 'noGeoRegistration', 'get').and.returnValue(false);
		component.mapsAmount = 2;
		fixture.detectChanges();
		spyOn(component.toggleMapSynchronization, 'emit');
		fixture.nativeElement.querySelector('.link-maps').click();
		expect(component.toggleMapSynchronization.emit).toHaveBeenCalled();
	});



	it('should not show link when 1 map', () => {
		component.mapsAmount = 1;
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.link-maps')).toBeNull();
	});
});
