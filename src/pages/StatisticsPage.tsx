// G006 全院医技检查预约系统 - 统计分析页面
import {
  BarChart3, TrendingUp, Calendar, Clock, Users,
  CheckCircle, AlertTriangle, Monitor, PieChart,
  Activity, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { APPOINTMENTS, DEVICES, STATISTICS, DEPARTMENTS } from '../data/initialData';

interface StatisticsPageProps {
  currentRole: string;
}

const StatisticsPage = ({ currentRole: _currentRole }: StatisticsPageProps) => {
  const today = '2026-05-02';

  // 基础统计数据
  const totalAppointments = STATISTICS.totalAppointments;
  const todayAppointments = APPOINTMENTS.filter(a => a.appointmentDate === today);
  const completedToday = todayAppointments.filter(a => a.status === '已完成').length;
  const checkedInToday = todayAppointments.filter(a => a.status === '已签到' || a.status === '检查中').length;
  const cancelledCount = todayAppointments.filter(a => a.status === '已取消').length;
  const pendingCount = todayAppointments.filter(a => a.status === '待确认' || a.status === '已确认').length;

  // 设备统计数据
  const activeDevices = DEVICES.filter(d => d.status === '正常').length;
  const totalDevices = DEVICES.length;
  const avgUtilization = Math.round(
    STATISTICS.deviceUtilization.reduce((sum, d) => sum + d.value, 0) / STATISTICS.deviceUtilization.length
  );

  // 周对比数据
  const lastWeekTotal = 980;
  const thisWeekTotal = STATISTICS.totalAppointments;
  const weekChange = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);

  // 检查状态分布
  const statusDistribution = [
    { name: '已完成', value: completedToday, color: '#059669' },
    { name: '检查中', value: checkedInToday, color: '#1e40af' },
    { name: '待签到', value: pendingCount, color: '#d97706' },
    { name: '已取消', value: cancelledCount, color: '#dc2626' },
  ];

  // 科室预约量统计
  const departmentStats = DEPARTMENTS.slice(0, 6).map(dept => {
    const count = todayAppointments.filter(a => a.departmentId === dept.id).length;
    return { name: dept.name, count, coordinator: dept.coordinator };
  }).sort((a, b) => b.count - a.count);

  // 时段分布（简化显示）
  const peakHours = STATISTICS.peakHours;
  const maxPeak = Math.max(...peakHours.map(p => p.count));

  // StatCard组件
  const StatCard: React.FC<{
    title: string;
    value: number | string;
    subtitle?: string;
    change?: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }> = ({ title, value, subtitle, change, icon, color, bgColor }) => (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 20,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
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
        <div style={{ fontSize: 28, fontWeight: 700, color: '#333', lineHeight: 1.2 }}>{value}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: '#999', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            {change !== undefined && (
              <span style={{
                color: change > 0 ? '#059669' : change < 0 ? '#dc2626' : '#999',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
                {change > 0 ? <ArrowUp size={12} /> : change < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
                {Math.abs(change)}%
              </span>
            )}
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  // 简单柱状图组件
  const SimpleBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
    <div style={{
      width: '100%',
      height: 8,
      background: '#f3f4f6',
      borderRadius: 4,
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${(value / max) * 100}%`,
        height: '100%',
        background: color,
        borderRadius: 4,
        transition: 'width 0.3s',
      }} />
    </div>
  );

  // 简单饼图组件
  const SimplePieChart: React.FC<{ data: { name: string; value: number; color: string }[]; total: number }> = ({ data, total }) => {
    let cumulativePercent = 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          position: 'relative',
          background: '#f3f4f6',
        }}>
          {data.map((item, index) => {
            const percent = (item.value / total) * 100;
            cumulativePercent += percent;
            const color = item.color;
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `conic-gradient(${color} 0deg ${percent * 3.6}deg, transparent ${percent * 3.6}deg 360deg)`,
                }}
              />
            );
          })}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            color: '#333',
          }}>
            {total}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
              <span style={{ fontSize: 12, color: '#666' }}>{item.name}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#333', marginLeft: 4 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 标题区 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e40af', margin: 0 }}>统计分析</h1>
        <p style={{ fontSize: 14, color: '#666', margin: '8px 0 0 0' }}>
          汉东省人民医院 · 全院医技检查预约系统 · {today}
        </p>
      </div>

      {/* 概览统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          title="累计预约总量"
          value={totalAppointments}
          subtitle="系统总预约数"
          change={weekChange}
          icon={<Calendar size={24} />}
          color="#1e40af"
          bgColor="#eff6ff"
        />
        <StatCard
          title="今日预约"
          value={todayAppointments.length}
          subtitle={`待签到 ${pendingCount} | 已签到 ${checkedInToday}`}
          icon={<TrendingUp size={24} />}
          color="#059669"
          bgColor="#ecfdf5"
        />
        <StatCard
          title="今日完成"
          value={completedToday}
          subtitle="检查已完成"
          icon={<CheckCircle size={24} />}
          color="#7c3aed"
          bgColor="#f5f3ff"
        />
        <StatCard
          title="平均等待时间"
          value={`${STATISTICS.avgWaitTime}分钟`}
          subtitle="签到到开始检查"
          icon={<Clock size={24} />}
          color="#be185d"
          bgColor="#fdf2f8"
        />
      </div>

      {/* 第二行统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          title="设备运行率"
          value={`${activeDevices}/${totalDevices}`}
          subtitle={`平均利用率 ${avgUtilization}%`}
          icon={<Monitor size={24} />}
          color="#0891b2"
          bgColor="#ecfeff"
        />
        <StatCard
          title="爽约率"
          value={`${STATISTICS.noShowRate}%`}
          subtitle="本月失约比例"
          icon={<AlertTriangle size={24} />}
          color="#d97706"
          bgColor="#fffbeb"
        />
        <StatCard
          title="检查类型数"
          value="6"
          subtitle="CT/MRI/超声/内镜/心电/X光"
          icon={<Activity size={24} />}
          color="#6366f1"
          bgColor="#eef2ff"
        />
        <StatCard
          title="今日取消"
          value={cancelledCount}
          subtitle="主动取消/超时取消"
          icon={<Users size={24} />}
          color="#dc2626"
          bgColor="#fef2f2"
        />
      </div>

      {/* 图表区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* 预约趋势图 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="#1e40af" />
            近7日预约趋势
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
            {STATISTICS.appointmentTrend.map((item, index) => {
              const maxCount = Math.max(...STATISTICS.appointmentTrend.map(t => t.count));
              const height = (item.count / maxCount) * 140;
              const isToday = index === STATISTICS.appointmentTrend.length - 1;
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 11, color: '#666', fontWeight: isToday ? 600 : 400 }}>
                    {item.count}
                  </div>
                  <div style={{
                    width: '100%',
                    height: height,
                    background: isToday ? '#1e40af' : '#93c5fd',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s',
                    minHeight: 20,
                  }} />
                  <div style={{ fontSize: 11, color: isToday ? '#1e40af' : '#999' }}>{item.date}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 检查类型分布 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChart size={18} color="#1e40af" />
            检查类型分布
          </h3>
          <SimplePieChart data={STATISTICS.modalityDistribution.map(item => ({
            ...item,
            color: { CT: '#1e40af', MRI: '#7c3aed', '超声': '#059669', '内镜': '#d97706', '心电': '#dc2626', 'X光': '#0891b2' }[item.name] || '#6b7280'
          }))} total={100} />
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STATISTICS.modalityDistribution.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                background: '#f3f4f6',
                borderRadius: 4,
                fontSize: 11,
              }}>
                <span style={{ color: '#666' }}>{item.name}</span>
                <span style={{ fontWeight: 600, color: '#333' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 时段分布 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="#1e40af" />
            时段预约分布
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {peakHours.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 50, fontSize: 12, color: '#666' }}>{item.hour}</div>
                <div style={{ flex: 1 }}>
                  <SimpleBar value={item.count} max={maxPeak} color="#1e40af" />
                </div>
                <div style={{ width: 30, fontSize: 12, fontWeight: 600, color: '#333', textAlign: 'right' }}>
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 设备利用率 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Monitor size={18} color="#1e40af" />
            设备利用率
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STATISTICS.deviceUtilization.map((item, index) => {
              const device = DEVICES.find(d => d.name.includes(item.name));
              const statusColor = device?.status === '正常' ? '#059669' : device?.status === '维护中' ? '#d97706' : '#dc2626';
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 60, fontSize: 12, color: '#333', flexShrink: 0 }}>
                    {item.name}
                  </div>
                  <div style={{ flex: 1 }}>
                    <SimpleBar
                      value={item.value}
                      max={100}
                      color={item.value > 85 ? '#dc2626' : item.value > 70 ? '#d97706' : '#059669'}
                    />
                  </div>
                  <div style={{ width: 36, fontSize: 12, fontWeight: 600, color: '#333', textAlign: 'right' }}>
                    {item.value}%
                  </div>
                  <div style={{
                    width: 40,
                    fontSize: 10,
                    padding: '2px 4px',
                    borderRadius: 3,
                    background: statusColor + '20',
                    color: statusColor,
                    textAlign: 'center',
                  }}>
                    {device?.status || '正常'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部数据表格区域 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 科室预约统计 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="#1e40af" />
            科室预约统计
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 12, color: '#666', fontWeight: 500 }}>科室</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>今日预约</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#666', fontWeight: 500 }}>负责人</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((dept, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '10px 8px', fontSize: 13, color: '#333' }}>{dept.name}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1e40af' }}>{dept.count}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#666' }}>{dept.coordinator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 今日预约状态分布 */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="#1e40af" />
            今日预约状态分布
          </h3>
          <SimplePieChart
            data={statusDistribution}
            total={todayAppointments.length}
          />
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
              <span>完成率</span>
              <span style={{ fontWeight: 600, color: '#333' }}>
                {todayAppointments.length > 0 ? Math.round((completedToday / todayAppointments.length) * 100) : 0}%
              </span>
            </div>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${todayAppointments.length > 0 ? (completedToday / todayAppointments.length) * 100 : 0}%`,
                height: '100%',
                background: '#059669',
                borderRadius: 3,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
