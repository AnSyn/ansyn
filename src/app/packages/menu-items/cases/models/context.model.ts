export type Context = {
	id: string,
	name: string,
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
