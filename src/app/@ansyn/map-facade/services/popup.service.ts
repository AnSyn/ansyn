import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class PopupService {

	constructor(protected http: HttpClient) {
	}


	getInfo(ev): Observable<string> {
		const eps = 10.0015;
		const coord = ev.coordinate;
		// const extent = ev.frameState.extent
		const geometry = {
			'xmin': coord[0] - eps,
			'ymin': coord[1] - eps,
			'xmax': coord[0] + eps,
			'ymax': coord[1] + eps,
			"spatialReference": { "wkid": 102100 }
		};
		const params = new HttpParams().set('f', 'json').set('returnGeometry', 'false').set('geometry', JSON.stringify(geometry))
			.set('spatialRel', 'esriSpatialRelIntersects').set('inSR', '102100')
			.set('outFields', 'OBJECTID,ID,Up_Date,GrowthCat,GrowthName,PlantYear,Dunam,Shape__Area,Shape__Length,YeshuvName,GrowthID')
			.set('outSR', '102100').set('quantizationParameters', JSON.stringify({ "mode": "edit" }));
		return this.http.get('https://services3.arcgis.com/Fqk0gVrfcnumlR5m/arcgis/rest/services/AgriParcelsForMapiReplace/FeatureServer/0/query', {
			params,
			responseType: 'text'
		})
	}
}
