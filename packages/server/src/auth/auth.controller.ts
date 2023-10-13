import { Controller, Get, Inject, Middlewares, Post } from '@sota/util';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sessionCheck } from '../middlewares/session-check';

@Controller()
export class AuthController {
    @Inject(AuthService) private authService: AuthService;

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
        req.session.user = { email };
        res.redirect('/');
    }

    @Post('logout')
    @Middlewares([sessionCheck])
    async logout(req: Request, res: Response) {
        req.session.user = null;
        res.sendStatus(200);
    }
}
