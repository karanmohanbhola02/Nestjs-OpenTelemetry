"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenTelemetryModule = void 0;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const TraceService_1 = require("./Trace/TraceService");
const Constants_1 = require("./Constants");
const MetricService_1 = require("./Metric/MetricService");
const OpenTelemetryModuleConfig_1 = require("./OpenTelemetryModuleConfig");
const OpenTelemetryService_1 = require("./OpenTelemetryService");
const DecoratorInjector_1 = require("./Trace/Injectors/DecoratorInjector");
const core_1 = require("@nestjs/core");
const MetricHttpMiddleware_1 = require("./Metric/Interceptors/Http/MetricHttpMiddleware");
const MetricInterceptor_1 = require("./Metric/Interceptors/MetricInterceptor");
const event_emitter_1 = require("@nestjs/event-emitter");
const MetricHttpEventProducer_1 = require("./Metric/Interceptors/Http/MetricHttpEventProducer");
const MetricGrpcEventProducer_1 = require("./Metric/Interceptors/Grpc/MetricGrpcEventProducer");
const MetricRabbitMQEventProducer_1 = require("./Metric/Interceptors/RabbitMQ/MetricRabbitMQEventProducer");
const DecoratorObserverMetricInjector_1 = require("./Metric/Injectors/DecoratorObserverMetricInjector");
const DecoratorCounterMetricInjector_1 = require("./Metric/Injectors/DecoratorCounterMetricInjector");
const sdk_metrics_base_1 = require("@opentelemetry/sdk-metrics-base");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
class OpenTelemetryModule {
    configure(consumer) {
        consumer.apply(MetricHttpMiddleware_1.MetricHttpMiddleware).forRoutes('*');
    }
    static async forRoot(configuration = {}) {
        var _a, _b;
        configuration = Object.assign(Object.assign({}, OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig), configuration);
        const injectors = (_a = configuration === null || configuration === void 0 ? void 0 : configuration.traceAutoInjectors) !== null && _a !== void 0 ? _a : [];
        const metrics = (_b = configuration === null || configuration === void 0 ? void 0 : configuration.metricAutoObservers) !== null && _b !== void 0 ? _b : [];
        return {
            global: true,
            module: OpenTelemetryModule,
            imports: [event_emitter_1.EventEmitterModule.forRoot()],
            providers: [
                ...injectors,
                ...metrics,
                TraceService_1.TraceService,
                MetricService_1.MetricService,
                OpenTelemetryService_1.OpenTelemetryService,
                MetricHttpMiddleware_1.MetricHttpMiddleware,
                MetricHttpEventProducer_1.MetricHttpEventProducer,
                MetricGrpcEventProducer_1.MetricGrpcEventProducer,
                MetricRabbitMQEventProducer_1.MetricRabbitMQEventProducer,
                DecoratorInjector_1.DecoratorInjector,
                DecoratorObserverMetricInjector_1.DecoratorObserverMetricInjector,
                DecoratorCounterMetricInjector_1.DecoratorCounterMetricInjector,
                this.buildProvider(configuration),
                this.buildInjectors(configuration),
                this.buildMeter(),
                this.buildTracer(),
                {
                    provide: Constants_1.Constants.SDK_CONFIG,
                    useValue: configuration,
                },
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: MetricInterceptor_1.MetricInterceptor,
                },
            ],
            exports: [TraceService_1.TraceService, MetricService_1.MetricService, sdk_metrics_base_1.Meter, sdk_trace_base_1.Tracer],
        };
    }
    static buildProvider(configuration) {
        return {
            provide: Constants_1.Constants.SDK,
            useFactory: async () => {
                const sdk = new sdk_node_1.NodeSDK(configuration);
                await sdk.start();
                return sdk;
            },
        };
    }
    static buildInjectors(configuration) {
        var _a, _b;
        const injectors = (_a = configuration === null || configuration === void 0 ? void 0 : configuration.traceAutoInjectors) !== null && _a !== void 0 ? _a : [];
        const metrics = (_b = configuration === null || configuration === void 0 ? void 0 : configuration.metricAutoObservers) !== null && _b !== void 0 ? _b : [];
        return {
            provide: Constants_1.Constants.SDK_INJECTORS,
            useFactory: async (...injectors) => {
                var e_1, _a;
                try {
                    for (var injectors_1 = __asyncValues(injectors), injectors_1_1; injectors_1_1 = await injectors_1.next(), !injectors_1_1.done;) {
                        const injector = injectors_1_1.value;
                        if (injector['inject'])
                            await injector.inject();
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (injectors_1_1 && !injectors_1_1.done && (_a = injectors_1.return)) await _a.call(injectors_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            },
            inject: [
                DecoratorInjector_1.DecoratorInjector,
                DecoratorObserverMetricInjector_1.DecoratorObserverMetricInjector,
                DecoratorCounterMetricInjector_1.DecoratorCounterMetricInjector,
                ...injectors,
                ...metrics,
            ],
        };
    }
    static async forRootAsync(configuration = {}) {
        return {
            global: true,
            module: OpenTelemetryModule,
            imports: [...configuration === null || configuration === void 0 ? void 0 : configuration.imports, event_emitter_1.EventEmitterModule.forRoot()],
            providers: [
                TraceService_1.TraceService,
                MetricService_1.MetricService,
                OpenTelemetryService_1.OpenTelemetryService,
                MetricHttpMiddleware_1.MetricHttpMiddleware,
                MetricHttpEventProducer_1.MetricHttpEventProducer,
                MetricGrpcEventProducer_1.MetricGrpcEventProducer,
                MetricRabbitMQEventProducer_1.MetricRabbitMQEventProducer,
                this.buildAsyncProvider(),
                this.buildAsyncInjectors(),
                this.buildMeter(),
                this.buildTracer(),
                {
                    provide: Constants_1.Constants.SDK_CONFIG,
                    useFactory: configuration.useFactory,
                    inject: configuration.inject,
                },
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: MetricInterceptor_1.MetricInterceptor,
                },
            ],
            exports: [TraceService_1.TraceService, MetricService_1.MetricService, sdk_metrics_base_1.Meter, sdk_trace_base_1.Tracer],
        };
    }
    static buildAsyncProvider() {
        return {
            provide: Constants_1.Constants.SDK,
            useFactory: async (config) => {
                config = Object.assign(Object.assign({}, OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig), config);
                const sdk = new sdk_node_1.NodeSDK(config);
                await sdk.start();
                return sdk;
            },
            inject: [Constants_1.Constants.SDK_CONFIG],
        };
    }
    static buildAsyncInjectors() {
        return {
            provide: Constants_1.Constants.SDK_INJECTORS,
            useFactory: async (config, moduleRef) => {
                var e_2, _a, e_3, _b;
                var _c, _d;
                config = Object.assign(Object.assign({}, OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig), config);
                const injectors = (_c = config.traceAutoInjectors) !== null && _c !== void 0 ? _c : OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig.traceAutoInjectors;
                const metrics = (_d = config.metricAutoObservers) !== null && _d !== void 0 ? _d : OpenTelemetryModuleConfig_1.OpenTelemetryModuleDefaultConfig.metricAutoObservers;
                const decoratorInjector = await moduleRef.create(DecoratorInjector_1.DecoratorInjector);
                await decoratorInjector.inject();
                const decoratorObserverMetricInjector = await moduleRef.create(DecoratorObserverMetricInjector_1.DecoratorObserverMetricInjector);
                await decoratorObserverMetricInjector.inject();
                const decoratorCounterMetricInjector = await moduleRef.create(DecoratorCounterMetricInjector_1.DecoratorCounterMetricInjector);
                await decoratorCounterMetricInjector.inject();
                try {
                    for (var injectors_2 = __asyncValues(injectors), injectors_2_1; injectors_2_1 = await injectors_2.next(), !injectors_2_1.done;) {
                        const injector = injectors_2_1.value;
                        const created = await moduleRef.create(injector);
                        if (created['inject'])
                            await created.inject();
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (injectors_2_1 && !injectors_2_1.done && (_a = injectors_2.return)) await _a.call(injectors_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                try {
                    for (var metrics_1 = __asyncValues(metrics), metrics_1_1; metrics_1_1 = await metrics_1.next(), !metrics_1_1.done;) {
                        const metric = metrics_1_1.value;
                        const createdMetric = await moduleRef.create(metric);
                        if (createdMetric['inject'])
                            await createdMetric.inject();
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (metrics_1_1 && !metrics_1_1.done && (_b = metrics_1.return)) await _b.call(metrics_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                return {};
            },
            inject: [Constants_1.Constants.SDK_CONFIG, core_1.ModuleRef],
        };
    }
    static buildMeter() {
        return {
            provide: sdk_metrics_base_1.Meter,
            useFactory: (metricService) => metricService.getMeter(),
            inject: [MetricService_1.MetricService],
        };
    }
    static buildTracer() {
        return {
            provide: sdk_trace_base_1.Tracer,
            useFactory: (traceService) => traceService.getTracer(),
            inject: [TraceService_1.TraceService],
        };
    }
}
exports.OpenTelemetryModule = OpenTelemetryModule;
//# sourceMappingURL=OpenTelemetryModule.js.map