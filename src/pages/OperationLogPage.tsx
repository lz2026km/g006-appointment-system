// G006 全院医技检查预约系统 - 操作日志页面
// 汉东省人民医院全院医技检查预约系统
import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Calendar, Clock, User, ChevronDown, RefreshCw, X,
  Eye, Download, FileText, CheckCircle, AlertTriangle, Edit2, Trash2,
  Plus, Settings, LogIn, LogOut, UserPlus, UserMinus, ClipboardCheck,
  CalendarCheck, Monitor, Stethoscope, Bell, FileCheck, Printer, BarChart3, Package
} from 'lucide-react';

// ============================================================
// 样式常量 - WIN10风格
// ============================================================
const C = {
  primary: '#1e40af',        // 深蓝主色
  primaryLight: '#3b82f6',   // 浅蓝
  primaryLighter: '#dbeafe', // 淡蓝背景
  accent: '#0891b2',         // 青色辅色
  accentLight: '#06b6d4',    // 浅青
  white: '#ffffff',          // 白色卡片
  bg: '#e8e8e8',             // 浅灰背景
  border: '#d1d5db',         // 边框色
  textDark: '#1f2937',       // 深色文字
  textMid: '#4b5563',        // 中色文字
  textLight: '#9ca3af',      // 浅色文字
  success: '#059669',        // 成功绿
  warning: '#d97706',        // 警告橙
  danger: '#dc2626',         // 危险红
  info: '#2563eb',           // 信息蓝
}

// ============================================================
// 类型定义
// ============================================================

// 操作类型
type OperationType = 
  | '登录' | '登出' | '新建' | '编辑' | '删除' | '查看' 
  | '签到' | '取消预约' | '改签' | '确认预约' | '完成检查'
  | '设备启用' | '设备停用' | '设备维护' | '排班调整'
  | '报告撰写' | '报告审核' | '危急值通知' | '物资申领'
  | '系统设置' | '数据导出' | '数据导入';

// 操作结果
type OperationResult = '成功' | '失败' | '部分成功';

// 操作日志记录
interface OperationLog {
  id: string;
  timestamp: string;        // 操作时间
  operator: string;          // 操作人
  operatorRole: string;      // 操作人角色
  operationType: OperationType;
  operationContent: string; // 操作描述
  targetType: string;        // 操作对象类型（预约/患者/设备等）
  targetId: string;          // 操作对象ID
  targetName: string;        // 操作对象名称
  result: OperationResult;
  ipAddress: string;         // IP地址
  deviceInfo: string;        // 设备信息
  details?: string;          // 详细信息
  duration?: number;         // 操作耗时（毫秒）
  errorMessage?: string;     // 错误信息（失败时）
}

