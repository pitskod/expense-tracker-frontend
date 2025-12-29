import React from 'react';

export interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  averageRenderTime: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private renderTimes: Map<string, number[]> = new Map();

  trackRender(componentName: string, renderTime: number): void {
    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      renderTime: 0,
      averageRenderTime: 0,
    };

    const times = this.renderTimes.get(componentName) || [];
    times.push(renderTime);
    this.renderTimes.set(componentName, times);

    const totalRenderTime = existing.renderTime + renderTime;
    const newRenderCount = existing.renderCount + 1;
    const averageRenderTime = totalRenderTime / newRenderCount;

    this.metrics.set(componentName, {
      renderCount: newRenderCount,
      renderTime: totalRenderTime,
      averageRenderTime,
    });
  }

  getMetrics(componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName);
  }

  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  reset(componentName?: string): void {
    if (componentName) {
      this.metrics.delete(componentName);
      this.renderTimes.delete(componentName);
    } else {
      this.metrics.clear();
      this.renderTimes.clear();
    }
  }

  logReport(): void {
    if (this.metrics.size === 0) {
      console.log('No performance metrics recorded');
      return;
    }

    console.group('📊 Performance Report');
    const sortedMetrics = Array.from(this.metrics.entries()).sort(
      (a, b) => b[1].averageRenderTime - a[1].averageRenderTime
    );

    sortedMetrics.forEach(([name, metrics]) => {
      console.log(
        `%c${name}%c: ${metrics.renderCount} renders, avg ${metrics.averageRenderTime.toFixed(2)}ms`,
        'font-weight: bold',
        'font-weight: normal'
      );
    });
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
): React.ComponentType<T> {
  const name = componentName || Component.displayName || Component.name || 'Unknown';

  return function PerformanceTrackedComponent(props: T) {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceMonitor.trackRender(name, renderTime);
    });

    return React.createElement(Component, props);
  };
}

export function useRenderTime(componentName: string): void {
  const startTime = React.useRef(performance.now());

  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    performanceMonitor.trackRender(componentName, renderTime);
    startTime.current = performance.now();
  });
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__performanceMonitor = performanceMonitor;
}

