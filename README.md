Microservice Base
========

## How to use

```
import { createServer } from '@cashfarm/microservice';

const server = createServer({
  // all attributes are optional
  // the values here are the default values
  enableCors: true,
  debug: true,
  port: 3000
});
Server.start();
```
