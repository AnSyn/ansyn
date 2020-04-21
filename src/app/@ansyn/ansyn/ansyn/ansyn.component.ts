import { Store } from '@ngrx/store';
import { Component, ElementRef, HostBinding, HostListener, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { MapFacadeService, selectActiveMapId, selectMapsList, selectOverlayOfActiveMap } from '@ansyn/map-facade';
import { selectIsPinned } from '@ansyn/menu';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { COMPONENT_MODE } from '../app-providers/component-mode';
import { LoadDefaultCaseAction } from '../modules/menu-items/cases/actions/cases.actions';
import { ICaseMapState } from '../modules/menu-items/cases/models/case.model';
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

	@ViewChild('animatedElementVertical') animatedElementVertical: ElementRef;

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

		// Hack
		// The problem was that the app footer was about 10px too high, and went over
		// the "i" icon and the map scale
		this.animatedElementVertical.nativeElement.addEventListener('animationend', () => {
			(this.animatedElementVertical.nativeElement as HTMLElement).style.animation = 'none';
			(this.animatedElementVertical.nativeElement as HTMLElement).style.opacity = '1';
		});

		setTimeout(() => {
			this.renderContextMenu = true;
		}, 1000);

	}
}
