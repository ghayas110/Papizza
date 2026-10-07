const rupees = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

export const formatPrice = (amount: number) => `Rs ${rupees.format(amount)}`;

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
