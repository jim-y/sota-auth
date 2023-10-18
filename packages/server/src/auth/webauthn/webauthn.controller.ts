import { Controller, Get, Inject, Post, Middlewares } from '@sota/util/decorators';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import { origin, rpID, rpName } from './rp';
import { Request, Response } from 'express';
import { Cache } from '#cache/cache';
import { User } from '#types/user.type';
import { UserModel, Authenticator } from '#types/webauthn.types';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { sessionCheck } from '#middlewares/session-check';

@Controller('webauthn')
export class WebAuthNController {
    @Inject(Cache) private cache: Cache;

    @Get('registration/options')
    @Middlewares([sessionCheck])
    async getRegistrationOptions(req: Request, res: Response) {
        // (Pseudocode) Retrieve the user from the database
        // after they've logged in
        const sessionUser = req.session.user;
        const user: UserModel = {
            id: sessionUser.id,
            username: sessionUser.username,
        };

        // (Pseudocode) Retrieve any of the user's previously-
        // registered authenticators
        const userAuthenticators: Authenticator[] = (await this.cache.getAuthenticators(user)) ?? [];

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: user.id,
            userName: user.username,
            // Don't prompt users for additional information about the authenticator
            // (Recommended for smoother UX)
            attestationType: 'none',
            authenticatorSelection: {
                authenticatorAttachment: 'cross-platform',
                residentKey: 'required',
                userVerification: 'preferred',
                // residentKey: 'discouraged',
            },
            /**
             * Support the two most common algorithms: ES256, and RS256
             */
            supportedAlgorithmIDs: [-7, -257],
            // Prevent users from re-registering existing authenticators
            excludeCredentials: userAuthenticators.map((authenticator) => ({
                id: authenticator.credentialID,
                type: 'public-key',
                // Optional
                transports: authenticator.transports,
            })),
            extensions: {
                credProps: true,
            },
            // excludeCredentials: [],
        });

        // (Pseudocode) Remember the challenge for this user
        await this.cache.setChallange(user.id, options.challenge);

        res.json(options);
    }

    @Post('registration/verify')
    @Middlewares([sessionCheck])
    async verifyRegistration(req: Request, res: Response) {
        const { body } = req;

        // (Pseudocode) Retrieve the logged-in user
        const sessionUser = req.session.user;
        const user: UserModel = {
            id: sessionUser.id,
            username: sessionUser.username,
        };

        // (Pseudocode) Get `options.challenge` that was saved above
        const expectedChallenge = await this.cache.getChallenge(user.id);

        let verification: VerifiedRegistrationResponse;
        try {
            verification = await verifyRegistrationResponse({
                response: body,
                expectedChallenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
                requireUserVerification: true,
            });
        } catch (error) {
            console.error(error);
            return res.status(400).send({ error: error.message });
        }

        const { verified, registrationInfo } = verification;
        const { credentialPublicKey, credentialID, counter, credentialBackedUp, credentialDeviceType } =
            registrationInfo;

        const existingAuthenticator = await this.cache.getAuthenticator(user, credentialID);

        if (!existingAuthenticator) {
            const newAuthenticator: Authenticator = {
                id: body.id,
                credentialID,
                credentialPublicKey,
                credentialBackedUp,
                credentialDeviceType,
                transports: body.response.transports,
                counter,
            };

            // (Pseudocode) Save the authenticator info so that we can
            // get it by user ID later
            await this.cache.saveAuthenticator(user, newAuthenticator);
        }

        await this.cache.clearChallenge(user.id);

        res.json({ verified });
    }

    // ========================================
    //             Authentication
    // ========================================

    @Get('authentication/options')
    async getAuthenticationOptions(req: Request, res: Response) {
        const email = req.query.email;

        const _user: User = await this.cache.getUser(email as string);

        // (Pseudocode) Retrieve the logged-in user
        const user: UserModel = {
            id: _user.id,
            username: _user.username,
        };

        // (Pseudocode) Retrieve any of the user's previously-
        // registered authenticators
        const userAuthenticators: Authenticator[] = (await this.cache.getAuthenticators(user)) ?? [];

        const options = await generateAuthenticationOptions({
            timeout: 60000,
            // Require users to use a previously-registered authenticator
            allowCredentials: userAuthenticators.map((authenticator) => ({
                id: authenticator.credentialID,
                type: 'public-key',
                transports: authenticator.transports,
            })),
            rpID,
            userVerification: 'preferred', // 'preferred'
        });

        // (Pseudocode) Remember this challenge for this user
        await this.cache.setChallange(user.id, options.challenge);

        res.json(options);
    }

    @Post('authentication/verify')
    async verifyAuthentication(req: Request, res: Response) {
        const { body } = req;
        const email = req.query.email;
        const _user: User = await this.cache.getUser(email as string);

        // (Pseudocode) Retrieve the logged-in user
        const user: UserModel = {
            id: _user.id,
            username: _user.username,
        };

        // (Pseudocode) Get `options.challenge` that was saved above
        const expectedChallenge = await this.cache.getChallenge(user.id);

        // (Pseudocode} Retrieve an authenticator from the DB that
        // should match the `id` in the returned credential
        const bodyCredIDBuffer = isoBase64URL.toBuffer(body.rawId);
        const authenticator: Authenticator = await this.cache.getAuthenticator(user, bodyCredIDBuffer);

        if (!authenticator) {
            return res.status(400).send({
                error: 'Authenticator is not registered with this site',
            });
        }

        let verification;
        try {
            verification = await verifyAuthenticationResponse({
                response: body,
                expectedChallenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
                authenticator,
                requireUserVerification: true,
            });
        } catch (error) {
            console.error(error);
            return res.status(400).send({ error: error.message });
        }

        const { verified, authenticationInfo } = verification;
        const { newCounter } = authenticationInfo;
        this.cache.saveUpdatedAuthenticatorCounter(user, authenticator, newCounter);
        await this.cache.clearChallenge(user.id);
        req.session.user = _user;
        res.json({ verified });
    }
}
