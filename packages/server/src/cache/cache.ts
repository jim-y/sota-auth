import { Singleton } from '@sota/util/decorators';
import { createClient } from 'redis';
import { User } from '#types/user.type';
import { UserModel, Authenticator, SerializedAuthenticator } from '#types/webauthn.types';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';
import { TextDecoder, TextEncoder } from 'util';

@Singleton()
export class Cache {
    static #instance: Cache;

    public client = createClient();
    constructor() {
        this.client
            .connect()
            .then(() => {
                console.log('Connected to redis');
            })
            .catch(console.error);
    }

    async addUser(user: User): Promise<void> {
        await this.client.set(`user:${user.email}`, JSON.stringify(user));
    }

    async getUser(email: string): Promise<User> {
        const resp = await this.client.get(`user:${email}`);
        return JSON.parse(resp) as User;
    }

    async setChallange(userId: string, challenge: string) {
        await this.client.setEx(`challenge:${userId}`, 300, challenge);
    }

    async getChallenge(userId: string): Promise<string> {
        return await this.client.get(`challenge:${userId}`);
    }

    async clearChallenge(userId: string): Promise<void> {
        await this.client.del(`challenge:${userId}`);
    }

    async saveAuthenticator(user: UserModel, authenticator: Authenticator) {
        const existingAuthenticators: Authenticator[] = await this.getAuthenticators(user);
        if (existingAuthenticators) {
            await this.client.set(
                `authenticators:${user.username}`,
                JSON.stringify([...existingAuthenticators, authenticator].map(this._serializeAuthenticator))
            );
        } else {
            await this.client.set(
                `authenticators:${user.username}`,
                JSON.stringify([this._serializeAuthenticator(authenticator)])
            );
        }
    }

    async getAuthenticators(user: UserModel): Promise<Authenticator[]> {
        const _authenticators: string = await this.client.get(`authenticators:${user.username}`);
        if (_authenticators) {
            const serializedAuthenticators: SerializedAuthenticator[] = JSON.parse(
                _authenticators
            ) as SerializedAuthenticator[];
            return serializedAuthenticators.map(this._deSerializeAuthenticator);
        } else {
            return null;
        }
    }

    async getAuthenticator(user: UserModel, credentialID: Uint8Array): Promise<Authenticator> {
        const existingAuthenticators: Authenticator[] = await this.getAuthenticators(user);
        if (existingAuthenticators) {
            return existingAuthenticators.find((authenticator) => {
                return isoUint8Array.areEqual(authenticator.credentialID, credentialID);
            });
        }
        return null;
    }

    async saveUpdatedAuthenticatorCounter(user, authenticator, newCounter) {
        const existingAuthenticators: Authenticator[] = await this.getAuthenticators(user);
        if (existingAuthenticators) {
            const foundAuthenticatorIndex = existingAuthenticators.findIndex((_authenticator) => {
                return isoUint8Array.areEqual(_authenticator.credentialID, authenticator.credentialID);
            });
            const [foundAuthenticator] = existingAuthenticators.splice(foundAuthenticatorIndex, 1);
            foundAuthenticator.counter = newCounter;
            await this.client.set(
                `authenticators:${user.username}`,
                JSON.stringify([...existingAuthenticators, foundAuthenticator].map(this._serializeAuthenticator))
            );
        }
    }

    private _serializeAuthenticator(authenticator: Authenticator): SerializedAuthenticator {
        const serialized: SerializedAuthenticator = {
            id: authenticator.id,
            counter: authenticator.counter,
            credentialDeviceType: authenticator.credentialDeviceType,
            credentialBackedUp: authenticator.credentialBackedUp,
            transports: authenticator.transports,
            credentialID: Buffer.from(authenticator.credentialID).toString('base64url'),
            // credentialPublicKey: new TextDecoder().decode(authenticator.credentialPublicKey as Uint8Array),
            credentialPublicKey: Buffer.from(authenticator.credentialPublicKey).toString('base64url'),
        };
        return serialized;
    }

    private _deSerializeAuthenticator(serializedAuthenticator: SerializedAuthenticator): Authenticator {
        const deSerialized: Authenticator = {
            id: serializedAuthenticator.id,
            counter: serializedAuthenticator.counter,
            credentialDeviceType: serializedAuthenticator.credentialDeviceType,
            credentialBackedUp: serializedAuthenticator.credentialBackedUp,
            transports: serializedAuthenticator.transports,
            credentialID: Buffer.from(serializedAuthenticator.credentialID, 'base64'),
            // credentialPublicKey: new TextEncoder().encode(serializedAuthenticator.credentialPublicKey),
            credentialPublicKey: Buffer.from(serializedAuthenticator.credentialPublicKey, 'base64'),
        };
        return deSerialized;
    }

    static get instance(): Cache {
        if (!this.#instance) {
            this.#instance = new Cache();
        }
        return this.#instance;
    }
}
