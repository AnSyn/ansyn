// latest date first
export const sortByDateDesc = (o1, o2) => o1.date > o2.date ? -1 : 1;
// earliest date first
export const sortByDateAsc = (o1, o2) => o1.date > o2.date ? 1 : -1;

// best resolution first
export const sortByResolutionDesc = (o1, o2) => o1.bestResolution > o2.bestResolution ? -1 : 1;
