import { select, Store } from '@ngrx/store';
import { Component, HostBinding, HostListener, Inject, Input, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import {
	MapFacadeService,
	mapStateSelector,
	selectActiveMapId,
	selectMapsList,
	selectOverlayOfActiveMap
} from '@ansyn/map-facade';
import { selectIsPinned } from '@ansyn/menu';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { COMPONENT_MODE } from '../app-providers/component-mode';
import { selectSelectedCase } from '../modules/menu-items/cases/reducers/cases.reducer';
import { LoadDefaultCaseAction } from '../modules/menu-items/cases/actions/cases.actions';
import { ICase, ICaseMapState } from '../modules/menu-items/cases/models/case.model';
import { IToolsConfig, toolsConfig } from '../modules/menu-items/tools/models/tools-config';
import { UpdateToolsFlags } from '../modules/menu-items/tools/actions/tools.actions';
import { toolsFlags } from '../modules/menu-items/tools/reducers/tools.reducer';
import { LoggerService } from '../modules/core/services/logger.service';
import { IOverlay } from '../modules/overlays/models/overlay.model';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit {
	renderContextMenu: boolean;

	selectedCaseName$: Observable<string> = this.store$
		.pipe(
			select(selectSelectedCase),
			map((selectSelected: ICase) => selectSelected ? selectSelected.name : 'Default Case')
		);

	isPinnedClass$: Observable<string> = this.store$.select(selectIsPinned).pipe(
		map((_isPinned) => _isPinned ? 'isPinned' : 'isNotPinned')
	);

	activeMap$: Observable<any> = combineLatest(
		this.store$.select(selectActiveMapId), this.store$.select(selectOverlayOfActiveMap))
		.pipe(
			withLatestFrom(this.store$.select(selectMapsList)),
			filter(([[activeMapId, overlay], mapList]: [[string, IOverlay], ICaseMapState[]]) => Boolean(mapList)),
			map(([[activeMapId, overlay], mapList]: [[string, IOverlay], ICaseMapState[]]) => MapFacadeService.mapById(mapList, activeMapId)),
			filter(Boolean)
		);

	@HostBinding('class.component') component = this.componentMode;
	@Input() version;

	@HostListener('window:beforeunload', ['$event'])
	public onWindowClose($event) {
		this.loggerService.beforeAppClose();
		return true;
	}

	constructor(protected store$: Store<any>,
				@Inject(COMPONENT_MODE) public componentMode: boolean,
				@Inject(toolsConfig) public toolsConfigData: IToolsConfig,
				public loggerService: LoggerService) {
}

ngOnInit()
:
void {
	if(this.componentMode
)
{
	this.store$.dispatch(new LoadDefaultCaseAction());
}

this.store$.dispatch(new UpdateToolsFlags([{
	key: toolsFlags.shadowMouseActiveForManyScreens,
	value: this.toolsConfigData.ShadowMouse && this.toolsConfigData.ShadowMouse.activeByDefault
}, {
	key: toolsFlags.forceShadowMouse,
	value: this.toolsConfigData.ShadowMouse && this.toolsConfigData.ShadowMouse.forceSendShadowMousePosition
}
]));

setTimeout(() => {
	this.renderContextMenu = true;
}, 1000);

}
}
