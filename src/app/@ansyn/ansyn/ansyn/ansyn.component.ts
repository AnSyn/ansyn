import { Store } from '@ngrx/store';
import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Case } from '@ansyn/menu-items/cases';
import '@ansyn/core/utils/clone-deep';
import 'rxjs/add/operator/distinctUntilChanged';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IMenuState, menuStateSelector } from '@ansyn/menu/reducers/menu.reducer';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IAppState } from '../app-effects/app.effects.module';
import { LoadDefaultCaseAction } from '@ansyn/menu-items';
import { CoreConfig, coreStateSelector, ICoreConfig, ICoreState, SetWindowLayout, WindowLayout } from '@ansyn/core';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit {
	selectedCase$: Observable<Case> = this.store$.select(casesStateSelector)
		.pluck('selectedCase')
		.filter(selectedCase => Boolean(selectedCase))
		.distinctUntilChanged();

	isPinned$ = this.store$.select(menuStateSelector)
		.pluck<IMenuState, boolean>('isPinned')
		.distinctUntilChanged()
		.skip(1);

	windowLayout$: Observable<WindowLayout> = this.store$.select(coreStateSelector)
		.pluck<ICoreState, WindowLayout>('windowLayout')
		.distinctUntilChanged()

	mapState$: Observable<IMapState> = this.store$.select(mapStateSelector);

	activeMap$: Observable<CaseMapState> = this.mapState$
		.map(MapFacadeService.activeMap)
		.filter(activeMap => Boolean(activeMap));

	selectedCaseName$: Observable<string> = this.selectedCase$.pluck('name');
	selectedCaseName: string;
	isPinnedClass: string;

	constructor(protected store$: Store<IAppState>, @Inject(CoreConfig) public coreConfig: ICoreConfig) {
	}

	ngOnInit(): void {
		this.store$.dispatch(new LoadDefaultCaseAction());
		this.store$.dispatch(new SetWindowLayout({windowLayout: this.coreConfig.windowLayout}))
		this.selectedCaseName$.subscribe(_selectedCaseName => {
			this.selectedCaseName = _selectedCaseName;
		});

		this.isPinned$.subscribe((_isPinned: boolean) => {
			this.isPinnedClass = _isPinned ? 'isPinned' : 'isNotPinned';
		});


	}
}
