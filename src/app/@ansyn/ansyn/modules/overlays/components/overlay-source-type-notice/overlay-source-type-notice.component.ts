import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { selectFooterCollapse, selectOverlayByMapId } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { CoreConfig } from '../../../core/models/core.config';
import { ICoreConfig } from '../../../core/models/core.config.model';
import { IOverlay } from '../../models/overlay.model';
import { IOverlaysConfig } from '../../models/overlays.config';
import { OverlaysConfig } from '../../services/overlays.service';

@Component({
	selector: 'ansyn-overlay-source-type-notice',
	templateUrl: './overlay-source-type-notice.component.html',
	styleUrls: ['./overlay-source-type-notice.component.less']
})
@AutoSubscriptions()
export class OverlaySourceTypeNoticeComponent implements OnInit, OnDestroy {
	@Input() mapId: string;
	footerCollapse: boolean;
	private _title: string = null;
	@AutoSubscription
	footerCollapse$ = this.store$.select(selectFooterCollapse).pipe(
		tap((collapse) => this.footerCollapse = collapse)
	);

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayByMapId(this.mapId)),
		tap((overlay) => {
			this.overlay = overlay;
		})
	);

	set overlay(overlay: IOverlay) {
		let sourceTypeConfig;
		// Extract the title, according to the new overlay and the configuration
		this._title = overlay
			&& (sourceTypeConfig = this._config.sourceTypeNotices[overlay.sourceType])
			&& (sourceTypeConfig[overlay.sensorType] || sourceTypeConfig.Default);
		// Insert the photo year into the title, if requested
		if (this._title && overlay.date) {
			this._title = this._title.replace('$year', overlay.date.getFullYear().toString());
		}
	}


	get title() {
		return this._title;
	}

	constructor(protected store$: Store<any>,
				@Inject(OverlaysConfig) public _config: IOverlaysConfig,
				@Inject(CoreConfig) public coreConfig: ICoreConfig) {
	}

	ngOnDestroy(): void {
	}


	ngOnInit(): void {
	}


	getType(): string {
		return '';
	}

}
