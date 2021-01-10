import { Component, HostBinding, HostListener, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import {
	MapFacadeService,
	selectActiveMapId,
	selectMapsList,
	selectOverlayOfActiveMap,
	selectIsMinimalistViewMode,
	selectFooterCollapse
} from '@ansyn/map-facade';
import { selectIsPinned, selectMenuCollapse, SelectMenuItemFromOutsideAction, selectSelectedMenuItem } from '@ansyn/menu';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { COMPONENT_MODE } from '../app-providers/component-mode';
import { LoadDefaultCaseAction } from '../modules/menu-items/cases/actions/cases.actions';
import { ICaseMapState } from '../modules/menu-items/cases/models/case.model';
import { IToolsConfig, toolsConfig } from '../modules/status-bar/components/tools/models/tools-config';
import { UpdateToolsFlags } from '../modules/status-bar/components/tools/actions/tools.actions';
import { LoggerService } from '../modules/core/services/logger.service';
import { IOverlay, IOverlayDrop } from '../modules/overlays/models/overlay.model';
import { toolsFlags } from '../modules/status-bar/components/tools/models/tools.model';
import { TranslateService } from '@ngx-translate/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectDropsDescending } from '../modules/overlays/reducers/overlays.reducer';

@Component({
	selector: 'ansyn-app',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.less']
})

@AutoSubscriptions()
export class AnsynComponent implements OnInit, OnDestroy {
	renderContextMenu: boolean;
	toggleResults = false;

	@AutoSubscription
	overlaysCount$: Observable<any> = this.store$
		.pipe(
			select(selectDropsDescending),
			filter(Boolean),
			map(({length}: IOverlayDrop[]) => length)
		);

	isMenuCollapse$ = this.store$.select(selectMenuCollapse);

	isFooterCollapse$ = this.store$.select(selectFooterCollapse);

	isPinnedClass$: Observable<string> = this.store$.select(selectIsPinned).pipe(
		map((_isPinned) => _isPinned ? 'isPinned' : 'isNotPinned')
	);

	isExpanded$ = this.store$.select(selectSelectedMenuItem).pipe(
		tap(item => {
			this.toggleResults = item === "SearchResults";
			return Boolean(item);
		})
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

	toggleResultsTable(elementRef: HTMLDivElement): void {
		this.toggleResults = !this.toggleResults;
		this.store$.dispatch(new SelectMenuItemFromOutsideAction({ name: "SearchResults", elementRef, toggleFromBottom: true }));
	}

	@HostListener('window:beforeunload', ['$event'])
	public onWindowClose($event) {
		this.loggerService.beforeAppClose();
		return true;
	}

	ngOnDestroy(): void {
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
