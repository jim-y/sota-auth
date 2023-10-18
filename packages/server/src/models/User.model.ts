import { CleanUser, User } from '#types/user.type';
import { Model } from '@sota/util/decorators';
import { randomUUID, createHash } from 'crypto';

@Model
export class UserModel implements User {
    email: string;
    username: string;
    id: string = randomUUID();
    firstName: string;
    lastName: string;
    emailhash: string;
    password: string;
    temp2FactorSecret: string;

    constructor(user?: Partial<User>) {
        if (user) {
            for (const prop in user) {
                this[prop] = user[prop];
            }
        }
        if (this.firstName && this.lastName) {
            this.username = [this.firstName, this.lastName].join(' ');
        } else {
            this.username = this.email;
        }
        if (this.email) {
            this.emailhash = createHash('md5').update(this.email.toLowerCase().trim()).digest('hex');
        }
    }

    static SALT_ROUNDS = 10;

    static #clean(userProperties: Partial<User>): CleanUser {
        return {
            email: userProperties.email,
            username: userProperties.username,
            id: userProperties.id,
            firstName: userProperties.firstName,
            lastName: userProperties.lastName,
            emailhash: userProperties.emailhash,
        } as CleanUser;
    }

    asJSON(): CleanUser {
        return UserModel.#clean(this);
    }
}
