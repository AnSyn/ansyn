import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import '@ansyn/core/utils/clone-deep';
import 'rxjs/add/operator/distinctUntilChanged';
import { Case, CaseMapState } from '@ansyn/core/models/case.model';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IMenuState, menuStateSelector } from '@ansyn/menu/reducers/menu.reducer';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IAppState } from '../app-effects/app.effects.module';
import { coreStateSelector, ICoreState, WindowLayout } from '@ansyn/core/reducers/core.reducer';


export const ansynComponentMeta = {
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
};


@Component(ansynComponentMeta)

export class AnsynComponent implements OnInit {
	selectedCase$: Observable<Case> = this.store$.select(casesStateSelector)
		.pluck<ICasesState, Case>('selectedCase')
		.filter(selectedCase => Boolean(selectedCase))
		.distinctUntilChanged();

	isPinned$ = this.store$.select(menuStateSelector)
		.pluck<IMenuState, boolean>('isPinned')
		.distinctUntilChanged()
		.skip(1);

	windowLayout$: Observable<WindowLayout> = this.store$.select(coreStateSelector)
		.pluck<ICoreState, WindowLayout>('windowLayout')
		.distinctUntilChanged();

	mapState$: Observable<IMapState> = this.store$.select(mapStateSelector);

	activeMap$: Observable<CaseMapState> = this.mapState$
		.map(MapFacadeService.activeMap)
		.filter(activeMap => Boolean(activeMap));

	selectedCaseName$: Observable<string> = this.selectedCase$.pluck('name');
	selectedCaseName: string;
	isPinnedClass: string;

	constructor(protected store$: Store<IAppState>) {
	}

	ngOnInit(): void {
		this.selectedCaseName$.subscribe(_selectedCaseName => {
			this.selectedCaseName = _selectedCaseName;
		});

		this.isPinned$.subscribe((_isPinned: boolean) => {
			this.isPinnedClass = _isPinned ? 'isPinned' : 'isNotPinned';
		});
	}
}
