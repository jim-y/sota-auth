import { Controller, Get, Inject } from "@sota/util";
import { Request, Response } from 'express';
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  @Inject('AuthService') private authService: AuthService; 

  @Get('login')
  async login(req: Request, res: Response) {
    res.send(this.authService.doLogin())
  }
}
