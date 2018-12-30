import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IUploadItem, selectUploadList } from '../../reducers/uploads.reducer';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { delay, take, tap } from 'rxjs/operators';
import { ClearUploadList, MoveToUploadOverlay } from '../../actions/uploads.actions';
import { TBOverlaySourceType, TBSourceProvider } from '../../../overlay-source-provider/tb-source-provider';
import { selectActiveMapId } from '@ansyn/map-facade';
import { IMultipleOverlaysSource, MultipleOverlaysSource } from '@ansyn/overlays';

@Component({
	selector: 'ansyn-upload-list',
	templateUrl: './upload-list.component.html',
	styleUrls: ['./upload-list.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class UploadListComponent implements OnInit, OnDestroy {
	filesList: IUploadItem[];

	@AutoSubscription
	uploadsState$ = this.store.select(selectUploadList).pipe(
		delay(0),
		tap((uploadList: Array<IUploadItem>) => {
			this.filesList = uploadList;
		})
	);

	constructor(private store: Store<any>,
				@Inject(MultipleOverlaysSource) protected overlaysSources: IMultipleOverlaysSource) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	clearList() {
		this.store.dispatch(new ClearUploadList());
	}


	moveToUpload($event: any): void {
		if ($event) {
			this.store.select(selectActiveMapId).pipe(take(1)).subscribe(mapId => {
				const overlay = (this.overlaysSources[TBOverlaySourceType] as TBSourceProvider).parseData($event['0']);
				this.store.dispatch(new MoveToUploadOverlay({ overlay, mapId }));
			});
		}
	}
}
