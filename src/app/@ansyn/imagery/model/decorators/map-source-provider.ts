import { ImageryDecorator } from './index';
import { BaseMapSourceProviderConstructor, ImageryMapSourceMetaData } from '../base-map-source-provider';
import { Injectable } from '@angular/core';

export function ImageryMapSource(metaData: ImageryMapSourceMetaData) {
	return function (constructor: BaseMapSourceProviderConstructor) {
		Injectable()(constructor);
		ImageryDecorator<ImageryMapSourceMetaData, BaseMapSourceProviderConstructor>(metaData)(constructor);
	};
}
