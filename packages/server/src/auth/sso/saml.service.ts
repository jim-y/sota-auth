import { Inject, Injectable } from '@sota/util';

@Injectable()
export class SamlService {
    @Inject('NODE_ENV') private nodeEnv;
    getMetadata() {
        if (this.nodeEnv === 'development') {
            return {
                meta: true,
                isDevelopment: true,
            };
        }
        return {
            meta: true,
        };
    }
}
