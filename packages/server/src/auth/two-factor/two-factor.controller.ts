import { Controller, Get, Inject, Put, Middlewares, Post } from '@sota/util/decorators';
import { Cache } from '#cache/cache';
import { sessionCheck } from '#middlewares/session-check';
import { User } from '#types/user.type';
import { Request, Response } from 'express';
import { TwoFactorService } from './two-factor.service';
import { UserModel } from '#models/User.model';

@Controller('two-factor')
export class TwoFactorController {
    @Inject(Cache) private cache: Cache;
    @Inject(TwoFactorService) private twoFactorService: TwoFactorService;

    @Get()
    @Middlewares([sessionCheck])
    async isTwoFactorEnabled(req: Request, res: Response) {
        const user: User = req.session.user;
        const options = await this.twoFactorService.isTwoFactorEnabled(user);
        res.json(options);
    }

    @Post()
    async doTwoFactorLogin(req: Request, res: Response) {
        if (req.session.login == null) {
            return res.redirect('/auth/login?error=invalid-2fa-login');
        }

        const token = req.body.token;
        const email: User['email'] = req.session.login.email;
        const user = await this.cache.getUser(email);
        const secret = await this.twoFactorService.getTwoFactorSecret(user);
        const isValid = await this.twoFactorService.verifyToken(user, secret, token);

        delete req.session.login;
        if (isValid) {
            req.session.user = user;
            return res.redirect('/');
        }
        res.redirect('/auth/login?error=invalid-2fa-login');
    }

    @Put('enable')
    @Middlewares([sessionCheck])
    async enableTwoFactor(req: Request, res: Response) {
        const user: User = req.session.user;
        const { imageUrl, secret } = await this.twoFactorService.enableTwoFactorForUser(user);
        req.session.user.temp2FactorSecret = secret;
        res.send(imageUrl);
    }

    @Post('verify')
    @Middlewares([sessionCheck])
    async verifyToken(req: Request, res: Response) {
        const { token } = req.body;
        const user: User = req.session.user;
        const isValid = await this.twoFactorService.verifyToken(user, user.temp2FactorSecret, token);
        if (isValid) {
            await this.cache.client.set(`two-factor:${user.id}`, user.temp2FactorSecret);
            delete req.session.user.temp2FactorSecret;
        }
        res.send(isValid);
    }
}
