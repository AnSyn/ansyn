import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { OverlayStatusComponent } from './overlay-status.component';
import { StoreModule, Store } from '@ngrx/store';

describe('OverlayStatusComponent', () => {
	let component: OverlayStatusComponent;
	let fixture: ComponentFixture<OverlayStatusComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayStatusComponent],
			imports: [StoreModule.forRoot({})]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayStatusComponent);
		component = fixture.componentInstance;
		component.mapId = 'mapId';
		component.overlay = {id: 'overlayId', };
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('check click on backToWorldView', () => {
		spyOn(component, 'backToWorldView');
		fixture.nativeElement.querySelector('.back-to-world-view').click();
		expect(component.backToWorldView).toHaveBeenCalled();
	});

	it('check click on toggleFavorite', () => {
		spyOn(component, 'toggleFavorite');
		fixture.nativeElement.querySelector('.set-favorite').click();
		expect(component.toggleFavorite).toHaveBeenCalled();
	});

	it('check click on togglePreset', () => {
		spyOn(component, 'togglePreset');
		fixture.nativeElement.querySelector('.set-preset').click();
		expect(component.togglePreset).toHaveBeenCalled();
	});
});
