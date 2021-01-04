import { Injectable, Inject } from '@angular/core';
import { IImageProcParam, IOverlayStatusConfig, overlayStatusConfig } from '../config/overlay-status-config';
import { IImageManualProcessArgs } from '../../../menu-items/cases/models/case.model';
import { isEqual } from 'lodash';

@Injectable({
	providedIn: 'root'
})
export class OverlayStatusService {
	_defaultImageManualProcessArgs: IImageManualProcessArgs;
	constructor(@Inject(overlayStatusConfig) protected config: IOverlayStatusConfig) {
	}

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	get defaultImageManualProcessArgs(): IImageManualProcessArgs {
		if (!this._defaultImageManualProcessArgs) {
			this._defaultImageManualProcessArgs = this.params.reduce<IImageManualProcessArgs>((initialObject: any, imageProcParam) => {
				return <any>{ ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
			}, {});
		}
		return {...this._defaultImageManualProcessArgs}
	}

	isDefaultImageProcess(imageProcessParam: IImageManualProcessArgs): boolean {
		return isEqual(imageProcessParam, this.defaultImageManualProcessArgs);
	}

}
