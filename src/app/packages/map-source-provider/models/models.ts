
export abstract class BaseSourceProvider {
	mapType: string;
	sourceType:  string;
	create(metaData: any): any {};
}
