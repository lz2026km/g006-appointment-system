// G006 全院医技检查预约系统 - 排班管理页面
import { useState, useMemo } from 'react';
import {
  Search, Plus, Calendar, Clock, Monitor,
  Edit2, Trash2, Eye,
  X, ChevronDown, Copy, ChevronLeft, ChevronRight, Users,
  Stethoscope
} from 'lucide-react';
import type { Schedule } from '../types';
import { SCHEDULES, DEVICES } from '../data/initialData';

interface SchedulePageProps {
  currentRole: string;
}

const SHIFT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '上午': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  '下午': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  '晚上': { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
  '全天': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '已排班': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  '未排班': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  '已满': { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
};

export default function SchedulePage({ currentRole }: SchedulePageProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(SCHEDULES);
  const [searchText, setSearchText] = useState('');
  const [filterDevice, setFilterDevice] = useState<string>('全部');
  const [filterShift, setFilterShift] = useState<string>('全部');
  const [filterDate, setFilterDate] = useState<string>('2026-05-02');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // 计算当前显示的周
  const currentWeek = useMemo(() => {
    const today = new Date('2026-05-02');
    today.setDate(today.getDate() + weekOffset * 7);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day.toISOString().split('T')[0]);
    }
    return weekDays;
  }, [weekOffset]);

  // 筛选后的排班列表
  const filteredSchedules = useMemo(() => {
    return schedules.filter(sch => {
      const matchesSearch = searchText === '' ||
        sch.deviceName.includes(searchText) ||
        sch.Technicians.some(t => t.includes(searchText)) ||
        sch.doctors.some(d => d.includes(searchText));
      const matchesDevice = filterDevice === '全部' || sch.deviceId === filterDevice;
      const matchesShift = filterShift === '全部' || sch.shiftType === filterShift;
      const matchesDate = sch.date === filterDate;
      return matchesSearch && matchesDevice && matchesShift && matchesDate;
    });
  }, [schedules, searchText, filterDevice, filterShift, filterDate]);

  // 按设备分组的排班（周视图用）
  const schedulesByDevice = useMemo(() => {
    const grouped: Record<string, Schedule[]> = {};
    DEVICES.forEach(device => {
      const deviceSchedules = schedules.filter(
        sch => sch.deviceId === device.id && currentWeek.includes(sch.date)
      );
      if (deviceSchedules.length > 0 || device.status !== '停机') {
        grouped[device.id] = deviceSchedules;
      }
    });
    return grouped;
  }, [schedules, currentWeek]);

  // 统计数据
  const statistics = useMemo(() => {
    const todaySchedules = schedules.filter(sch => sch.date === filterDate);
    return {
      total: todaySchedules.length,
      scheduled: todaySchedules.filter(sch => sch.status === '已排班').length,
      unscheduled: DEVICES.filter(d => d.status !== '停机').length - new Set(todaySchedules.map(s => s.deviceId)).size,
      full: todaySchedules.filter(sch => sch.status === '已满').length,
      totalCapacity: todaySchedules.reduce((sum, sch) => sum + sch.totalCapacity, 0),
      bookedCount: todaySchedules.reduce((sum, sch) => sum + sch.bookedCount, 0),
    };
  }, [schedules, filterDate]);

  const handleView = (sch: Schedule) => {
    setSelectedSchedule(sch);
    setModalType('view');
    setShowModal(true);
  };

  const handleEdit = (sch: Schedule) => {
    setSelectedSchedule(sch);
    setModalType('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedSchedule(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleCopySchedule = (sch: Schedule) => {
    const newSch: Schedule = {
      ...sch,
      id: `SCH${String(schedules.length + 1).padStart(3, '0')}`,
      date: filterDate,
    };
    setSchedules(prev => [...prev, newSch]);
  };

  const handleDelete = (schId: string) => {
    if (confirm('确定要删除此排班吗？')) {
      setSchedules(prev => prev.filter(sch => sch.id !== schId));
    }
  };

  // 新建排班表单状态
  const [newSch, setNewSch] = useState({
    deviceId: '',
    deviceName: '',
    date: filterDate,
    shiftType: '上午' as '上午' | '下午' | '晚上' | '全天',
    Technicians: [] as string[],
    doctors: [] as string[],
    totalCapacity: 20,
  });

  const handleCreateSubmit = () => {
    const device = DEVICES.find(d => d.id === newSch.deviceId);
    const sch: Schedule = {
      id: `SCH${String(schedules.length + 1).padStart(3, '0')}`,
      deviceId: newSch.deviceId,
      deviceName: device?.name.split(' ')[0] || '',
      date: newSch.date,
      shiftType: newSch.shiftType,
      Technicians: newSch.Technicians,
      doctors: newSch.doctors,
      totalCapacity: newSch.totalCapacity,
      bookedCount: 0,
      status: '已排班',
    };
    setSchedules(prev => [...prev, sch]);
    setShowModal(false);
  };

  const handleTechnicianChange = (value: string) => {
    const techs = value.split(',').map(s => s.trim()).filter(s => s);
    setNewSch(prev => ({ ...prev, Technicians: techs }));
  };

  const handleDoctorChange = (value: string) => {
    const docs = value.split(',').map(s => s.trim()).filter(s => s);
    setNewSch(prev => ({ ...prev, doctors: docs }));
  };

  const formatWeekDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  };

  const isToday = (dateStr: string) => dateStr === '2026-05-02';

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', margin: 0 }}>排班管理</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>管理设备检查排班与人员调度</p>
        </div>
        {currentRole === '管理员' || currentRole === '技师' ? (
          <button
            onClick={handleCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: '#1e40af', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> 新建排班
          </button>
        ) : null}
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '今日排班', value: statistics.total, color: '#1e40af' },
          { label: '已排班设备', value: statistics.scheduled, color: '#059669' },
          { label: '未排班设备', value: statistics.unscheduled, color: '#dc2626' },
          { label: '已满班次', value: statistics.full, color: '#7c3aed' },
          { label: '总容量', value: statistics.totalCapacity, color: '#0891b2' },
          { label: '已预约', value: statistics.bookedCount, color: '#d97706' },
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

      {/* 周导航 */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              style={{ padding: 8, border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, cursor: 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
              {currentWeek[0]} 至 {currentWeek[6]}
            </span>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              style={{ padding: 8, border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, cursor: 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
            >
              今天
            </button>
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            共 {DEVICES.filter(d => d.status !== '停机').length} 台设备
          </div>
        </div>
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
              placeholder="搜索设备/技术人员/医生..."
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

          {/* 设备筛选 */}
          <select
            value={filterDevice}
            onChange={e => setFilterDevice(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
          >
            <option value="全部">全部设备</option>
            {DEVICES.filter(d => d.status !== '停机').map(device => (
              <option key={device.id} value={device.id}>{device.name.split(' ')[0]}</option>
            ))}
          </select>

          {/* 班次筛选 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer',
              }}
            >
              <Clock size={14} /> {filterShift} <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff',
                border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, minWidth: 120,
              }}>
                {['全部', '上午', '下午', '晚上', '全天'].map(shift => (
                  <div
                    key={shift}
                    onClick={() => { setFilterShift(shift); setShowFilterDropdown(false); }}
                    style={{
                      padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                      background: filterShift === shift ? '#f3f4f6' : '#fff',
                    }}
                  >
                    {shift}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
            共 {filteredSchedules.length} 条排班记录
          </div>
        </div>
      </div>

      {/* 排班列表表格 */}
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>设备名称</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>日期</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>班次</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>技术人员</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>值班医生</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>容量</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((sch, idx) => {
              const device = DEVICES.find(d => d.id === sch.deviceId);
              const utilization = sch.totalCapacity > 0 ? Math.round((sch.bookedCount / sch.totalCapacity) * 100) : 0;
              return (
                <tr
                  key={sch.id}
                  style={{
                    borderBottom: idx < filteredSchedules.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: '#fff',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Monitor size={16} color='#6b7280' />
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{sch.deviceName}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{device?.location}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{sch.date}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{formatWeekDay(sch.date)}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: SHIFT_COLORS[sch.shiftType].bg, color: SHIFT_COLORS[sch.shiftType].text,
                      border: `1px solid ${SHIFT_COLORS[sch.shiftType].border}`,
                    }}>
                      {sch.shiftType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {sch.Technicians.map((tech, i) => (
                        <span key={i} style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11,
                          background: '#f3f4f6', color: '#374151',
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {sch.doctors.map((doc, i) => (
                        <span key={i} style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11,
                          background: '#e0e7ff', color: '#3730a3',
                        }}>
                          {doc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{sch.bookedCount}/{sch.totalCapacity}</div>
                    <div style={{
                      width: 60, height: 4, background: '#f3f4f6', borderRadius: 2, marginTop: 4, overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${utilization}%`, height: '100%',
                        background: utilization > 90 ? '#dc2626' : utilization > 75 ? '#d97706' : '#059669',
                        borderRadius: 2,
                      }} />
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: STATUS_COLORS[sch.status].bg, color: STATUS_COLORS[sch.status].text,
                      border: `1px solid ${STATUS_COLORS[sch.status].border}`,
                    }}>
                      {sch.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleView(sch)}
                        title="查看详情"
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                      >
                        <Eye size={16} />
                      </button>
                      {(currentRole === '管理员' || currentRole === '技师') && (
                        <>
                          <button
                            onClick={() => handleEdit(sch)}
                            title="编辑"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleCopySchedule(sch)}
                            title="复制排班"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(sch.id)}
                            title="删除"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredSchedules.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: 14, margin: 0 }}>暂无排班记录</p>
          </div>
        )}
      </div>

      {/* 周视图预览 */}
      <div style={{
        marginTop: 24,
        background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>设备排班周视图</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', position: 'sticky', left: 0, background: '#f8fafc' }}>设备</th>
                {currentWeek.map(date => (
                  <th key={date} style={{
                    padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#374151',
                    background: isToday(date) ? '#eff6ff' : '#f8fafc',
                  }}>
                    <div>{formatWeekDay(date)}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 400 }}>{date.slice(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEVICES.filter(d => d.status !== '停机').map(device => {
                const deviceSchedules = schedulesByDevice[device.id] || [];
                return (
                  <tr key={device.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', position: 'sticky', left: 0, background: '#fff' }}>
                      <div style={{ fontWeight: 500, color: '#111827' }}>{device.name.split(' ')[0]}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{device.modality}</div>
                    </td>
                    {currentWeek.map(date => {
                      const daySchedules = deviceSchedules.filter(s => s.date === date);
                      return (
                        <td key={date} style={{
                          padding: '8px', textAlign: 'center',
                          background: isToday(date) ? '#f0f9ff' : '#fff',
                        }}>
                          {daySchedules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
                              {daySchedules.map(sch => (
                                <div key={sch.id} style={{
                                  padding: '4px 8px', borderRadius: 4, fontSize: 11,
                                  background: SHIFT_COLORS[sch.shiftType].bg,
                                  color: SHIFT_COLORS[sch.shiftType].text,
                                  cursor: 'pointer',
                                }}
                                  onClick={() => handleView(sch)}
                                >
                                  {sch.shiftType} {sch.bookedCount}/{sch.totalCapacity}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: '#d1d5db', fontSize: 11 }}>—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模态框 */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '90vh',
            overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                {modalType === 'view' ? '排班详情' : modalType === 'edit' ? '编辑排班' : '新建排班'}
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
              {modalType === 'create' ? (
                // 新建排班表单
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>选择设备</label>
                    <select
                      value={newSch.deviceId}
                      onChange={e => {
                        const device = DEVICES.find(d => d.id === e.target.value);
                        setNewSch(prev => ({ ...prev, deviceId: e.target.value, deviceName: device?.name.split(' ')[0] || '' }));
                      }}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      <option value="">请选择设备</option>
                      {DEVICES.filter(d => d.status !== '停机').map(device => (
                        <option key={device.id} value={device.id}>{device.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>排班日期</label>
                    <input
                      type="date"
                      value={newSch.date}
                      onChange={e => setNewSch(prev => ({ ...prev, date: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>班次类型</label>
                    <select
                      value={newSch.shiftType}
                      onChange={e => setNewSch(prev => ({ ...prev, shiftType: e.target.value as any }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      <option value="上午">上午</option>
                      <option value="下午">下午</option>
                      <option value="晚上">晚上</option>
                      <option value="全天">全天</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>技术人员（多个用逗号分隔）</label>
                    <input
                      type="text"
                      placeholder="如：刘建国, 马力"
                      value={newSch.Technicians.join(', ')}
                      onChange={e => handleTechnicianChange(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>值班医生（多个用逗号分隔）</label>
                    <input
                      type="text"
                      placeholder="如：张伟, 李娜"
                      value={newSch.doctors.join(', ')}
                      onChange={e => handleDoctorChange(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>总容量</label>
                    <input
                      type="number"
                      value={newSch.totalCapacity}
                      onChange={e => setNewSch(prev => ({ ...prev, totalCapacity: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{ padding: '10px 20px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleCreateSubmit}
                      style={{ padding: '10px 20px', border: 'none', background: '#1e40af', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      创建排班
                    </button>
                  </div>
                </div>
              ) : selectedSchedule ? (
                // 查看/编辑模式
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{
                      padding: 16, background: '#f8fafc', borderRadius: 8,
                      border: '1px solid #e5e7eb',
                    }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>设备名称</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{selectedSchedule.deviceName}</div>
                    </div>
                    <div style={{
                      padding: 16, background: '#f8fafc', borderRadius: 8,
                      border: '1px solid #e5e7eb',
                    }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>排班日期</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{selectedSchedule.date} {formatWeekDay(selectedSchedule.date)}</div>
                    </div>
                    <div style={{
                      padding: 16, background: '#f8fafc', borderRadius: 8,
                      border: '1px solid #e5e7eb',
                    }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>班次类型</div>
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: SHIFT_COLORS[selectedSchedule.shiftType].bg,
                        color: SHIFT_COLORS[selectedSchedule.shiftType].text,
                        border: `1px solid ${SHIFT_COLORS[selectedSchedule.shiftType].border}`,
                      }}>
                        {selectedSchedule.shiftType}
                      </span>
                    </div>
                    <div style={{
                      padding: 16, background: '#f8fafc', borderRadius: 8,
                      border: '1px solid #e5e7eb',
                    }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>排班状态</div>
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: STATUS_COLORS[selectedSchedule.status].bg,
                        color: STATUS_COLORS[selectedSchedule.status].text,
                        border: `1px solid ${STATUS_COLORS[selectedSchedule.status].border}`,
                      }}>
                        {selectedSchedule.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                          <Users size={14} style={{ marginRight: 6 }} /> 技术人员
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {selectedSchedule.Technicians.map((tech, i) => (
                            <span key={i} style={{
                              padding: '6px 12px', borderRadius: 6, fontSize: 12,
                              background: '#f3f4f6', color: '#374151',
                            }}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                          <Stethoscope size={14} style={{ marginRight: 6 }} /> 值班医生
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {selectedSchedule.doctors.map((doc, i) => (
                            <span key={i} style={{
                              padding: '6px 12px', borderRadius: 6, fontSize: 12,
                              background: '#e0e7ff', color: '#3730a3',
                            }}>
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>容量使用情况</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
                          {selectedSchedule.bookedCount} / {selectedSchedule.totalCapacity}
                        </div>
                      </div>
                      <div style={{
                        width: 100, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${selectedSchedule.totalCapacity > 0 ? (selectedSchedule.bookedCount / selectedSchedule.totalCapacity) * 100 : 0}%`,
                          height: '100%',
                          background: selectedSchedule.bookedCount / selectedSchedule.totalCapacity > 0.9 ? '#dc2626' :
                            selectedSchedule.bookedCount / selectedSchedule.totalCapacity > 0.75 ? '#d97706' : '#059669',
                          borderRadius: 4,
                        }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{ padding: '10px 20px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
                    >
                      关闭
                    </button>
                    {modalType === 'edit' && (currentRole === '管理员' || currentRole === '技师') && (
                      <button
                        onClick={() => {
                          // 编辑保存逻辑
                          setShowModal(false);
                        }}
                        style={{ padding: '10px 20px', border: 'none', background: '#1e40af', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        保存修改
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
