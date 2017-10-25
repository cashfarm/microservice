import * as Hapi from 'hapi';
import * as Boom from 'boom';

const server = new Hapi.Server();

export function betterErrors(request: Hapi.Request, reply: Hapi.ReplyWithContinue) {
  if (!request.response.isBoom) {
    return reply.continue();
  }

  const err: Boom.BoomError & Error = <any> request.response;

  if (err.data) {
    err.output.payload.data = err.data;
  }

  if (500 === err.output.payload.statusCode && process.env.NODE_ENV !== 'production') {
    if (err.message) {
      err.output.payload.message = err.message;
    }

    if (err.stack)
      err.output.payload.stack = err.stack.split('\n').slice(1).map(l => l.replace(/\s*at\s*/, ''));
  }

  return reply(err);
}
