import { Component, Input } from '@angular/core';
import { ILayer } from '../../../models/layers.model';
import { Store } from '@ngrx/store';
import { ILayerState } from '../../../reducers/layers.reducer';
import { AddLayer, CloseLayersModal, UpdateLayer } from '../../../actions/layers.actions';
import { DataLayersService } from '../../../services/data-layers.service';
import { LoggerService } from '../../../../../core/services/logger.service';

@Component({
	selector: 'ansyn-edit-layer',
	templateUrl: './edit-layer.component.html',
	styleUrls: ['./edit-layer.component.less']
})
export class EditLayerComponent {
	@Input() layer: ILayer;

	constructor(
		protected store: Store<ILayerState>,
		protected dataLayersService: DataLayersService,
		protected loggerService: LoggerService
		) {
	}

	addLayer(name) {
		const layer = this.dataLayersService.generateAnnotationLayer(name);
		this.store.dispatch(new AddLayer(layer));
		this.closeModal();
	}

	closeModal() {
		this.store.dispatch(new CloseLayersModal());
	}

	editLayer(name) {
		this.loggerService.info(`Renaming ${this.layer.type} layer ${this.layer.name} to ${name}`, 'Layers', 'RENAME_LAYER');
		// Todo: by action + effect
		this.store.dispatch(new UpdateLayer({ ...this.layer, name }));
		this.closeModal();
	}

}
