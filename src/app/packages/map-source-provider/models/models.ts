

export abstract class BaseSourceProvider {
	mapType: string;
	sourceType:  string;
	create(metaData: any): any {};
	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	};
}
