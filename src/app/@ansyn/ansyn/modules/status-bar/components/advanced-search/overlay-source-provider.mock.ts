import { Observable, EMPTY } from "rxjs";
import { BaseOverlaySourceProvider, IFetchParams } from "../../../overlays/models/base-overlay-source-provider.model";
import { IOverlaysFetchData, IOverlay } from "../../../overlays/models/overlay.model";

export class OverlaySourceProviderMock extends BaseOverlaySourceProvider {
	public fetch(fetchParams: IFetchParams): Observable<IOverlaysFetchData> {
		return EMPTY;
	}

	public getById(id: string, sourceType: string = null): Observable<IOverlay> {
		return EMPTY;
	};
}
