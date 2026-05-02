// G006 全院医技检查预约系统 - 签到管理页面
import React, { useState, useMemo } from 'react';
import {
  Search, ClipboardCheck, Clock, User, Phone, Calendar, Monitor,
  CheckCircle, XCircle, Eye, Edit2, RefreshCw, X, ChevronDown,
  Users, Timer, AlertTriangle, ArrowRight, UserCheck
} from 'lucide-react';
import { CheckInRecord, Appointment } from '../types';
import { CHECKIN_RECORDS, APPOINTMENTS, DEVICES, EXAM_ITEMS } from '../data/initialData';

// 状态颜色映射
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '候检': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  '检查中': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  '已完成': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  '离开': { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
};

interface CheckinPageProps {
  currentRole: string;
}

export default function CheckinPage({ currentRole }: CheckinPageProps) {
  const [checkinRecords, setCheckinRecords] = useState<CheckInRecord[]>(CHECKIN_RECORDS);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('全部');
  const [filterDevice, setFilterDevice] = useState<string>('全部');
  const [filterDate, setFilterDate] = useState<string>('2026-05-02');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CheckInRecord | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // 筛选后的签到记录
  const filteredRecords = useMemo(() => {
    return checkinRecords.filter(record => {
      const matchesSearch = searchText === '' ||
        record.patientName.includes(searchText) ||
        record.appointmentId.includes(searchText);
      const matchesStatus = filterStatus === '全部' || record.status === filterStatus;
      const matchesDevice = filterDevice === '全部' || record.deviceName.includes(filterDevice);
      return matchesSearch && matchesStatus && matchesDevice;
    });
  }, [checkinRecords, searchText, filterStatus, filterDevice]);

  // 统计数据
  const statistics = useMemo(() => {
    const waiting = checkinRecords.filter(r => r.status === '候检').length;
    const inProgress = checkinRecords.filter(r => r.status === '检查中').length;
    const completed = checkinRecords.filter(r => r.status === '已完成').length;
    const left = checkinRecords.filter(r => r.status === '离开').length;
    return {
      total: checkinRecords.length,
      waiting,
      inProgress,
      completed,
      left,
    };
  }, [checkinRecords]);

  // 获取关联预约信息
  const getAppointmentInfo = (appointmentId: string) => {
    return APPOINTMENTS.find(apt => apt.id === appointmentId);
  };

  // 状态更新
  const handleStatusChange = (recordId: string, newStatus: string) => {
    setCheckinRecords(prev => prev.map(record =>
      record.id === recordId ? { ...record, status: newStatus as CheckInRecord['status'] } : record
    ));
  };

  // 手动签到
  const handleManualCheckin = (aptId: string) => {
    const apt = APPOINTMENTS.find(a => a.id === aptId);
    if (!apt) return;

    const newRecord: CheckInRecord = {
      id: `CI${String(checkinRecords.length + 1).padStart(3, '0')}`,
      appointmentId: apt.id,
      patientName: apt.patientName,
      examItemName: apt.examItemName,
      deviceName: apt.deviceName,
      checkInTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      queueNumber: checkinRecords.length + 1,
      estimatedTime: apt.appointmentTime.split('-')[0],
      status: '候检',
    };
    setCheckinRecords(prev => [...prev, newRecord]);
  };

  // 查看详情
  const handleView = (record: CheckInRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  // 待签到预约（已确认但未签到）
  const pendingCheckinAppointments = useMemo(() => {
    const checkedInIds = checkinRecords.map(r => r.appointmentId);
    return APPOINTMENTS.filter(apt =>
      (apt.status === '已确认' || apt.status === '待确认') &&
      !checkedInIds.includes(apt.id) &&
      apt.appointmentDate === filterDate
    );
  }, [checkinRecords, filterDate]);

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', margin: 0 }}>签到管理</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>管理患者检查签到与排队</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCheckinRecords(CHECKIN_RECORDS)}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '总签到', value: statistics.total, color: '#1e40af' },
          { label: '候检中', value: statistics.waiting, color: '#f59e0b' },
          { label: '检查中', value: statistics.inProgress, color: '#3b82f6' },
          { label: '已完成', value: statistics.completed, color: '#10b981' },
          { label: '已离开', value: statistics.left, color: '#6b7280' },
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
              placeholder="搜索患者姓名/预约号..."
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
              <ClipboardCheck size={14} /> {filterStatus} <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff',
                border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, minWidth: 120,
              }}>
                {['全部', '候检', '检查中', '已完成', '离开'].map(status => (
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

          {/* 设备筛选 */}
          <select
            value={filterDevice}
            onChange={e => setFilterDevice(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
          >
            <option value="全部">全部设备</option>
            {DEVICES.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
            共 {filteredRecords.length} 条记录
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 16 }}>
        {/* 签到列表 */}
        <div style={{
          background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #e5e7eb',
            background: '#f8fafc', fontWeight: 600, fontSize: 14, color: '#374151',
          }}>
            签到记录
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>患者</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>检查项目</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>设备</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>签到时间</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>状态</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, idx) => (
                <tr
                  key={record.id}
                  style={{
                    borderBottom: idx < filteredRecords.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{record.patientName}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{record.appointmentId}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{record.examItemName}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>排队号: {record.queueNumber}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{record.deviceName}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>预计: {record.estimatedTime}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
                      <Clock size={12} /> {record.checkInTime}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                      background: STATUS_COLORS[record.status]?.bg,
                      color: STATUS_COLORS[record.status]?.text,
                      border: `1px solid ${STATUS_COLORS[record.status]?.border}`,
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleView(record)}
                        title="查看详情"
                        style={{ padding: 5, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                      >
                        <Eye size={15} />
                      </button>
                      {record.status === '候检' && (
                        <button
                          onClick={() => handleStatusChange(record.id, '检查中')}
                          title="开始检查"
                          style={{ padding: 5, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#3b82f6' }}
                        >
                          <ArrowRight size={15} />
                        </button>
                      )}
                      {record.status === '检查中' && (
                        <button
                          onClick={() => handleStatusChange(record.id, '已完成')}
                          title="完成检查"
                          style={{ padding: 5, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#10b981' }}
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                      {(record.status === '已完成' || record.status === '检查中') && (
                        <button
                          onClick={() => handleStatusChange(record.id, '离开')}
                          title="患者离开"
                          style={{ padding: 5, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#ef4444' }}
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
              <ClipboardCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: 14, margin: 0 }}>暂无签到记录</p>
            </div>
          )}
        </div>

        {/* 待签到列表 */}
        <div style={{
          background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #e5e7eb',
            background: '#f8fafc', fontWeight: 600, fontSize: 14, color: '#374151',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>待签到 ({pendingCheckinAppointments.length})</span>
            <span style={{ fontSize: 11, fontWeight: 400, color: '#6b7280' }}>已确认/待确认</span>
          </div>
          <div style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
            {pendingCheckinAppointments.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <UserCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: 14, margin: 0 }}>暂无待签到预约</p>
              </div>
            ) : (
              pendingCheckinAppointments.map(apt => (
                <div
                  key={apt.id}
                  style={{
                    padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{apt.patientName}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{apt.patientType} | {apt.gender} | {apt.age}岁</div>
                    </div>
                    <span style={{
                      padding: '2px 6px', borderRadius: 4, fontSize: 10,
                      background: '#e0e7ff', color: '#3730a3',
                    }}>
                      {apt.modality}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                    {apt.examItemName}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      {apt.appointmentTime} | {apt.deviceName}
                    </div>
                    <button
                      onClick={() => handleManualCheckin(apt.id)}
                      style={{
                        padding: '4px 10px', background: '#10b981', color: '#fff',
                        border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      签到
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 详情模态框 */}
      {showModal && selectedRecord && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 500,
            overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>签到详情</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}
              >
                <X size={20} color='#6b7280' />
              </button>
            </div>

            {/* 模态框内容 */}
            <div style={{ padding: 20 }}>
              {/* 患者信息 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <User size={18} color='#1e40af' />
                  <span style={{ fontWeight: 600, color: '#1e40af' }}>患者信息</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingLeft: 26 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>患者姓名</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.patientName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>预约号</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.appointmentId}</div>
                  </div>
                </div>
              </div>

              {/* 检查信息 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <ClipboardCheck size={18} color='#1e40af' />
                  <span style={{ fontWeight: 600, color: '#1e40af' }}>检查信息</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingLeft: 26 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>检查项目</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.examItemName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>设备</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.deviceName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>排队号</div>
                    <div style={{ fontWeight: 500, color: '#1e40af', fontSize: 18 }}>#{selectedRecord.queueNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>预计检查时间</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.estimatedTime}</div>
                  </div>
                </div>
              </div>

              {/* 签到信息 */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Clock size={18} color='#1e40af' />
                  <span style={{ fontWeight: 600, color: '#1e40af' }}>签到信息</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingLeft: 26 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>签到时间</div>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{selectedRecord.checkInTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>当前状态</div>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                      background: STATUS_COLORS[selectedRecord.status]?.bg,
                      color: STATUS_COLORS[selectedRecord.status]?.text,
                      border: `1px solid ${STATUS_COLORS[selectedRecord.status]?.border}`,
                    }}>
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 关联预约详情 */}
              {(() => {
                const apt = getAppointmentInfo(selectedRecord.appointmentId);
                return apt ? (
                  <div style={{
                    background: '#f8fafc', borderRadius: 8, padding: 16, marginTop: 16,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>关联预约</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                      <div>
                        <span style={{ color: '#9ca3af' }}>预约日期: </span>
                        <span style={{ color: '#374151' }}>{apt.appointmentDate}</span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af' }}>预约时段: </span>
                        <span style={{ color: '#374151' }}>{apt.appointmentTime}</span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af' }}>科室: </span>
                        <span style={{ color: '#374151' }}>{apt.departmentName}</span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af' }}>接诊医生: </span>
                        <span style={{ color: '#374151' }}>{apt.doctorName}</span>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#9ca3af' }}>临床诊断: </span>
                        <span style={{ color: '#374151' }}>{apt.clinicalDiagnosis}</span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
                {selectedRecord.status === '候检' && (
                  <button
                    onClick={() => { handleStatusChange(selectedRecord.id, '检查中'); setShowModal(false); }}
                    style={{
                      padding: '8px 16px', background: '#3b82f6', color: '#fff',
                      border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    开始检查
                  </button>
                )}
                {selectedRecord.status === '检查中' && (
                  <button
                    onClick={() => { handleStatusChange(selectedRecord.id, '已完成'); setShowModal(false); }}
                    style={{
                      padding: '8px 16px', background: '#10b981', color: '#fff',
                      border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    完成检查
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px', background: '#fff', color: '#374151',
                    border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
