import * as Hapi from 'hapi';

import { Endpoint, IController } from '@cashfarm/api-util';

import { provide } from '@cashfarm/plow';
import Config from '../config';

@provide('IController')
export class MetaCtl implements IController {

  @Endpoint(
    'GET', '',
    {
      description: 'Returns available endpoints',
      tags: ['api']
  })
  public meta(hapiReq: Hapi.Request, reply: Hapi.Base_Reply) {
    const apiInfo = hapiReq.server.plugins.blipp.info()[0];
    reply({
      uri: apiInfo.uri + Config.get('api.prefix'),
      version: Config.get('api.version'),
      endpoints: apiInfo.routes
    });
  }
}

export default MetaCtl;
