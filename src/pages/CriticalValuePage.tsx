// G006 全院医技检查预约系统 - 危急值管理页面
import React, { useState, useMemo } from 'react';
import {
  Search, AlertTriangle, Clock, User, Phone, Calendar, Monitor,
  CheckCircle, XCircle, Eye, RefreshCw, X, ChevronDown,
  Bell, BellOff, FileText, UserCheck, PhoneCall, MessageSquare,
  CheckSquare, Square, Filter, Building2
} from 'lucide-react';
import { APPOINTMENTS, DEVICES, DEPARTMENTS, EXAM_ITEMS } from '../data/initialData';

// 危急值状态
type CriticalValueStatus = '待处理' | '已通知' | '已确认' | '已处理';
type HandleMethod = '电话通知' | '短信通知' | '现场告知' | '其他';

interface CriticalValueRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  phone: string;
  idCard: string;
  examItemId: string;
  examItemName: string;
  modality: string;
  deviceId: string;
  deviceName: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  criticalType: string; // 危急值类型
  criticalContent: string; // 危急值内容
  criticalValue: string; // 危急值数值
  normalRange: string; // 正常范围
  severity: '高危' | '紧急' | '严重';
  status: CriticalValueStatus;
  discoveredTime: string; // 发现时间
  notifiedTime?: string; // 通知时间
  confirmedTime?: string; // 确认时间
  handledTime?: string; // 处理时间
  handleMethod?: HandleMethod;
  handler?: string; // 处理人
  handlerRole?: string; // 处理人角色
  notifyDoctor?: string; // 通知医生
  notifyContent?: string; // 通知内容
  notes?: string; // 备注
  isUrgent: boolean;
}

// 危急值类型配置
const CRITICAL_TYPES: Record<string, { color: string; examples: string[] }> = {
  '血氧饱和度': { color: '#dc2626', examples: ['SpO2 < 90%', 'SpO2 < 85%'] },
  '心率': { color: '#f59e0b', examples: ['HR > 150bpm', 'HR < 40bpm'] },
  '血压': { color: '#7c3aed', examples: ['SBP > 180mmHg', 'SBP < 90mmHg'] },
  '血糖': { color: '#2563eb', examples: ['Glu > 28mmol/L', 'Glu < 2.8mmol/L'] },
  '体温': { color: '#dc2626', examples: ['T > 42°C', 'T < 35°C'] },
  'CT发现': { color: '#991b1b', examples: ['主动脉夹层', '气胸>30%'] },
  'MRI发现': { color: '#7c3aed', examples: ['脑疝', '大面积脑梗死'] },
  '超声发现': { color: '#dc2626', examples: ['宫外孕破裂', '主动脉瘤破裂'] },
  '心电图': { color: '#f59e0b', examples: ['急性心梗', '恶性心律失常'] },
  '其他': { color: '#6b7280', examples: [] },
};

// 状态颜色映射
const STATUS_COLORS: Record<CriticalValueStatus, { bg: string; text: string; border: string }> = {
  '待处理': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  '已通知': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  '已确认': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  '已处理': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
};

// 严重程度颜色
const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '高危': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  '紧急': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  '严重': { bg: '#f3e8ff', text: '#7c3aed', border: '#c4b5fd' },
};

