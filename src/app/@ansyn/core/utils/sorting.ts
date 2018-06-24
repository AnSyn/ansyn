// latest date first
export const sortByDate = (o1, o2) => new Date(o2.date).getTime() - new Date(o1.date).getTime();
export const sortByDateDesc = (o1, o2) => -sortByDate(o1, o2);
