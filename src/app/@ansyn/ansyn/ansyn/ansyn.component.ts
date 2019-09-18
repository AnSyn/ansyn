import { select, Store } from '@ngrx/store';
import { Component, HostBinding, HostListener, Inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { selectIsPinned } from '@ansyn/menu';
import { filter, map } from 'rxjs/operators';
import { COMPONENT_MODE } from '../app-providers/component-mode';
import { selectSelectedCase } from '../modules/menu-items/cases/reducers/cases.reducer';
import { LoadDefaultCaseAction } from '../modules/menu-items/cases/actions/cases.actions';
import { ICase, ICaseMapState } from '../modules/menu-items/cases/models/case.model';
import { IToolsConfig, toolsConfig } from '../modules/menu-items/tools/models/tools-config';
import { UpdateToolsFlags } from '../modules/menu-items/tools/actions/tools.actions';
import { toolsFlags } from '../modules/menu-items/tools/reducers/tools.reducer';
import { ICoreConfig } from '../modules/core/models/core.config.model';
import { CoreConfig } from '../modules/core/models/core.config';
import { LoggerService } from '../modules/core/services/logger.service';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit {
	renderContextMenu: boolean;
	renderCredentials: boolean;

	selectedCaseName$: Observable<string> = this.store$
		.pipe(
			select(selectSelectedCase),
			map((selectSelected: ICase) => selectSelected ? selectSelected.name : 'Default Case')
		);

	isPinnedClass$: Observable<string> = this.store$.select(selectIsPinned).pipe(
		map((_isPinned) => _isPinned ? 'isPinned' : 'isNotPinned')
	);

	activeMap$: Observable<ICaseMapState> = this.store$
		.pipe(
			select(mapStateSelector),
			filter(Boolean),
			map(MapFacadeService.activeMap),
			filter(Boolean)
		);

	@HostBinding('class.component') component = this.componentMode;
	@Input() version;

	@HostListener('window:beforeunload', ['$event'])
	public doSomething($event) {
		this.loggerService.beforeAppClose();
		return true;
	}

	constructor(protected store$: Store<any>,
				@Inject(COMPONENT_MODE) public componentMode: boolean,
				@Inject(CoreConfig) public coreConfig: ICoreConfig,
				@Inject(toolsConfig) public toolsConfigData: IToolsConfig,
				public loggerService: LoggerService) {
	}

	ngOnInit(): void {
		if (this.componentMode) {
			this.store$.dispatch(new LoadDefaultCaseAction());
		}

		this.store$.dispatch(new UpdateToolsFlags([{
			key: toolsFlags.shadowMouseActiveForManyScreens,
			value: this.toolsConfigData.ShadowMouse && this.toolsConfigData.ShadowMouse.activeByDefault
		}]));

		setTimeout(() => {
			this.renderContextMenu = true;
			this.renderCredentials = this.coreConfig.showCredentials;
		}, 1000);

	}
}