// ============================================================
// 模拟操作日志数据
// ============================================================
const generateMockLogs = (): OperationLog[] => {
  const logs: OperationLog[] = [
    {
      id: 'LOG001',
      timestamp: '2026-05-02 13:45:23',
      operator: '张伟',
      operatorRole: '管理员',
      operationType: '登录',
      operationContent: '管理员登录系统',
      targetType: '系统',
      targetId: 'SYS001',
      targetName: '全院医技预约系统',
      result: '成功',
      ipAddress: '192.168.1.100',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      duration: 1520,
    },
    {
      id: 'LOG002',
      timestamp: '2026-05-02 13:46:10',
      operator: '张伟',
      operatorRole: '管理员',
      operationType: '新建',
      operationContent: '新建预约记录',
      targetType: '预约',
      targetId: 'APT013',
      targetName: '李建国 - 胸部CT平扫',
      result: '成功',
      ipAddress: '192.168.1.100',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '预约时间：2026-05-03 09:00-10:00',
      duration: 3200,
    },
    {
      id: 'LOG003',
      timestamp: '2026-05-02 13:48:35',
      operator: '李娜',
      operatorRole: '前台',
      operationType: '签到',
      operationContent: '患者签到',
      targetType: '预约',
      targetId: 'APT001',
      targetName: '李建国 - 头颅CT平扫',
      result: '成功',
      ipAddress: '192.168.1.101',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '签到时间：07:55',
      duration: 850,
    },
    {
      id: 'LOG004',
      timestamp: '2026-05-02 13:50:12',
      operator: '王强',
      operatorRole: '技师',
      operationType: '设备维护',
      operationContent: '设备维护开始',
      targetType: '设备',
      targetId: 'DEV004',
      targetName: 'MRI-02 (飞利浦 Ingenia)',
      result: '成功',
      ipAddress: '192.168.1.102',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '维护原因：例行保养，预计恢复时间：2026-05-03 08:00',
      duration: 2100,
    },
    {
      id: 'LOG005',
      timestamp: '2026-05-02 13:52:08',
      operator: '张伟',
      operatorRole: '管理员',
      operationType: '编辑',
      operationContent: '修改患者信息',
      targetType: '患者',
      targetId: 'P002',
      targetName: '王秀英',
      result: '成功',
      ipAddress: '192.168.1.100',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '修改字段：联系电话',
      duration: 1800,
    },
    {
      id: 'LOG006',
      timestamp: '2026-05-02 13:55:30',
      operator: '刘芳',
      operatorRole: '护士',
      operationType: '取消预约',
      operationContent: '取消患者预约',
      targetType: '预约',
      targetId: 'APT011',
      targetName: '李建国 - 心脏彩超',
      result: '成功',
      ipAddress: '192.168.1.103',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '取消原因：患者主动取消',
      duration: 1200,
    },
    {
      id: 'LOG007',
      timestamp: '2026-05-02 14:00:15',
      operator: '赵敏',
      operatorRole: '医生',
      operationType: '报告撰写',
      operationContent: '撰写检查报告',
      targetType: '报告',
      targetId: 'RPT001',
      targetName: '刘芳 - 腹部肝胆脾胰超声',
      result: '成功',
      ipAddress: '192.168.1.104',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '报告状态：已提交待审核',
      duration: 45000,
    },
    {
      id: 'LOG008',
      timestamp: '2026-05-02 14:05:42',
      operator: '陈静',
      operatorRole: '医生',
      operationType: '报告审核',
      operationContent: '审核检查报告',
      targetType: '报告',
      targetId: 'RPT001',
      targetName: '刘芳 - 腹部肝胆脾胰超声',
      result: '成功',
      ipAddress: '192.168.1.105',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '审核意见：未见异常',
      duration: 15000,
    },
    {
      id: 'LOG009',
      timestamp: '2026-05-02 14:10:20',
      operator: '王芳',
      operatorRole: '医生',
      operationType: '危急值通知',
      operationContent: '发现并通知危急值',
      targetType: '危急值',
      targetId: 'CV001',
      targetName: '孙磊 - 头颅CT平扫',
      result: '成功',
      ipAddress: '192.168.1.106',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '危急值类型：颅内出血，通知医生：张伟，通知时间：14:10',
      duration: 8500,
    },
    {
      id: 'LOG010',
      timestamp: '2026-05-02 14:15:00',
      operator: '张伟',
      operatorRole: '管理员',
      operationType: '排班调整',
      operationContent: '调整设备排班',
      targetType: '排班',
      targetId: 'SCH002',
      targetName: 'CT-01 下午班',
      result: '成功',
      ipAddress: '192.168.1.100',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '调整内容：增加技师王磊',
      duration: 5600,
    },
    {
      id: 'LOG011',
      timestamp: '2026-05-02 14:20:30',
      operator: '李娜',
      operatorRole: '前台',
      operationType: '改签',
      operationContent: '修改预约时间',
      targetType: '预约',
      targetId: 'APT006',
      targetName: '赵敏 - 电子胃镜检查',
      result: '成功',
      ipAddress: '192.168.1.101',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '原时间：2026-05-03 09:00，新时间：2026-05-02 14:00',
      duration: 2800,
    },
    {
      id: 'LOG012',
      timestamp: '2026-05-02 14:25:15',
      operator: '马云飞',
      operatorRole: '技师',
      operationType: '设备启用',
      operationContent: '设备恢复正常使用',
      targetType: '设备',
      targetId: 'DEV004',
      targetName: 'MRI-02 (飞利浦 Ingenia)',
      result: '成功',
      ipAddress: '192.168.1.107',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '维护完成，已恢复正常使用',
      duration: 1200,
    },
    {
      id: 'LOG013',
      timestamp: '2026-05-02 14:30:00',
      operator: '周婷',
      operatorRole: '护士',
      operationType: '确认预约',
      operationContent: '确认预约信息',
      targetType: '预约',
      targetId: 'APT003',
      targetName: '张伟 - 冠脉CTA',
      result: '成功',
      ipAddress: '192.168.1.108',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '确认加急预约',
      duration: 950,
    },
    {
      id: 'LOG014',
      timestamp: '2026-05-02 14:35:22',
      operator: '刘建国',
      operatorRole: '技师',
      operationType: '完成检查',
      operationContent: '检查完成',
      targetType: '预约',
      targetId: 'APT001',
      targetName: '李建国 - 头颅CT平扫',
      result: '成功',
      ipAddress: '192.168.1.109',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '检查时长：15分钟，图像已上传',
      duration: 900000,
    },
    {
      id: 'LOG015',
      timestamp: '2026-05-02 14:40:00',
      operator: '吴浩',
      operatorRole: '管理员',
      operationType: '数据导出',
      operationContent: '导出日统计数据',
      targetType: '统计',
      targetId: 'STAT001',
      targetName: '2026-05-02 日统计报表',
      result: '成功',
      ipAddress: '192.168.1.110',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '导出格式：Excel，包含15项统计数据',
      duration: 12000,
    },
    {
      id: 'LOG016',
      timestamp: '2026-05-02 14:45:30',
      operator: '郑刚',
      operatorRole: '管理员',
      operationType: '新建',
      operationContent: '新建检查项目',
      targetType: '检查项目',
      targetId: 'EI016',
      targetName: '肺功能检查',
      result: '成功',
      ipAddress: '192.168.1.111',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '项目类型：肺功能，所属科室：呼吸内科',
      duration: 6800,
    },
    {
      id: 'LOG017',
      timestamp: '2026-05-02 14:50:15',
      operator: '孙磊',
      operatorRole: '护士',
      operationType: '查看',
      operationContent: '查看患者信息',
      targetType: '患者',
      targetId: 'P007',
      targetName: '孙磊',
      result: '成功',
      ipAddress: '192.168.1.112',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      duration: 500,
    },
    {
      id: 'LOG018',
      timestamp: '2026-05-02 14:55:00',
      operator: '张伟',
      operatorRole: '管理员',
      operationType: '系统设置',
      operationContent: '修改系统参数',
      targetType: '系统设置',
      targetId: 'CFG001',
      targetName: '预约规则配置',
      result: '成功',
      ipAddress: '192.168.1.100',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '修改内容：最大预约提前天数由7天调整为14天',
      duration: 4200,
    },
    {
      id: 'LOG019',
      timestamp: '2026-05-02 15:00:00',
      operator: '李娜',
      operatorRole: '前台',
      operationType: '新建',
      operationContent: '新建患者档案',
      targetType: '患者',
      targetId: 'P011',
      targetName: '新患者-张三',
      result: '失败',
      ipAddress: '192.168.1.101',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      errorMessage: '身份证号已存在',
      duration: 1500,
    },
    {
      id: 'LOG020',
      timestamp: '2026-05-02 15:05:30',
      operator: '陈静',
      operatorRole: '医生',
      operationType: '物资申领',
      operationContent: '申领检查物资',
      targetType: '物资',
      targetId: 'MAT001',
      targetName: 'CT胶片',
      result: '部分成功',
      ipAddress: '192.168.1.105',
      deviceInfo: 'Chrome 125.0 / Windows 10',
      details: '申请数量：50张，实际批准：30张（库存不足）',
      duration: 3200,
    },
  ];
  return logs;
};

