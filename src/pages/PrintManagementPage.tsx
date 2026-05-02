// G006 全院医技检查预约系统 - 打印管理页面
import React, { useState, useMemo } from 'react';
import {
  Search, Printer, Plus, Filter, Calendar, Clock, User, Monitor,
  AlertTriangle, CheckCircle, XCircle, RefreshCw,
  X, ChevronDown, Download, Info, RotateCcw, Square, CheckSquare, Eye
} from 'lucide-react';
import type { Appointment, ReportStatus } from '../types';
import { APPOINTMENTS } from '../data/initialData';

// 打印任务状态
export type PrintStatus = '待打印' | '打印中' | '已打印' | '打印失败' | '已取消';

// 打印任务类型
export type PrintTaskType = '报告打印' | '申请单打印' | '预约单打印' | '凭证打印';

interface PrintTask {
  id: string;
  taskType: PrintTaskType;
  relatedId: string; // 关联的预约ID或报告ID
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  phone: string;
  examItemName: string;
  modality: string;
  deviceName: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  printStatus: PrintStatus;
  printTime?: string;
  printedBy?: string;
  printerName?: string;
  copies: number;
  pageCount: number;
  fileSize?: string;
  isUrgent: boolean;
  notes?: string;
  createdAt: string;
}

// 打印机状态
interface PrinterDevice {
  id: string;
  name: string;
  type: string; // 激光/喷墨/热敏
  location: string;
  status: '在线' | '离线' | '缺纸' | '缺墨' | '故障';
  todayPrintCount: number;
  totalPrintCount: number;
  lastPrintTime?: string;
}

// 打印状态颜色映射
const PRINT_STATUS_COLORS: Record<PrintStatus, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  '待打印': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', icon: <Clock size={14} /> },
  '打印中': { bg: '#dbeafe', text: '#1e40af', border: '#a5b4fc', icon: <RefreshCw size={14} className="animate-spin" /> },
  '已打印': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7', icon: <CheckCircle size={14} /> },
  '打印失败': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', icon: <XCircle size={14} /> },
  '已取消': { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', icon: <X size={14} /> },
};

// 任务类型颜色
const TASK_TYPE_COLORS: Record<PrintTaskType, { bg: string; text: string }> = {
  '报告打印': { bg: '#dbeafe', text: '#1e40af' },
  '申请单打印': { bg: '#f3e8ff', text: '#6b21a8' },
  '预约单打印': { bg: '#d1fae5', text: '#065f46' },
  '凭证打印': { bg: '#fef3c7', text: '#92400e' },
};

// 模拟打印机数据
const MOCK_PRINTERS: PrinterDevice[] = [
  { id: 'PRN001', name: '放射科激光打印机', type: '激光', location: '医技楼1层CT室', status: '在线', todayPrintCount: 156, totalPrintCount: 45890, lastPrintTime: '10:32:15' },
  { id: 'PRN002', name: '超声科喷墨打印机', type: '喷墨', location: '医技楼2层超声室', status: '在线', todayPrintCount: 89, totalPrintCount: 32100, lastPrintTime: '10:28:44' },
  { id: 'PRN003', name: '内镜中心热敏打印机', type: '热敏', location: '门诊楼3层内镜室', status: '缺纸', todayPrintCount: 34, totalPrintCount: 12500, lastPrintTime: '09:15:22' },
  { id: 'PRN004', name: '心电图室激光打印机', type: '激光', location: '门诊楼2层心电图室', status: '在线', todayPrintCount: 112, totalPrintCount: 38900, lastPrintTime: '10:35:01' },
  { id: 'PRN005', name: '前台报告打印机', type: '激光', location: '门诊大厅前台', status: '离线', todayPrintCount: 0, totalPrintCount: 67800 },
];

interface PrintManagementPageProps {
  currentRole: string;
}

