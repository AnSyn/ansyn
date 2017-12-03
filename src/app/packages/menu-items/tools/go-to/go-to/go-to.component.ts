import { Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { IToolsState, toolsStateSelector } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import {
	GoToAction,
	GoToExpandAction,
	GoToInputChangeAction,
	PullActiveCenter,
	SetPinLocationModeAction
} from '../../actions/tools.actions';
import { Observable } from 'rxjs/Observable';
import { IToolsConfig, toolsConfig } from '../../models';
import { isEqual } from 'lodash';
import 'rxjs/add/operator/pluck';
import { copyFromContent } from '@ansyn/core/utils/clipboard';
import { ProjectionConverterService } from '@ansyn/core/services/projection-converter.service';
import { CoordinatesSystem } from '@ansyn/core/models';

@Component({
	selector: 'ansyn-go-to',
	templateUrl: './go-to.component.html',
	styleUrls: ['./go-to.component.less']
})
export class GoToComponent implements OnInit {
	@Input() disabled: boolean;
	private _expand: boolean;
	public activeCenter: number[];
	public gotoExpand$: Observable<boolean> = this.store$.select(toolsStateSelector)
		.pluck<IToolsState, boolean>('gotoExpand')
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
		.map((state: IToolsState) => state.flags.get('pinLocation'))
		.distinctUntilChanged(isEqual);

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
			this.inputs.from = this.projectionConverterService.convertByProjectionDatum(this.activeCenter, this.activeCenterProjDatum, this.from);
			this.inputs.to = this.projectionConverterService.convertByProjectionDatum(this.activeCenter, this.activeCenterProjDatum, this.to);
			this.dispatchInputUpdated(this.activeCenter, this.activeCenterProjDatum);
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
		const goToInput = this.projectionConverterService.convertByProjectionDatum(this.inputs.from, this.from, this.activeCenterProjDatum);
		this.store$.dispatch(new GoToAction(goToInput));
	}

	copyToClipBoard(value: string) {
		copyFromContent(value);
	}

	convert(coords, convertFrom: any, convertTo: any, inputKey: string) {
		this.inputs[inputKey] = this.projectionConverterService.convertByProjectionDatum(coords, convertFrom, convertTo);
		this.dispatchInputUpdated(coords, convertFrom);
	}

	togglePinLocation() {
		this.store$.dispatch(new SetPinLocationModeAction(!this.pinLocationMode));
	}

	close() {
		this.store$.dispatch(new GoToExpandAction(false));
	}

	private dispatchInputUpdated(coords: number[], convertFrom: CoordinatesSystem) {
		const toWgs84 = this.projectionConverterService.convertByProjectionDatum(coords, convertFrom, this.activeCenterProjDatum);
		this.store$.dispatch(new GoToInputChangeAction(toWgs84));
	}
}
