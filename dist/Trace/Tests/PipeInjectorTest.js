"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const OpenTelemetryModule_1 = require("../../OpenTelemetryModule");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const common_1 = require("@nestjs/common");
const PipeInjector_1 = require("../Injectors/PipeInjector");
const constants_1 = require("@nestjs/common/constants");
const core_1 = require("@nestjs/core");
describe('Tracing Pipe Injector Test', () => {
    const exporter = new sdk_trace_base_1.NoopSpanProcessor();
    const exporterSpy = jest.spyOn(exporter, 'onStart');
    const sdkModule = OpenTelemetryModule_1.OpenTelemetryModule.forRoot({
        spanProcessor: exporter,
        traceAutoInjectors: [PipeInjector_1.PipeInjector],
    });
    beforeEach(() => {
        exporterSpy.mockClear();
        exporterSpy.mockReset();
    });
    it(`should trace global pipe`, async function () {
        var e_1, _a;
        class HelloPipe {
            async transform(value) { }
        }
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            providers: [{ provide: core_1.APP_PIPE, useClass: HelloPipe }],
        }).compile();
        const app = context.createNestApplication();
        await app.init();
        const injector = app.get(PipeInjector_1.PipeInjector);
        const providers = injector.getProviders();
        try {
            for (var providers_1 = __asyncValues(providers), providers_1_1; providers_1_1 = await providers_1.next(), !providers_1_1.done;) {
                const provider = providers_1_1.value;
                if (typeof provider.token === 'string' &&
                    provider.token.includes(core_1.APP_PIPE)) {
                    await provider.metatype.prototype.transform(1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (providers_1_1 && !providers_1_1.done && (_a = providers_1.return)) await _a.call(providers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pipe->Global->HelloPipe' }), expect.any(Object));
        await app.close();
    });
    it(`should trace controller pipe`, async function () {
        class HelloPipe {
            async transform(value, metadata) { }
        }
        let HelloController = class HelloController {
            async hi() { }
        };
        __decorate([
            (0, common_1.Get)(),
            (0, common_1.UsePipes)(HelloPipe),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", Promise)
        ], HelloController.prototype, "hi", null);
        HelloController = __decorate([
            (0, common_1.Controller)('hello')
        ], HelloController);
        const context = await testing_1.Test.createTestingModule({
            imports: [sdkModule],
            controllers: [HelloController],
        }).compile();
        const app = context.createNestApplication();
        const helloController = app.get(HelloController);
        await app.init();
        const pipes = Reflect.getMetadata(constants_1.PIPES_METADATA, helloController.hi);
        await pipes[0].transform(1);
        expect(exporterSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pipe->HelloController.hi.HelloPipe' }), expect.any(Object));
        await app.close();
    });
});
//# sourceMappingURL=PipeInjectorTest.js.map