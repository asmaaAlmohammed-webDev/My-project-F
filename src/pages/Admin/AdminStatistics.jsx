import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AdminStatistics.css';

// ADDED: Admin statistics page with interactive graphs and toggleable metrics
const AdminStatistics = () => {
  const { t } = useTranslation();
  const [activeMetric, setActiveMetric] = useState('users');
  const [timeRange, setTimeRange] = useState('7days');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Available metrics for the top bar
  const metrics = [
    { key: 'users', label: t('users'), icon: '👥' },
    { key: 'orders', label: t('orders'), icon: '🛒' },
    { key: 'products', label: t('products'), icon: '📚' },
    { key: 'reviews', label: t('reviews'), icon: '⭐' },
    { key: 'revenue', label: t('revenue'), icon: '💰' },
    { key: 'categories', label: t('categories'), icon: '🏷️' }
  ];

  // Time range options
  const timeRanges = [
    { key: '7days', label: t('last7Days') },
    { key: '30days', label: t('last30Days') },
    { key: '3months', label: t('last3Months') },
    { key: '1year', label: t('lastYear') }
  ];

  // Mock data generator (replace with API call)
  const generateMockData = (metric, range) => {
    const dataPoints = range === '7days' ? 7 : range === '30days' ? 30 : range === '3months' ? 90 : 365;
    const data = [];
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let value;
      switch (metric) {
        case 'users':
          value = Math.floor(Math.random() * 50) + 10;
          break;
        case 'orders':
          value = Math.floor(Math.random() * 30) + 5;
          break;
        case 'products':
          value = Math.floor(Math.random() * 10) + 1;
          break;
        case 'reviews':
          value = Math.floor(Math.random() * 20) + 2;
          break;
        case 'revenue':
          value = Math.floor(Math.random() * 1000) + 200;
          break;
        case 'categories':
          value = Math.floor(Math.random() * 3) + 1;
          break;
        default:
          value = 0;
      }
      
      data.push({
        date: date.toLocaleDateString(),
        value: value
      });
    }
    
    return data;
  };

  // Fetch data when metric or time range changes
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const data = generateMockData(activeMetric, timeRange);
      setChartData(data);
      setLoading(false);
    }, 500);
  }, [activeMetric, timeRange]);

  const handleMetricChange = (metric) => {
    setActiveMetric(metric);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Calculate summary stats
  const getSummaryStats = () => {
    if (!chartData || chartData.length === 0) return { total: 0, average: 0, trend: 0 };
    
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const average = Math.round(total / chartData.length);
    const trend = chartData.length > 1 ? 
      ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100).toFixed(1) : 0;
    
    return { total, average, trend };
  };

  const stats = getSummaryStats();

  return (
    <div className="admin-statistics">
      {/* Header */}
      <div className="statistics-header">
        <h1>{t('statistics')}</h1>
        <p>{t('viewDetailedAnalytics')}</p>
      </div>

      {/* Metrics Toggle Bar */}
      <div className="metrics-bar">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            className={`metric-btn ${activeMetric === metric.key ? 'active' : ''}`}
            onClick={() => handleMetricChange(metric.key)}
          >
            <span className="metric-icon">{metric.icon}</span>
            <span className="metric-label">{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="time-range-selector">
        <label>{t('timeRange')}:</label>
        <div className="time-range-buttons">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              className={`time-btn ${timeRange === range.key ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange(range.key)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">{t('totalStats')}</span>
          <span className="stat-value">{stats.total.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('averageStats')}</span>
          <span className="stat-value">{stats.average.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('trendStats')}</span>
          <span className={`stat-value ${stats.trend >= 0 ? 'positive' : 'negative'}`}>
            {stats.trend >= 0 ? '+' : ''}{stats.trend}%
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <div className="chart-header">
          <h2>{t('overTimeChart', { metric: metrics.find(m => m.key === activeMetric)?.label })}</h2>
        </div>
        
        <div className="chart-content">
          {loading ? (
            <div className="chart-loading">
              <div className="loading-spinner"></div>
              <p>{t('loadingChart')}</p>
            </div>
          ) : (
            <div className="simple-chart">
              {/* Enhanced SVG chart with proper axes */}
              <svg width="100%" height="380" viewBox="0 0 900 380">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                
                {chartData && (() => {
                  const margin = { top: 40, right: 40, bottom: 60, left: 70 };
                  const chartWidth = 900 - margin.left - margin.right;
                  const chartHeight = 380 - margin.top - margin.bottom;
                  const maxValue = Math.max(...chartData.map(d => d.value));
                  const minValue = Math.min(...chartData.map(d => d.value));
                  const valueRange = maxValue - minValue || 1;
                  
                  // Add padding to value range to prevent cutoff
                  const valuePadding = valueRange * 0.1;
                  const paddedMax = maxValue + valuePadding;
                  const paddedMin = Math.max(0, minValue - valuePadding);
                  const paddedRange = paddedMax - paddedMin;
                  
                  // Create Y-axis scale
                  const yTicks = 5;
                  const yTickValues = [];
                  for (let i = 0; i <= yTicks; i++) {
                    yTickValues.push(paddedMin + (paddedRange * i / yTicks));
                  }
                  
                  // Generate path for the line
                  const pathData = chartData.map((point, index) => {
                    const x = margin.left + (index / (chartData.length - 1)) * chartWidth;
                    const y = margin.top + chartHeight - ((point.value - paddedMin) / paddedRange) * chartHeight;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                  
                  // Generate area path
                  const areaData = `${pathData} L ${margin.left + chartWidth} ${margin.top + chartHeight} L ${margin.left} ${margin.top + chartHeight} Z`;
                  
                  return (
                    <g>
                      {/* Chart Background */}
                      <rect 
                        x={margin.left} 
                        y={margin.top} 
                        width={chartWidth} 
                        height={chartHeight} 
                        fill="#fafbfc" 
                        stroke="#e2e8f0"
                      />
                      
                      {/* Grid Lines - Horizontal */}
                      {yTickValues.map((value, index) => {
                        const y = margin.top + chartHeight - ((value - paddedMin) / paddedRange) * chartHeight;
                        return (
                          <line
                            key={`grid-h-${index}`}
                            x1={margin.left}
                            y1={y}
                            x2={margin.left + chartWidth}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                          />
                        );
                      })}
                      
                      {/* Grid Lines - Vertical */}
                      {chartData.map((_, index) => {
                        if (index % Math.ceil(chartData.length / 6) === 0) {
                          const x = margin.left + (index / (chartData.length - 1)) * chartWidth;
                          return (
                            <line
                              key={`grid-v-${index}`}
                              x1={x}
                              y1={margin.top}
                              x2={x}
                              y2={margin.top + chartHeight}
                              stroke="#e2e8f0"
                              strokeWidth="1"
                              strokeDasharray="2,2"
                            />
                          );
                        }
                        return null;
                      })}
                      
                      {/* Area under the curve */}
                      <path
                        d={areaData}
                        fill="url(#chartGradient)"
                        opacity="0.3"
                      />
                      
                      {/* Main line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Data points */}
                      {chartData.map((point, index) => {
                        const x = margin.left + (index / (chartData.length - 1)) * chartWidth;
                        const y = margin.top + chartHeight - ((point.value - paddedMin) / paddedRange) * chartHeight;
                        
                        return (
                          <g key={index}>
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#3b82f6"
                              stroke="white"
                              strokeWidth="2"
                              className="chart-point"
                            />
                            
                            {/* Value labels - positioned safely within bounds */}
                            <text
                              x={x}
                              y={Math.max(y - 15, margin.top + 15)}
                              textAnchor="middle"
                              fontSize="11"
                              fill="#64748b"
                              fontWeight="500"
                              opacity="0.8"
                            >
                              {point.value}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Y-Axis */}
                      <line
                        x1={margin.left}
                        y1={margin.top}
                        x2={margin.left}
                        y2={margin.top + chartHeight}
                        stroke="#64748b"
                        strokeWidth="2"
                      />
                      
                      {/* X-Axis */}
                      <line
                        x1={margin.left}
                        y1={margin.top + chartHeight}
                        x2={margin.left + chartWidth}
                        y2={margin.top + chartHeight}
                        stroke="#64748b"
                        strokeWidth="2"
                      />
                      
                      {/* Y-Axis Labels */}
                      {yTickValues.map((value, index) => {
                        const y = margin.top + chartHeight - ((value - paddedMin) / paddedRange) * chartHeight;
                        return (
                          <g key={`y-label-${index}`}>
                            <line
                              x1={margin.left - 5}
                              y1={y}
                              x2={margin.left}
                              y2={y}
                              stroke="#64748b"
                              strokeWidth="1"
                            />
                            <text
                              x={margin.left - 10}
                              y={y + 4}
                              textAnchor="end"
                              fontSize="12"
                              fill="#64748b"
                            >
                              {Math.round(value).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* X-Axis Labels */}
                      {chartData.map((point, index) => {
                        if (index % Math.ceil(chartData.length / 6) === 0) {
                          const x = margin.left + (index / (chartData.length - 1)) * chartWidth;
                          return (
                            <g key={`x-label-${index}`}>
                              <line
                                x1={x}
                                y1={margin.top + chartHeight}
                                x2={x}
                                y2={margin.top + chartHeight + 5}
                                stroke="#64748b"
                                strokeWidth="1"
                              />
                              <text
                                x={x}
                                y={margin.top + chartHeight + 18}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#64748b"
                              >
                                {point.date}
                              </text>
                            </g>
                          );
                        }
                        return null;
                      })}
                      
                      {/* Y-Axis Title */}
                      <text
                        x={15}
                        y={margin.top + chartHeight / 2}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#374151"
                        fontWeight="600"
                        transform={`rotate(-90 15 ${margin.top + chartHeight / 2})`}
                      >
                        {t('count')} ({metrics.find(m => m.key === activeMetric)?.label})
                      </text>
                      
                      {/* X-Axis Title */}
                      <text
                        x={margin.left + chartWidth / 2}
                        y={margin.top + chartHeight + 45}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#374151"
                        fontWeight="600"
                      >
                        {t('dateAxis')}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
