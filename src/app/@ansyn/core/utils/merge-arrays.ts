export function mergeArrays(array: any[]): any[] {
	return array.reduce((prev, next) => [...prev, ...next], []);
}
