// G006 全院医技检查预约系统 - 预约管理页面
import { useState } from 'react';
import { Search, Plus, Filter, Calendar, Clock, Phone, Edit2, Eye, X, ChevronDown, CheckCircle, Stethoscope, RefreshCw, CalendarDays, User, AlertTriangle, ShieldAlert, Info, AlertCircle } from 'lucide-react';
import { APPOINTMENTS } from '../data/initialData';
import { evaluateRules, type RuleEngineContext, type RuleEvaluationResult } from '../data/rulesData';
import type { Appointment, AppointmentStatus } from '../types';

// 状态颜色映射 - 彩色标签
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  '待确认': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  '已确认': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  '已完成': { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
  '已取消': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
};

const STATUS_OPTIONS = ['全部', '待确认', '已确认', '已完成', '已取消'];
const TIME_SLOTS = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'];

const DEVICES = [
  { id: 'DEV001', name: 'CT-01 (西门子 Definition AS+)', usedSlots: 28 },
  { id: 'DEV002', name: 'CT-02 (GE Revolution)', usedSlots: 35 },
  { id: 'DEV003', name: 'MRI-01 (西门子 MAGNETOM Vida)', usedSlots: 20 },
  { id: 'DEV005', name: '超声-01 (迈瑞 Resona 7)', usedSlots: 32 },
  { id: 'DEV006', name: '超声-02 (GE Voluson E10)', usedSlots: 18 },
  { id: 'DEV007', name: '内镜-01 (奥林巴斯 290)', usedSlots: 12 },
  { id: 'DEV008', name: '心电图-01 (GE MAC 2000)', usedSlots: 45 },
  { id: 'DEV009', name: 'DR-01 (西门子 Ysio)', usedSlots: 30 },
];

const EXAM_ITEMS = [
  { id: 'EI001', name: '头颅CT平扫', modality: 'CT' },
  { id: 'EI002', name: '胸部CT平扫', modality: 'CT' },
  { id: 'EI003', name: '腹部CT平扫', modality: 'CT' },
  { id: 'EI004', name: '冠脉CTA', modality: 'CT' },
  { id: 'EI005', name: '头颅MRI平扫', modality: 'MRI' },
  { id: 'EI006', name: '腰椎MRI', modality: 'MRI' },
  { id: 'EI007', name: '腹部肝胆脾胰超声', modality: '超声' },
  { id: 'EI008', name: '心脏彩超', modality: '超声' },
  { id: 'EI009', name: '甲状腺超声', modality: '超声' },
  { id: 'EI010', name: '电子胃镜检查', modality: '内镜' },
  { id: 'EI011', name: '电子结肠镜检查', modality: '内镜' },
  { id: 'EI012', name: '常规十二导联心电图', modality: '心电' },
  { id: 'EI013', name: '24小时动态心电图', modality: '心电' },
  { id: 'EI014', name: '胸部X线正侧位片', modality: 'X光' },
  { id: 'EI015', name: '颈椎张口位X线', modality: 'X光' },
];

const PATIENTS = [
  { id: 'P001', name: '李建国', gender: '男', age: 58, phone: '13812345601', patientType: '门诊' as const },
  { id: 'P002', name: '王秀英', gender: '女', age: 45, phone: '13912345602', patientType: '门诊' as const },
  { id: 'P003', name: '张伟', gender: '男', age: 32, phone: '13712345603', patientType: '住院' as const },
  { id: 'P004', name: '刘芳', gender: '女', age: 67, phone: '13612345604', patientType: '体检' as const },
  { id: 'P005', name: '陈强', gender: '男', age: 28, phone: '13512345605', patientType: '门诊' as const },
  { id: 'P006', name: '赵敏', gender: '女', age: 51, phone: '13412345606', patientType: '门诊' as const },
  { id: 'P007', name: '孙磊', gender: '男', age: 73, phone: '13312345607', patientType: '住院' as const },
  { id: 'P008', name: '周婷', gender: '女', age: 39, phone: '13212345608', patientType: '门诊' as const },
  { id: 'P009', name: '吴浩', gender: '男', age: 44, phone: '13112345609', patientType: '体检' as const },
  { id: 'P010', name: '郑静', gender: '女', age: 62, phone: '13012345610', patientType: '门诊' as const },
];