// 操作类型图标映射
const getOperationIcon = (type: OperationType) => {
  const icons: Record<OperationType, React.ReactNode> = {
    '登录': <LogIn size={14} />,
    '登出': <LogOut size={14} />,
    '新建': <Plus size={14} />,
    '编辑': <Edit2 size={14} />,
    '删除': <Trash2 size={14} />,
    '查看': <Eye size={14} />,
    '签到': <ClipboardCheck size={14} />,
    '取消预约': <X size={14} />,
    '改签': <CalendarCheck size={14} />,
    '确认预约': <CheckCircle size={14} />,
    '完成检查': <CheckCircle size={14} />,
    '设备启用': <Monitor size={14} />,
    '设备停用': <Monitor size={14} />,
    '设备维护': <Settings size={14} />,
    '排班调整': <Clock size={14} />,
    '报告撰写': <FileText size={14} />,
    '报告审核': <FileCheck size={14} />,
    '危急值通知': <AlertTriangle size={14} />,
    '物资申领': <Package size={14} />,
    '系统设置': <Settings size={14} />,
    '数据导出': <Download size={14} />,
    '数据导入': <Download size={14} />,
  };
  return icons[type] || <FileText size={14} />;
};

// 操作类型颜色映射
const getOperationColor = (type: OperationType): { bg: string; text: string; border: string } => {
  const colors: Record<OperationType, { bg: string; text: string; border: string }> = {
    '登录': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    '登出': { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
    '新建': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    '编辑': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    '删除': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    '查看': { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
    '签到': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    '取消预约': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    '改签': { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
    '确认预约': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    '完成检查': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    '设备启用': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    '设备停用': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    '设备维护': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    '排班调整': { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
    '报告撰写': { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
    '报告审核': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    '危急值通知': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    '物资申领': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    '系统设置': { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
    '数据导出': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    '数据导入': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  };
  return colors[type] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
};

// 结果颜色映射
const RESULT_COLORS = {
  '成功': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  '失败': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  '部分成功': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
};

// 操作类型选项
const OPERATION_TYPES: OperationType[] = [
  '登录', '登出', '新建', '编辑', '删除', '查看',
  '签到', '取消预约', '改签', '确认预约', '完成检查',
  '设备启用', '设备停用', '设备维护', '排班调整',
  '报告撰写', '报告审核', '危急值通知', '物资申领',
  '系统设置', '数据导出', '数据导入',
];

// 角色选项
const ROLES = ['全部', '管理员', '医生', '技师', '护士', '前台'];

// 结果选项
const RESULTS = ['全部', '成功', '失败', '部分成功'];

// ============================================================
// 组件Props
// ============================================================
interface OperationLogPageProps {
  currentRole: string;
}

// ============================================================
// 主组件
// ============================================================
export default function OperationLogPage({ currentRole }: OperationLogPageProps) {
  const [logs] = useState<OperationLog[]>(generateMockLogs());
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('全部');
  const [filterRole, setFilterRole] = useState<string>('全部');
  const [filterResult, setFilterResult] = useState<string>('全部');
  const [filterDate, setFilterDate] = useState<string>('2026-05-02');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 筛选后的日志列表
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchText === '' ||
        log.operator.includes(searchText) ||
        log.operationContent.includes(searchText) ||
        log.targetName.includes(searchText) ||
        log.targetId.includes(searchText);
      const matchesType = filterType === '全部' || log.operationType === filterType;
      const matchesRole = filterRole === '全部' || log.operatorRole === filterRole;
      const matchesResult = filterResult === '全部' || log.result === filterResult;
      const matchesDate = filterDate === '' || log.timestamp.startsWith(filterDate);
      return matchesSearch && matchesType && matchesRole && matchesResult && matchesDate;
    });
  }, [logs, searchText, filterType, filterRole, filterResult, filterDate]);

  // 统计数据
  const statistics = useMemo(() => {
    return {
      total: filteredLogs.length,
      success: filteredLogs.filter(l => l.result === '成功').length,
      failed: filteredLogs.filter(l => l.result === '失败').length,
      partial: filteredLogs.filter(l => l.result === '部分成功').length,
      todayTotal: logs.filter(l => l.timestamp.startsWith('2026-05-02')).length,
    };
  }, [filteredLogs, logs]);

  // 处理查看详情
  const handleViewDetail = (log: OperationLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // 格式化时长
  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.primary, margin: 0 }}>操作日志</h1>
          <p style={{ fontSize: 13, color: C.textMid, margin: '4px 0 0 0' }}>记录系统所有操作行为</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: '#fff', color: C.primary,
              border: `1px solid ${C.primary}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Download size={16} /> 导出日志
          </button>
          <button
            onClick={() => {}}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: C.primary, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} /> 刷新
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '日志总数', value: statistics.total, color: C.primary },
          { label: '今日日志', value: statistics.todayTotal, color: C.info },
          { label: '成功操作', value: statistics.success, color: C.success },
          { label: '失败操作', value: statistics.failed, color: C.danger },
          { label: '部分成功', value: statistics.partial, color: C.warning },
        ].map(stat => (
          <div key={stat.label} style={{
            background: C.white, borderRadius: 10, padding: '14px 16px',
            border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div style={{
        background: C.white, borderRadius: 10, padding: '16px 20px', marginBottom: 16,
        border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 搜索框 */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
            <input
              type="text"
              placeholder="搜索操作人/内容/对象..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 38px', border: `1px solid ${C.border}`,
                borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 日期筛选 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} color={C.textMid} />
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{ padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none' }}
            />
          </div>

          {/* 操作类型筛选 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.white, cursor: 'pointer',
              }}
            >
              <Filter size={14} /> {filterType} <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, background: C.white,
                border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, maxHeight: 300, overflowY: 'auto', minWidth: 150,
              }}>
                <div
                  onClick={() => { setFilterType('全部'); setShowFilterDropdown(false); }}
                  style={{
                    padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                    background: filterType === '全部' ? C.bg : C.white,
                  }}
                >
                  全部
                </div>
                {OPERATION_TYPES.map(type => (
                  <div
                    key={type}
                    onClick={() => { setFilterType(type); setShowFilterDropdown(false); }}
                    style={{
                      padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                      background: filterType === type ? C.bg : C.white,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {getOperationIcon(type)} {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 角色筛选 */}
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            style={{ padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none' }}
          >
            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
          </select>

          {/* 结果筛选 */}
          <select
            value={filterResult}
            onChange={e => setFilterResult(e.target.value)}
            style={{ padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none' }}
          >
            {RESULTS.map(result => <option key={result} value={result}>{result}</option>)}
          </select>

          <div style={{ marginLeft: 'auto', fontSize: 13, color: C.textMid }}>
            共 {filteredLogs.length} 条记录
          </div>
        </div>
      </div>

      {/* 日志列表 */}
      <div style={{
        background: C.white, borderRadius: 10, border: `1px solid ${C.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${C.border}` }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: C.textDark }}>时间</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: C.textDark }}>操作人</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: C.textDark }}>操作类型</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: C.textDark }}>操作内容</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: C.textDark }}>操作对象</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: C.textDark }}>结果</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: C.textDark }}>耗时</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: C.textDark }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => (
              <tr
                key={log.id}
                style={{
                  borderBottom: idx < filteredLogs.length - 1 ? `1px solid #f3f4f6` : 'none',
                  background: log.result === '失败' ? '#fef2f2' : C.white,
                }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500, color: C.textDark }}>{log.timestamp.split(' ')[1]}</div>
                  <div style={{ fontSize: 12, color: C.textLight }}>{log.timestamp.split(' ')[0]}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500, color: C.textDark }}>{log.operator}</div>
                  <div style={{ fontSize: 12, color: C.textLight }}>{log.operatorRole}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: getOperationColor(log.operationType).bg,
                    color: getOperationColor(log.operationType).text,
                    border: `1px solid ${getOperationColor(log.operationType).border}`,
                  }}>
                    {getOperationIcon(log.operationType)} {log.operationType}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ color: C.textDark, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.operationContent}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500, color: C.textDark }}>{log.targetName}</div>
                  <div style={{ fontSize: 12, color: C.textLight }}>{log.targetType} - {log.targetId}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: RESULT_COLORS[log.result].bg,
                    color: RESULT_COLORS[log.result].text,
                    border: `1px solid ${RESULT_COLORS[log.result].border}`,
                  }}>
                    {log.result}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: C.textMid, fontSize: 12 }}>
                  {formatDuration(log.duration)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => handleViewDetail(log)}
                    title="查看详情"
                    style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: C.textMid }}
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textLight }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: 14, margin: 0 }}>暂无日志记录</p>
          </div>
        )}
      </div>

      {/* 详情模态框 */}
      {showDetailModal && selectedLog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: C.white, borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '90vh',
            overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, margin: 0 }}>操作详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}
              >
                <X size={20} color={C.textMid} />
              </button>
            </div>

            {/* 模态框内容 */}
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                {/* 基本信息 */}
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>基本信息</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>日志ID</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>操作时间</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.timestamp}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>操作人</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.operator} ({selectedLog.operatorRole})</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>操作结果</div>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                        background: RESULT_COLORS[selectedLog.result].bg,
                        color: RESULT_COLORS[selectedLog.result].text,
                        border: `1px solid ${RESULT_COLORS[selectedLog.result].border}`,
                      }}>
                        {selectedLog.result}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 操作信息 */}
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>操作信息</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>操作类型</div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                        background: getOperationColor(selectedLog.operationType).bg,
                        color: getOperationColor(selectedLog.operationType).text,
                        border: `1px solid ${getOperationColor(selectedLog.operationType).border}`,
                      }}>
                        {getOperationIcon(selectedLog.operationType)} {selectedLog.operationType}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>操作耗时</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{formatDuration(selectedLog.duration)}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>操作内容</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.operationContent}</div>
                    </div>
                  </div>
                </div>

                {/* 操作对象 */}
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>操作对象</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>对象类型</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.targetType}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>对象ID</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.targetId}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>对象名称</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.targetName}</div>
                    </div>
                  </div>
                </div>

                {/* 详细信息 */}
                {selectedLog.details && (
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>详细信息</div>
                    <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.details}</div>
                  </div>
                )}

                {/* 错误信息 */}
                {selectedLog.errorMessage && (
                  <div style={{ background: '#fef2f2', borderRadius: 8, padding: 16, border: `1px solid ${C.danger}` }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.danger, marginBottom: 12 }}>错误信息</div>
                    <div style={{ fontSize: 13, color: C.danger }}>{selectedLog.errorMessage}</div>
                  </div>
                )}

                {/* 环境信息 */}
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 12 }}>环境信息</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>IP地址</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.ipAddress}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.textLight, marginBottom: 4 }}>设备信息</div>
                      <div style={{ fontSize: 13, color: C.textDark }}>{selectedLog.deviceInfo}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 导出模态框 */}
      {showExportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: C.white, borderRadius: 12, width: '90%', maxWidth: 400,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, margin: 0 }}>导出日志</h3>
              <button
                onClick={() => setShowExportModal(false)}
                style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}
              >
                <X size={20} color={C.textMid} />
              </button>
            </div>

            {/* 模态框内容 */}
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textDark, marginBottom: 6 }}>
                  导出格式
                </label>
                <select
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="json">JSON (.json)</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textDark, marginBottom: 6 }}>
                  日期范围
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  />
                  <span style={{ color: C.textMid }}>至</span>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.textMid }}>
                  将导出 <span style={{ fontWeight: 600, color: C.primary }}>{filteredLogs.length}</span> 条日志记录
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowExportModal(false)}
                  style={{
                    flex: 1, padding: '10px 16px', background: C.white, color: C.textMid,
                    border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  style={{
                    flex: 1, padding: '10px 16px', background: C.primary, color: '#fff',
                    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  确认导出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
