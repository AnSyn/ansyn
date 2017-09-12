import { IAppState } from '../../app-reducers';
import { Store } from '@ngrx/store';
import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit {
	@ViewChild('mapsContainer') mapsContainer;

	selected_case$: Observable<Case> = this.store.select('cases')
		.pluck('selected_case')
		.filter(selected_case => !_isNil(selected_case))
		.distinctUntilChanged();

	activeMap$: Observable<CaseMapState> = this.selected_case$.map(CasesService.activeMap);

	selectedCaseName$: Observable<string> = this.selected_case$.pluck('name');

	displayedOverlay$: any = this.activeMap$
		.pluck('data')
		.map((data: any) => data.overlay);

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

	displayedOverlay: Overlay;
	selectedCaseName: string;
	editMode = false;
	isFavoriteOverlay: boolean;
	maps: CaseMapsState = null;
	version;
	pinLocation: boolean;

	constructor(private store: Store<IAppState>) {
		this.version = (<any>packageJson).version;
	}

	ngOnInit(): void {
		this.store.dispatch(new LoadContextsAction());
		this.selectedCaseName$.subscribe(_selectedCaseName => this.selectedCaseName = _selectedCaseName);
		this.maps$.subscribe(maps => {
			this.maps = maps;
		});
		this.displayedOverlay$.subscribe((_displayedOverlay: Overlay) => {
			this.displayedOverlay = _displayedOverlay;
		});
		this.isFavoriteOverlay$.subscribe((isFavoriteOverlay: boolean) => {
			this.isFavoriteOverlay = isFavoriteOverlay;
		});
		this.pinLocation$.subscribe(_pinLocation => this.pinLocation = _pinLocation);
	}

	toggleEditMode() {
		this.editMode = !this.editMode;
	}

}
