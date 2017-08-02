import {
	Component, EventEmitter, HostBinding, Inject, Input, OnInit,
	Output
} from '@angular/core';
import { IToolsState } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { GoToAction, PullActiveCenter, SetPinLocationModeAction } from '../../actions/tools.actions';
import { createSelector } from '@ansyn/core/utils';
import { Observable } from 'rxjs/Observable';
import { ToolsConfig } from '../../models/tools-config';
import { toolsConfig } from '../../services/tools.service';
import { isEqual } from 'lodash';
import { GoToService } from '../../services/go-to.service';

@Component({
	selector: 'ansyn-go-to',
	templateUrl: './go-to.component.html',
	styleUrls: ['./go-to.component.less']
})
export class GoToComponent implements OnInit {
	_expand;
	activeCenter$: Observable<number[]> = createSelector(this.store$, 'tools', 'activeCenter');
	activeCenter: number[];
	activeCenterProjDatum = {datum: 'wgs84', projection: 'geo'};

	inputs = {
		from: [],
		to: []
	};

	pin_location_mode$: Observable<boolean> = this.store$.select('tools')
		.map((state: IToolsState) => state.flags.get('pin_location'))
		.distinctUntilChanged(isEqual);

	pin_location_mode: boolean;

	@Output() expandChange= new EventEmitter();
	@HostBinding('class.expand') @Input() set expand(value) {
		this._expand = value;
		if (value) {
			this.store$.dispatch(new PullActiveCenter());
		}
		this.expandChange.emit(value);
	};
	get expand() {
		return this._expand
	}

	get from() {
		return this.config.GoTo.from;
	}

	get to() {
		return this.config.GoTo.to;
	}

	ngOnInit(): void {
		this.activeCenter$.subscribe((_activeCenter) => {
			this.activeCenter = [..._activeCenter.map(num => +num.toFixed(5))];
			this.inputs.from = this.goToService.convertByProjectionDatum(this.activeCenter, this.activeCenterProjDatum, this.from);
			this.inputs.to = this.goToService.convertByProjectionDatum(this.activeCenter, this.activeCenterProjDatum, this.to);
		});
		this.pin_location_mode$.subscribe((_pin_location_mode) => {
			this.pin_location_mode = _pin_location_mode;
		});
		this.store$.dispatch(new PullActiveCenter())
	}

	constructor(private store$: Store<IToolsState>, @Inject(toolsConfig) private config: ToolsConfig, private goToService: GoToService) { }

	submitGoTo(): void {
		this.store$.dispatch(new GoToAction(this.activeCenter));
	}

	convert(coords, convertFrom: any, convertTo: any, inputKey: string) {
		this.inputs[inputKey] = this.goToService.convertByProjectionDatum(coords, convertFrom, convertTo)
	}

	togglePinLocation() {
		this.store$.dispatch(new SetPinLocationModeAction(!this.pin_location_mode))
	}
}
