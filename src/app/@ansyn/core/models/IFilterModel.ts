export interface IFilterModel {
	key: string;
	filterFunc: (ovrelay: any, key: string) => boolean;
}
