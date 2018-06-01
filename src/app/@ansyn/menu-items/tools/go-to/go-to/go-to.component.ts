import { Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { IToolsState, toolsStateSelector, toolsFlags } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import {
	GoToAction,
	GoToInputChangeAction,
	PullActiveCenter,
	SetPinLocationModeAction
} from '../../actions/tools.actions';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/pluck';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { ProjectionConverterService } from '@ansyn/core/services/projection-converter.service';
import { SetSubMenu } from '../../actions/tools.actions';
import { selectSubMenu, SubMenuEnum } from '../../reducers/tools.reducer';
import { CoordinatesSystem } from '@ansyn/core/models/coordinate-system.model';
import { IToolsConfig, toolsConfig } from '@ansyn/menu-items/tools/models/tools-config';
import { ClearActiveInteractionsAction } from '@ansyn/core/actions/core.actions';

@Component({
	selector: 'ansyn-go-to',
	templateUrl: './go-to.component.html',
	styleUrls: ['./go-to.component.less']
})
export class GoToComponent implements OnInit {
	@Input() disabled: boolean;
	private _expand: boolean;
	public activeCenter: number[];
	public gotoExpand$: Observable<boolean> = this.store$.select(selectSubMenu)
		.map((subMenu) => subMenu === SubMenuEnum.goTo)
		.distinctUntilChanged();
	activeCenter$: Observable<number[]> = this.store$.select(toolsStateSelector)
		.pluck<any, any>('activeCenter')
		.distinctUntilChanged();

	activeCenterProjDatum: CoordinatesSystem = { datum: 'wgs84', projection: 'geo' };

	inputs = {
		from: [0, 0],
		to: []
	};

	pinLocationMode$: Observable<boolean> = this.store$.select(toolsStateSelector)
		.map((state: IToolsState) => state.flags.get(toolsFlags.pinLocation))
		.distinctUntilChanged();

	pinLocationMode: boolean;

	@HostBinding('class.expand')
	set expand(value) {
		this._expand = value;
	}

	get expand() {
		return this._expand;
	}

	get from(): CoordinatesSystem {
		return this.config.GoTo.from;
	}

	get to(): CoordinatesSystem {
		return this.config.GoTo.to;
	}

	ngOnInit(): void {
		this.activeCenter$.subscribe((_activeCenter) => {
			this.activeCenter = _activeCenter;
			if (this.projectionConverterService.isValidConversion(this.activeCenter, this.activeCenterProjDatum)) {
				this.inputs.from = this.projectionConverterService.convertByProjectionDatum(this.activeCenter, this.activeCenterProjDatum, this.from);
				this.inputs.to = this.projectionConverterService.convertByProjectionDatum(this.activeCenter, this.activeCenterProjDatum, this.to);
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

	constructor(protected store$: Store<IToolsState>, @Inject(toolsConfig) protected config: IToolsConfig, protected projectionConverterService: ProjectionConverterService) {
	}

	submitGoTo(): void {
		const conversionValid = this.projectionConverterService.isValidConversion(this.inputs.from, this.from);
		if (conversionValid) {
			const goToInput = this.projectionConverterService.convertByProjectionDatum(this.inputs.from, this.from, this.activeCenterProjDatum);
			this.store$.dispatch(new GoToAction(goToInput));
		}
	}

	copyToClipBoard(value: string) {
		copyFromContent(value);
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

	private dispatchInputUpdated(coords: number[], convertFrom: CoordinatesSystem) {
		const conversionValid = this.projectionConverterService.isValidConversion(coords, convertFrom);
		if (conversionValid) {
			const toWgs84 = this.projectionConverterService.convertByProjectionDatum(coords, convertFrom, this.activeCenterProjDatum);
			this.store$.dispatch(new GoToInputChangeAction(toWgs84));
		}
	}
}
