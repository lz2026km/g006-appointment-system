// G006 全院医技检查预约系统 - 首页仪表盘
// 汉东省人民医院全院医技检查预约系统
// UTF-8编码
// React + TypeScript，内联样式，蓝色系 #1e40af，WIN10风格

import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Monitor,
} from 'lucide-react';
import {
  APPOINTMENTS,
  DEVICES,
  CHECKIN_RECORDS,
  STATISTICS,
} from '../data/initialData';

// ============================================================
// Props类型定义
// ============================================================
interface HomePageProps {
  currentRole: string;
}

// ============================================================
// 状态徽章组件
// 根据不同状态显示不同颜色的标签，用于标识预约状态
// ============================================================
const StatusBadge = ({ status }: { status: string }) => {
  // 状态配置映射表，包含背景色、文字颜色
  const statusConfig: Record<
    string,
    { bg: string; color: string; text: string }
  > = {
    '已签到': { bg: '#dbeafe', color: '#1e40af', text: '已签到' },
    '检查中': { bg: '#fef3c7', color: '#d97706', text: '检查中' },
    '已完成': { bg: '#d1fae5', color: '#059669', text: '已完成' },
    '已确认': { bg: '#e0e7ff', color: '#4338ca', text: '已确认' },
    '待确认': { bg: '#fee2e2', color: '#dc2626', text: '待确认' },
    '已取消': { bg: '#f3f4f6', color: '#6b7280', text: '已取消' },
    '候检': { bg: '#ecfdf5', color: '#059669', text: '候检' },
  };

  // 获取对应状态的配置，默认使用已确认状态的样式
  const config = statusConfig[status] || statusConfig['已确认'];

  // 渲染状态徽章
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.text}
    </span>
  );
};

