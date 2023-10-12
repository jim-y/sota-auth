import { Controller, Get, Inject } from '@sota/util';
import { SamlService } from './saml.service';

@Controller('saml')
export class SamlController {
    @Inject(SamlService) private samlService: SamlService;

    @Get('metadata')
    async getMetadata(req, res) {
        res.status(200);
        res.json(this.samlService.getMetadata());
    }
}
