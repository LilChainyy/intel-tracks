import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import { useStockChart, ChartRange, ChartDataPoint, StockEvent } from '@/hooks/useStockChart';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, TrendingUp, DollarSign, Landmark, BarChart3 } from 'lucide-react';

interface StockPriceChartProps {
  ticker: string;
}

const RANGES: ChartRange[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y'];

// Map event types to icons
const eventIcons: Record<string, typeof Calendar> = {
  earnings: BarChart3,
  dividend: DollarSign,
  'ex-dividend': DollarSign,
  fed_meeting: Landmark,
  cpi: TrendingUp,
  jobs_report: TrendingUp,
};

// Map event types to colors
const eventColors: Record<string, string> = {
  earnings: 'hsl(var(--accent))',
  dividend: 'hsl(var(--primary))',
  'ex-dividend': 'hsl(var(--primary))',
  fed_meeting: 'hsl(var(--warning, 45 93% 47%))',
  cpi: 'hsl(var(--warning, 45 93% 47%))',
  jobs_report: 'hsl(var(--warning, 45 93% 47%))',
};

export function StockPriceChart({ ticker }: StockPriceChartProps) {
  const { data, isLoading, error, range, changeRange } = useStockChart(ticker);
  const [selectedEvent, setSelectedEvent] = useState<StockEvent | null>(null);
  const [hoveredPrice, setHoveredPrice] = useState<{ price: number; date: string } | null>(null);

  // Format chart data for Recharts
  const chartData = useMemo(() => {
    if (!data?.chartData) return [];
    return data.chartData.map((point) => ({
      ...point,
      formattedDate: formatDate(point.date, range),
    }));
  }, [data?.chartData, range]);

  // Find events that fall within the chart date range
  const chartEvents = useMemo(() => {
    if (!data?.events || !chartData.length) return [];
    
    const chartStart = chartData[0]?.timestamp || 0;
    const chartEnd = chartData[chartData.length - 1]?.timestamp || 0;
    
    // For events to show on chart, we extend the range slightly into the future
    const futureBuffer = (chartEnd - chartStart) * 0.2; // 20% buffer for future events
    
    return data.events.filter((event) => {
      return event.timestamp >= chartStart && event.timestamp <= chartEnd + futureBuffer;
    });
  }, [data?.events, chartData]);

  // Calculate where events should appear on the chart (approximate position)
  const eventPositions = useMemo(() => {
    if (!chartData.length || !chartEvents.length) return [];
    
    const lastPrice = chartData[chartData.length - 1]?.price || 0;
    
    return chartEvents.map((event) => {
      // Find the closest chart point to this event
      const closestPoint = chartData.reduce((prev, curr) => {
        return Math.abs(curr.timestamp - event.timestamp) < Math.abs(prev.timestamp - event.timestamp)
          ? curr
          : prev;
      }, chartData[chartData.length - 1]);
      
      return {
        event,
        x: event.timestamp,
        y: closestPoint.price || lastPrice,
        formattedDate: formatDate(event.date, range),
      };
    });
  }, [chartData, chartEvents, range]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as ChartDataPoint & { formattedDate: string };
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground">{formatFullDate(point.date)}</p>
          <p className="text-sm font-semibold text-foreground">
            ${point.price.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle event click
  const handleEventClick = useCallback((event: StockEvent) => {
    setSelectedEvent(event);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Skeleton key={r} className="h-8 w-12" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Unable to load chart data</p>
      </div>
    );
  }

  const lineColor = data.isPositive 
    ? 'hsl(var(--success))' 
    : 'hsl(var(--destructive))';
  const gradientId = `gradient-${ticker}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Price Header */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            ${hoveredPrice?.price?.toFixed(2) || data.currentPrice.toFixed(2)}
          </span>
          <span
            className={`text-sm font-medium ${
              data.isPositive ? 'text-success' : 'text-destructive'
            }`}
          >
            {data.isPositive ? '+' : ''}
            {data.priceChangePercent.toFixed(2)}%
          </span>
        </div>
        {hoveredPrice && (
          <p className="text-xs text-muted-foreground">{hoveredPrice.date}</p>
        )}
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseMove={(e) => {
              if (e.activePayload && e.activePayload[0]) {
                const point = e.activePayload[0].payload;
                setHoveredPrice({
                  price: point.price,
                  date: formatFullDate(point.date),
                });
              }
            }}
            onMouseLeave={() => setHoveredPrice(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              hide
              domain={['dataMin', 'dataMax']}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              animationDuration={500}
            />
            {/* Event markers */}
            {eventPositions.map((pos, index) => (
              <ReferenceDot
                key={`${pos.event.type}-${pos.event.date}-${index}`}
                x={pos.x}
                y={pos.y}
                r={4}
                fill={eventColors[pos.event.type] || 'hsl(var(--muted-foreground))'}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                onClick={() => handleEventClick(pos.event)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Event Legend (if events exist) */}
      {chartEvents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chartEvents.slice(0, 3).map((event, index) => {
            const Icon = eventIcons[event.type] || Calendar;
            return (
              <button
                key={`${event.type}-${event.date}-${index}`}
                onClick={() => handleEventClick(event)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 hover:bg-secondary text-xs transition-colors"
              >
                <Icon className="w-3 h-3" style={{ color: eventColors[event.type] }} />
                <span className="text-muted-foreground">{formatShortDate(event.date)}</span>
              </button>
            );
          })}
          {chartEvents.length > 3 && (
            <span className="text-xs text-muted-foreground self-center">
              +{chartEvents.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Range Selector */}
      <div className="flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => changeRange(r)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              range === r
                ? 'bg-foreground text-background'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  {(() => {
                    const Icon = eventIcons[selectedEvent.type] || Calendar;
                    return (
                      <Icon
                        className="w-5 h-5"
                        style={{ color: eventColors[selectedEvent.type] }}
                      />
                    );
                  })()}
                  {selectedEvent.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatFullDate(selectedEvent.date)}</span>
              </div>
              <div className="text-sm">
                <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-xs capitalize">
                  {selectedEvent.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Helper functions
function formatDate(dateStr: string, range: ChartRange): string {
  const date = new Date(dateStr);
  if (range === '1D') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