// ============================================================
// KPI指标卡片组件
// 显示关键绩效指标的卡片，包含标题、数值、副标题、图标和趋势信息
// ============================================================
const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}) => {
  // 卡片外层容器样式
  const containerStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 8,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    position: 'relative',
    overflow: 'hidden',
  };

  // 鼠标悬停效果
  const hoverStyle: React.CSSProperties = {
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  };

  // 图标容器样式
  const iconContainerStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 8,
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1e40af',
    flexShrink: 0,
  };

  // 内容区域容器
  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  // 标题文字样式
  const titleStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: 500,
  };

  // 数值样式
  const valueStyle: React.CSSProperties = {
    fontSize: 26,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.2,
    fontFamily: 'Segoe UI, Microsoft YaHei, sans-serif',
  };

  // 副标题样式
  const subtitleStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  };

  // 趋势指示器样式
  const trendStyle: React.CSSProperties = {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 11,
    fontWeight: 600,
  };

  // 根据趋势类型获取颜色
  const getTrendColor = () => {
    if (trend === 'up') return '#059669';
    if (trend === 'down') return '#dc2626';
    return '#6b7280';
  };

  // 根据趋势类型获取图标
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp size={12} />;
    if (trend === 'down') return <ArrowDown size={12} />;
    return null;
  };

  // 渲染KPI卡片
  return (
    <div style={{ ...containerStyle, ...hoverStyle }}>
      <div style={iconContainerStyle}>{icon}</div>
      <div style={contentStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={valueStyle}>{value}</div>
        {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
      </div>
      {trend && trendValue && (
        <div style={{ ...trendStyle, color: getTrendColor() }}>
          {getTrendIcon()}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================
// 纯CSS饼图组件
// 使用conic-gradient实现，无需外部图表库
// 支持多数据段的占比展示
// ============================================================
const CSSPieChart = ({
  data,
  title,
}: {
  data: { name: string; value: number; color: string }[];
  title: string;
}) => {
  // 计算所有数据的总和
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // 计算每个数据段的起始角度和结束角度
  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const startAngle = currentAngle;
    currentAngle += percentage;
    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle,
    };
  });

  // 容器样式
  const containerStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
  };

  // 标题样式
  const headerStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '1px solid #f3f4f6',
  };

  // 图表容器样式
  const chartContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap' as const,
  };

  // 饼图主体样式，使用conic-gradient创建饼图效果
  const pieStyle: React.CSSProperties = {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: `conic-gradient(${segments
      .map((s) => {
        const startDeg = s.startAngle * 3.6;
        const endDeg = s.endAngle * 3.6;
        return `${s.color} ${startDeg}deg ${endDeg}deg`;
      })
      .join(', ')})`,
    position: 'relative',
    flexShrink: 0,
  };

  // 饼图中心白色圆形遮罩样式
  const pieCenterStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // 图例容器样式
  const legendStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
    minWidth: 120,
  };

  // 图例项样式
  const legendItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
  };

  // 图例颜色块样式
  const legendColorStyle = (color: string): React.CSSProperties => ({
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: color,
    flexShrink: 0,
  });

  // 图例标签样式
  const legendLabelStyle: React.CSSProperties = {
    flex: 1,
    color: '#4b5563',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  // 图例数值样式
  const legendValueStyle: React.CSSProperties = {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 12,
  };

  // 渲染饼图
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>{title}</div>
      <div style={chartContainerStyle}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <div style={pieStyle}>
            <div style={pieCenterStyle}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#1e40af',
                }}
              >
                {total}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: '#6b7280',
                }}
              >
                总计
              </span>
            </div>
          </div>
        </div>
        <div style={legendStyle}>
          {segments.map((segment) => (
            <div key={segment.name} style={legendItemStyle}>
              <div style={legendColorStyle(segment.color)} />
              <span style={legendLabelStyle}>{segment.name}</span>
              <span style={legendValueStyle}>{segment.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 纯CSS条形图组件
// 使用CSS实现横向条形图，展示设备利用率等数据
// ============================================================
const CSSBarChart = ({
  data,
  title,
  maxValue,
  showPercentage,
}: {
  data: { name: string; value: number; color?: string }[];
  title: string;
  maxValue?: number;
  showPercentage?: boolean;
}) => {
  // 计算最大值，用于归一化条形长度
  const max = maxValue || Math.max(...data.map((d) => d.value));

  // 容器样式
  const containerStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
  };

  // 标题样式
  const headerStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '1px solid #f3f4f6',
  };

  // 条形图容器样式
  const barContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  };

  // 单个条形项样式
  const barItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  // 条形标签样式
  const barLabelStyle: React.CSSProperties = {
    width: 70,
    fontSize: 12,
    color: '#4b5563',
    flexShrink: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  };

  // 条形轨道背景样式
  const barTrackStyle: React.CSSProperties = {
    flex: 1,
    height: 20,
    background: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  };

  // 条形填充样式
  const barFillStyle = (
    value: number,
    maxVal: number,
    color?: string
  ): React.CSSProperties => ({
    width: `${(value / maxVal) * 100}%`,
    height: '100%',
    background: color || '#1e40af',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  });

  // 条形数值标签样式
  const barValueStyle: React.CSSProperties = {
    width: 40,
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'right' as const,
    flexShrink: 0,
  };

  // 渲染条形图
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>{title}</div>
      <div style={barContainerStyle}>
        {data.map((item, index) => (
          <div key={index} style={barItemStyle}>
            <div style={barLabelStyle}>{item.name}</div>
            <div style={barTrackStyle}>
              <div style={barFillStyle(item.value, max, item.color)} />
            </div>
            <div style={barValueStyle}>
              {showPercentage
                ? `${Math.round((item.value / max) * 100)}%`
                : item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 预约表格组件
// 展示预约列表信息，包含患者信息、检查项目、设备、时间等
// ============================================================
const AppointmentTable = ({
  appointments,
  title,
}: {
  appointments: typeof APPOINTMENTS;
  title: string;
}) => {
  // 表格容器样式
  const containerStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  };

  // 表头样式
  const headerStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    padding: '14px 16px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  // 表格样式
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  };

  // 表头单元格基础样式
  const thBaseStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#6b7280',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap' as const,
  };

  // 表格单元格基础样式
  const tdBaseStyle: React.CSSProperties = {
    padding: '10px 12px',
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle' as const,
  };

  // 根据是否急诊返回不同的行背景色
  const getRowStyle = (
    isUrgent: boolean
  ): React.CSSProperties => ({
    background: isUrgent ? '#fef2f2' : 'transparent',
    transition: 'background 0.15s',
  });

  // 患者信息容器样式
  const patientInfoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };

  // 患者姓名样式
  const patientNameStyle: React.CSSProperties = {
    fontWeight: 600,
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  // 患者信息副标题样式
  const patientMetaStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#9ca3af',
  };

  // 急诊徽章样式
  const urgentBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '1px 5px',
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 600,
    background: '#fee2e2',
    color: '#dc2626',
    marginLeft: 6,
  };

  // 检查项目样式
  const examItemStyle: React.CSSProperties = {
    fontWeight: 500,
    color: '#111827',
  };

  // 检查类型样式
  const examTypeStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#9ca3af',
  };

  // 设备名称样式
  const deviceNameStyle: React.CSSProperties = {
    color: '#374151',
  };

  // 科室名称样式
  const deptNameStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#9ca3af',
  };

  // 预约时间样式
  const timeStyle: React.CSSProperties = {
    color: '#374151',
  };

  // 预约日期样式
  const dateStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#9ca3af',
  };

  // 渲染预约表格
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <Calendar size={16} color="#1e40af" />
        {title}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: '#9ca3af',
            fontWeight: 400,
          }}
        >
          共 {appointments.length} 条记录
        </span>
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thBaseStyle}>患者信息</th>
            <th style={thBaseStyle}>检查项目</th>
            <th style={thBaseStyle}>设备</th>
            <th style={thBaseStyle}>预约时间</th>
            <th style={thBaseStyle}>状态</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr
              key={apt.id}
              style={getRowStyle(apt.isUrgent || false)}
            >
              <td style={tdBaseStyle}>
                <div style={patientInfoStyle}>
                  <div style={patientNameStyle}>
                    {apt.patientName}
                    <span
                      style={{
                        fontWeight: 400,
                        color: '#9ca3af',
                      }}
                    >
                      {apt.gender} {apt.age}岁
                    </span>
                    {apt.isUrgent && (
                      <span style={urgentBadgeStyle}>急诊</span>
                    )}
                  </div>
                  <div style={patientMetaStyle}>
                    {apt.patientType} · {apt.phone}
                  </div>
                </div>
              </td>
              <td style={tdBaseStyle}>
                <div style={examItemStyle}>{apt.examItemName}</div>
                <div style={examTypeStyle}>{apt.modality}</div>
              </td>
              <td style={tdBaseStyle}>
                <div style={deviceNameStyle}>{apt.deviceName}</div>
                <div style={deptNameStyle}>{apt.departmentName}</div>
              </td>
              <td style={tdBaseStyle}>
                <div style={timeStyle}>{apt.appointmentTime}</div>
                <div style={dateStyle}>{apt.appointmentDate}</div>
              </td>
              <td style={tdBaseStyle}>
                <StatusBadge status={apt.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================
// 候检队列卡片组件
// 展示单个候检患者的排队信息
// ============================================================
const QueueCard = ({
  rec,
}: {
  rec: (typeof CHECKIN_RECORDS)[0];
}) => {
  // 队列号徽章样式
  const badgeStyle = (): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#ffffff',
    background:
      rec.status === '检查中'
        ? '#1e40af'
        : rec.status === '候检'
        ? '#059669'
        : '#6b7280',
  });

  // 卡片容器样式
  const cardStyle: React.CSSProperties = {
    flex: '1 1 200px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    background: '#f9fafb',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  };

  // 患者信息样式
  const infoStyle: React.CSSProperties = {
    flex: 1,
  };

  // 患者姓名样式
  const nameStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
  };

  // 检查信息样式
  const metaStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  };

  // 渲染候检卡片
  return (
    <div style={cardStyle}>
      <div style={badgeStyle()}>{rec.queueNumber}</div>
      <div style={infoStyle}>
        <div style={nameStyle}>{rec.patientName}</div>
        <div style={metaStyle}>
          {rec.examItemName} · {rec.deviceName}
        </div>
      </div>
      <StatusBadge status={rec.status} />
    </div>
  );
};

