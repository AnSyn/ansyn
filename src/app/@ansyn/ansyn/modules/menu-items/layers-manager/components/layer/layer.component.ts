import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { selectSelectedLayersIds } from '../../reducers/layers.reducer';
import { ILayer } from '../../models/layers.model';
import { SelectOnlyLayer, SetLayerSelection } from '../../actions/layers.actions';
import { TranslateService } from '@ngx-translate/core';

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

	@HostBinding('class.rtl')
	isRTL = this.translateService.instant('direction') === 'rtl';

	constructor(
		protected store$: Store<any>,
		protected translateService: TranslateService
	) {
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	public onCheckboxClicked(checked: boolean): void {
		this.store$.dispatch(new SetLayerSelection({ id: this.layer.id, value: checked, layer: this.layer }));
	}

	public selectOnly() {
		this.store$.dispatch(new SelectOnlyLayer(this.layer.id));
	}

}
