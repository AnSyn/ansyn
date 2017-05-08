import { Context } from './context.model';

export type Case = {
	id?:string;
	name?:string;
	owner?:string;
	last_modified?:Date;
	state?: {
		selected_overlay_id?: string;
		selected_context_id?: string;
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
		maps: {position: any} [],
		region: {}

	}
}
