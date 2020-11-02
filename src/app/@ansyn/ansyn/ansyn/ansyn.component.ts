import { Component, HostBinding, HostListener, Inject, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import {
	MapFacadeService,
	selectActiveMapId,
	selectMapsList,
	selectOverlayOfActiveMap,
	selectIsMinimalistViewMode
} from '@ansyn/map-facade';
import { selectIsPinned, selectMenuCollapse } from '@ansyn/menu';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { COMPONENT_MODE } from '../app-providers/component-mode';
import { LoadDefaultCaseAction } from '../modules/menu-items/cases/actions/cases.actions';
import { ICaseMapState } from '../modules/menu-items/cases/models/case.model';
import { IToolsConfig, toolsConfig } from '../modules/menu-items/tools/models/tools-config';
import { UpdateToolsFlags } from '../modules/menu-items/tools/actions/tools.actions';
import { LoggerService } from '../modules/core/services/logger.service';
import { IOverlay } from '../modules/overlays/models/overlay.model';
import { toolsFlags } from '../modules/menu-items/tools/models/tools.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

export class AnsynComponent implements OnInit {
	renderContextMenu: boolean;

	isMenuCollapse$ = this.store$.select(selectMenuCollapse);

	isPinnedClass$: Observable<string> = this.store$.select(selectIsPinned).pipe(
		map((_isPinned) => _isPinned ? 'isPinned' : 'isNotPinned')
	);

	hideStatus$: Observable<boolean> = this.store$.select(selectIsMinimalistViewMode);

	activeMap$: Observable<any> = combineLatest([
		this.store$.select(selectActiveMapId),
		this.store$.select(selectOverlayOfActiveMap)
	])
		.pipe(
			withLatestFrom(this.store$.select(selectMapsList)),
			filter(([[activeMapId, overlay], mapList]: [[string, IOverlay], ICaseMapState[]]) => Boolean(mapList)),
			map(([[activeMapId, overlay], mapList]: [[string, IOverlay], ICaseMapState[]]) => MapFacadeService.mapById(mapList, activeMapId)),
			filter(Boolean)
		);

	@HostBinding('class.component') component = this.componentMode;

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	@Input() version;

	constructor(
		protected store$: Store<any>,
		@Inject(COMPONENT_MODE) public componentMode: boolean,
		@Inject(toolsConfig) public toolsConfigData: IToolsConfig,
		public loggerService: LoggerService,
		protected translateService: TranslateService
	) {
	}

	@HostListener('window:beforeunload', ['$event'])
	public onWindowClose($event) {
		this.loggerService.beforeAppClose();
		return true;
	}

	ngOnInit(): void {
		if (this.componentMode) {
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
