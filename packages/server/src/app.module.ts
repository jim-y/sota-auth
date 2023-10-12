import { Module } from '@sota/util';
import AuthModule from './auth/module';

@Module({
    modules: [AuthModule],
})
class AppModule {}

export default AppModule;
