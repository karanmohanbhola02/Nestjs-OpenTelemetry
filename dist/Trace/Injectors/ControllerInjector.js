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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerInjector = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const BaseTraceInjector_1 = require("./BaseTraceInjector");
let ControllerInjector = class ControllerInjector extends BaseTraceInjector_1.BaseTraceInjector {
    constructor(modulesContainer) {
        super(modulesContainer);
        this.modulesContainer = modulesContainer;
        this.loggerService = new common_1.Logger();
    }
    inject() {
        const controllers = this.getControllers();
        for (const controller of controllers) {
            const keys = this.metadataScanner.getAllFilteredMethodNames(controller.metatype.prototype);
            for (const key of keys) {
                if (!this.isDecorated(controller.metatype.prototype[key]) &&
                    !this.isAffected(controller.metatype.prototype[key]) &&
                    this.isPath(controller.metatype.prototype[key])) {
                    const traceName = `Controller->${controller.name}.${controller.metatype.prototype[key].name}`;
                    const method = this.wrap(controller.metatype.prototype[key], traceName, {
                        controller: controller.name,
                        method: controller.metatype.prototype[key].name,
                    });
                    this.reDecorate(controller.metatype.prototype[key], method);
                    controller.metatype.prototype[key] = method;
                    this.loggerService.log(`Mapped ${controller.name}.${key}`, this.constructor.name);
                }
            }
        }
    }
};
ControllerInjector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModulesContainer])
], ControllerInjector);
exports.ControllerInjector = ControllerInjector;
//# sourceMappingURL=ControllerInjector.js.map