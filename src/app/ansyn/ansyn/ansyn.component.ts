import { IAppState } from '../../app-reducers';
import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Case } from '@ansyn/menu-items/cases';
import { isEqual as _isEqual, isNil as _isNil } from 'lodash';
import '@ansyn/core/utils/clone-deep';
import packageJson from '../../../../package.json';
import { LoadContextsAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import 'rxjs/add/operator/distinctUntilChanged';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { IMenuState } from '@ansyn/menu/reducers/menu.reducer';

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

	isPinned$ = this.store.select<IMenuState>('menu')
		.pluck<IMenuState, boolean>('isPinned')
		.distinctUntilChanged()
		.skip(1);

	mapState$: Observable<IMapState> = this.store.select('map');

	activeMap$: Observable<CaseMapState> = this.mapState$
		.map(MapFacadeService.activeMap)
		.filter(activeMap => !_isNil(activeMap));

	selectedCaseName$: Observable<string> = this.selected_case$.pluck('name');

	displayedOverlay$: any = this.activeMap$
		.pluck('data')
		.map((data: any) => data.overlay)
		.distinctUntilChanged();

	isFavoriteOverlay$ = this.selected_case$
		.withLatestFrom(this.activeMap$)
		.filter(([selectedCase]) => !_isNil(selectedCase.state.favoritesOverlays))
		.distinctUntilChanged(([oldCase], [newCase]): boolean => _isEqual(oldCase.state.favoritesOverlays, newCase.state.favoritesOverlays))
		.map(([selectedCase, activeMap]: [Case, CaseMapState]) => {
			return activeMap.data.overlay && (selectedCase.state.favoritesOverlays.includes(activeMap.data.overlay.id));
		});

	displayedOverlay: Overlay;
	selectedCaseName: string;
	isFavoriteOverlay: boolean;
	version = packageJson.version;
	isPinnedClass: string;

	constructor(private store: Store<IAppState>) {
	}

	ngOnInit(): void {
		this.store.dispatch(new LoadContextsAction());

		this.selectedCaseName$.subscribe(_selectedCaseName => {
			this.selectedCaseName = _selectedCaseName;
		});

		this.displayedOverlay$
			.withLatestFrom(this.selected_case$)
			.filter(([overlay, selectedCase]: [Overlay, Case]) => {
				return Boolean(selectedCase);
			})
			.subscribe(([overlay, selectedCase]: [Overlay, Case]) => {
				this.displayedOverlay = overlay;
				if (Boolean(overlay)) {
					this.isFavoriteOverlay = selectedCase.state.favoritesOverlays.includes(overlay.id);
				} else {
					this.isFavoriteOverlay = false;
				}
			});

		this.isFavoriteOverlay$.subscribe((isFavoriteOverlay: boolean) => {
			this.isFavoriteOverlay = isFavoriteOverlay;
		});

		this.isPinned$.subscribe((_isPinned: boolean) => {
			this.isPinnedClass = _isPinned ? 'isPinned' : 'isNotPinned';
		});
	}

}
