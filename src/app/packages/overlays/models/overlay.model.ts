/**
 * Created by ohad1 on 02/04/2017.
 */


export type  Overlay = {
	id: string,
	footprint?: any,//@todo add type geojson_multipoligon,
	sensorType?: string,
	sensorName?: string,
	channel?: string,
	bestResolution?: number,
	isStereo?: boolean,
	name: string,
	imageUrl?: string,
	thumbnailUrl?: string,
	photoTime: Date,
	azimuth: number, //radians
	aproximateTransform?: any,
	csmState?: string,
	sourceType?:string
}
