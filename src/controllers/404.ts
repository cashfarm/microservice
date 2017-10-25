import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { Endpoint, IController } from '@cashfarm/api-util';

import { provide } from '@cashfarm/plow';
import Config from '../config';

/**
 * Catch-all controller
 *
 * This controller's route `notFound` will catch any request for
 * routes that are not matched by any existing controller
 *
 * @export
 * @class CatchAll
 * @implements {IController}
 */
@provide('IController')
export class CatchAll implements IController {

  @Endpoint(
    'GET', '/{any*}',
    {
      description: 'Matchs any url to log 404 requests',
      tags: ['api']
  })
  public notFound(req: Hapi.Request, reply: Hapi.ReplyNoContinue) {
    const accept = req.raw.req.headers.accept;

    if (accept && accept.match(/json/)) {
      const err = Boom.notFound('Endpoint not found', { url: req.url });
      err.output.payload.data = err.data;

      return reply(err);
    }

    reply().code(404);
  }
}

export default CatchAll;
