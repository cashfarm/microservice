// tslint:disable-next-line:no-import-side-effect
import 'reflect-metan////////data';

import { Server } from 'hapi';
import { Container, decorate, injectable, unmanaged } from '@cashfarm/plow';

import { EventSourcedRepositoryOf, GesEventStore } from '@cashfarm/plow';
import { MysqlStore, Store } from '@cashfarm/store';

import { EventBus, IEventBus } from '@cashfarm/plow';
import { Router } from '@cashfarm/api-util';
import { IMicroserviceOptions } from './iMicroserviceOptions';

export function setupContainer(container: Container, serviceName: string, server: Server, options: IMicroserviceOptions) {
  require('./controllers');

  const router = new Router(server, []);
  server.decorate('server', 'getRouter', () => router);
  container.bind<Router>('IRouter').toConstantValue(router);

  container.bind<Server>('Server').toConstantValue(server);
  container.bind('ApiPrefix').toConstantValue(options.apiPrefix);

  const evtBus = new EventBus(serviceName);
  container.bind<IEventBus>('IEventBus').toConstantValue(evtBus);

  if (options.decoratePlowModules) {
    //
    // Decorate classes from 3rd part modules
    //
    decorate(injectable(), Store);
    decorate(injectable(), MysqlStore);
    decorate(unmanaged(), MysqlStore, 0);

    decorate(injectable(), GesEventStore);
    decorate(injectable(), EventSourcedRepositoryOf);
    decorate(unmanaged(), EventSourcedRepositoryOf, 0);
    decorate(unmanaged(), EventSourcedRepositoryOf, 1);
    decorate(unmanaged(), EventSourcedRepositoryOf, 2);
  }
}
