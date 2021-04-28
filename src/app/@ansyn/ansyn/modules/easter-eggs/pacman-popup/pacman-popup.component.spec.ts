import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { PacmanPopupComponent } from './pacman-popup.component';
import { Store, StoreModule } from "@ngrx/store";
import { IStatusBarState, statusBarFeatureKey, StatusBarReducer } from "../../status-bar/reducers/status-bar.reducer";
import { selectActiveMapId, selectMapsList, selectOverlayOfActiveMap } from "@ansyn/map-facade";
import { of } from "rxjs";

describe('PacmanPopupComponent', () => {
	let component: PacmanPopupComponent;
	let fixture: ComponentFixture<PacmanPopupComponent>;
	let store: Store<IStatusBarState>;
	let statusBarState: IStatusBarState;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[statusBarFeatureKey]: StatusBarReducer
				})
			],
			declarations: [ PacmanPopupComponent ]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		store = _store;

		fixture = TestBed.createComponent(PacmanPopupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
