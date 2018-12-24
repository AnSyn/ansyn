import { Component, OnDestroy, OnInit } from '@angular/core';
import { IUploadItem, selectUploadList } from '../../reducers/uploads.reducer';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';

import { delay, tap } from 'rxjs/operators';
import { ClearUploadList } from '../../actions/uploads.actions';

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

	constructor(private store: Store<any>) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	clearList() {
		this.store.dispatch(new ClearUploadList());
	}


}
