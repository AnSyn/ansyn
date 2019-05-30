import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectSelectedLayersIds } from '../../reducers/layers.reducer';
import { ILayer } from '../../models/layers.model';
import { SelectOnlyLayer, SetLayerSelection } from '../../actions/layers.actions';

@Component({
	selector: 'ansyn-layer',
	templateUrl: './layer.component.html',
	styleUrls: ['./layer.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class LayerComponent implements OnInit, OnDestroy {
	@Input() layer: ILayer;
	@Input() showOnly: boolean;
	isChecked: boolean;

	@AutoSubscription
	selectedLayersIds$: Observable<any> = this.store$
		.pipe(
			select(selectSelectedLayersIds),
			tap(selectedLayersIds => this.isChecked = selectedLayersIds.includes(this.layer && this.layer.id))
		);

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	constructor(protected store$: Store<any>) {
	}

	public onCheckboxClicked(checked: boolean): void {
		this.store$.dispatch(new SetLayerSelection({ id: this.layer.id, value: checked }));
	}

	public selectOnly() {
		this.store$.dispatch(new SelectOnlyLayer(this.layer.id));
	}

}