// ============================================================
// 主页面组件
// 首页仪表盘，展示系统关键指标和数据
// ============================================================
export default function HomePage({ currentRole }: HomePageProps) {
  // 固定日期，用于过滤今日数据
  const todayDate = '2026-05-02';

  // 过滤今日预约数据
  const todayAppointments = APPOINTMENTS.filter(
    (a) => a.appointmentDate === todayDate
  );

  // 获取最近8条预约记录用于表格展示
  const recentAppointments = todayAppointments.slice(0, 8);

  // 计算今日统计数据
  const todayTotal = todayAppointments.length;
  const pendingCheckIn = todayAppointments.filter(
    (a) => a.status === '已确认' || a.status === '待确认'
  ).length;
  const checkingIn = todayAppointments.filter(
    (a) => a.status === '检查中' || a.status === '已签到'
  ).length;
  const completedToday = todayAppointments.filter(
    (a) => a.status === '已完成'
  ).length;
  const urgentAppointments = todayAppointments.filter(
    (a) =>
      a.isUrgent &&
      a.status !== '已取消' &&
      a.status !== '已完成'
  ).length;

  // 设备统计数据
  const activeDevices = DEVICES.filter((d) => d.status === '正常').length;
  const totalDevices = DEVICES.length;

  // 预约类型分布数据 - 用于饼图展示
  const modalityData = [
    { name: 'CT', value: 38, color: '#1e40af' },
    { name: 'MRI', value: 15, color: '#3b82f6' },
    { name: '超声', value: 28, color: '#60a5fa' },
    { name: '内镜', value: 8, color: '#93c5fd' },
    { name: '心电', value: 18, color: '#bfdbfe' },
    { name: 'X光', value: 10, color: '#dbeafe' },
  ];

  // 设备利用率数据 - 用于条形图展示
  // 根据利用率高低显示不同颜色
  const deviceUtilizationData = STATISTICS.deviceUtilization.map(
    (item) => ({
      name: item.name,
      value: item.value,
      color:
        item.value > 85
          ? '#dc2626'
          : item.value > 70
          ? '#d97706'
          : '#059669',
    })
  );

  // 计算完成率和签到率
  const completionRate = Math.round(
    (completedToday / todayTotal) * 100
  );
  const checkInRate = Math.round(
    ((checkingIn + completedToday) / todayTotal) * 100
  );

  // ============================================================
  // 页面主容器样式
  // ============================================================
  const mainContainerStyle: React.CSSProperties = {
    padding: 20,
    background: '#f3f4f6',
    minHeight: '100vh',
    fontFamily:
      'Segoe UI, Microsoft YaHei, Helvetica Neue, sans-serif',
  };

  // ============================================================
  // 页面标题区域样式
  // ============================================================
  const headerSectionStyle: React.CSSProperties = {
    marginBottom: 20,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: 12,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: '#1e40af',
    margin: 0,
    lineHeight: 1.3,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#6b7280',
    margin: '6px 0 0 0',
  };

  const roleBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 20,
    background: '#1e40af',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 500,
  };

  // ============================================================
  // 网格布局样式
  // ============================================================
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: 16,
  };

  const kpiGridStyle: React.CSSProperties = {
    ...gridStyle,
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    marginBottom: 16,
  };

  const chartsGridStyle: React.CSSProperties = {
    ...gridStyle,
    gridTemplateColumns:
      'repeat(auto-fit, minmax(340px, 1fr))',
    marginBottom: 16,
  };

  const tableSectionStyle: React.CSSProperties = {
    marginBottom: 16,
  };

  // ============================================================
  // 候检队列区域样式
  // ============================================================
  const checkinSectionStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    marginBottom: 16,
  };

  const checkinHeaderStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const checkinListStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
  };

  // ============================================================
  // 提示框样式
  // ============================================================
  const alertStyle: React.CSSProperties = {
    marginTop: 16,
    padding: '12px 16px',
    background: '#fef3c7',
    borderRadius: 8,
    border: '1px solid #fcd34d',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  };

  const alertContentStyle: React.CSSProperties = {
    flex: 1,
  };

  const alertTitleStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: '#92400e',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const alertTextStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#a16207',
    lineHeight: 1.5,
  };

  // ============================================================
  // 底部统计信息样式
  // ============================================================
  const footerStyle: React.CSSProperties = {
    marginTop: 16,
    padding: '12px 16px',
    background: '#ffffff',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: 12,
    fontSize: 11,
    color: '#9ca3af',
  };

  // ============================================================
  // 渲染页面
  // ============================================================
  return (
    <div style={mainContainerStyle}>
      {/* ============================================================ */}
      {/* 页面标题区域 */}
      {/* ============================================================ */}
      <div style={headerSectionStyle}>
        <div>
          <h1 style={titleStyle}>
            <LayoutDashboard
              size={24}
              style={{
                display: 'inline',
                marginRight: 10,
                verticalAlign: 'middle',
              }}
            />
            全院医技检查预约系统
          </h1>
          <p style={subtitleStyle}>
            汉东省人民医院 · {todayDate} · 实时数据更新
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={roleBadgeStyle}>{currentRole}</span>
          <Clock size={16} color="#6b7280" />
          <span
            style={{
              fontSize: 12,
              color: '#6b7280',
            }}
          >
            {new Date().toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KPI指标卡片区域 - 第一行 */}
      {/* 包含：今日预约、待签到、检查中、已完成 */}
      {/* ============================================================ */}
      <div style={kpiGridStyle}>
        <KPICard
          title="今日预约"
          value={todayTotal}
          subtitle={`待签到 ${pendingCheckIn} · 已签到 ${checkingIn}`}
          icon={<Calendar size={22} />}
          trend="up"
          trendValue="12%"
        />
        <KPICard
          title="待签到"
          value={pendingCheckIn}
          subtitle="已确认 + 待确认"
          icon={<Users size={22} />}
        />
        <KPICard
          title="检查中"
          value={checkingIn}
          subtitle="正在进行检查"
          icon={<Activity size={22} />}
        />
        <KPICard
          title="已完成"
          value={completedToday}
          subtitle="今日累计完成"
          icon={<CheckCircle size={22} />}
          trend="up"
          trendValue="8%"
        />
      </div>

      {/* ============================================================ */}
      {/* KPI指标卡片区域 - 第二行 */}
      {/* 包含：危急/急诊、设备运行、本周趋势、平均等待时间 */}
      {/* ============================================================ */}
      <div style={kpiGridStyle}>
        <KPICard
          title="危急/急诊"
          value={urgentAppointments}
          subtitle="需优先处理"
          icon={<AlertTriangle size={22} />}
        />
        <KPICard
          title="设备运行"
          value={`${activeDevices}/${totalDevices}`}
          subtitle="正常设备数/总设备数"
          icon={<Monitor size={22} />}
        />
        <KPICard
          title="本周预约趋势"
          value="↑ 12%"
          subtitle="较上周同期增长"
          icon={<TrendingUp size={22} />}
        />
        <KPICard
          title="平均等待时间"
          value={`${STATISTICS.avgWaitTime}分钟`}
          subtitle="签到到开始检查"
          icon={<Clock size={22} />}
        />
      </div>

      {/* ============================================================ */}
      {/* 图表区域 */}
      {/* 左侧：检查类型分布饼图 */}
      {/* 右侧：设备利用率条形图 */}
      {/* ============================================================ */}
      <div style={chartsGridStyle}>
        <CSSPieChart
          data={modalityData}
          title="检查类型分布"
        />
        <CSSBarChart
          data={deviceUtilizationData}
          title="设备利用率"
          maxValue={100}
          showPercentage
        />
      </div>

      {/* ============================================================ */}
      {/* 候检队列区域 */}
      {/* 展示当前正在候检和检查中的患者信息 */}
      {/* ============================================================ */}
      <div style={checkinSectionStyle}>
        <div style={checkinHeaderStyle}>
          <Activity size={16} color="#1e40af" />
          实时候检队列
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: '#9ca3af',
              fontWeight: 400,
            }}
          >
            当前 {CHECKIN_RECORDS.length} 人候检
          </span>
        </div>
        <div style={checkinListStyle}>
          {CHECKIN_RECORDS.map((record) => (
            <QueueCard key={record.id} rec={record} />
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 预约列表表格 */}
      {/* 展示最近8条预约记录 */}
      {/* ============================================================ */}
      <div style={tableSectionStyle}>
        <AppointmentTable
          appointments={recentAppointments}
          title="最近预约列表"
        />
      </div>

      {/* ============================================================ */}
      {/* 提示信息区域 */}
      {/* 展示设备维护等重要通知信息 */}
      {/* ============================================================ */}
      <div style={alertStyle}>
        <AlertTriangle
          size={18}
          color="#d97706"
          style={{
            flexShrink: 0,
            marginTop: 2,
          }}
        />
        <div style={alertContentStyle}>
          <div style={alertTitleStyle}>
            设备维护提醒
            <span
              style={{
                fontWeight: 400,
                fontSize: 11,
              }}
            >
              维护中
            </span>
          </div>
          <div style={alertTextStyle}>
            MRI-02 设备（飞利浦 Ingenia）正在进行计划性维护，
            预计维护完成时间：2026-05-03 08:00。
            请合理安排患者预约，您可以选择 MRI-01 设备进行预约。
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 系统统计信息区域 */}
      {/* 展示系统累计预约量、今日完成率、签到率等统计数据 */}
      {/* ============================================================ */}
      <div style={footerStyle}>
        <span>
          系统累计预约总量：{STATISTICS.totalAppointments}
        </span>
        <span>·</span>
        <span>今日完成率：{completionRate}%</span>
        <span>·</span>
        <span>签到率：{checkInRate}%</span>
        <span>·</span>
        <span>
          数据更新时间：{new Date().toLocaleString('zh-CN')}
        </span>
      </div>
    </div>
  );
}
