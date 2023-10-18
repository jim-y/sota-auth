import { Controller, Get, Inject, Middlewares, Post } from '@sota/util/decorators';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sessionCheck } from '#middlewares/session-check';
import { Cache } from '#cache/cache';
import { User } from '#types/user.type';
import { TwoFactorService } from './two-factor/two-factor.service';

@Controller()
export class AuthController {
    @Inject(AuthService) private authService: AuthService;
    @Inject(TwoFactorService) private twoFactorService: TwoFactorService;

    @Get('session')
    @Middlewares([sessionCheck])
    async getSession(req: Request, res: Response) {
        const session = req.session.user;
        res.json(session);
    }

    @Post('login')
    async login(req: Request, res: Response) {
        const email = req.body.email;
        const password = req.body.password;
        const user: User | null = await this.authService.verifyAndGetUser(email, password);
        if (user) {
            const isTwoFactorEnabled = await this.twoFactorService.isTwoFactorEnabled(user);
            if (isTwoFactorEnabled) {
                req.session.login = {
                    email: user.email,
                };
                return res.redirect('/auth/login/2fa');
            }
            req.session.user = user;
            res.redirect('/');
        } else {
            const params = new URLSearchParams('error=invalid-email-or-password');
            res.redirect(`/auth/login?${params.toString()}`);
        }
    }

    @Post('logout')
    @Middlewares([sessionCheck])
    async logout(req: Request, res: Response) {
        req.session.user = null;
        res.sendStatus(200);
    }

    @Post('register')
    async register(req: Request, res: Response) {
        const email = req.body.email;
        const password = req.body.password;
        const passwordConfirm = req.body.passwordConfirm;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;

        if (password !== passwordConfirm) {
            const params = new URLSearchParams('error=passwords-do-not-match');
            return res.redirect(`/auth/register?${params.toString()}`);
        }

        const user = await this.authService.createUser({
            email,
            password,
            firstName,
            lastName,
        });
        req.session.user = user;
        res.redirect('/');
    }
}
