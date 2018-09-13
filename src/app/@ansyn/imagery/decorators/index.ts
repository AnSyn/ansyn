/**
 * @description Add depths to constructor
 */
export function ImageryDecorator<M, C>(metaData: M) {
	return function (constructor: C) {
		Object.keys(metaData).forEach((key) => {
			constructor[key] = metaData[key];
		});
	};
}
