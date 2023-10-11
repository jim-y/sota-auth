import { Module } from '@sota/util';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  prefix: 'auth',
  controllers: [AuthController],
  services: [AuthService]
})
class AuthModule {}
export default AuthModule;