import { axisBottom, axisTop } from 'd3';

export default (xScale, configuration, where) => {
	const tickFormat = configuration.locale
		? configuration.locale.timeFormat
		: configuration.tickFormat;

	// change where so the first letter will be uppercase
	where = `${where[0].toUpperCase()}${where.slice(1)}`;

	let axis = undefined;
	if (where === 'Top') {
		axis = axisTop(null).scale(xScale).tickFormat(tickFormat);
	} else {
		axis = axisBottom(null).scale(xScale).tickFormat(tickFormat);
	}

	// const axis = d3[`axis${where}`]().scale(xScale).tickFormat(tickFormat);

	if (typeof configuration.axisFormat === 'function') {
		configuration.axisFormat(axis);
	}

	return axis;
};
