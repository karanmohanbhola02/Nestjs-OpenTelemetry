import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
import { Injectable } from '@nestjs/common';
import { ValueObserver } from '@opentelemetry/api-metrics';

@Injectable()
export class ActiveHandlesMetric implements BaseMetric {
  name = 'nodejs_active_handles';
  description =
    'Number of active libuv handles grouped by handle type. Every handle type is C++ class name.';

  private valueObserver: ValueObserver;

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    if (typeof process['_getActiveHandles'] !== 'function') {
      return;
    }

    this.valueObserver = this.metricService
      .getProvider()
      .getMeter('default')
      .createValueObserver(
        this.name,
        {
          description: this.description,
        },
        (observerResult) => this.observerCallback(observerResult),
      );
  }

  private observerCallback(observerResult) {
    this.valueObserver.clear();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const handles = process._getActiveHandles();
    const data = this.aggregateByObjectName(handles);
    for (const key in data) {
      observerResult.observe(
        data[key],
        Object.assign({ type: key }, this.metricService.getLabels() || {}),
      );
    }
  }

  private aggregateByObjectName(list) {
    const data = {};

    for (let i = 0; i < list.length; i++) {
      const listElement = list[i];

      if (!listElement || typeof listElement.constructor === 'undefined') {
        continue;
      }

      if (Object.hasOwnProperty.call(data, listElement.constructor.name)) {
        data[listElement.constructor.name] += 1;
      } else {
        data[listElement.constructor.name] = 1;
      }
    }
    return data;
  }
}
