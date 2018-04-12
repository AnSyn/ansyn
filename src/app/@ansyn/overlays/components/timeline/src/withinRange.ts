export const withinRange = (date, dateBounds) => {
	const startingDate: any = Math.min(...dateBounds);
	const endingDate: any = Math.max(...dateBounds);

	// @TODO: remove the `new Date()` constructor in the next major version: we need to force it at configuration level.
	return new Date(date) >= startingDate && new Date(date) <= endingDate;
};
