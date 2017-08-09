import { Component, EventEmitter, HostBinding, Inject, Input, OnInit, Output } from '@angular/core';
import { IToolsState } from '../reducers/tools.reducer';
import { Store } from '@ngrx/store';
import { ShowOverlaysFootprintAction } from '../actions/tools.actions';
import { OverlayVisualizerMode } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ansyn-visualizers',
	templateUrl: './visualizers.component.html',
	styleUrls: ['./visualizers.component.less']
})
export class VisualizersComponent implements OnInit {
	private _expand: boolean;
	private _visualizersChecked: boolean;
	public _visualizerType: OverlayVisualizerMode;

	private selectedMapVisualizerMode$: Observable<OverlayVisualizerMode> = this.store$.select('tools')
		.map((state: IToolsState) => {
			return state.activeOverlaysFootprintMode;
		});

	private needToDispatchAction = true;

	public set visualizerType(value: OverlayVisualizerMode) {
		if (this._visualizerType !== value) {
			this._visualizerType = value;
			if (this.needToDispatchAction) {
				this.store$.dispatch(new ShowOverlaysFootprintAction(value));
			}
		}
		// need to be outside of if because load bug
		if (this._visualizerType === 'None') {
			this.visualizersChecked = false;
		} else {
			this.visualizersChecked = true;
		}
	};

	public get visualizerType() {
		return this._visualizerType;
	}

	@Output() expandChange = new EventEmitter();
	@HostBinding('class.expand') @Input() set expand(value) {
		this._expand = value;
		this.expandChange.emit(value);
	};
	get expand() {
		return this._expand;
	}

	@Output() visualizersCheckedChange = new EventEmitter();
	@Input() set visualizersChecked(value) {
		this._visualizersChecked = value;
		this.visualizersCheckedChange.emit(value);
	};
	get visualizersChecked() {
		return this._visualizersChecked;
	}

	ngOnInit(): void { }

	constructor(private store$: Store<IToolsState>) {
		this.needToDispatchAction = false;
		this.visualizerType = 'None';
		this.needToDispatchAction = true;

		this.selectedMapVisualizerMode$.subscribe((visualizerType)=>{
			this.needToDispatchAction = false;
			if (!visualizerType) {
				this.visualizerType = 'None';
			} else {
				this.visualizerType = visualizerType;
			}
			this.needToDispatchAction = true;
		});
	}

	close() {
		this.expand = false;
	}
}