// 初始危急值数据
const initialCriticalValues: CriticalValueRecord[] = [
  {
    id: 'CV001',
    appointmentId: 'APT002',
    patientId: 'P002',
    patientName: '王秀英',
    gender: '女',
    age: 45,
    phone: '13912345602',
    idCard: '310102197911022345',
    examItemId: 'EI002',
    examItemName: '胸部CT平扫',
    modality: 'CT',
    deviceId: 'DEV001',
    deviceName: 'CT-01',
    departmentId: 'D001',
    departmentName: '放射科',
    doctorId: 'DOC001',
    doctorName: '张伟',
    appointmentDate: '2026-05-02',
    appointmentTime: '09:00-10:00',
    criticalType: 'CT发现',
    criticalContent: '左侧气胸，左肺压缩约35%',
    criticalValue: '气胸35%',
    normalRange: '无气胸',
    severity: '紧急',
    status: '已通知',
    discoveredTime: '2026-05-02 09:15:00',
    notifiedTime: '2026-05-02 09:18:00',
    handleMethod: '电话通知',
    handler: '刘建国',
    handlerRole: '技师',
    notifyDoctor: '呼吸内科值班',
    notifyContent: '患者王秀英CT检查发现左侧气胸35%，请紧急会诊',
    isUrgent: false,
    notes: '患者有COPD病史',
  },
  {
    id: 'CV002',
    appointmentId: 'APT004',
    patientId: 'P004',
    patientName: '刘芳',
    gender: '女',
    age: 67,
    phone: '13612345604',
    idCard: '310104195901044567',
    examItemId: 'EI007',
    examItemName: '腹部肝胆脾胰超声',
    modality: '超声',
    deviceId: 'DEV005',
    deviceName: '超声-01',
    departmentId: 'D002',
    departmentName: '超声医学科',
    doctorId: 'DOC003',
    doctorName: '王芳',
    appointmentDate: '2026-05-02',
    appointmentTime: '08:00-09:00',
    criticalType: '超声发现',
    criticalContent: '腹部超声未见明显异常',
    criticalValue: '未见异常',
    normalRange: '正常',
    severity: '严重',
    status: '已处理',
    discoveredTime: '2026-05-02 08:20:00',
    notifiedTime: '2026-05-02 08:25:00',
    confirmedTime: '2026-05-02 08:30:00',
    handledTime: '2026-05-02 08:45:00',
    handleMethod: '现场告知',
    handler: '王芳',
    handlerRole: '医生',
    notes: '体检患者，无明显异常',
    isUrgent: false,
  },
  {
    id: 'CV003',
    appointmentId: 'APT001',
    patientId: 'P001',
    patientName: '李建国',
    gender: '男',
    age: 58,
    phone: '13812345601',
    idCard: '310101196801011234',
    examItemId: 'EI001',
    examItemName: '头颅CT平扫',
    modality: 'CT',
    deviceId: 'DEV001',
    deviceName: 'CT-01',
    departmentId: 'D001',
    departmentName: '放射科',
    doctorId: 'DOC001',
    doctorName: '张伟',
    appointmentDate: '2026-05-02',
    appointmentTime: '08:00-09:00',
    criticalType: 'CT发现',
    criticalContent: '右侧大脑中动脉瘤破裂出血',
    criticalValue: '动脉瘤破裂',
    normalRange: '无动脉瘤',
    severity: '高危',
    status: '待处理',
    discoveredTime: '2026-05-02 08:10:00',
    handleMethod: '电话通知',
    handler: '刘建国',
    handlerRole: '技师',
    notifyDoctor: '神经外科值班',
    notifyContent: '患者李建国头颅CT发现右侧大脑中动脉瘤破裂出血，请紧急会诊',
    isUrgent: true,
    notes: '患者有高血压病史，血压180/110mmHg',
  },
  {
    id: 'CV004',
    appointmentId: 'APT005',
    patientId: 'P005',
    patientName: '陈强',
    gender: '男',
    age: 28,
    phone: '13512345605',
    idCard: '310105199801055678',
    examItemId: 'EI012',
    examItemName: '常规十二导联心电图',
    modality: '心电',
    deviceId: 'DEV008',
    deviceName: '心电图-01',
    departmentId: 'D004',
    departmentName: '心电图室',
    doctorId: 'DOC004',
    doctorName: '赵敏',
    appointmentDate: '2026-05-02',
    appointmentTime: '08:30-09:00',
    criticalType: '心电图',
    criticalContent: '急性下壁心肌梗死',
    criticalValue: 'V1-V5 ST段抬高',
    normalRange: '正常心电图',
    severity: '高危',
    status: '已确认',
    discoveredTime: '2026-05-02 08:35:00',
    notifiedTime: '2026-05-02 08:36:00',
    confirmedTime: '2026-05-02 08:40:00',
    handleMethod: '电话通知',
    handler: '赵敏',
    handlerRole: '医生',
    notifyDoctor: '心内科值班',
    notifyContent: '患者陈强心电图示急性下壁心肌梗死，请紧急会诊',
    isUrgent: true,
    notes: '已口服阿司匹林300mg',
  },
  {
    id: 'CV005',
    appointmentId: 'APT010',
    patientId: 'P010',
    patientName: '郑静',
    gender: '女',
    age: 62,
    phone: '13012345610',
    idCard: '310110196401101123',
    examItemId: 'EI003',
    examItemName: '腹部CT平扫',
    modality: 'CT',
    deviceId: 'DEV002',
    deviceName: 'CT-02',
    departmentId: 'D001',
    departmentName: '放射科',
    doctorId: 'DOC001',
    doctorName: '张伟',
    appointmentDate: '2026-05-02',
    appointmentTime: '14:00-15:00',
    criticalType: 'CT发现',
    criticalContent: '急性胰腺炎伴胰周渗出',
    criticalValue: '胰腺肿大，周围渗出',
    normalRange: '胰腺形态正常',
    severity: '紧急',
    status: '待处理',
    discoveredTime: '2026-05-02 14:30:00',
    handleMethod: '短信通知',
    handler: '王磊',
    handlerRole: '技师',
    notifyDoctor: '消化内科值班',
    notifyContent: '患者郑静腹部CT示急性胰腺炎，请会诊',
    notes: '患者腹痛待查',
    isUrgent: true,
  },
];