export default function AppointmentPage({ currentRole }: { currentRole: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newForm, setNewForm] = useState({ patientId: '', patientName: '', gender: '男', age: 0, phone: '', examItemId: '', deviceId: '', appointmentDate: '2026-05-02', appointmentTime: '08:00-09:00', clinicalDiagnosis: '', isUrgent: false });
  const [ruleModal, setRuleModal] = useState<{ show: boolean; result: RuleEvaluationResult | null; context: RuleEngineContext | null }>({ show: false, result: null, context: null });
  const [forceCreate, setForceCreate] = useState(false);

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = searchText === '' || apt.patientName.includes(searchText) || apt.phone.includes(searchText) || apt.id.includes(searchText);
    const matchesStatus = filterStatus === '全部' || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statistics = {
    total: appointments.length,
    pending: appointments.filter(apt => apt.status === '待确认').length,
    confirmed: appointments.filter(apt => apt.status === '已确认').length,
    completed: appointments.filter(apt => apt.status === '已完成').length,
    cancelled: appointments.filter(apt => apt.status === '已取消').length,
  };

  const handleView = (apt: Appointment) => { setSelectedAppointment(apt); setModalType('view'); setShowModal(true); };
  const handleEdit = (apt: Appointment) => { setSelectedAppointment(apt); setModalType('edit'); setShowModal(true); };
  const handleCreate = () => { setSelectedAppointment(null); setModalType('create'); setNewForm({ patientId: '', patientName: '', gender: '男', age: 0, phone: '', examItemId: '', deviceId: '', appointmentDate: '2026-05-02', appointmentTime: '08:00-09:00', clinicalDiagnosis: '', isUrgent: false }); setShowModal(true); setForceCreate(false); };

  const handlePatientSelect = (patientId: string) => {
    const patient = PATIENTS.find(p => p.id === patientId);
    if (patient) setNewForm(prev => ({ ...prev, patientId: patient.id, patientName: patient.name, gender: patient.gender, age: patient.age, phone: patient.phone }));
  };

  // 验证预约规则
  const validateAppointmentRules = (formData: typeof newForm): RuleEvaluationResult => {
    const examItem = EXAM_ITEMS.find(e => e.id === formData.examItemId);
    const patient = PATIENTS.find(p => p.id === formData.patientId);
    
    const context: RuleEngineContext = {
      appointment: {
        patientId: formData.patientId || `P${String(appointments.length + 1).padStart(3, '0')}`,
        patientName: formData.patientName,
        examItemId: formData.examItemId,
        examItemName: examItem?.name || '',
        modality: examItem?.modality || '',
        deviceId: formData.deviceId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        clinicalDiagnosis: formData.clinicalDiagnosis,
        isUrgent: formData.isUrgent,
      },
      existingAppointments: appointments,
      patientAge: patient?.age || formData.age,
      patientGender: patient?.gender || formData.gender,
      patientType: patient?.patientType || '门诊',
      isUrgent: formData.isUrgent,
      waitingDays: 0,
      deviceUsedSlots: DEVICES.find(d => d.id === formData.deviceId)?.usedSlots || 0,
    };
    
    return evaluateRules(context);
  };

  const handleCreateSubmit = () => {
    if (!newForm.patientName || !newForm.examItemId || !newForm.deviceId) { alert('请填写完整信息'); return; }
    
    // 规则验证
    if (!forceCreate) {
      const validationResult = validateAppointmentRules(newForm);
      
      // 如果有错误级别的违规，弹出规则拦截窗口
      if (!validationResult.passed && validationResult.violations.some(v => v.severity === 'error')) {
        setRuleModal({ show: true, result: validationResult, context: null });
        return;
      }
      
      // 如果有警告，显示确认窗口
      if (validationResult.warnings.length > 0) {
        setRuleModal({ show: true, result: validationResult, context: null });
        return;
      }
    }
    
    proceedWithCreate();
  };
  
  const proceedWithCreate = () => {
    const examItem = EXAM_ITEMS.find(e => e.id === newForm.examItemId);
    const device = DEVICES.find(d => d.id === newForm.deviceId);
    const apt: Appointment = {
      id: `APT${String(appointments.length + 1).padStart(3, '0')}`, patientId: newForm.patientId || `P${String(appointments.length + 1).padStart(3, '0')}`,
      patientName: newForm.patientName, gender: newForm.gender, age: newForm.age, patientType: '门诊', phone: newForm.phone, idCard: '',
      examItemId: newForm.examItemId, examItemName: examItem?.name || '', modality: examItem?.modality || '',
      deviceId: newForm.deviceId, deviceName: device?.name || '', departmentId: 'D001', departmentName: '放射科',
      doctorId: 'DOC001', doctorName: '张伟', appointmentDate: newForm.appointmentDate, appointmentTime: newForm.appointmentTime,
      status: '待确认', registrationType: '门诊', clinicalDiagnosis: newForm.clinicalDiagnosis, clinicalInfo: '', isUrgent: newForm.isUrgent,
      checkInTime: undefined, reportStatus: '未写', createdAt: new Date().toLocaleString(), updatedAt: new Date().toLocaleString(),
    };
    setAppointments(prev => [...prev, apt]); setShowModal(false); setRuleModal({ show: false, result: null, context: null }); setForceCreate(false);
  };

  const handleStatusChange = (aptId: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(apt => apt.id === aptId ? { ...apt, status: newStatus, updatedAt: new Date().toLocaleString() } : apt));
  };
  const handleCancel = (aptId: string) => { if (confirm('确定要取消此预约吗？')) handleStatusChange(aptId, '已取消'); };
  const handleRefresh = () => { setAppointments(APPOINTMENTS); setSearchText(''); setFilterStatus('全部'); };

  const statusTag = (status: string) => {
    const s = STATUS_STYLES[status] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    return { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: s.bg, color: s.text, border: `1px solid ${s.border}` };
  };

  return (
    <div style={{ padding: 24, background: '#f0f4f8', minHeight: '100vh', fontFamily: '"Segoe UI", sans-serif' }}>
      {/* 页面标题区 */}
      <div style={{ background: '#ffffff', borderRadius: 8, padding: '20px 24px', marginBottom: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1e40af', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CalendarDays size={24} />预约管理
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0 0' }}>管理所有检查预约记录</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleRefresh} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#ffffff', color: '#1e40af', border: '1px solid #1e40af', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <RefreshCw size={14} />重置
            </button>
            {(currentRole === '管理员' || currentRole === '前台') && (
              <button onClick={handleCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#1e40af', color: '#ffffff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <Plus size={16} />新建预约
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 统计卡片区 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '总预约', value: statistics.total, icon: Calendar, color: '#1e40af' },
          { label: '待确认', value: statistics.pending, icon: Clock, color: '#f59e0b' },
          { label: '已确认', value: statistics.confirmed, icon: CheckCircle, color: '#3b82f6' },
          { label: '已完成', value: statistics.completed, icon: Stethoscope, color: '#10b981' },
          { label: '已取消', value: statistics.cancelled, icon: X, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#ffffff', borderRadius: 8, padding: '16px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{stat.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 筛选区 */}
      <div style={{ background: '#ffffff', borderRadius: 8, padding: '16px 20px', marginBottom: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="搜索患者姓名/手机/预约号..." value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: '100%', padding: '8px 12px 8px 38px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={16} color="#6b7280" /><input type="date" value="2026-05-02" readOnly style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }} /></div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, background: '#ffffff', cursor: 'pointer' }}>
              <Filter size={14} />{filterStatus}<ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#ffffff', border: '1px solid #d1d5db', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, minWidth: 120 }}>
                {STATUS_OPTIONS.map(status => (
                  <div key={status} onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }} style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', background: filterStatus === status ? '#f3f4f6' : '#ffffff', borderBottom: '1px solid #f3f4f6' }}>{status}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>共 {filteredAppointments.length} 条记录</div>
        </div>
      </div>

      {/* 表格区 */}
      <div style={{ background: '#ffffff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>患者姓名</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>检查项目</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>设备</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>日期时间</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>联系电话</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>状态</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((apt, idx) => (
              <tr key={apt.id} style={{ background: apt.isUrgent ? '#fef3c7' : '#ffffff', borderBottom: idx < filteredAppointments.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} color="#9ca3af" />{apt.patientName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{apt.gender} | {apt.age}岁</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{apt.examItemName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}><span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4, fontSize: 11, background: '#e0e7ff', color: '#3730a3' }}>{apt.modality}</span></div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{apt.deviceName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{apt.departmentName}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 500, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} color="#6b7280" />{apt.appointmentDate}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={12} />{apt.appointmentTime}</div>
                </td>
                <td style={{ padding: '14px 16px' }}><div style={{ color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} color="#6b7280" />{apt.phone}</div></td>
                <td style={{ padding: '14px 16px' }}><span style={statusTag(apt.status)}>{apt.status}</span></td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleView(apt)} title="查看详情" style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}><Eye size={16} /></button>
                    {(currentRole === '管理员' || currentRole === '前台') && (
                      <>
                        <button onClick={() => handleEdit(apt)} title="编辑" style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}><Edit2 size={16} /></button>
                        {apt.status === '待确认' && <button onClick={() => handleStatusChange(apt.id, '已确认')} title="确认预约" style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#10b981' }}><CheckCircle size={16} /></button>}
                        {(apt.status === '待确认' || apt.status === '已确认') && <button onClick={() => handleCancel(apt.id)} title="取消预约" style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#ef4444' }}><X size={16} /></button>}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAppointments.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: 14, margin: 0 }}>暂无预约记录</p>
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: 8, width: '90%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            {/* 模态框头部 */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>{modalType === 'view' ? '预约详情' : modalType === 'edit' ? '编辑预约' : '新建预约'}</h3>
              <button onClick={() => setShowModal(false)} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}><X size={20} color="#6b7280" /></button>
            </div>

            {/* 模态框内容 */}
            <div style={{ padding: 20 }}>
              {modalType === 'create' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>选择患者 *</label>
                    <select value={newForm.patientId} onChange={e => handlePatientSelect(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none' }}>
                      <option value="">请选择患者</option>
                      {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>患者姓名 *</label>
                    <input type="text" value={newForm.patientName} onChange={e => setNewForm(prev => ({ ...prev, patientName: e.target.value }))} placeholder="请输入患者姓名" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>性别</label>
                    <select value={newForm.gender} onChange={e => setNewForm(prev => ({ ...prev, gender: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none' }}>
                      <option value="男">男</option><option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>年龄</label>
                    <input type="number" value={newForm.age} onChange={e => setNewForm(prev => ({ ...prev, age: Number(e.target.value) }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>联系电话</label>
                    <input type="text" value={newForm.phone} onChange={e => setNewForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="请输入联系电话" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: 16, marginTop: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px 0' }}>预约信息</h4>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>检查项目 *</label>
                    <select value={newForm.examItemId} onChange={e => setNewForm(prev => ({ ...prev, examItemId: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none' }}>
                      <option value="">请选择检查项目</option>
                      {EXAM_ITEMS.map(item => <option key={item.id} value={item.id}>{item.name} ({item.modality})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>检查设备 *</label>
                    <select value={newForm.deviceId} onChange={e => setNewForm(prev => ({ ...prev, deviceId: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none' }}>
                      <option value="">请选择设备</option>
                      {DEVICES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>预约日期 *</label>
                    <input type="date" value={newForm.appointmentDate} onChange={e => setNewForm(prev => ({ ...prev, appointmentDate: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>预约时段 *</label>
                    <select value={newForm.appointmentTime} onChange={e => setNewForm(prev => ({ ...prev, appointmentTime: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none' }}>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>临床诊断</label>
                    <input type="text" value={newForm.clinicalDiagnosis} onChange={e => setNewForm(prev => ({ ...prev, clinicalDiagnosis: e.target.value }))} placeholder="请输入临床诊断" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                      <input type="checkbox" checked={newForm.isUrgent} onChange={e => setNewForm(prev => ({ ...prev, isUrgent: e.target.checked }))} />
                      加急预约
                    </label>
                  </div>
                </div>
              ) : selectedAppointment ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* 头部信息 */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1e40af' }}>{selectedAppointment.id}</span>
                    <span style={statusTag(selectedAppointment.status)}>{selectedAppointment.status}</span>
                    {selectedAppointment.isUrgent && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626', fontSize: 12, fontWeight: 600 }}><Stethoscope size={14} />加急</span>}
                  </div>
                  {/* 患者信息 */}
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>患者姓名</label><div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{selectedAppointment.patientName}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>性别/年龄</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.gender} | {selectedAppointment.age}岁</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>联系电话</label><div style={{ fontSize: 14, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} />{selectedAppointment.phone}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>身份证号</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.idCard}</div></div>
                  {/* 检查信息 */}
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 4 }}><h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px 0' }}>检查信息</h4></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>检查项目</label><div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{selectedAppointment.examItemName}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>设备类型</label><span style={{ padding: '2px 8px', background: '#e0e7ff', color: '#3730a3', borderRadius: 4, fontSize: 12 }}>{selectedAppointment.modality}</span></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>检查设备</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.deviceName}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>科室</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.departmentName}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>预约日期</label><div style={{ fontSize: 14, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} />{selectedAppointment.appointmentDate}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>预约时段</label><div style={{ fontSize: 14, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} />{selectedAppointment.appointmentTime}</div></div>
                  {/* 临床信息 */}
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 4 }}><h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px 0' }}>临床信息</h4></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>挂号类型</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.registrationType}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>患者类型</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.patientType}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>开单医生</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.doctorName}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>报告状态</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.reportStatus || '未写'}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>临床诊断</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.clinicalDiagnosis}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>临床信息</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.clinicalInfo}</div></div>
                  {selectedAppointment.checkInTime && <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>签到时间</label><div style={{ fontSize: 14, color: '#10b981', fontWeight: 600 }}>{selectedAppointment.checkInTime}</div></div>}
                  {/* 操作信息 */}
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 4 }}><h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px 0' }}>操作信息</h4></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>创建时间</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.createdAt}</div></div>
                  <div><label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>更新时间</label><div style={{ fontSize: 14, color: '#111827' }}>{selectedAppointment.updatedAt}</div></div>
                </div>
              ) : null}
            </div>

            {/* 模态框底部 */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, background: '#ffffff', cursor: 'pointer' }}>关闭</button>
              {modalType === 'create' && <button onClick={handleCreateSubmit} style={{ padding: '10px 20px', border: 'none', borderRadius: 4, fontSize: 13, background: '#1e40af', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }}>确认创建</button>}
              {modalType === 'edit' && selectedAppointment && (
                <>
                  {selectedAppointment.status === '待确认' && <button onClick={() => { handleStatusChange(selectedAppointment.id, '已确认'); setShowModal(false); }} style={{ padding: '10px 20px', border: 'none', borderRadius: 4, fontSize: 13, background: '#10b981', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }}>确认预约</button>}
                  {selectedAppointment.status !== '已完成' && selectedAppointment.status !== '已取消' && <button onClick={() => { handleStatusChange(selectedAppointment.id, '已取消'); setShowModal(false); }} style={{ padding: '10px 20px', border: 'none', borderRadius: 4, fontSize: 13, background: '#ef4444', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }}>取消预约</button>}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 规则拦截弹窗 */}
      {ruleModal.show && ruleModal.result && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#ffffff', borderRadius: 12, width: '90%', maxWidth: 560, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 12px 48px rgba(0,0,0,0.3)' }}>
            {/* 弹窗头部 */}
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid #e5e7eb',
              background: ruleModal.result.violations.length > 0 ? '#fef2f2' : '#fffbeb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {ruleModal.result.violations.length > 0 ? (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={24} color="#dc2626" />
                  </div>
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={24} color="#d97706" />
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                    {ruleModal.result.violations.length > 0 ? '规则拦截' : '规则提醒'}
                  </h3>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>
                    检测到 {ruleModal.result.violations.length} 个错误, {ruleModal.result.warnings.length} 个警告
                  </p>
                </div>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div style={{ padding: 20 }}>
              {/* 错误列表 */}
              {ruleModal.result.violations.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <AlertCircle size={16} color="#dc2626" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>错误 (Error)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ruleModal.result.violations.map((violation, idx) => (
                      <div key={idx} style={{ 
                        padding: 14, 
                        background: '#fee2e2', 
                        borderRadius: 8, 
                        borderLeft: `4px solid #ef4444`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ padding: '2px 8px', background: '#ef4444', color: '#ffffff', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>ERR</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#991b1b' }}>{violation.ruleName}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>{violation.message}</p>
                        {violation.suggestedFix && (
                          <div style={{ marginTop: 8, padding: '8px 10px', background: '#fecaca', borderRadius: 4, fontSize: 12, color: '#b91c1c' }}>
                            <Info size={12} style={{ display: 'inline', marginRight: 4 }} />
                            建议: {violation.suggestedFix}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 警告列表 */}
              {ruleModal.result.warnings.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <AlertTriangle size={16} color="#d97706" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#d97706' }}>警告 (Warning)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ruleModal.result.warnings.map((warning, idx) => (
                      <div key={idx} style={{ 
                        padding: 14, 
                        background: '#fef3c7', 
                        borderRadius: 8, 
                        borderLeft: `4px solid #f59e0b`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ padding: '2px 8px', background: '#f59e0b', color: '#ffffff', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>WARN</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>{warning.ruleName}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#78350f', margin: 0, lineHeight: 1.5 }}>{warning.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 建议时段 */}
              {ruleModal.result.suggestedSlots.length > 0 && (
                <div style={{ 
                  padding: 14, 
                  background: '#eff6ff', 
                  borderRadius: 8, 
                  border: '1px solid #bfdbfe',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Clock size={16} color="#1e40af" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>建议替代时段</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {ruleModal.result.suggestedSlots.map((slot, idx) => (
                      <span key={idx} style={{ 
                        padding: '6px 12px', 
                        background: '#dbeafe', 
                        color: '#1e40af', 
                        borderRadius: 6, 
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}>
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 优先级信息 */}
              <div style={{ marginTop: 16, padding: '12px 14px', background: '#f9fafb', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>综合优先级分数</div>
                <div style={{ 
                  padding: '4px 12px', 
                  background: '#1e40af', 
                  color: '#ffffff', 
                  borderRadius: 12, 
                  fontSize: 13, 
                  fontWeight: 700 
                }}>
                  {ruleModal.result.priorityScore} 分
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                onClick={() => { setRuleModal({ show: false, result: null, context: null }); setForceCreate(false); }}
                style={{ 
                  padding: '10px 20px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 6, 
                  fontSize: 13, 
                  background: '#ffffff', 
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                取消预约
              </button>
              {ruleModal.result.warnings.length > 0 && ruleModal.result.violations.length === 0 && (
                <button 
                  onClick={() => { setForceCreate(true); proceedWithCreate(); }}
                  style={{ 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: 6, 
                    fontSize: 13, 
                    background: '#f59e0b', 
                    color: '#ffffff', 
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  确认继续创建
                </button>
              )}
              <button 
                onClick={() => { setRuleModal({ show: false, result: null, context: null }); setForceCreate(false); }}
                style={{ 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: 6, 
                  fontSize: 13, 
                  background: '#1e40af', 
                  color: '#ffffff', 
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                返回修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
