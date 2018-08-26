import 'zone.js/dist/zone-error';
import { constConfigurations } from './const/configuration.const';
export const configuration = {
	production: false,
	...constConfigurations
};
