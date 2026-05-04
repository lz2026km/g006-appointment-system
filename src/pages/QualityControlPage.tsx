// G006 全院医技检查预约系统 - 质控统计页面
import {
  ShieldCheck, AlertTriangle, Clock, FileCheck, CheckCircle,
  XCircle, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown,
  Calendar, Users, BarChart3, Timer, Bell
} from 'lucide-react';
import { APPOINTMENTS, STATISTICS } from '../data/initialData';

interface QualityControlPageProps {
  currentRole: string;
}

const QualityControlPage = ({ currentRole: _currentRole }: QualityControlPageProps) => {
  const today = '2026-05-02';

  // 模拟质控数据
  const qualityMetrics = {
    appointmentSuccessRate: 94.5,    // 预约成功率
    noShowRate: 4.2,                // 爽约率
    avgWaitTime: 18,                 // 平均等候时长(分钟)
    reportTimelinessRate: 87.3,     // 报告及时率
    // 同比环比
    appointmentSuccessRateYoY: 2.3,   // 预约成功率同比
    appointmentSuccessRateMoM: 1.5,    // 预约成功率环比
    noShowRateYoY: -0.8,               // 爽约率同比(下降)
    noShowRateMoM: -0.3,                // 爽约率环比(下降)
    avgWaitTimeYoY: -3.2,              // 等候时长同比(下降)
    avgWaitTimeMoM: -1.1,              // 等候时长环比(下降)
    reportTimelinessRateYoY: 4.5,      // 报告及时率同比
    reportTimelinessRateMoM: 2.1,      // 报告及时率环比
  };

  // 近30天质控趋势数据
  const qualityTrend = [
    { date: '04-03', successRate: 91.2, noShowRate: 5.8, avgWait: 22, reportRate: 82.5 },
    { date: '04-05', successRate: 92.5, noShowRate: 5.2, avgWait: 21, reportRate: 83.8 },
    { date: '04-07', successRate: 93.1, noShowRate: 4.9, avgWait: 20, reportRate: 84.2 },
    { date: '04-09', successRate: 92.8, noShowRate: 5.1, avgWait: 21, reportRate: 83.5 },
    { date: '04-11', successRate: 94.2, noShowRate: 4.5, avgWait: 19, reportRate: 85.6 },
    { date: '04-13', successRate: 93.5, noShowRate: 4.7, avgWait: 20, reportRate: 84.8 },
    { date: '04-15', successRate: 94.8, noShowRate: 4.2, avgWait: 18, reportRate: 86.2 },
    { date: '04-17', successRate: 94.2, noShowRate: 4.4, avgWait: 19, reportRate: 85.9 },
    { date: '04-19', successRate: 93.8, noShowRate: 4.6, avgWait: 19, reportRate: 85.3 },
    { date: '04-21', successRate: 95.1, noShowRate: 3.9, avgWait: 17, reportRate: 87.1 },
    { date: '04-23', successRate: 94.6, noShowRate: 4.1, avgWait: 18, reportRate: 86.5 },
    { date: '04-25', successRate: 95.3, noShowRate: 3.8, avgWait: 16, reportRate: 87.8 },
    { date: '04-27', successRate: 94.9, noShowRate: 4.0, avgWait: 17, reportRate: 87.2 },
    { date: '04-29', successRate: 95.5, noShowRate: 3.6, avgWait: 16, reportRate: 88.1 },
    { date: '05-01', successRate: 93.2, noShowRate: 4.8, avgWait: 20, reportRate: 84.6 },
    { date: '05-02', successRate: 94.5, noShowRate: 4.2, avgWait: 18, reportRate: 87.3 },
  ];

  // 超时预警列表
  const timeoutWarnings = [
    { id: 'W001', patientName: '张三', examItem: '腹部CT平扫', device: 'CT-01', scheduledTime: '08:00', actualTime: '08:35', waitMinutes: 35, threshold: 30, status: '超时' },
    { id: 'W002', patientName: '李四', examItem: '头颅MRI平扫', device: 'MRI-01', scheduledTime: '09:00', actualTime: '09:28', waitMinutes: 28, threshold: 30, status: '预警' },
    { id: 'W003', patientName: '王五', examItem: '心脏彩超', device: '超声-01', scheduledTime: '10:00', actualTime: '10:42', waitMinutes: 42, threshold: 30, status: '超时' },
    { id: 'W004', patientName: '赵六', examItem: '电子胃镜检查', device: '内镜-01', scheduledTime: '11:00', actualTime: '11:18', waitMinutes: 18, threshold: 30, status: '正常' },
    { id: 'W005', patientName: '钱七', examItem: '胸部X线正侧位片', device: 'DR-01', scheduledTime: '14:00', actualTime: '14:32', waitMinutes: 32, threshold: 30, status: '超时' },
    { id: 'W006', patientName: '孙八', examItem: '常规心电图', device: '心电图-01', scheduledTime: '15:00', actualTime: '15:12', waitMinutes: 12, threshold: 20, status: '正常' },
  ];

  // 各检查类型质控指标
  const modalityQC = [
    { modality: 'CT', successRate: 93.2, noShowRate: 4.8, avgWait: 22, reportRate: 85.6, total: 58 },
    { modality: 'MRI', successRate: 95.8, noShowRate: 2.5, avgWait: 28, reportRate: 91.2, total: 25 },
    { modality: '超声', successRate: 96.2, noShowRate: 2.8, avgWait: 12, reportRate: 88.5, total: 68 },
    { modality: '内镜', successRate: 91.5, noShowRate: 6.2, avgWait: 25, reportRate: 82.3, total: 18 },
    { modality: '心电', successRate: 98.5, noShowRate: 1.2, avgWait: 8, reportRate: 95.8, total: 45 },
    { modality: 'X光', successRate: 97.8, noShowRate: 1.8, avgWait: 10, reportRate: 92.1, total: 32 },
  ];

  // KPI卡片组件
  const QCKPICard: React.FC<{
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    trend?: number;
    trendLabel?: string;
    status?: 'good' | 'warning' | 'danger';
  }> = ({ title, value, unit, icon, color, bgColor, trend, trendLabel, status }) => {
    const statusColor = status === 'good' ? '#059669' : status === 'warning' ? '#d97706' : status === 'danger' ? '#dc2626' : '#666';
    return (
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            flexShrink: 0,
          }}>
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{value}</span>
              {unit && <span style={{ fontSize: 14, color: '#666' }}>{unit}</span>}
            </div>
            {trend !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color: trend > 0 ? '#059669' : trend < 0 ? '#dc2626' : '#999',
                  fontSize: 12,
                }}>
                  {trend > 0 ? <ArrowUp size={12} /> : trend < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
                  {Math.abs(trend)}%
                </span>
                {trendLabel && <span style={{ fontSize: 11, color: '#999' }}>{trendLabel}</span>}
              </div>
            )}
          </div>
          {status && (
            <div style={{
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              background: statusColor + '20',
              color: statusColor,
            }}>
              {status === 'good' ? '达标' : status === 'warning' ? '预警' : '超标'}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 趋势图组件
  const TrendChart: React.FC<{
    data: { date: string; value: number }[];
    color: string;
    unit: string;
    threshold?: number;
  }> = ({ data, color, unit, threshold }) => {
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;

    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
        {data.map((item, index) => {
          const height = ((item.value - min) / range) * 60 + 20;
          const isLatest = index === data.length - 1;
          return (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%',
                height: height,
                background: isLatest ? color : color + '60',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.3s',
                position: 'relative',
              }}>
                {threshold && item.value > threshold && (
                  <div style={{
                    position: 'absolute',
                    top: -4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#dc2626',
                  }} />
                )}
              </div>
              <div style={{ fontSize: 8, color: '#999' }}>{item.date}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // 简单柱状图组件
  const SimpleBar: React.FC<{ value: number; max: number; color: string; showValue?: boolean }> = ({ value, max, color, showValue }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${(value / max) * 100}%`,
          height: '100%',
          background: color,
          borderRadius: 4,
          transition: 'width 0.3s',
        }} />
      </div>
      {showValue && <span style={{ fontSize: 11, fontWeight: 600, color: '#333', minWidth: 36 }}>{value}</span>}
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      {/* 标题区 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e40af', margin: 0 }}>质控统计</h1>
          <p style={{ fontSize: 14, color: '#666', margin: '8px 0 0 0' }}>
            汉东省人民医院 · 全院医技检查预约系统 · {today}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #e8e8e8',
            fontSize: 12,
            color: '#333',
            background: '#fff',
          }}>
            <option>近7天</option>
            <option>近30天</option>
            <option>近90天</option>
          </select>
          <select style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #e8e8e8',
            fontSize: 12,
            color: '#333',
            background: '#fff',
          }}>
            <option>全部科室</option>
            <option>放射科</option>
            <option>超声医学科</option>
            <option>内镜中心</option>
          </select>
        </div>
      </div>

      {/* 核心KPI卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <QCKPICard
          title="预约成功率"
          value={qualityMetrics.appointmentSuccessRate}
          unit="%"
          icon={<CheckCircle size={24} />}
          color="#059669"
          bgColor="#ecfdf5"
          trend={qualityMetrics.appointmentSuccessRateMoM}
          trendLabel="环比"
          status="good"
        />
        <QCKPICard
          title="爽约率"
          value={qualityMetrics.noShowRate}
          unit="%"
          icon={<XCircle size={24} />}
          color="#d97706"
          bgColor="#fffbeb"
          trend={qualityMetrics.noShowRateMoM}
          trendLabel="环比"
          status="warning"
        />
        <QCKPICard
          title="平均等候时长"
          value={qualityMetrics.avgWaitTime}
          unit="分钟"
          icon={<Clock size={24} />}
          color="#1e40af"
          bgColor="#eff6ff"
          trend={qualityMetrics.avgWaitTimeMoM}
          trendLabel="环比"
          status="good"
        />
        <QCKPICard
          title="报告及时率"
          value={qualityMetrics.reportTimelinessRate}
          unit="%"
          icon={<FileCheck size={24} />}
          color="#7c3aed"
          bgColor="#f5f3ff"
          trend={qualityMetrics.reportTimelinessRateMoM}
          trendLabel="环比"
          status="good"
        />
      </div>

      {/* 同比环比详情卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
        {/* 预约成功率同比环比 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="#059669" />
            预约成功率
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>同比</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <ArrowUp size={14} color="#059669" />
                <span style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>{qualityMetrics.appointmentSuccessRateYoY}%</span>
              </div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>较去年同期</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>环比</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <ArrowUp size={14} color="#059669" />
                <span style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>{qualityMetrics.appointmentSuccessRateMoM}%</span>
              </div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>较上期</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <TrendChart
              data={qualityTrend.map(t => ({ date: t.date, value: t.successRate }))}
              color="#059669"
              unit="%"
            />
          </div>
        </div>

        {/* 爽约率同比环比 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={16} color="#d97706" />
            爽约率
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>同比</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <ArrowDown size={14} color="#059669" />
                <span style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>{Math.abs(qualityMetrics.noShowRateYoY)}%</span>
              </div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>较去年同期下降</div>
            </div>
            <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>环比</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <ArrowDown size={14} color="#059669" />
                <span style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>{Math.abs(qualityMetrics.noShowRateMoM)}%</span>
              </div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>较上期下降</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <TrendChart
              data={qualityTrend.map(t => ({ date: t.date, value: t.noShowRate }))}
              color="#d97706"
              unit="%"
            />
          </div>
        </div>
      </div>

      {/* 各检查类型质控指标 */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={18} color="#1e40af" />
          各检查类型质控指标
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#666', fontWeight: 500 }}>检查类型</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>预约量</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>预约成功率</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>爽约率</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>平均等候</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>报告及时率</th>
              </tr>
            </thead>
            <tbody>
              {modalityQC.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px', fontSize: 13, fontWeight: 600, color: '#1e40af' }}>{item.modality}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: 13, color: '#333' }}>{item.total}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${item.successRate}%`,
                          height: '100%',
                          background: item.successRate >= 95 ? '#059669' : item.successRate >= 90 ? '#d97706' : '#dc2626',
                          borderRadius: 3,
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#333', minWidth: 36 }}>{item.successRate}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: item.noShowRate <= 3 ? '#059669' : item.noShowRate <= 5 ? '#d97706' : '#dc2626',
                    }}>
                      {item.noShowRate}%
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: 12, color: '#333' }}>{item.avgWait}分钟</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${item.reportRate}%`,
                          height: '100%',
                          background: item.reportRate >= 90 ? '#059669' : item.reportRate >= 80 ? '#d97706' : '#dc2626',
                          borderRadius: 3,
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#333', minWidth: 36 }}>{item.reportRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 超时预警列表 */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={18} color="#dc2626" />
          超时预警列表
          <span style={{
            marginLeft: 'auto',
            padding: '4px 10px',
            background: '#fef2f2',
            color: '#dc2626',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
          }}>
            {timeoutWarnings.filter(w => w.status === '超时').length} 条超时
          </span>
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12, color: '#666', fontWeight: 500 }}>患者姓名</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12, color: '#666', fontWeight: 500 }}>检查项目</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>设备</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>预约时间</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>实际开始</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>等候时长</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>阈值</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>状态</th>
              </tr>
            </thead>
            <tbody>
              {timeoutWarnings.map((warning, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 8px', fontSize: 13, color: '#333' }}>{warning.patientName}</td>
                  <td style={{ padding: '12px 8px', fontSize: 13, color: '#333' }}>{warning.examItem}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, color: '#666' }}>{warning.device}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, color: '#666' }}>{warning.scheduledTime}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, color: '#666' }}>{warning.actualTime}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: warning.waitMinutes > warning.threshold ? '#dc2626' : '#333' }}>
                    {warning.waitMinutes}分钟
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, color: '#666' }}>{warning.threshold}分钟</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 500,
                      background: warning.status === '超时' ? '#fef2f2' : warning.status === '预警' ? '#fffbeb' : '#ecfdf5',
                      color: warning.status === '超时' ? '#dc2626' : warning.status === '预警' ? '#d97706' : '#059669',
                    }}>
                      {warning.status === '超时' && <AlertTriangle size={10} style={{ marginRight: 4 }} />}
                      {warning.status === '预警' && <Clock size={10} style={{ marginRight: 4 }} />}
                      {warning.status === '正常' && <CheckCircle size={10} style={{ marginRight: 4 }} />}
                      {warning.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QualityControlPage;
