import { IAppState } from '../../app-effects';
import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Case } from '@ansyn/menu-items/cases';
import { isNil as _isNil } from 'lodash';
import '@ansyn/core/utils/clone-deep';
import * as packageJson from '../../../../../package.json';
import { LoadContextsAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import 'rxjs/add/operator/distinctUntilChanged';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IMenuState, menuStateSelector } from '@ansyn/menu/reducers/menu.reducer';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit {
	selectedCase$: Observable<Case> = this.store$.select(casesStateSelector)
		.pluck('selectedCase')
		.filter(selectedCase => !_isNil(selectedCase))
		.distinctUntilChanged();

	isPinned$ = this.store$.select(menuStateSelector)
		.pluck<IMenuState, boolean>('isPinned')
		.distinctUntilChanged()
		.skip(1);

	mapState$: Observable<IMapState> = this.store$.select(mapStateSelector);

	activeMap$: Observable<CaseMapState> = this.mapState$
		.map(MapFacadeService.activeMap)
		.filter(activeMap => !_isNil(activeMap));

	selectedCaseName$: Observable<string> = this.selectedCase$.pluck('name');
	selectedCaseName: string;
	version = (<any>packageJson).version;
	isPinnedClass: string;

	constructor(protected store$: Store<IAppState>) {
	}

	ngOnInit(): void {
		this.store$.dispatch(new LoadContextsAction());

		this.selectedCaseName$.subscribe(_selectedCaseName => {
			this.selectedCaseName = _selectedCaseName;
		});

		this.isPinned$.subscribe((_isPinned: boolean) => {
			this.isPinnedClass = _isPinned ? 'isPinned' : 'isNotPinned';
		});
	}
}
