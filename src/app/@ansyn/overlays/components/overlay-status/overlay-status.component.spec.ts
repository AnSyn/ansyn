import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { OverlayStatusComponent } from './overlay-status.component';
import {
	IOverlaysState,
	OverlayReducer,
	overlaysFeatureKey,
	selectLoading,
	selectStatusMessage
} from '../../reducers/overlays.reducer';
import { Store, StoreModule } from '@ngrx/store';
import { EventEmitter } from '@angular/core';

describe('OverlayStatusComponent', () => {
	let component: OverlayStatusComponent;
	let fixture: ComponentFixture<OverlayStatusComponent>;
	let store: Store<IOverlaysState>;
	const selectStatusMessageMock$ = new EventEmitter();
	const selectLoadingMock$ = new EventEmitter();

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayStatusComponent],
			imports: [
				StoreModule.forRoot({
					[overlaysFeatureKey]: OverlayReducer
				})
			]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(OverlayStatusComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;

		const fakeStore = new Map<any, any>([
			[selectStatusMessage, selectStatusMessageMock$],
			[selectLoading, selectLoadingMock$]
		]);

		spyOn(store, 'select').and.callFake(type => fakeStore.get(type));
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('Should change "showStatus" to true only if statusMessage exists and not loading', async(async () => {
		expect(component.showStatus).toBeFalsy();

		selectStatusMessageMock$.emit('message!!');
		selectLoadingMock$.emit(false);
		await component.showStatus$.toPromise();
		expect(component.showStatus).toBeTruthy();

		selectStatusMessageMock$.emit(null);
		await component.showStatus$.toPromise();
		expect(component.showStatus).toBeFalsy();

	}));

});
