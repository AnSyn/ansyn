import { Store } from '@ngrx/store';
import { Component, HostBinding, Input } from '@angular/core';
import { ICase } from '@ansyn/core';
import { MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { selectIsPinned } from '@ansyn/menu';
import { LoadDefaultCaseAction, selectSelectedCase } from '@ansyn/menu-items';
import { select } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { Inject } from '@angular/core';
import { COMPONENT_MODE } from '../app-providers/component-mode';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent {
	selectedCaseName$ = this.store$
		.pipe(
			select(selectSelectedCase),
			map((selectSelected: ICase) => selectSelected ? selectSelected.name : 'Default Case')
		);

	isPinnedClass$ = this.store$.select(selectIsPinned).pipe(
		map((_isPinned) => _isPinned ? 'isPinned' : 'isNotPinned')
	);

	activeMap$ = this.store$
		.pipe(
			select(mapStateSelector),
			filter(Boolean),
			map(MapFacadeService.activeMap),
			filter(Boolean)
		);

	@HostBinding('class.component') component = this.componentMode;
	@Input() version;

	constructor(protected store$: Store<any>, @Inject(COMPONENT_MODE) public componentMode: boolean) {
		if (componentMode) {
			store$.dispatch(new LoadDefaultCaseAction());
		}
	}
}
