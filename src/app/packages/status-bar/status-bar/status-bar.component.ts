import { Component, Input, OnInit, Renderer } from '@angular/core';
import { Store } from '@ngrx/store';
import { IStatusBarState, MapsLayout } from '../reducers/status-bar.reducer';
import { ChangeLayoutAction, SetLinkCopyToastValueAction, ShareSelectedCaseLinkAction } from '../actions/status-bar.actions';
import { Observable } from 'rxjs/Observable';
import { isEqual } from 'lodash';

@Component({
	selector: 'ansyn-status-bar',
	templateUrl: './status-bar.component.html',
	styleUrls: ['./status-bar.component.less']
})
export class StatusBarComponent implements OnInit {
	layouts$: Observable<MapsLayout[]> = this.store.select("status_bar").map((state: IStatusBarState) => state.layouts).distinctUntilChanged(isEqual);
	selected_layout_index$: Observable<number> = this.store.select("status_bar").map((state: IStatusBarState) => state.selected_layout_index).distinctUntilChanged(isEqual);

	showLinkCopyToast$: Observable<boolean> = this.store.select('status_bar')
		.map((state: IStatusBarState) => state.showLinkCopyToast)
		.distinctUntilChanged(isEqual);

	selected_layout_index: number;
	@Input() selected_case_name: string;
	@Input() overlays_count: number;
	@Input('overlay-name') overlayName: number;
	@Input('hide-overlay-name') hideOverlayName: boolean;
	@Input('maps') maps: any;

	showLinkCopyToast: boolean;

	ngOnInit(): void {
		this.selected_layout_index$.subscribe((_selected_layout_index: number) => {
			this.selected_layout_index = _selected_layout_index;
		});

		this.showLinkCopyToast$
			.subscribe((_showLinkCopyToast) =>{
				this.showLinkCopyToast = _showLinkCopyToast;
			})
	}

	constructor(private store: Store<IStatusBarState>) { }

	layoutSelectChange(selected_layout_index: number) {
		this.store.dispatch(new ChangeLayoutAction(selected_layout_index));
	}
	onShowToastChange(value: boolean) {
		this.store.dispatch(new SetLinkCopyToastValueAction(value));
	}
	copyText() {
		this.store.dispatch(new ShareSelectedCaseLinkAction());
	}


}
