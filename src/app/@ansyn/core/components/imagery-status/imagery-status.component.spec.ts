import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ImageryStatusComponent } from './imagery-status.component';
import { StoreModule } from '@ngrx/store';
import { Overlay } from '../../models/overlay.model';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '../../models/logger.config';
import { CoreModule } from '@ansyn/core';


describe('ImageryStatusComponent', () => {
	let component: ImageryStatusComponent;
	let fixture: ComponentFixture<ImageryStatusComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [CoreModule, EffectsModule.forRoot([]), StoreModule.forRoot({})],
			providers: [{ provide: LoggerConfig, useValue: {} }]
		}).compileComponents();
	}));

	beforeEach(inject([], () => {
		fixture = TestBed.createComponent(ImageryStatusComponent);
		component = fixture.componentInstance;
		component.mapId = 'test';
		component.overlay = {} as Overlay;
		component.mapsAmount = 2;
		fixture.detectChanges();
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('check click on backToWorldView', () => {
		spyOn(component.backToWorldView, 'emit');
		fixture.nativeElement.querySelector('.back-to-world-view').click();
		expect(component.backToWorldView.emit).toHaveBeenCalled();
	});

	it('check click on toggleMapSynchronization', () => {
		spyOnProperty(component, 'noGeoRegistration', 'get').and.returnValue(false);
		spyOn(component.toggleMapSynchronization, 'emit');
		fixture.detectChanges();
		fixture.nativeElement.querySelector('.link-maps').click();
		expect(component.toggleMapSynchronization.emit).toHaveBeenCalled();
	});

	it('check click on toggleFavorite', () => {
		spyOn(component, 'toggleFavorite');
		fixture.nativeElement.querySelector('.set-favorite').click();
		expect(component.toggleFavorite).toHaveBeenCalled();
	});

	it('should not show link when 1 map', () => {
		component.mapsAmount = 1;
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.link-maps')).toBeNull();
	});
});
