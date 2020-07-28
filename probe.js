'use strict';

const {createTerminus, HealthCheckError} = require('@godaddy/terminus');
const http = require('http');


module.exports = class Probe {

    constructor(logger, config) {
        this._logger = logger;
        this._config = config;
        this._readyFlag = false;
        this._liveFlag = true;
        this._errors = [];
        this.server = null;

        const noop = () => {
        };
        const onSignal = () => {
            this._logger.log('onSignal, server is starting cleanup');
            return Promise.all([
                // your clean logic, like closing database connections
            ]);
        };

        const onShutdown = () => {
            this._logger.log('onShutdown, not implemented');
        };

        const beforeShutdown = () => {
            this._logger.log('beforeShutdown, not implemented');
        };

        const onSendFailureDuringShutdown = () => {
            this._logger.log('onSendFailureDuringShutdown, not implemented');
        };

        const liveness = () => {
            this._logger.log('silly', `liveness probe = ${this._liveFlag}`);
            if (this._liveFlag) {
                return Promise.resolve();
            }
            else {
                throw new HealthCheckError('liveness failed', this._errors);
            }
        };
        const readiness = () => {
            this._logger.log('silly', `readiness probe = ${this._readyFlag}`);
            if (this._readyFlag) {
                return Promise.resolve();
            } else {
                throw new HealthCheckError('liveness failed', this._errors);
            }
        };
        this._options = {
            // healtcheck options
            healthChecks: {
                '/liveness': config.liveness || liveness,    // a promise returning function indicating service health
                '/readiness': config.readiness || readiness    // a promise returning function indicating service ready
            },


            // cleanup options
            timeout: config.timeout || 1000,                   // [optional = 1000] number of milliseconds before forcefull exiting
            beforeShutdown: config.beforeShutdown || beforeShutdown,                  // [optional] called before the HTTP server starts its shutdown
            onSignal: config.onSignal || onSignal,                        // [optional] cleanup function, returning a promise (used to be onSigterm)
            onShutdown: config.onShutdown || onShutdown,                      // [optional] called right before exiting
            onSendFailureDuringShutdown: config.onSendFailureDuringShutdown || onSendFailureDuringShutdown,     // [optional] called before sending each 503 during shutdowns

            // both
            logger: config.logger || noop                      // [optional] logger function to be called with errors
        };


        process.on('uncaughtException', (err) => {
            this._logger.log('error', `uncaughtException ${err}`);
            this.addError(`uncaughtException ${err}`);
            this._liveFlag = false;
        });

        this._logger.log('info', `Probe configuration init`);
    }

    set readyFlag(flag) {
        this._logger.log('info', `readyFlag change to ${flag}`);
        this._readyFlag = flag;
    }

    set liveFlag(flag) {
        this._logger.log('info', `liveFlag change to ${flag}`);
        this._liveFlag = flag;
    }

    addError(err) {
        this._errors.push(err);
    }

    start(app, port) {
        return new Promise((resolve, reject) => {
            this.server = createTerminus(http.createServer(app), this._options);
            this.server.listen(port, () => {
                this._logger.log('info', `Probe server is listening on port ${port}`);
                return resolve();
            }).on('error', (err) => {
                this.readyFlag = false;
                this.liveFlag = false;
                this.addError(err);
                this._logger.log('error', `Error start mc-prob server : ${err}`)
                return reject();
            });
        })
    }

    stop() {
        if (this.server && this.server.address()) {
            this._logger.log('debug', `server is running`);
            this.server.close();
        } else {
            this._logger.log('error', `server is not running`);
        }
    }
}
