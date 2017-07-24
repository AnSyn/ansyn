import { IAppState } from '../app-reducers';
import { Store } from '@ngrx/store';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Observable } from 'rxjs/Observable';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Case,CaseMapsState } from '@ansyn/menu-items/cases';
import { isEqual, isNil } from 'lodash';
import { IOverlayState } from '@ansyn/overlays';
import { ActiveMapChangedAction } from '@ansyn/map-facade';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import "@ansyn/core/utils/clone-deep";
import * as packageJson from '../../../package.json';
import { CaseMapState, Overlay, MapsLayout} from '@ansyn/core/models';
import { LoadContextsAction } from '@ansyn/menu-items/cases/actions/cases.actions';

@Component({
	selector: 'ansyn-ansyn',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit{
	@ViewChild('mapsContainer') mapsContainer;

	selected_layout$: Observable<MapsLayout> = this.store.select('status_bar')
		.map((state: IStatusBarState) => state.layouts[state.selected_layout_index])
		.distinctUntilChanged(isEqual);


	selected_case$: Observable<Case> = this.store.select('cases')
		.map((state: ICasesState) => state.selected_case)
		.cloneDeep()
		.distinctUntilChanged(isEqual);

	maps$: Observable<CaseMapsState> = this.store.select('cases')
		.map((state: ICasesState) => {
			const s_case = state.selected_case;
			return s_case ? s_case.state.maps : {data: []} as any;
		})
		.distinctUntilChanged(isEqual);


	overlays_count$ = this.store.select('overlays')
		.map((state: IOverlayState) => state.count)
		.distinctUntilChanged(isEqual);


	displayedOverlay$ = this.store.select('cases')
		.filter((cases: ICasesState) => !isNil(cases.selected_case))
		.map((cases: ICasesState) => {
			const activeMap: CaseMapState = cases.selected_case.state.maps.data.find((map) => map.id == cases.selected_case.state.maps.active_map_id);
			return activeMap.data.overlay;
		});

	histogramActive$ = this.store.select('cases')
		.filter((cases: ICasesState) => !isNil(cases.selected_case))
		.map((cases: ICasesState) => {
			const activeMap: CaseMapState = cases.selected_case.state.maps.data.find((map) => map.id == cases.selected_case.state.maps.active_map_id);
			return activeMap.data.isHistogramActive;
		});

	displayedOverlay: Overlay;
	selected_layout: MapsLayout;
	selected_case: Case;
	maps: CaseMapsState;
	overlays_count: number;
	histogramActive: boolean;
	public version;

	constructor(private store: Store<IAppState>) {
		this.version = (<any>packageJson).version;
	}

	ngOnInit(): void {
		this.store.dispatch(new LoadContextsAction());
		this.selected_case$.subscribe( selected_case => this.selected_case = selected_case);
		this.selected_layout$.subscribe( selected_layout => this.selected_layout = selected_layout);

		this.maps$.subscribe(maps => {
			this.maps = maps;
		});

		this.overlays_count$.subscribe(_overlays_count => {
			this.overlays_count = _overlays_count;
		});

		this.displayedOverlay$.subscribe((_displayedOverlay: Overlay) => {
			this.displayedOverlay = _displayedOverlay;
		});

		this.histogramActive$.subscribe((histogramActive: boolean) => {
			this.histogramActive = histogramActive;
		});
	}

	onActiveImagery(active_map_id: string) {
		if(this.selected_case.state.maps.active_map_id !== active_map_id ){
			this.store.dispatch(new ActiveMapChangedAction(active_map_id/*this.selected_case*/));
		}
	}

	layoutChangeSuccess() {
		this.store.dispatch(new UpdateMapSizeAction());
	}

	toggleEditMode($event){
		this.mapsContainer.imageriesContainer.nativeElement.classList.toggle('edit-mode');
	}
}
