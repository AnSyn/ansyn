/**
 * @description Add depths to constructor
 */
export function ImageryDecorator(metaData) {
	return function (constructor: any) {
		Object.entries(metaData).forEach(([key, value]) => {
			constructor.prototype[key] = value;
		});
	};
}
