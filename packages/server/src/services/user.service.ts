import { Cache } from '#cache/cache';
import { UserModel } from '#models/User.model';
import { User } from '#types/user.type';
import { Inject, Singleton } from '@sota/util/decorators';
import bcrypt from 'bcrypt';

@Singleton()
export class UserService {
    static #instance: UserService;

    @Inject(Cache) private cache: Cache;

    async create(userProperties: Partial<User>): Promise<UserModel> {
        if (userProperties.password) {
            userProperties.password = await bcrypt.hash(userProperties.password, UserModel.SALT_ROUNDS);
        }
        await this.cache.client.set(`user:${userProperties.email}`, JSON.stringify(userProperties), {
            NX: true,
        });
        return new UserModel(userProperties);
    }

    async get(email: User['email']): Promise<UserModel> {
        const user = await this.cache.client.get(`user:${email}`);
        return new UserModel(JSON.parse(user));
    }

    static get instance() {
        if (!this.#instance) this.#instance = new UserService();
        return this.#instance;
    }
}
