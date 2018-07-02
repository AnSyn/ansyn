export interface FilterModel {
	key: string;
	filterFunc: (ovrelay: any, key: string) => boolean;
}
