import { Component } from '@angular/core';
import { ILayerState, selectLayersModal } from '../../reducers/layers.reducer';
import { Store } from '@ngrx/store';
import { CloseLayersModal } from '../../actions/layers.actions';
import { ILayerModal, SelectedModalEnum } from '../../reducers/layers-modal';
import { Observable } from 'rxjs';

@Component({
	selector: 'ansyn-data-layers-modals',
	templateUrl: './data-layers-modals.component.html',
	styleUrls: ['./data-layers-modals.component.less']
})
export class DataLayersModalsComponent {
	modal$: Observable<ILayerModal> = this.store.select(selectLayersModal);

	get SelectedModalEnum() {
		return SelectedModalEnum;
	}

	constructor(protected store: Store<ILayerState>) {
	}

	closeModal(): void {
		this.store.dispatch(CloseLayersModal());
	}
}
