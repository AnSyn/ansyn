import { Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { IToolsState, selectSubMenu, SubMenuEnum, toolsFlags, toolsStateSelector } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import {
	ClearActiveInteractionsAction,
	GoToAction,
	GoToInputChangeAction,
	PullActiveCenter,
	SetPinLocationModeAction,
	SetSubMenu
} from '../../actions/tools.actions';
import { Observable } from 'rxjs';
import { IToolsConfig, toolsConfig } from '../../models/tools-config';
import {
	copyFromContent,
	ICoordinatesSystem,
	IEd50Notification,
	IMapFacadeConfig,
	mapFacadeConfig,
	ProjectionConverterService,
	SetToastMessageAction
} from '@ansyn/map-facade';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';

@Component({
	selector: 'ansyn-go-to',
	templateUrl: './go-to.component.html',
	styleUrls: ['./go-to.component.less']
})
export class GoToComponent implements OnInit {
	@Input() disabled: boolean;
	private _expand: boolean;
	public activeCenter: number[];
	public gotoExpand$: Observable<boolean> = this.store$.select(selectSubMenu).pipe(
		map((subMenu) => subMenu === SubMenuEnum.goTo),
		distinctUntilChanged()
	);
	activeCenter$: Observable<number[]> = this.store$.select(toolsStateSelector).pipe(
		pluck<any, any>('activeCenter'),
		distinctUntilChanged()
	);

	activeCenterProjDatum: ICoordinatesSystem = { datum: 'wgs84', projection: 'geo' };

	inputs = {
		geoWgs84: [0, 0],
		utmEd50: [],
		utmWgs84: []
	};

	pinLocationMode$: Observable<boolean> = this.store$.select(toolsStateSelector).pipe(
		map((state: IToolsState) => state.flags.get(toolsFlags.pinLocation)),
		distinctUntilChanged()
	);

	pinLocationMode: boolean;

	@HostBinding('class.expand')
	set expand(value) {
		this._expand = value;
	}

	get expand() {
		return this._expand;
	}

	get geoWgs84(): ICoordinatesSystem {
		return this.config.GoTo.geoWgs84;
	}

	get utmEd50(): ICoordinatesSystem {
		return this.config.GoTo.utmEd50;
	}

	get utmWgs84(): ICoordinatesSystem {
		return this.config.GoTo.utmWgs84;
	}

	get notification(): IEd50Notification {
		return this.mapfacadeConfig.Proj4.ed50Notification;
	}

	ngOnInit(): void {
		this.activeCenter$.subscribe((_activeCenter) => {
			this.activeCenter = _activeCenter;
			if (this.projectionConverterService.isValidConversion(this.activeCenter, this.activeCenterProjDatum)) {
				this.inputs.geoWgs84 = this.projectionConverterService.convertByProjectionDatum(this.activeCenter, this.activeCenterProjDatum, this.geoWgs84);
				this.inputs.utmEd50 = this.projectionConverterService.convertByProjectionDatum(this.activeCenter, this.activeCenterProjDatum, this.utmEd50);
				this.dispatchInputUpdated(this.activeCenter, this.activeCenterProjDatum);
			}
		});

		this.pinLocationMode$.subscribe((_pinLocationMode) => {
			this.pinLocationMode = _pinLocationMode;
		});

		this.gotoExpand$.subscribe((_gotoExpand) => {
			this.expand = _gotoExpand;
			if (this.expand) {
				this.store$.dispatch(new PullActiveCenter());
			}
		});
	}

	constructor(protected store$: Store<IToolsState>,
				@Inject(toolsConfig) protected config: IToolsConfig,
				@Inject(mapFacadeConfig) protected mapfacadeConfig: IMapFacadeConfig,
				protected projectionConverterService: ProjectionConverterService) {
	}

	submitGoTo(): void {
		const conversionValid = this.projectionConverterService.isValidConversion(this.inputs.geoWgs84, this.geoWgs84);
		if (conversionValid) {
			const goToInput = this.projectionConverterService.convertByProjectionDatum(this.inputs.geoWgs84, this.geoWgs84, this.activeCenterProjDatum);
			this.store$.dispatch(new GoToAction(goToInput));
		}
	}

	copyToClipBoard(value: string) {
		copyFromContent(value);
		this.store$.dispatch(new SetToastMessageAction({ toastText: 'Copy to clipboard' }));
	}

	convert(coords, convertFrom: any, convertTo: any, inputKey: string) {
		const conversionValid = this.projectionConverterService.isValidConversion(coords, convertFrom);
		if (conversionValid) {
			this.inputs[inputKey] = this.projectionConverterService.convertByProjectionDatum(coords, convertFrom, convertTo);
			this.dispatchInputUpdated(coords, convertFrom);
		}
	}

	togglePinLocation() {
		this.store$.dispatch(new ClearActiveInteractionsAction({ skipClearFor: [SetPinLocationModeAction] }));
		this.store$.dispatch(new SetPinLocationModeAction(!this.pinLocationMode));
	}

	close() {
		this.store$.dispatch(new SetSubMenu(null));
	}

	private dispatchInputUpdated(coords: number[], convertFrom: ICoordinatesSystem) {
		const conversionValid = this.projectionConverterService.isValidConversion(coords, convertFrom);
		if (conversionValid) {
			const toWgs84 = this.projectionConverterService.convertByProjectionDatum(coords, convertFrom, this.activeCenterProjDatum);
			this.store$.dispatch(new GoToInputChangeAction(toWgs84));
		}
	}
}
