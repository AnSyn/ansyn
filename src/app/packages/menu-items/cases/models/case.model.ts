export type Case = {
	id?:string;
	name?:string;
	owner?:string;
	last_modified?:Date;
	state?: {
		selected_overlays_ids?: string[];
		selected_context_id?: string;
		maps?: {position: any} [],
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
}
