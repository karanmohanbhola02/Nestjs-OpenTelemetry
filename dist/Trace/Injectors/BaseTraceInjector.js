"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTraceInjector = void 0;
const api_1 = require("@opentelemetry/api");
const Constants_1 = require("../../Constants");
const core_1 = require("@nestjs/core");
const constants_1 = require("@nestjs/common/constants");
class BaseTraceInjector {
    constructor(modulesContainer) {
        this.modulesContainer = modulesContainer;
        this.metadataScanner = new core_1.MetadataScanner();
    }
    *getControllers() {
        var _a;
        for (const module of this.modulesContainer.values()) {
            for (const controller of module.controllers.values()) {
                if (controller && ((_a = controller.metatype) === null || _a === void 0 ? void 0 : _a.prototype)) {
                    yield controller;
                }
            }
        }
    }
    *getProviders() {
        var _a;
        for (const module of this.modulesContainer.values()) {
            for (const provider of module.providers.values()) {
                if (provider && ((_a = provider.metatype) === null || _a === void 0 ? void 0 : _a.prototype)) {
                    yield provider;
                }
            }
        }
    }
    isPath(prototype) {
        return Reflect.hasMetadata(constants_1.PATH_METADATA, prototype);
    }
    isAffected(prototype) {
        return Reflect.hasMetadata(Constants_1.Constants.TRACE_METADATA_ACTIVE, prototype);
    }
    getTraceName(prototype) {
        return Reflect.getMetadata(Constants_1.Constants.TRACE_METADATA, prototype);
    }
    isDecorated(prototype) {
        return Reflect.hasMetadata(Constants_1.Constants.TRACE_METADATA, prototype);
    }
    reDecorate(source, destination) {
        const keys = Reflect.getMetadataKeys(source);
        for (const key of keys) {
            const meta = Reflect.getMetadata(key, source);
            Reflect.defineMetadata(key, meta, destination);
        }
    }
    wrap(prototype, traceName, attributes = {}) {
        const method = {
            [prototype.name]: function (...args) {
                var _a;
                const tracer = api_1.trace.getTracer('default');
                const currentSpan = (_a = api_1.trace.getSpan(api_1.context.active())) !== null && _a !== void 0 ? _a : tracer.startSpan('default');
                return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), currentSpan), () => {
                    const span = tracer.startSpan(traceName);
                    span.setAttributes(attributes);
                    if (prototype.constructor.name === 'AsyncFunction') {
                        return prototype
                            .apply(this, args)
                            .catch((error) => BaseTraceInjector.recordException(error, span))
                            .finally(() => {
                            span.end();
                        });
                    }
                    else {
                        try {
                            const result = prototype.apply(this, args);
                            span.end();
                            return result;
                        }
                        catch (error) {
                            BaseTraceInjector.recordException(error, span);
                        }
                        finally {
                            span.end();
                        }
                    }
                });
            },
        }[prototype.name];
        Reflect.defineMetadata(Constants_1.Constants.TRACE_METADATA, traceName, method);
        this.affect(method);
        this.reDecorate(prototype, method);
        return method;
    }
    static recordException(error, span) {
        span.recordException(error);
        span.setStatus({ code: api_1.SpanStatusCode.ERROR, message: error.message });
        throw error;
    }
    affect(prototype) {
        Reflect.defineMetadata(Constants_1.Constants.TRACE_METADATA_ACTIVE, 1, prototype);
    }
}
exports.BaseTraceInjector = BaseTraceInjector;
//# sourceMappingURL=BaseTraceInjector.js.map