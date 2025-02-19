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
exports.ResourceMetric = void 0;
const MetricService_1 = require("../MetricService");
const host_metrics_1 = require("@opentelemetry/host-metrics");
const common_1 = require("@nestjs/common");
let ResourceMetric = class ResourceMetric {
    constructor(metricService) {
        this.metricService = metricService;
        this.description = 'ResourceMetric';
        this.name = 'ResourceMetric';
        this.hostMetrics = new host_metrics_1.HostMetrics({
            meterProvider: this.metricService.getProvider(),
            name: this.name,
        });
    }
    async inject() {
        this.hostMetrics.start();
    }
};
ResourceMetric = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [MetricService_1.MetricService])
], ResourceMetric);
exports.ResourceMetric = ResourceMetric;
//# sourceMappingURL=ResourceMetric.js.map