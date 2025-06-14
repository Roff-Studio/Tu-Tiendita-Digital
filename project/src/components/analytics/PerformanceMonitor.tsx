import React, { useEffect, useState } from 'react';
import { Activity, Zap, Clock, Eye } from 'lucide-react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      // Web Vitals measurement
      if ('PerformanceObserver' in window) {
        // Measure FCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev!, fcp: entry.startTime }));
            }
          });
        }).observe({ entryTypes: ['paint'] });

        // Measure LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev!, lcp: lastEntry.startTime }));
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Measure CLS
        new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          setMetrics(prev => ({ ...prev!, cls: clsValue }));
        }).observe({ entryTypes: ['layout-shift'] });

        // Measure FID
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            setMetrics(prev => ({ ...prev!, fid: entry.processingStart - entry.startTime }));
          });
        }).observe({ entryTypes: ['first-input'] });
      }

      // Measure TTFB
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        setMetrics(prev => ({ ...prev!, ttfb }));
      }
    };

    measurePerformance();

    // Initialize with default values
    setMetrics({
      fcp: 0,
      lcp: 0,
      cls: 0,
      fid: 0,
      ttfb: 0
    });
  }, []);

  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  const getScoreColor = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatValue = (metric: string, value: number) => {
    if (metric === 'cls') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 text-white p-2 rounded-lg hover:bg-black transition-colors"
        title="Performance Metrics"
      >
        <Activity className="h-4 w-4" />
      </button>

      {isVisible && (
        <div className="absolute top-12 left-0 bg-white rounded-lg shadow-xl border p-4 min-w-64">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Performance Metrics
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                FCP
              </span>
              <span className={getScoreColor('fcp', metrics.fcp)}>
                {formatValue('fcp', metrics.fcp)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                LCP
              </span>
              <span className={getScoreColor('lcp', metrics.lcp)}>
                {formatValue('lcp', metrics.lcp)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>CLS</span>
              <span className={getScoreColor('cls', metrics.cls)}>
                {formatValue('cls', metrics.cls)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>FID</span>
              <span className={getScoreColor('fid', metrics.fid)}>
                {formatValue('fid', metrics.fid)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>TTFB</span>
              <span className={getScoreColor('ttfb', metrics.ttfb)}>
                {formatValue('ttfb', metrics.ttfb)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Good
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                Needs Improvement
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                Poor
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;