// latest date first
export const sortByDateDesc = (o1, o2) => new Date(o1.date) > new Date(o2.date) ? 1 : -1;
export const sortByDate = (o1, o2) => new Date(o2.date) > new Date(o1.date) ? 1 : -1;
