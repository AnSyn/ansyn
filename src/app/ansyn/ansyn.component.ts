import { IAppState } from '../app-reducers';
import { Store } from '@ngrx/store';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Observable } from 'rxjs/Observable';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Case,CaseMapsState } from '@ansyn/menu-items/cases';
import { isEqual as _isEqual, isNil as _isNil} from 'lodash';
import { ActiveMapChangedAction } from '@ansyn/map-facade';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import "@ansyn/core/utils/clone-deep";
import * as packageJson from '../../../package.json';
import { MapsLayout} from '@ansyn/core/models';
import { LoadContextsAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import 'rxjs/add/operator/distinctUntilChanged';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { CaseMapState } from '../packages/core/models/case.model';

@Component({
	selector: 'ansyn-ansyn',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit{
	@ViewChild('mapsContainer') mapsContainer;

	selected_case$: Observable<Case> = this.store.select('cases')
		.pluck('selected_case')
		.filter(selected_case => !_isNil(selected_case))
		.distinctUntilChanged(_isEqual);

	activeMap$: Observable<CaseMapState> = this.selected_case$.map(CasesService.activeMap);

	selectedCaseName$: Observable<string> = this.selected_case$.pluck('name');

	overlays_count$ = this.store.select('overlays')
		.map((state: IOverlayState) => state.count)
		.distinctUntilChanged(_isEqual);

	displayedOverlay$: any = this.activeMap$
		.pluck('data')
		.map((data: any) => data.overlay);

	selected_layout$: Observable<MapsLayout> = this.store.select('status_bar')
		.map((state: IStatusBarState) => state.layouts[state.selected_layout_index])
		.distinctUntilChanged(_isEqual);

	isFavoriteOverlay$ = this.selected_case$
		.filter(selectedCase => _isNil(selectedCase.state.favoritesOverlays))
		.map((selectedCase: Case) => {
			const activeMap = CasesService.activeMap(selectedCase);
			return activeMap.data.overlay && (selectedCase.state.favoritesOverlays.indexOf(activeMap.data.overlay.id) > -1);
		});

	maps$: Observable<CaseMapsState> = this.selected_case$
		.map((selectedCase: Case) => selectedCase.state.maps)
		.distinctUntilChanged(_isEqual);

	pinLocation$: Observable<boolean> = this.store.select('tools')
		.pluck('flags')
		.map((flags: Map<any, any>) => flags.get('pin_location'))
		.distinctUntilChanged(_isEqual);

	overlays_count = 0;
	displayedOverlay: Overlay;
	selectedCaseName: string;
	selected_layout: MapsLayout;
	editMode = false;
	isFavoriteOverlay: boolean;
	maps: CaseMapsState = <any>{};
	version;
	pinLocation: boolean;
	counter = 0;

	constructor(private store: Store<IAppState>) {
		this.version = (<any>packageJson).version;
	}

	ngOnInit(): void {
		this.store.dispatch(new LoadContextsAction());
		this.selectedCaseName$.subscribe(_selectedCaseName => this.selectedCaseName = _selectedCaseName);
		this.maps$.subscribe(maps => this.maps = maps);
		this.overlays_count$.subscribe(_overlays_count => { this.overlays_count = _overlays_count});
		this.displayedOverlay$.subscribe((_displayedOverlay: Overlay) => { this.displayedOverlay = _displayedOverlay});
		this.isFavoriteOverlay$.subscribe((isFavoriteOverlay: boolean) => { this.isFavoriteOverlay = isFavoriteOverlay});
		this.pinLocation$.subscribe( _pinLocation => this.pinLocation = _pinLocation);
		this.selected_layout$.subscribe( selected_layout => { this.selected_layout = selected_layout});

	}

	setActiveImagery(active_map_id: string) {
		if(this.maps.active_map_id !== active_map_id ){
			this.store.dispatch(new ActiveMapChangedAction(active_map_id));
		}
	}

	layoutChangeSuccess() {
		this.store.dispatch(new UpdateMapSizeAction());
	}

	toggleEditMode(){
		this.editMode = !this.editMode;
	}

}