export default function PrintManagementPage({ currentRole }: PrintManagementPageProps) {
  const [printTasks, setPrintTasks] = useState<PrintTask[]>(() => {
    // 从已完成或检查中的预约生成打印任务数据
    const baseTasks: PrintTask[] = APPOINTMENTS
      .filter(apt => apt.status === '已完成' || apt.reportStatus === '已审核' || apt.reportStatus === '已打印')
      .slice(0, 12)
      .map((apt, idx) => ({
        id: `PT${String(idx + 1).padStart(4, '0')}`,
        taskType: '报告打印' as PrintTaskType,
        relatedId: apt.id,
        patientId: apt.patientId,
        patientName: apt.patientName,
        gender: apt.gender,
        age: apt.age,
        phone: apt.phone,
        examItemName: apt.examItemName,
        modality: apt.modality,
        deviceName: apt.deviceName,
        departmentName: apt.departmentName,
        appointmentDate: apt.appointmentDate,
        appointmentTime: apt.appointmentTime,
        printStatus: idx < 6 ? '已打印' as PrintStatus : idx < 8 ? '待打印' as PrintStatus : idx < 10 ? '打印失败' as PrintStatus : '已取消' as PrintStatus,
        printTime: idx < 6 ? `${apt.appointmentDate.split('-')[2]} ${String(8 + idx).padStart(2, '0')}:${String(idx * 5).padStart(2, '0')}:00` : undefined,
        printedBy: idx < 6 ? '前台-李梅' : undefined,
        printerName: idx < 6 ? '放射科激光打印机' : undefined,
        copies: 1,
        pageCount: apt.modality === 'CT' || apt.modality === 'MRI' ? 2 : 1,
        fileSize: apt.modality === 'CT' || apt.modality === 'MRI' ? '2.4MB' : '856KB',
        isUrgent: apt.isUrgent,
        notes: apt.isUrgent ? '加急报告' : '',
        createdAt: apt.appointmentDate + ' ' + (idx < 10 ? `${String(8 + idx).padStart(2, '0')}:00:00` : '14:00:00'),
      }));

    // 添加一些其他类型的打印任务
    const additionalTasks: PrintTask[] = [
      { id: 'PT0013', taskType: '预约单打印', relatedId: 'APT001', patientId: 'P001', patientName: '李建国', gender: '男', age: 58, phone: '13812345601', examItemName: '头颅CT平扫', modality: 'CT', deviceName: 'CT-01', departmentName: '放射科', appointmentDate: '2026-05-02', appointmentTime: '08:00-09:00', printStatus: '已打印', printTime: '2026-05-02 07:45:00', printedBy: '前台-王芳', printerName: '前台报告打印机', copies: 2, pageCount: 1, fileSize: '124KB', isUrgent: false, createdAt: '2026-05-02 07:40:00' },
      { id: 'PT0014', taskType: '申请单打印', relatedId: 'APT003', patientId: 'P003', patientName: '张伟', gender: '男', age: 32, phone: '13712345603', examItemName: '冠脉CTA', modality: 'CT', deviceName: 'CT-01', departmentName: '放射科', appointmentDate: '2026-05-02', appointmentTime: '10:00-11:00', printStatus: '待打印', copies: 1, pageCount: 1, fileSize: '98KB', isUrgent: true, notes: '住院患者申请单', createdAt: '2026-05-02 09:30:00' },
      { id: 'PT0015', taskType: '凭证打印', relatedId: 'APT005', patientId: 'P005', patientName: '陈强', gender: '男', age: 28, phone: '13512345605', examItemName: '常规十二导联心电图', modality: '心电', deviceName: '心电图-01', departmentName: '心电图室', appointmentDate: '2026-05-02', appointmentTime: '08:30-09:00', printStatus: '已打印', printTime: '2026-05-02 08:20:00', printedBy: '前台-李梅', printerName: '心电图室激光打印机', copies: 1, pageCount: 1, fileSize: '65KB', isUrgent: false, createdAt: '2026-05-02 08:15:00' },
    ];

    return [...baseTasks, ...additionalTasks];
  });

  const [printers] = useState<PrinterDevice[]>(MOCK_PRINTERS);

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('全部');
  const [filterTaskType, setFilterTaskType] = useState<string>('全部');
  const [filterDate, setFilterDate] = useState<string>('2026-05-02');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'history' | 'printer'>('view');
  const [selectedTask, setSelectedTask] = useState<PrintTask | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // 筛选后的打印任务列表
  const filteredTasks = useMemo(() => {
    return printTasks.filter(task => {
      const matchesSearch = searchText === '' ||
        task.patientName.includes(searchText) ||
        task.id.includes(searchText) ||
        task.relatedId.includes(searchText) ||
        task.phone.includes(searchText) ||
        task.examItemName.includes(searchText);
      const matchesStatus = filterStatus === '全部' || task.printStatus === filterStatus;
      const matchesTaskType = filterTaskType === '全部' || task.taskType === filterTaskType;
      const matchesDate = filterDate === '' || task.appointmentDate === filterDate;
      return matchesSearch && matchesStatus && matchesTaskType && matchesDate;
    });
  }, [printTasks, searchText, filterStatus, filterTaskType, filterDate]);

  // 统计数据
  const statistics = useMemo(() => {
    const todayTasks = printTasks.filter(t => t.appointmentDate === filterDate);
    return {
      total: todayTasks.length,
      pending: todayTasks.filter(t => t.printStatus === '待打印').length,
      printing: todayTasks.filter(t => t.printStatus === '打印中').length,
      printed: todayTasks.filter(t => t.printStatus === '已打印').length,
      failed: todayTasks.filter(t => t.printStatus === '打印失败').length,
      cancelled: todayTasks.filter(t => t.printStatus === '已取消').length,
      urgentCount: todayTasks.filter(t => t.isUrgent && t.printStatus !== '已打印' && t.printStatus !== '已取消').length,
      totalPages: todayTasks.filter(t => t.printStatus === '已打印').reduce((sum, t) => sum + t.pageCount * t.copies, 0),
    };
  }, [printTasks, filterDate]);

  // 打印机统计数据
  const printerStats = useMemo(() => {
    return {
      total: printers.length,
      online: printers.filter(p => p.status === '在线').length,
      offline: printers.filter(p => p.status === '离线').length,
      error: printers.filter(p => p.status === '缺纸' || p.status === '缺墨' || p.status === '故障').length,
      todayTotalPrints: printers.reduce((sum, p) => sum + p.todayPrintCount, 0),
    };
  }, [printers]);

  const handleView = (task: PrintTask) => {
    setSelectedTask(task);
    setModalType('view');
    setShowModal(true);
  };

  const handleReprint = (task: PrintTask) => {
    setPrintTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, printStatus: '待打印' as PrintStatus, printTime: undefined } : t
    ));
  };

  const handleCancel = (taskId: string) => {
    if (confirm('确定要取消此打印任务吗？')) {
      setPrintTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, printStatus: '已取消' as PrintStatus } : t
      ));
    }
  };

  const handleBatchPrint = () => {
    if (selectedTasks.size === 0) {
      alert('请先选择要打印的任务');
      return;
    }
    setPrintTasks(prev => prev.map(t =>
      selectedTasks.has(t.id) && t.printStatus === '待打印' ? { ...t, printStatus: '打印中' as PrintStatus } : t
    ));
    // 模拟打印完成后更新状态
    setTimeout(() => {
      setPrintTasks(prev => prev.map(t =>
        selectedTasks.has(t.id) && t.printStatus === '打印中' ? { ...t, printStatus: '已打印' as PrintStatus, printTime: new Date().toLocaleString(), printedBy: currentRole } : t
      ));
    }, 2000);
    setSelectedTasks(new Set());
  };

  const handleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    const pendingTasks = filteredTasks.filter(t => t.printStatus === '待打印');
    if (selectedTasks.size === pendingTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(pendingTasks.map(t => t.id)));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', margin: 0 }}>打印管理</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>管理检查报告、申请单及预约单的打印任务</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setModalType('printer'); setShowModal(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: '#fff', color: '#374151',
              border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Printer size={16} /> 打印机管理
          </button>
          <button
            onClick={() => { setModalType('history'); setShowModal(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: '#fff', color: '#374151',
              border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Clock size={16} /> 打印历史
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '今日任务', value: statistics.total, color: '#1e40af' },
          { label: '待打印', value: statistics.pending, color: '#f59e0b' },
          { label: '打印中', value: statistics.printing, color: '#3b82f6' },
          { label: '已打印', value: statistics.printed, color: '#10b981' },
          { label: '打印失败', value: statistics.failed, color: '#ef4444' },
          { label: '已取消', value: statistics.cancelled, color: '#6b7280' },
          { label: '加急任务', value: statistics.urgentCount, color: '#dc2626' },
          { label: '总页数', value: statistics.totalPages, color: '#8b5cf6' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px',
            border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 搜索框 */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="搜索患者姓名/任务号/预约号/手机..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #e5e7eb',
                borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 日期筛选 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} color='#6b7280' />
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
            />
          </div>

          {/* 状态筛选 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer',
              }}
            >
              <Filter size={14} /> {filterStatus} <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff',
                border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, minWidth: 120,
              }}>
                {['全部', '待打印', '打印中', '已打印', '打印失败', '已取消'].map(status => (
                  <div
                    key={status}
                    onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                    style={{
                      padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                      background: filterStatus === status ? '#f3f4f6' : '#fff',
                    }}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 任务类型筛选 */}
          <select
            value={filterTaskType}
            onChange={e => setFilterTaskType(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
          >
            <option value="全部">全部类型</option>
            <option value="报告打印">报告打印</option>
            <option value="申请单打印">申请单打印</option>
            <option value="预约单打印">预约单打印</option>
            <option value="凭证打印">凭证打印</option>
          </select>

          {/* 批量打印按钮 */}
          {selectedTasks.size > 0 && (
            <button
              onClick={handleBatchPrint}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', background: '#10b981', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Printer size={16} /> 批量打印 ({selectedTasks.size})
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
            共 {filteredTasks.length} 条任务
          </div>
        </div>
      </div>

      {/* 打印任务列表表格 */}
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', width: 40 }}>
                <button
                  onClick={handleSelectAll}
                  style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  {selectedTasks.size === filteredTasks.filter(t => t.printStatus === '待打印').length && filteredTasks.filter(t => t.printStatus === '待打印').length > 0 ? (
                    <CheckSquare size={16} color='#1e40af' />
                  ) : (
                    <Square size={16} color='#9ca3af' />
                  )}
                </button>
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>任务信息</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>患者信息</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>检查项目</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>任务类型</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>打印状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, idx) => (
              <tr
                key={task.id}
                style={{
                  borderBottom: idx < filteredTasks.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: task.isUrgent ? '#fef3c7' : '#fff',
                }}
              >
                <td style={{ padding: '12px 16px' }}>
                  {task.printStatus === '待打印' && (
                    <button
                      onClick={() => handleSelectTask(task.id)}
                      style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                      {selectedTasks.has(task.id) ? (
                        <CheckSquare size={16} color='#1e40af' />
                      ) : (
                        <Square size={16} color='#9ca3af' />
                      )}
                    </button>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{task.id}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    创建: {task.createdAt}
                  </div>
                  {task.isUrgent && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <AlertTriangle size={12} color='#dc2626' />
                      <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>加急</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{task.patientName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {task.gender} | {task.age}岁 | {task.phone}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{task.examItemName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: 4, fontSize: 11,
                      background: '#e0e7ff', color: '#3730a3',
                    }}>
                      {task.modality}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    <Monitor size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {task.deviceName}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: TASK_TYPE_COLORS[task.taskType].bg,
                    color: TASK_TYPE_COLORS[task.taskType].text,
                  }}>
                    {task.taskType}
                  </span>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                    {task.pageCount}页 x {task.copies}份
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: PRINT_STATUS_COLORS[task.printStatus].bg,
                    color: PRINT_STATUS_COLORS[task.printStatus].text,
                    border: `1px solid ${PRINT_STATUS_COLORS[task.printStatus].border}`,
                  }}>
                    {PRINT_STATUS_COLORS[task.printStatus].icon}
                    {task.printStatus}
                  </span>
                  {task.printTime && (
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                      {task.printTime}
                    </div>
                  )}
                  {task.printedBy && (
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                      操作员: {task.printedBy}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleView(task)}
                      title="查看详情"
                      style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                    >
                      <Eye size={16} />
                    </button>
                    {task.printStatus === '待打印' && (
                      <button
                        onClick={() => handleReprint(task)}
                        title="重新打印"
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                    {task.printStatus === '打印失败' && (
                      <button
                        onClick={() => handleReprint(task)}
                        title="重试打印"
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#ef4444' }}
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                    {task.printStatus === '待打印' && (
                      <button
                        onClick={() => handleCancel(task.id)}
                        title="取消任务"
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#ef4444' }}
                      >
                        <X size={16} />
                      </button>
                    )}
                    {task.printStatus === '已打印' && (
                      <button
                        onClick={() => handleReprint(task)}
                        title="补打"
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                      >
                        <Printer size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <Printer size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: 14, margin: 0 }}>暂无打印任务</p>
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: modalType === 'printer' ? 800 : 600, maxHeight: '90vh',
            overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                {modalType === 'view' ? '打印任务详情' : modalType === 'history' ? '打印历史记录' : '打印机管理'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}
              >
                <X size={20} color='#6b7280' />
              </button>
            </div>

            {/* 模态框内容 */}
            <div style={{ padding: 20 }}>
              {modalType === 'view' && selectedTask ? (
                // 打印任务详情
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>任务编号</label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedTask.id}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>任务类型</label>
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: TASK_TYPE_COLORS[selectedTask.taskType].bg,
                        color: TASK_TYPE_COLORS[selectedTask.taskType].text,
                      }}>
                        {selectedTask.taskType}
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>患者姓名</label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedTask.patientName}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>打印状态</label>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: PRINT_STATUS_COLORS[selectedTask.printStatus].bg,
                        color: PRINT_STATUS_COLORS[selectedTask.printStatus].text,
                        border: `1px solid ${PRINT_STATUS_COLORS[selectedTask.printStatus].border}`,
                      }}>
                        {PRINT_STATUS_COLORS[selectedTask.printStatus].icon}
                        {selectedTask.printStatus}
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>检查项目</label>
                      <div style={{ fontSize: 14, color: '#111827' }}>{selectedTask.examItemName}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>设备/科室</label>
                      <div style={{ fontSize: 14, color: '#111827' }}>{selectedTask.deviceName} / {selectedTask.departmentName}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>预约时间</label>
                      <div style={{ fontSize: 14, color: '#111827' }}>{selectedTask.appointmentDate} {selectedTask.appointmentTime}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>份数/页数</label>
                      <div style={{ fontSize: 14, color: '#111827' }}>{selectedTask.copies} 份 x {selectedTask.pageCount} 页</div>
                    </div>
                    {selectedTask.printTime && (
                      <>
                        <div>
                          <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>打印时间</label>
                          <div style={{ fontSize: 14, color: '#111827' }}>{selectedTask.printTime}</div>
                        </div>
                        <div>
                          <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>操作员</label>
                          <div style={{ fontSize: 14, color: '#111827' }}>{selectedTask.printedBy}</div>
                        </div>
                      </>
                    )}
                    {selectedTask.printerName && (
                      <div>
                        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>使用打印机</label>
                        <div style={{ fontSize: 14, color: '#111827' }}>{selectedTask.printerName}</div>
                      </div>
                    )}
                    {selectedTask.notes && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>备注</label>
                        <div style={{ fontSize: 14, color: '#111827' }}>{selectedTask.notes}</div>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                    {selectedTask.printStatus === '待打印' && (
                      <>
                        <button
                          onClick={() => handleReprint(selectedTask)}
                          style={{
                            padding: '10px 20px', background: '#10b981', color: '#fff',
                            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          <Printer size={16} style={{ display: 'inline', marginRight: 6 }} /> 立即打印
                        </button>
                        <button
                          onClick={() => { handleCancel(selectedTask.id); setShowModal(false); }}
                          style={{
                            padding: '10px 20px', background: '#fff', color: '#ef4444',
                            border: '1px solid #ef4444', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          取消任务
                        </button>
                      </>
                    )}
                    {selectedTask.printStatus === '打印失败' && (
                      <button
                        onClick={() => { handleReprint(selectedTask); setShowModal(false); }}
                        style={{
                          padding: '10px 20px', background: '#ef4444', color: '#fff',
                          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <RefreshCw size={16} style={{ display: 'inline', marginRight: 6 }} /> 重试打印
                      </button>
                    )}
                    {selectedTask.printStatus === '已打印' && (
                      <button
                        onClick={() => { handleReprint(selectedTask); setShowModal(false); }}
                        style={{
                          padding: '10px 20px', background: '#1e40af', color: '#fff',
                          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <Printer size={16} style={{ display: 'inline', marginRight: 6 }} /> 补打报告
                      </button>
                    )}
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '10px 20px', background: '#fff', color: '#374151',
                        border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      关闭
                    </button>
                  </div>
                </div>
              ) : modalType === 'history' ? (
                // 打印历史
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Info size={16} color='#6b7280' />
                      <span style={{ fontSize: 13, color: '#6b7280' }}>显示最近30天的打印记录</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>今日打印</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e40af' }}>{statistics.printed}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>本周打印</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{statistics.printed * 7}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>本月打印</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{statistics.printed * 30}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>总页数</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#8b5cf6' }}>{statistics.totalPages * 30}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>任务号</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>患者</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>类型</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>打印时间</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>操作员</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printTasks.filter(t => t.printStatus === '已打印').map(task => (
                          <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '10px 12px', color: '#1e40af', fontWeight: 500 }}>{task.id}</td>
                            <td style={{ padding: '10px 12px' }}>{task.patientName}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                padding: '2px 6px', borderRadius: 4, fontSize: 11,
                                background: TASK_TYPE_COLORS[task.taskType].bg,
                                color: TASK_TYPE_COLORS[task.taskType].text,
                              }}>
                                {task.taskType}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#6b7280' }}>{task.printTime}</td>
                            <td style={{ padding: '10px 12px', color: '#6b7280' }}>{task.printedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
                    <button
                      style={{
                        padding: '10px 20px', background: '#1e40af', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <Download size={16} style={{ display: 'inline', marginRight: 6 }} /> 导出报表
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '10px 20px', background: '#fff', color: '#374151',
                        border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      关闭
                    </button>
                  </div>
                </div>
              ) : (
                // 打印机管理
                <div>
                  {/* 打印机统计 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#d1fae5', padding: '12px 16px', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: '#065f46' }}>在线</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#065f46' }}>{printerStats.online}</div>
                    </div>
                    <div style={{ background: '#fee2e2', padding: '12px 16px', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: '#991b1b' }}>离线</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#991b1b' }}>{printerStats.offline}</div>
                    </div>
                    <div style={{ background: '#fef3c7', padding: '12px 16px', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: '#92400e' }}>异常</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#92400e' }}>{printerStats.error}</div>
                    </div>
                    <div style={{ background: '#e0e7ff', padding: '12px 16px', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: '#3730a3' }}>今日打印</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#3730a3' }}>{printerStats.todayTotalPrints}</div>
                    </div>
                  </div>

                  {/* 打印机列表 */}
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {printers.map(printer => (
                      <div
                        key={printer.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '16px', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 12,
                          background: printer.status === '离线' ? '#fef2f2' : printer.status === '在线' ? '#fff' : '#fffbeb',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 10, background: '#e0e7ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Printer size={24} color='#3730a3' />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{printer.name}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                              {printer.type} | {printer.location}
                            </div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                              今日: {printer.todayPrintCount} 张 | 累计: {printer.totalPrintCount.toLocaleString()} 张
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                              background: printer.status === '在线' ? '#d1fae5' : printer.status === '离线' ? '#fee2e2' : '#fef3c7',
                              color: printer.status === '在线' ? '#065f46' : printer.status === '离线' ? '#991b1b' : '#92400e',
                            }}>
                              {printer.status === '在线' ? <CheckCircle size={12} /> : printer.status === '离线' ? <XCircle size={12} /> : <AlertTriangle size={12} />}
                              {printer.status}
                            </span>
                            {printer.lastPrintTime && (
                              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                                最后打印: {printer.lastPrintTime}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {printer.status === '在线' && (
                              <button
                                style={{
                                  padding: '8px 12px', background: '#10b981', color: '#fff',
                                  border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                }}
                              >
                                测试打印
                              </button>
                            )}
                            {printer.status === '缺纸' && (
                              <button
                                style={{
                                  padding: '8px 12px', background: '#f59e0b', color: '#fff',
                                  border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                }}
                              >
                                已补纸
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '10px 20px', background: '#fff', color: '#374151',
                        border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      关闭
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
