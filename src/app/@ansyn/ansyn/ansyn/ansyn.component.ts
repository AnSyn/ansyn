import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/distinctUntilChanged';
import { ICase, ICaseMapState } from '@ansyn/core';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { selectIsPinned } from '@ansyn/menu/reducers/menu.reducer';
import { selectSelectedCase } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Input } from '@angular/core';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent {
	selectedCaseName$: Observable<string> = this.store$.select(selectSelectedCase)
		.map((selectSelected: ICase) => selectSelected ? selectSelected.name : 'Default Case');

	isPinnedClass$: Observable<string> = this.store$.select(selectIsPinned)
		.map((_isPinned) => _isPinned ? 'isPinned' : 'isNotPinned');

	activeMap$: Observable<ICaseMapState> = this.store$.select(mapStateSelector)
		.filter(Boolean)
		.map(MapFacadeService.activeMap)
		.filter(Boolean);

	@Input() version;

	constructor(protected store$: Store<any>) {
	}
}
