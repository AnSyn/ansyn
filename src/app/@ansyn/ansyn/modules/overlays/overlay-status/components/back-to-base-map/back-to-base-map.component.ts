import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEntryComponent, selectMapsTotal, selectOverlayByMapId } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { BackToWorldView } from '../../actions/overlay-status.actions';
import { Observable } from 'rxjs';
import { selectIsPinned } from '@ansyn/menu';
import { IStatusBarConfig } from '../../../../status-bar/models/statusBar-config.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'ansyn-back-to-base-map',
	templateUrl: './back-to-base-map.component.html',
	styleUrls: ['./back-to-base-map.component.less']
})
@AutoSubscriptions()
export class BackToBaseMapComponent implements OnInit, OnDestroy, IEntryComponent {
	static showFirst = true;
	@Input() mapId: string;
	overlay: any;
	isPinned: boolean;

	isRTL = this.translateService.instant('direction') === 'rtl';

	@AutoSubscription
	isPinned$: Observable<boolean> = this.store$.pipe(
		select(selectIsPinned),
		tap(isPinned => this.isPinned = isPinned)
	);

	constructor(
		protected store$: Store<any>,
		protected translateService: TranslateService
	) {
	}

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayByMapId(this.mapId)),
		tap(overlay => this.overlay = overlay)
	);

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	getType(): string {
		return 'buttons';
	}

	backToWorldView() {
		this.store$.dispatch(new BackToWorldView({ mapId: this.mapId }));
	}
}
