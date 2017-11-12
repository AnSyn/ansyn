import { Component, HostBinding, Input } from '@angular/core';
import { IToolsState } from '../../reducers/tools.reducer';
import { Store } from '@ngrx/store';
// import { SetManualImageProcessing } from '../../actions/tools.actions';

@Component({
	selector: 'ansyn-image-processing-control',
	templateUrl: './image-processing-control.component.html',
	styleUrls: ['./image-processing-control.component.less']
})
export class ImageProcessingControlComponent {
	private _isExpended: boolean;

	public imgProcessParams = {
		contrast: 50,
		gamma: 30
	};

	@HostBinding('class.expand') @Input()
	set expand(value) {
		this._isExpended = value;
	}

	get expand() {
		return this._isExpended;
	}
	constructor(public store$: Store<IToolsState>) {

	}
	manualImageProcess() {
		// this.store$.dispatch(new SetManualImageProcessing(this.imgProcessParams));
	}

	close() {
		this.expand = false;
	}
}