interface CriticalValuePageProps {
  currentRole: string;
}

export default function CriticalValuePage({ currentRole }: CriticalValuePageProps) {
  const [criticalValues, setCriticalValues] = useState<CriticalValueRecord[]>(initialCriticalValues);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('全部');
  const [filterSeverity, setFilterSeverity] = useState<string>('全部');
  const [filterModality, setFilterModality] = useState<string>('全部');
  const [filterDate, setFilterDate] = useState<string>('2026-05-02');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'handle' | 'notify'>('view');
  const [selectedRecord, setSelectedRecord] = useState<CriticalValueRecord | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);

  // 筛选后的危急值记录
  const filteredRecords = useMemo(() => {
    return criticalValues.filter(record => {
      const matchesSearch = searchText === '' ||
        record.patientName.includes(searchText) ||
        record.id.includes(searchText) ||
        record.appointmentId.includes(searchText) ||
        record.phone.includes(searchText) ||
        record.criticalType.includes(searchText) ||
        record.criticalContent.includes(searchText);
      const matchesStatus = filterStatus === '全部' || record.status === filterStatus;
      const matchesSeverity = filterSeverity === '全部' || record.severity === filterSeverity;
      const matchesModality = filterModality === '全部' || record.modality === filterModality;
      const matchesDate = filterDate === '' || record.appointmentDate === filterDate;
      return matchesSearch && matchesStatus && matchesSeverity && matchesModality && matchesDate;
    });
  }, [criticalValues, searchText, filterStatus, filterSeverity, filterModality, filterDate]);

  // 统计数据
  const statistics = useMemo(() => {
    const todayRecords = criticalValues.filter(r => r.appointmentDate === filterDate);
    return {
      total: todayRecords.length,
      pending: todayRecords.filter(r => r.status === '待处理').length,
      notified: todayRecords.filter(r => r.status === '已通知').length,
      confirmed: todayRecords.filter(r => r.status === '已确认').length,
      handled: todayRecords.filter(r => r.status === '已处理').length,
      highRisk: todayRecords.filter(r => r.severity === '高危' && r.status !== '已处理').length,
      urgent: todayRecords.filter(r => r.severity === '紧急' && r.status !== '已处理').length,
    };
  }, [criticalValues, filterDate]);

  // 查看详情
  const handleView = (record: CriticalValueRecord) => {
    setSelectedRecord(record);
    setModalType('view');
    setShowModal(true);
  };

  // 处理危急值
  const handleProcess = (record: CriticalValueRecord) => {
    setSelectedRecord(record);
    setModalType('handle');
    setShowModal(true);
  };

  // 通知
  const handleNotify = (record: CriticalValueRecord) => {
    setSelectedRecord(record);
    setModalType('notify');
    setShowModal(true);
  };

  // 状态更新
  const handleStatusChange = (recordId: string, newStatus: CriticalValueStatus, updates?: Partial<CriticalValueRecord>) => {
    setCriticalValues(prev => prev.map(record => {
      if (record.id !== recordId) return record;
      const now = new Date().toLocaleString('zh-CN');
      let updatesWithTime: Partial<CriticalValueRecord> = { ...updates };
      
      if (newStatus === '已通知') {
        updatesWithTime.notifiedTime = now;
      } else if (newStatus === '已确认') {
        updatesWithTime.confirmedTime = now;
      } else if (newStatus === '已处理') {
        updatesWithTime.handledTime = now;
      }
      
      return { ...record, status: newStatus, ...updatesWithTime };
    }));
  };

  // 获取关联预约信息
  const getAppointmentInfo = (appointmentId: string) => {
    return APPOINTMENTS.find(apt => apt.id === appointmentId);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={24} />
            危急值管理
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>管理检查中发现的危急值，及时通知并处理</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCriticalValues(initialCriticalValues)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: '#fff', color: '#374151',
              border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} /> 重置
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '今日危急值', value: statistics.total, color: '#dc2626' },
          { label: '待处理', value: statistics.pending, color: '#991b1b' },
          { label: '已通知', value: statistics.notified, color: '#f59e0b' },
          { label: '已确认', value: statistics.confirmed, color: '#1e40af' },
          { label: '已处理', value: statistics.handled, color: '#10b981' },
          { label: '高危未处理', value: statistics.highRisk, color: '#dc2626' },
          { label: '紧急未处理', value: statistics.urgent, color: '#f59e0b' },
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
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="搜索患者/危急值类型/内容..."
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
                {['全部', '待处理', '已通知', '已确认', '已处理'].map(status => (
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

          {/* 严重程度筛选 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSeverityDropdown(!showSeverityDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer',
              }}
            >
              <AlertTriangle size={14} /> {filterSeverity === '全部' ? '严重程度' : filterSeverity} <ChevronDown size={14} />
            </button>
            {showSeverityDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff',
                border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, minWidth: 120,
              }}>
                {['全部', '高危', '紧急', '严重'].map(severity => (
                  <div
                    key={severity}
                    onClick={() => { setFilterSeverity(severity); setShowSeverityDropdown(false); }}
                    style={{
                      padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                      background: filterSeverity === severity ? '#f3f4f6' : '#fff',
                    }}
                  >
                    {severity}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 设备类型筛选 */}
          <select
            value={filterModality}
            onChange={e => setFilterModality(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
          >
            <option value="全部">全部设备类型</option>
            <option value="CT">CT</option>
            <option value="MRI">MRI</option>
            <option value="超声">超声</option>
            <option value="内镜">内镜</option>
            <option value="心电">心电</option>
            <option value="X光">X光</option>
          </select>

          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
            共 {filteredRecords.length} 条记录
          </div>
        </div>
      </div>

      {/* 危急值列表 */}
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>危急值编号</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>患者信息</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>检查信息</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>危急值内容</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>严重程度</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, idx) => (
              <tr
                key={record.id}
                style={{
                  borderBottom: idx < filteredRecords.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: record.isUrgent || record.severity === '高危' ? '#fef2f2' : '#fff',
                }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#dc2626' }}>{record.id}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    <Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {record.discoveredTime.split(' ')[1]}
                  </div>
                  {record.isUrgent && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <AlertTriangle size={12} color='#dc2626' />
                      <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>加急</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{record.patientName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {record.gender} | {record.age}岁 | {record.phone}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{record.examItemName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: 4, fontSize: 11,
                      background: '#e0e7ff', color: '#3730a3',
                    }}>
                      {record.modality}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    <Monitor size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {record.deviceName}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{record.criticalType}</div>
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 2, fontWeight: 500 }}>
                    {record.criticalContent}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    数值: {record.criticalValue} | 正常: {record.normalRange}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: SEVERITY_COLORS[record.severity]?.bg,
                    color: SEVERITY_COLORS[record.severity]?.text,
                    border: `1px solid ${SEVERITY_COLORS[record.severity]?.border}`,
                  }}>
                    {record.severity}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: STATUS_COLORS[record.status]?.bg,
                    color: STATUS_COLORS[record.status]?.text,
                    border: `1px solid ${STATUS_COLORS[record.status]?.border}`,
                  }}>
                    {record.status}
                  </span>
                  {record.notifiedTime && (
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                      通知: {record.notifiedTime.split(' ')[1]}
                    </div>
                  )}
                  {record.handledTime && (
                    <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>
                      处理: {record.handledTime.split(' ')[1]}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleView(record)}
                      title="查看详情"
                      style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                    >
                      <Eye size={16} />
                    </button>
                    {(currentRole === '管理员' || currentRole === '医生') && record.status !== '已处理' && (
                      <>
                        {record.status === '待处理' && (
                          <button
                            onClick={() => handleNotify(record)}
                            title="通知医生"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#f59e0b' }}
                          >
                            <PhoneCall size={16} />
                          </button>
                        )}
                        {record.status === '已通知' && (
                          <button
                            onClick={() => handleStatusChange(record.id, '已确认')}
                            title="确认危急值"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#3b82f6' }}
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        {record.status === '已确认' && (
                          <button
                            onClick={() => handleStatusChange(record.id, '已处理')}
                            title="处理完成"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#10b981' }}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {(record.status === '已通知' || record.status === '已确认') && (
                          <button
                            onClick={() => handleProcess(record)}
                            title="处理"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                          >
                            <CheckSquare size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRecords.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: 14, margin: 0 }}>暂无危急值记录</p>
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showModal && selectedRecord && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 700, maxHeight: '90vh',
            overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: modalType === 'view' ? '#fef2f2' : modalType === 'handle' ? '#eff6ff' : '#fffbeb',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                {modalType === 'view' ? (
                  <>
                    <AlertTriangle size={20} color='#dc2626' /> 危急值详情
                  </>
                ) : modalType === 'handle' ? (
                  <>
                    <CheckSquare size={20} color='#3b82f6' /> 处理危急值
                  </>
                ) : (
                  <>
                    <PhoneCall size={20} color='#f59e0b' /> 通知医生
                  </>
                )}
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
              {/* 危急值状态标识 */}
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 20,
                background: SEVERITY_COLORS[selectedRecord.severity]?.bg,
                border: `1px solid ${SEVERITY_COLORS[selectedRecord.severity]?.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={20} color={SEVERITY_COLORS[selectedRecord.severity]?.text} />
                  <span style={{ fontWeight: 600, color: SEVERITY_COLORS[selectedRecord.severity]?.text }}>
                    {selectedRecord.severity} - {selectedRecord.criticalType}
                  </span>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: STATUS_COLORS[selectedRecord.status]?.bg,
                  color: STATUS_COLORS[selectedRecord.status]?.text,
                  border: `1px solid ${STATUS_COLORS[selectedRecord.status]?.border}`,
                }}>
                  {selectedRecord.status}
                </span>
              </div>

              {/* 患者信息 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <User size={18} color='#dc2626' />
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>患者信息</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingLeft: 26 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>患者姓名</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.patientName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>性别/年龄</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.gender} | {selectedRecord.age}岁</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>联系电话</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>身份证号</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.idCard}</div>
                  </div>
                </div>
              </div>

              {/* 检查信息 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <FileText size={18} color='#1e40af' />
                  <span style={{ fontWeight: 600, color: '#1e40af' }}>检查信息</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingLeft: 26 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>检查项目</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.examItemName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>设备类型</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.modality}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>设备名称</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.deviceName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>检查时间</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.appointmentDate} {selectedRecord.appointmentTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>开单医生</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.doctorName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>执行科室</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.departmentName}</div>
                  </div>
                </div>
              </div>

              {/* 危急值信息 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={18} color='#dc2626' />
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>危急值信息</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingLeft: 26 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>危急值类型</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.criticalType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>严重程度</div>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                      background: SEVERITY_COLORS[selectedRecord.severity]?.bg,
                      color: SEVERITY_COLORS[selectedRecord.severity]?.text,
                      border: `1px solid ${SEVERITY_COLORS[selectedRecord.severity]?.border}`,
                    }}>
                      {selectedRecord.severity}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>危急值</div>
                    <div style={{ fontWeight: 500, color: '#dc2626' }}>{selectedRecord.criticalValue}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>正常范围</div>
                    <div style={{ fontWeight: 500, color: '#10b981' }}>{selectedRecord.normalRange}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>危急值描述</div>
                    <div style={{ fontWeight: 500, color: '#111827', padding: '8px 12px', background: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca' }}>
                      {selectedRecord.criticalContent}
                    </div>
                  </div>
                </div>
              </div>

              {/* 处理时间线 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Clock size={18} color='#6b7280' />
                  <span style={{ fontWeight: 600, color: '#374151' }}>处理时间线</span>
                </div>
                <div style={{ paddingLeft: 26 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626' }} />
                    <span style={{ fontSize: 13, color: '#111827' }}>发现时间: {selectedRecord.discoveredTime}</span>
                  </div>
                  {selectedRecord.notifiedTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                      <span style={{ fontSize: 13, color: '#111827' }}>通知时间: {selectedRecord.notifiedTime}</span>
                    </div>
                  )}
                  {selectedRecord.confirmedTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} />
                      <span style={{ fontSize: 13, color: '#111827' }}>确认时间: {selectedRecord.confirmedTime}</span>
                    </div>
                  )}
                  {selectedRecord.handledTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: 13, color: '#111827' }}>处理时间: {selectedRecord.handledTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 通知与处理信息 */}
              {(selectedRecord.handleMethod || selectedRecord.notifyDoctor) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <PhoneCall size={18} color='#10b981' />
                    <span style={{ fontWeight: 600, color: '#10b981' }}>通知与处理</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingLeft: 26 }}>
                    {selectedRecord.handleMethod && (
                      <div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>处理方式</div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.handleMethod}</div>
                      </div>
                    )}
                    {selectedRecord.handler && (
                      <div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>处理人</div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.handler} ({selectedRecord.handlerRole})</div>
                      </div>
                    )}
                    {selectedRecord.notifyDoctor && (
                      <div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>通知医生</div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.notifyDoctor}</div>
                      </div>
                    )}
                    {selectedRecord.notifyContent && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>通知内容</div>
                        <div style={{ fontWeight: 500, color: '#111827', padding: '8px 12px', background: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d' }}>
                          {selectedRecord.notifyContent}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 备注 */}
              {selectedRecord.notes && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <MessageSquare size={18} color='#6b7280' />
                    <span style={{ fontWeight: 600, color: '#374151' }}>备注</span>
                  </div>
                  <div style={{ paddingLeft: 26, fontSize: 13, color: '#6b7280' }}>
                    {selectedRecord.notes}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              {modalType === 'view' && (currentRole === '管理员' || currentRole === '医生') && selectedRecord.status !== '已处理' && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                  {selectedRecord.status === '待处理' && (
                    <button
                      onClick={() => { setModalType('notify'); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 20px', background: '#f59e0b', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <PhoneCall size={16} /> 通知医生
                    </button>
                  )}
                  {selectedRecord.status === '已通知' && (
                    <button
                      onClick={() => handleStatusChange(selectedRecord.id, '已确认')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 20px', background: '#3b82f6', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <UserCheck size={16} /> 确认危急值
                    </button>
                  )}
                  {selectedRecord.status === '已确认' && (
                    <button
                      onClick={() => handleStatusChange(selectedRecord.id, '已处理')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 20px', background: '#10b981', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <CheckCircle size={16} /> 处理完成
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
