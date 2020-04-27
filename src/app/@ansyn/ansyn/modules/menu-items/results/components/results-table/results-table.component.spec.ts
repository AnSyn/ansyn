import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ResultsTableComponent } from './results-table.component';
import { TranslateModule } from "@ngx-translate/core";
import { Store, StoreModule } from "@ngrx/store";
import { StatusBarConfig } from "../../../../status-bar/models/statusBar.config";
import { LoadCasesAction } from "../../../cases/actions/cases.actions";
import { store } from "@angular/core/src/render3";
import {
	IOverlaysState,
	MarkUpClass,
	OverlayReducer,
	overlaysFeatureKey
} from "../../../../overlays/reducers/overlays.reducer";
import { DisplayOverlayFromStoreAction, SetMarkUp } from "../../../../overlays/actions/overlays.actions";
import { IOverlay } from "../../../../overlays/models/overlay.model";
import { ICasesState } from "../../../cases/reducers/cases.reducer";
import { CasesTableComponent } from "../../../cases/components/cases-table/cases-table.component";

describe('ResultsTableComponent', () => {
	let component: ResultsTableComponent;
	let fixture: ComponentFixture<ResultsTableComponent>;
	let store: Store<IOverlaysState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(),
				StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer })],
			declarations: [ResultsTableComponent],
			providers: [{
				provide: StatusBarConfig,
				useValue: { toolTips: {} }
			}]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IOverlaysState>) => {
		spyOn(_store, 'dispatch');
		fixture = TestBed.createComponent(ResultsTableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('openOverlay should dispatch DisplayOverlayFromStoreAction', () => {
		const overlay: IOverlay = {
			azimuth: 0,
			date: undefined,
			id: "",
			isGeoRegistered: undefined,
			name: "",
			photoTime: ""
		};
		component.openOverlay(overlay);
		expect(store.dispatch).toHaveBeenCalledWith(new DisplayOverlayFromStoreAction({ id: overlay.id }));
	});

	it('onMouseOver should dispatch SetMarkUp', () => {
		const $event = jasmine.createSpyObj({ stopPropagation: () => null });
		const id = "1";
		component.onMouseOver($event, id);
		expect(store.dispatch).toHaveBeenCalledWith(new SetMarkUp({
			classToSet: MarkUpClass.hover,
			dataToSet: { overlaysIds: [id] },
			customOverviewElement: $event.currentTarget
		}));
	});


	it('onMouseOut should dispatch SetMarkUp', () => {
		component.onMouseOut();
		expect(store.dispatch).toHaveBeenCalledWith(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
	});
});
