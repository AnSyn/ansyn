import { InjectionToken } from '@angular/core';

export const ImisightOverlaySourceConfig: InjectionToken<IImisightOverlaySourceConfig> = new InjectionToken('imisight-overlays-source-config');

export interface IImisightOverlaySourceConfig {
	baseUrl: string;
	callbackURL: string;
}
