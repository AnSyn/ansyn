import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	IUploadItem,
	IUploadsFormData,
	IUploadsState,
	selectFormData,
	selectUploadList
} from '../reducers/uploads.reducer';
import {
	AddRequestToFileList,
	MoveToUploadOverlay,
	RequestUploadFiles,
	RequestUploadFileSuccess,
	ResetFormData,
	UpdateUploadFilePercent,
	UploadsActionTypes
} from '../actions/uploads.actions';
import { concatMap, map, tap, withLatestFrom } from 'rxjs/operators';
import { UploadFileService } from '../services/upload-file.service';
import { HttpEventType } from '@angular/common/http';
import { ToggleFavoriteAction } from '@ansyn/core';
import { DisplayOverlayAction } from '@ansyn/overlays';
import { ofType } from '@ngrx/effects';

@Injectable()
export class UploadFilesEffects {

	@Effect()
	requestUploadFiles: Observable<any> = this.actions$
		.pipe(
			ofType<RequestUploadFiles>(UploadsActionTypes.requestUploadFiles),
			withLatestFrom(this.store$.select(selectUploadList), this.store$.select(selectFormData), (action, uploadList, formData): [number, IUploadsFormData] => {
				return [uploadList.length, formData];
			}),
			map(([uploadListLength, formData]: [number, IUploadsFormData]) => {
				const { files, ...request } = formData;
				const newFiles: IUploadItem[] = Array.from(files).map((file, index) => {
					const r = { ...request, file };
					return {
						request: r,
						percent: 0,
						response: undefined,
						index: index + uploadListLength
					};
				});
				return newFiles;
			}),
			concatMap((files) => [
				new AddRequestToFileList(files),
				new ResetFormData()
			])
		);

	@Effect({ dispatch: false })
	addRequestToFileList: Observable<any> = this.actions$
		.pipe(
			ofType<AddRequestToFileList>(UploadsActionTypes.addRequestToFileList),
			tap(({ payload }) => {
				const requestFile = [...payload];
				requestFile.forEach(file => {
					this.uploadFileService.upload(file).subscribe({
							next: event => this.ping(event, file.index),
							error: err => this.error(file.index, err)
						}
					);
				});
			})
		);

	@Effect()
	moveToUploadOverlay: Observable<any> = this.actions$
		.pipe(
			ofType<MoveToUploadOverlay>(UploadsActionTypes.moveToUploadOverlay),
			map((action => action.payload)),
			concatMap(({ overlay, mapId }) => [
				new ToggleFavoriteAction({ value: true, id: overlay.id, overlay }),
				new DisplayOverlayAction({ overlay, mapId })
			])
		);


	constructor(protected actions$: Actions,
				protected store$: Store<IUploadsState>,
				protected uploadFileService: UploadFileService) {
	}

	private ping(event, index: number) {
		switch (event.type) {
			case HttpEventType.Sent: {
				this.store$.dispatch(new UpdateUploadFilePercent({ index, percent: 0 }));
				break;
			}
			case HttpEventType.UploadProgress: {
				let percent = Math.round(event.loaded / event.total * 90);
				this.store$.dispatch(new UpdateUploadFilePercent({ index, percent }));
				break;
			}
			case HttpEventType.Response: {
				this.store$.dispatch(new RequestUploadFileSuccess({ index, body: event.body }));
				break;
			}
		}
	}

	private error(index: number, err: any) {
		this.store$.dispatch(new UpdateUploadFilePercent({ index, percent: -1 }));
	}
}
