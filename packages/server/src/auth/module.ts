import { Module } from '@sota/util/decorators';

import SingleSignOnModule from './sso/module';

import { AuthController } from './auth.controller';
import { WebAuthNController } from './webauthn/webauthn.controller';
import { TwoFactorController } from './two-factor/two-factor.controller';

@Module({
    prefix: 'auth',
    inheritPrefix: true,
    modules: [SingleSignOnModule],
    controllers: [AuthController, WebAuthNController, TwoFactorController],
})
class AuthModule {}
export default AuthModule;
