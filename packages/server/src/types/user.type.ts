export type CleanUser = {
    email: string;
    username: string;
    id: string;
    firstName: string;
    lastName: string;
    emailhash: string;
};

export type User = CleanUser & {
    password?: string;
    temp2FactorSecret?: string;
};
