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
exports.MetricRabbitMQEventProducer = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const ProducerEvent_1 = require("../ProducerEvent");
const constants_1 = require("@nestjs/microservices/constants");
let MetricRabbitMQEventProducer = class MetricRabbitMQEventProducer {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }
    onFinish(context, startAt, exception) {
        const labels = this.getLabels(context);
        this.publish(startAt, exception, labels);
    }
    publish(startAt, exception, labels) {
        const diff = process.hrtime(startAt);
        const time = diff[0] * 1e3 + diff[1] * 1e-6;
        this.eventEmitter.emit(ProducerEvent_1.ProducerEvent.RMQ, {
            time,
            labels: Object.assign({ exception }, labels),
        });
    }
    getLabels(context) {
        const pattern = Reflect.getMetadata(constants_1.PATTERN_METADATA, context.getHandler()) || '';
        const tags = context.getArgByIndex(1).args[0].fields;
        return {
            pattern,
            redelivered: tags.redelivered,
            exchange: tags.exchange,
            routingKey: tags.routingKey,
        };
    }
};
MetricRabbitMQEventProducer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], MetricRabbitMQEventProducer);
exports.MetricRabbitMQEventProducer = MetricRabbitMQEventProducer;
//# sourceMappingURL=MetricRabbitMQEventProducer.js.map