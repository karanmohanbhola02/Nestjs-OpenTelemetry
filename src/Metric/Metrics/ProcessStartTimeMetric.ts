import { BaseMetric } from './BaseMetric';
import { MetricService } from '../MetricService';
import { Injectable } from '@nestjs/common';
import {
  AggregationTemporality,
  ValueObserver,
} from '@opentelemetry/api-metrics';

@Injectable()
export class ProcessStartTimeMetric implements BaseMetric {
  name = 'process_start_time_seconds';
  description = 'Start time of the process since unix epoch in seconds.';

  private valueObserver: ValueObserver;
  private readonly uptimeInSecond = Math.round(
    Date.now() / 1000 - process.uptime(),
  );

  constructor(private readonly metricService: MetricService) {}

  async inject(): Promise<void> {
    this.valueObserver = this.metricService
      .getProvider()
      .getMeter('default')
      .createValueObserver(
        this.name,
        {
          description: this.description,
          aggregationTemporality:
            AggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
        },
        (observerResult) => this.observerCallback(observerResult),
      );
  }

  private observerCallback(observerResult) {
    observerResult.observe(this.uptimeInSecond, this.metricService.getLabels());
  }
}
