import { Component, Input } from '@angular/core';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import {
	SelectOnly, ToggleLayerSelection,
	UpdateSelectedLayersIds
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { select, Store } from '@ngrx/store';
import { selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Observable } from 'rxjs/Observable';
import { map, tap } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

@Component({
	selector: 'ansyn-layer',
	templateUrl: './layer.component.html',
	styleUrls: ['./layer.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class LayerComponent {
	@Input() layer: ILayer;
	@Input() showOnly: boolean;
	selectedLayersIds: string[] = [];

	@AutoSubscription
	selectedLayersIds$: Observable<any> = this.store$
		.pipe(
			select(selectSelectedLayersIds),
			tap(selectedLayersIds => this.selectedLayersIds = selectedLayersIds)
		);

	constructor(protected store$: Store <any>) {
	}

	public onCheckboxClicked(): void {
		this.store$.dispatch(new ToggleLayerSelection(this.layer.id));
	}

	public selectOnly() {
		this.store$.dispatch(new SelectOnly(this.layer.id));
	}

}
