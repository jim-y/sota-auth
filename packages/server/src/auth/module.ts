import { Module } from '@sota/util';

import SingleSignOnModule from './sso/module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    prefix: 'auth',
    inheritPrefix: true,
    modules: [SingleSignOnModule],
    controllers: [AuthController],
})
class AuthModule {}
export default AuthModule;
