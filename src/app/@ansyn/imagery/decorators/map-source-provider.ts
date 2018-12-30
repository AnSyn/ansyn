import { ImageryDecorator } from './index';
import { IBaseMapSourceProviderConstructor, IImageryMapSourceMetaData } from '../model/base-map-source-provider';
import { Injectable } from '@angular/core';

export function ImageryMapSource(metaData: IImageryMapSourceMetaData) {
	return function (constructor: IBaseMapSourceProviderConstructor) {
		Injectable()(constructor);
		ImageryDecorator(metaData)(constructor);
	};
}
