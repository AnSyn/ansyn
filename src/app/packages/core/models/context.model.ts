export type Context = {
	id: string,
	name: string,

	layout_index?: number,
	zoom?: number,
	imageryCount?: number,
	timeFilter?: string,
	geoFilter?: string
	orientation: string,

	time: {
		type:string,
		from: Date,
		to: Date
	},
	facets: {
		SensorName: string,
		SensorType: 'SAR' | 'VIS' | 'IR' | 'Satellite',
		Stereo: boolean,
		Resolution: number
	},
	region: {}
}
