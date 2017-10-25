// tslint:disable:no-console
// tslint:disable:no-import-side-effect
import { betterErrors } from './ext/betterErrors';
import { Server } from 'hapi';

import Config from './config';
import { interfaces as IoC, decorate, inject, injectable, multiInject } from 'inversify';

import '@cashfarm/api-util/lib/hapi/router';

import { container, Container } from '@cashfarm/plow';
import { Router } from '@cashfarm/api-util';
import { IMicroserviceOptions } from './iMicroserviceOptions';
import { setupContainer } from './container.config';

const Glue = require('glue');

const composeOptions = {
  relativeTo: __dirname
};

export interface IMsServer extends Server {
  getContainer(): Container;
  getRouter(): Router;
}

// tslint:disable-next-line:max-line-length
export async function createServer(serviceName: string, options?: IMicroserviceOptions, customContainer?: Container): Promise<IMsServer>;
export async function createServer(serviceName: string, override?: (server: Server) => void, customContainer?: Container): Promise<IMsServer>;
export async function createServer(
          serviceName: string,
          override?: IMicroserviceOptions|((server: IMsServer) => void),
          customContainer?: Container):
              Promise<Server> {
  return new Promise<Server>( (resolve, reject) => {

    const options: IMicroserviceOptions = {
      debug: true,
      enableCors: true,
      port: 3000
    };

    if (typeof override === 'object') {
      Object.assign(options, override);
    }

    const criteria = {
      env: process.env.NODE_ENV || 'development',
      debug: 'on'
    };

    const manifest = Config.get('/', criteria);

    // @todo Find a better way to configure the port
    manifest.connections[0].port = options.port;

    Glue.compose(manifest, composeOptions, (err?: any, server?: IMsServer) => {
      if (err) {
        return reject(err);
      }

      if (customContainer) {
        setupContainer(customContainer, serviceName, server, options);
        server.decorate('server', 'getContainer', () => customContainer);
      }
      else {
        setupContainer(container, serviceName, server, options);
        server.decorate('server', 'getContainer', () => container);
      }

      if (options.enableCors) {
        const addCorsHeaders = require('hapi-cors-headers');
        server.ext('onPreResponse', addCorsHeaders);
      }

      if (options.debug) {
        server.settings.debug = { log: ['error', 'uncaught'], request: ['error', 'uncaught'] };
        server.ext('onPreResponse', betterErrors);
      }

      if (typeof override === 'function') {
        override(server);
      }

      server.on('start', () => {
        server.getRouter().addControllers(container.getAll('IController'));
      });

      resolve(server);
    });
  });
}
