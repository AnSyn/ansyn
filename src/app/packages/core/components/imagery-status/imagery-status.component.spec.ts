import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ImageryStatusComponent } from './imagery-status.component';
import { Store, StoreModule } from '@ngrx/store';
import { CoreModule } from '@ansyn/core';
import { Overlay } from '../../models/overlay.model';


describe('', () => {
	let component: ImageryStatusComponent;
	let fixture: ComponentFixture<ImageryStatusComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [CoreModule, StoreModule.forRoot({})]
		})
			.compileComponents();
	}));

	beforeEach(inject([], () => {
		fixture = TestBed.createComponent(ImageryStatusComponent);
		component = fixture.componentInstance;
		component.map_id = 'test';
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
		spyOn(component.toggleMapSynchronization, 'emit');
		fixture.nativeElement.querySelector('.status-bar-link-maps-icon').click();
		expect(component.toggleMapSynchronization.emit).toHaveBeenCalled();
	});

	it('check click on toggleFavorite', () => {
		spyOn(component.toggleFavorite, 'emit');
		fixture.nativeElement.querySelector('.status-bar-favorite-icon').click();
		expect(component.toggleFavorite.emit).toHaveBeenCalled();
	});

	it('should not show link when 1 map', () => {
		component.mapsAmount = 1;
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.status-bar-link-maps-icon')).toBeNull();
	});
});
