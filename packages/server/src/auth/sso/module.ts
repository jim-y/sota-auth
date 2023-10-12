import { Module } from '@sota/util';

import { SamlController } from './saml.controller';
import { SamlService } from './saml.service';

@Module({
    prefix: 'sso',
    inheritPrefix: true,
    controllers: [SamlController],
})
class SingleSignOnModule {}
export default SingleSignOnModule;
