# Map-Colonies probe
> build on top of godaddy terminus
## Install

```
$ npm install --save @map-colonies/mc-probe
```

## Usage

### javascript
```js
const { Probe } = require('@map-colonies/mc-probe');
const { MCLogger } = require('@map-colonies/mc-logger');
const service = require('./package.json');
const express = require('express');

const app = express();
const logger = new MCLogger({
    level:'info'
},service);
const probConfig = {
};
const probe = new Probe(logger,probConfig);
probe.start(app,3000).then(()=>{
    probe.readyFlag = true;
}).catch(()=>{
    probe.liveFlag = false;
});
```

### typescript
```ts
import { Probe } from '@map-colonies/mc-probe';
import { MCLogger } from '@map-colonies/mc-logger';
import express from 'express';
import { readFileSync } from 'fs'
const serviceString = readFileSync('./package.json','utf-8');
const service = JSON.parse(serviceString);
console.log(service);
const app = express();
const logger = new MCLogger({
    level:'info'
},service);
const probConfig = {
};
const probe = new Probe(logger, probConfig);
probe.start(app,3000).then(()=>{
    probe.readyFlag = true;
}).catch(()=>{
    probe.liveFlag = false;
});
```