import { Cache } from '#cache/cache';
import { User } from '#types/user.type';
import { Inject, Injectable } from '@sota/util/decorators';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
    @Inject(Cache) private cache: Cache;

    async getTwoFactorSecret(user: User): Promise<string> {
        return this.cache.client.get(`two-factor:${user.id}`);
    }

    async isTwoFactorEnabled(user: User) {
        const secret = await this.cache.client.get(`two-factor:${user.id}`);
        if (!secret) return null;
        return {
            imageUrl: await this._getImageURL(user.email, secret),
        };
    }

    async enableTwoFactorForUser(user: User): Promise<{ imageUrl: string; secret: string }> {
        const secret = speakeasy.generateSecret({ length: 20 });
        const imageUrl = await this._getImageURL(user.email, secret.base32);
        return { imageUrl, secret: secret.base32 };
    }

    async disableTwoFactorForUser(user: User): Promise<void> {
        this.cache.client.del(`two-factor:${user.id}`);
    }

    verifyToken(user: User, secret: string, token: string): boolean {
        return speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 6 });
    }

    private async _getImageURL(email: string, secret: string): Promise<string> {
        const service = process.env.SERVICE_NAME;
        const url = `otpauth://totp/${service}:${encodeURIComponent(email)}?secret=${secret}&issuer=${service}`;
        return await QRCode.toDataURL(url);
    }
}
