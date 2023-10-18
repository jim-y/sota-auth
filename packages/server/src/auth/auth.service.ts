import { Injectable, Inject } from '@sota/util/decorators';
import { randomUUID } from 'crypto';
import { Cache } from '#cache/cache';
import bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { User } from '#types/user.type';
import { UserModel } from '#models/User.model';
import { UserService } from '#services/user.service';

@Injectable()
export class AuthService {
    @Inject(Cache) private cache: Cache;
    @Inject(UserService) private userService: UserService;

    async createUser({ email, password, firstName, lastName }) {
        const userModel = await this.userService.create({
            email,
            password,
            firstName,
            lastName,
        });
        return userModel.asJSON();
    }

    async verifyAndGetUser(email, password): Promise<User | null> {
        const user = await this.userService.get(email);
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            return user.asJSON();
        }
        return null;
    }

    // async checkTwoFactor(user: User): Promise<string> {
    //     return this.cache.client.get(`two-factor:${user.id}`);
    // }
}
