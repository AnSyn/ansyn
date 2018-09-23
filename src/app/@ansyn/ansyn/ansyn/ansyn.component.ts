import { Store } from '@ngrx/store';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/distinctUntilChanged';
import { ICase, ICaseMapState } from '@ansyn/core';
import { MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { selectIsPinned } from '@ansyn/menu';
import { selectSelectedCase } from '@ansyn/menu-items';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent {
	selectedCaseName$: Observable<string> = this.store$
		.pipe(
			select(selectSelectedCase),
			map((selectSelected: ICase) => selectSelected ? selectSelected.name : 'Default Case')
		);

	isPinnedClass$: Observable<string> = this.store$.select(selectIsPinned)
		.map((_isPinned) => _isPinned ? 'isPinned' : 'isNotPinned');

	activeMap$: Observable<ICaseMapState> = this.store$
		.pipe(
			select(mapStateSelector),
			filter(Boolean),
			map(MapFacadeService.activeMap),
			filter(Boolean)
		);

	@Input() version;

	constructor(protected store$: Store<any>) {
	}
}
