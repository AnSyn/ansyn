export class PlanetOverlay {
	_links: {
		_self: string,
		assets: string,
		thumbnail: string
	};
	_permissions: string[];
	geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
	id: string;
	properties: {
		acquired: string,
		anomalous_pixels: number,
		black_fill: number,
		cloud_cover: number,
		columns: number,
		epsg_code: number,
		grid_cell: string,
		ground_control: boolean,
		gsd: number,
		item_type: string,
		origin_x: number,
		origin_y: number,
		pixel_resolution: number,
		provider: string,
		published: string,
		rows: number,
		satellite_id: string,
		strip_id: string,
		sun_azimuth: number,
		sun_elevation: number,
		updated: string,
		usable_data: number,
		view_angle: number
	};
}
