import { IAppState } from '../../app-reducers';
import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Case, CaseMapsState } from '@ansyn/menu-items/cases';
import { isEqual as _isEqual, isNil as _isNil } from 'lodash';
import '@ansyn/core/utils/clone-deep';
import * as packageJson from '../../../../package.json';
import { LoadContextsAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import 'rxjs/add/operator/distinctUntilChanged';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { MapFacadeService } from '../../packages/map-facade/services/map-facade.service';
import { IMapState } from '../../packages/map-facade/reducers/map.reducer';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit {

	selected_case$: Observable<Case> = this.store.select('cases')
		.pluck('selected_case')
		.filter(selected_case => !_isNil(selected_case))
		.distinctUntilChanged();


	mapState$: Observable<IMapState> = this.store.select('map');

	activeMap$: Observable<CaseMapState> = this.mapState$
		.map(MapFacadeService.activeMap)
		.filter(activeMap => !_isNil(activeMap));

	selectedCaseName$: Observable<string> = this.selected_case$.pluck('name');

	displayedOverlay$: any = this.activeMap$
		.pluck('data')
		.map((data: any) => data.overlay);
app
	isFavoriteOverlay$ = this.selected_case$
		.filter(selectedCase => _isNil(selectedCase.state.favoritesOverlays))
		.map((selectedCase: Case) => {
			const activeMap = CasesService.activeMap(selectedCase);
			return activeMap.data.overlay && (selectedCase.state.favoritesOverlays.indexOf(activeMap.data.overlay.id) > -1);
		});

	displayedOverlay: Overlay;
	selectedCaseName: string;
	editMode: boolean;
	isFavoriteOverlay: boolean;
	version;

	constructor(private store: Store<IAppState>) {
		this.version = (<any>packageJson).version;
	}

	ngOnInit(): void {
		this.store.dispatch(new LoadContextsAction());
		this.selectedCaseName$.subscribe(_selectedCaseName => this.selectedCaseName = _selectedCaseName);
		this.displayedOverlay$.subscribe((_displayedOverlay: Overlay) => { this.displayedOverlay = _displayedOverlay});
		this.isFavoriteOverlay$.subscribe((isFavoriteOverlay: boolean) => { this.isFavoriteOverlay = isFavoriteOverlay});
	}

	toggleEditMode() {
		this.editMode = !this.editMode;
	}

}
