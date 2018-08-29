import { Component } from '@angular/core';
import { ILayerState, selectLayersModal } from '../../reducers/layers.reducer';
import { Store } from '@ngrx/store';
import { CloseLayersModal } from '../../actions/layers.actions';
import { SelectedModalEnum } from '../../reducers/layers-modal';

@Component({
	selector: 'ansyn-data-layers-modals',
	templateUrl: './data-layers-modals.component.html',
	styleUrls: ['./data-layers-modals.component.less']
})
export class DataLayersModalsComponent {
	modal$ = this.store.select(selectLayersModal);

	get SelectedModalEnum() {
		return SelectedModalEnum;
	}

	constructor(protected store: Store<ILayerState>) {
	}

	closeModal(): void {
		this.store.dispatch(new CloseLayersModal());
	}


}
