import { Component, Input } from '@angular/core';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { SelectOnlyLayer, SetLayerSelection } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { select, Store } from '@ngrx/store';
import { selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/internal/operators';
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

	constructor(protected store$: Store<any>) {
	}

	public onCheckboxClicked(checked: boolean): void {
		this.store$.dispatch(new SetLayerSelection({ id: this.layer.id, value: checked }));
	}

	public selectOnly() {
		this.store$.dispatch(new SelectOnlyLayer(this.layer.id));
	}

}
