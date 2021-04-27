/**
 * Returns opacity value from color string if in format 'rgba(r,g,b,a)'; otherwise returns 1
 */
export function getOpacityFromColor(color: string): number {
	// RegExp which recognizes strings in format 'rgba(r,g,b,a)' where r,g,b,a are numbers
	const rgbaMatcher = /^rgba\(\d{1,3},\d{1,3},\d{1,3},\d\.*\d*\)$/;

	const colorIsInRgbaFormat = rgbaMatcher.test(color);
	const alpha: number = colorIsInRgbaFormat ? +color.split(',')[3].replace(/[^0-9.]/g, '') : 1;

	return alpha;
}

export function stringToRGB(str: string) {
	return intToRGB(hashCode(str));
}

function hashCode(str) { // java String#hashCode
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
}

function intToRGB(i) {
	let c = (i & 0x00FFFFFF)
		.toString(16)
		.toUpperCase();

	return "00000".substring(0, 6 - c.length) + c;
}
