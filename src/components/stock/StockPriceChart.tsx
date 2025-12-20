import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { useStockEvents, StockEvent, ChartDataPoint } from '@/hooks/useStockEvents';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Briefcase, BarChart3, FileText } from 'lucide-react';

interface StockPriceChartProps {
  ticker: string;
}

type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'YTD';

const timeRanges: TimeRange[] = ['1W', '1M', '3M', '1Y', 'YTD'];

const eventTypeConfig: Record<StockEvent['type'], { color: string; icon: React.ReactNode; label: string }> = {
  earnings: { color: 'hsl(217, 91%, 60%)', icon: <BarChart3 className="w-3 h-3" />, label: 'Earnings' },
  dividend: { color: 'hsl(142, 69%, 58%)', icon: <DollarSign className="w-3 h-3" />, label: 'Dividend' },
  fed_meeting: { color: 'hsl(38, 92%, 50%)', icon: <Briefcase className="w-3 h-3" />, label: 'Fed Meeting' },
  cpi: { color: 'hsl(280, 65%, 60%)', icon: <FileText className="w-3 h-3" />, label: 'CPI Release' },
  jobs_report: { color: 'hsl(200, 80%, 50%)', icon: <FileText className="w-3 h-3" />, label: 'Jobs Report' },
  gdp: { color: 'hsl(340, 70%, 50%)', icon: <FileText className="w-3 h-3" />, label: 'GDP Report' },
};

function formatDate(dateStr: string, range: TimeRange): string {
  const date = new Date(dateStr);
  if (range === '1W' || range === '1M') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  events: StockEvent[];
}

function CustomTooltip({ active, payload, events }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const dataPoint = payload[0].payload;
  const dateStr = dataPoint.date.split('T')[0];
  const dayEvents = events.filter(e => e.date === dateStr);

  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">
        {new Date(dataPoint.date).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })}
      </p>
      <p className="text-sm font-semibold text-foreground">
        {formatPrice(dataPoint.price)}
      </p>
      {dayEvents.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border space-y-1">
          {dayEvents.map((event, i) => {
            const config = eventTypeConfig[event.type];
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span style={{ color: config.color }}>{config.icon}</span>
                <span className="text-foreground">{event.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StockPriceChart({ ticker }: StockPriceChartProps) {
  const { data, isLoading, error, range, setRange } = useStockEvents(ticker);
  const [selectedEvent, setSelectedEvent] = useState<StockEvent | null>(null);

  // Find chart data points that have events on the same day
  const eventMarkers = useMemo(() => {
    if (!data) return [];
    
    const markers: Array<{ dataPoint: ChartDataPoint; event: StockEvent }> = [];
    
    for (const event of data.events) {
      // Find the closest chart data point to this event date
      const eventDate = new Date(event.date).getTime();
      let closestPoint: ChartDataPoint | null = null;
      let minDiff = Infinity;
      
      for (const point of data.chartData) {
        const pointDate = new Date(point.date).setHours(0, 0, 0, 0);
        const diff = Math.abs(eventDate - pointDate);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = point;
        }
      }
      
      // Only show if within 1 day
      if (closestPoint && minDiff < 2 * 24 * 60 * 60 * 1000) {
        markers.push({ dataPoint: closestPoint, event });
      }
    }
    
    return markers;
  }, [data]);

  // Upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return data.events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= now && eventDate <= thirtyDaysFromNow;
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="card-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            {timeRanges.map((r) => (
              <div key={r} className="h-6 w-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="h-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-surface p-4">
        <p className="text-sm text-muted-foreground text-center">
          Unable to load chart data
        </p>
      </div>
    );
  }

  const isPositive = data.periodChangePercent >= 0;
  const chartColor = isPositive ? 'hsl(142, 69%, 58%)' : 'hsl(0, 84%, 60%)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface p-4 space-y-4"
    >
      {/* Header with price change */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            {formatPrice(data.currentPrice)}
          </span>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{data.periodChangePercent.toFixed(2)}%</span>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex gap-1">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                range === r
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(val) => formatDate(val, range)}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              minTickGap={50}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `$${val.toFixed(0)}`}
              width={45}
            />
            <Tooltip content={<CustomTooltip events={data.events} />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: chartColor }}
            />
            {/* Event markers */}
            {eventMarkers.map((marker, i) => {
              const config = eventTypeConfig[marker.event.type];
              return (
                <ReferenceDot
                  key={i}
                  x={marker.dataPoint.date}
                  y={marker.dataPoint.price}
                  r={4}
                  fill={config.color}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  onClick={() => setSelectedEvent(marker.event)}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Event legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(eventTypeConfig).map(([type, config]) => {
          const hasEvents = data.events.some(e => e.type === type);
          if (!hasEvents) return null;
          return (
            <div key={type} className="flex items-center gap-1.5 text-muted-foreground">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
            </div>
          );
        })}
      </div>

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Upcoming Events</span>
          </div>
          <div className="space-y-1.5">
            {upcomingEvents.slice(0, 3).map((event, i) => {
              const config = eventTypeConfig[event.type];
              const eventDate = new Date(event.date);
              const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span className="text-foreground">{event.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected event popup */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-popover border border-border rounded-lg"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span style={{ color: eventTypeConfig[selectedEvent.type].color }}>
                {eventTypeConfig[selectedEvent.type].icon}
              </span>
              <span className="text-sm font-medium text-foreground">{selectedEvent.name}</span>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          {selectedEvent.description && (
            <p className="text-xs text-foreground/80 mt-1">{selectedEvent.description}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
