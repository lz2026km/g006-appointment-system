// G006 全院医技检查预约系统 - 号源管理页面
import { useState, useMemo } from 'react';
import {
  Search, Plus, Calendar, Clock, Monitor, X, ChevronDown,
  Edit2, Trash2, Eye, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight,
  CalendarDays, Filter
} from 'lucide-react';
import type { SlotSource, TimeSlot, Device } from '../types';
import { SLOT_SOURCES, DEVICES, EXAM_ITEMS } from '../data/initialData';

// 号源状态颜色
const STATUS_COLORS = {
  available: '#10b981',
  limited: '#f59e0b',
  full: '#ef4444',
};

interface SlotSourcePageProps {
  currentRole: string;
}

export default function SlotSourcePage({ currentRole }: SlotSourcePageProps) {
  const [slotSources, setSlotSources] = useState<SlotSource[]>(SLOT_SOURCES);
  const [searchText, setSearchText] = useState('');
  const [filterDevice, setFilterDevice] = useState<string>('全部');
  const [filterDate, setFilterDate] = useState<string>('2026-05-02');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedSource, setSelectedSource] = useState<SlotSource | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // 筛选后的号源列表
  const filteredSources = useMemo(() => {
    return slotSources.filter(source => {
      const matchesSearch = searchText === '' ||
        source.deviceName.includes(searchText) ||
        source.examItemName.includes(searchText);
      const matchesDevice = filterDevice === '全部' || source.deviceId === filterDevice;
      const matchesDate = filterDate === '' || source.date === filterDate;
      return matchesSearch && matchesDevice && matchesDate;
    });
  }, [slotSources, searchText, filterDevice, filterDate]);

  // 统计数据
  const statistics = useMemo(() => {
    const todaySources = slotSources.filter(s => s.date === filterDate);
    let totalSlots = 0;
    let totalAvailable = 0;
    let totalDevices = new Set<string>();

    todaySources.forEach(s => {
      totalDevices.add(s.deviceId);
      s.slots.forEach(slot => {
        totalSlots += slot.total;
        totalAvailable += slot.available;
      });
    });

    return {
      deviceCount: totalDevices.size,
      totalSlots,
      totalAvailable,
      utilization: totalSlots > 0 ? Math.round(((totalSlots - totalAvailable) / totalSlots) * 100) : 0,
    };
  }, [slotSources, filterDate]);

  // 获取设备列表（按设备类型分组）
  const deviceOptions = useMemo(() => {
    const grouped: Record<string, Device[]> = {};
    DEVICES.forEach(device => {
      if (!grouped[device.modality]) {
        grouped[device.modality] = [];
      }
      grouped[device.modality].push(device);
    });
    return grouped;
  }, []);

  // 打开详情
  const handleView = (source: SlotSource) => {
    setSelectedSource(source);
    setModalType('view');
    setShowModal(true);
  };

  // 打开编辑
  const handleEdit = (source: SlotSource) => {
    setSelectedSource(source);
    setModalType('edit');
    setShowModal(true);
  };

  // 打开新建
  const handleCreate = () => {
    setSelectedSource(null);
    setModalType('create');
    setShowModal(true);
  };

  // 切换自动放号
  const handleToggleAutoRelease = (sourceId: string) => {
    setSlotSources(prev => prev.map(s =>
      s.id === sourceId ? { ...s, autoRelease: !s.autoRelease } : s
    ));
  };

  // 删除号源
  const handleDelete = (sourceId: string) => {
    if (confirm('确定要删除此号源配置吗？')) {
      setSlotSources(prev => prev.filter(s => s.id !== sourceId));
    }
  };

  // 新建号源表单状态
  const [newSource, setNewSource] = useState({
    deviceId: '',
    examItemId: '',
    date: filterDate,
    autoRelease: true,
    releaseRule: '每日08:00自动放号',
  });

  // 处理设备选择
  const handleDeviceSelect = (deviceId: string) => {
    const examItems = EXAM_ITEMS.filter(e => e.applicableDeviceIds.includes(deviceId));
    setNewSource(prev => ({
      ...prev,
      deviceId,
      examItemId: examItems.length > 0 ? examItems[0].id : '',
    }));
  };

  // 生成时间段
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const times = [
      { start: '08:00', end: '09:00' },
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' },
      { start: '17:00', end: '18:00' },
    ];
    times.forEach(t => {
      slots.push({
        startTime: t.start,
        endTime: t.end,
        total: 4,
        available: Math.floor(Math.random() * 5),
      });
    });
    return slots;
  };

  // 提交新建
  const handleCreateSubmit = () => {
    const device = DEVICES.find(d => d.id === newSource.deviceId);
    const examItem = EXAM_ITEMS.find(e => e.id === newSource.examItemId);

    if (!device || !examItem) {
      alert('请选择设备和检查项目');
      return;
    }

    const source: SlotSource = {
      id: `SS${String(slotSources.length + 1).padStart(3, '0')}`,
      deviceId: newSource.deviceId,
      deviceName: device.name,
      examItemId: newSource.examItemId,
      examItemName: examItem.name,
      date: newSource.date,
      slots: generateTimeSlots(),
      autoRelease: newSource.autoRelease,
      releaseRule: newSource.releaseRule,
    };

    setSlotSources(prev => [...prev, source]);
    setShowModal(false);
  };

  // 获取号源状态
  const getSlotStatus = (_total: number, available: number) => {
    if (available === 0) return { color: STATUS_COLORS.full, text: '已满' };
    if (available <= 2) return { color: STATUS_COLORS.limited, text: '紧张' };
    return { color: STATUS_COLORS.available, text: '充足' };
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', margin: 0 }}>号源管理</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>管理系统设备号源配置与放号规则</p>
        </div>
        {currentRole === '管理员' && (
          <button
            onClick={handleCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: '#1e40af', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> 配置号源
          </button>
        )}
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{
          background: '#fff', borderRadius: 10, padding: '14px 16px',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={20} color='#1e40af' />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>配置设备数</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1e40af' }}>{statistics.deviceCount}</div>
            </div>
          </div>
        </div>
        <div style={{
          background: '#fff', borderRadius: 10, padding: '14px 16px',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={20} color='#059669' />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>总号源数</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{statistics.totalSlots}</div>
            </div>
          </div>
        </div>
        <div style={{
          background: '#fff', borderRadius: 10, padding: '14px 16px',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color='#d97706' />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>可用号源</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>{statistics.totalAvailable}</div>
            </div>
          </div>
        </div>
        <div style={{
          background: '#fff', borderRadius: 10, padding: '14px 16px',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color='#6b7280' />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>使用率</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#6b7280' }}>{statistics.utilization}%</div>
            </div>
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
              placeholder="搜索设备/检查项目..."
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
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer',
              }}
            >
              <Filter size={14} /> {filterDevice} <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff',
                border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, minWidth: 160, maxHeight: 300, overflowY: 'auto',
              }}>
                <div
                  onClick={() => { setFilterDevice('全部'); setShowFilterDropdown(false); }}
                  style={{
                    padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                    background: filterDevice === '全部' ? '#f3f4f6' : '#fff',
                  }}
                >
                  全部设备
                </div>
                {Object.entries(deviceOptions).map(([modality, devices]) => (
                  <div key={modality}>
                    <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 600, color: '#6b7280', background: '#f9fafb' }}>
                      {modality}
                    </div>
                    {devices.map(device => (
                      <div
                        key={device.id}
                        onClick={() => { setFilterDevice(device.name); setShowFilterDropdown(false); }}
                        style={{
                          padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                          background: filterDevice === device.name ? '#f3f4f6' : '#fff',
                        }}
                      >
                        {device.name.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
            共 {filteredSources.length} 条号源配置
          </div>
        </div>
      </div>

      {/* 号源列表表格 */}
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>设备/检查项目</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>日期</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>号源时段</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>可用/总数</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>放号规则</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>自动放号</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSources.map((source, idx) => {
              const totalAvailable = source.slots.reduce((sum, s) => sum + s.available, 0);
              const totalSlots = source.slots.reduce((sum, s) => sum + s.total, 0);
              const status = getSlotStatus(totalSlots, totalAvailable);

              return (
                <tr
                  key={source.id}
                  style={{
                    borderBottom: idx < filteredSources.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: '#fff',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e40af' }}>{source.deviceName.split(' ')[0]}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{source.examItemName}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{source.date}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {source.slots.slice(0, 4).map((slot, i) => {
                        const slotStatus = getSlotStatus(slot.total, slot.available);
                        return (
                          <div key={i} style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 11,
                            background: slotStatus.color + '20', color: slotStatus.color,
                          }}>
                            {slot.startTime}-{slot.endTime}
                          </div>
                        );
                      })}
                      {source.slots.length > 4 && (
                        <div style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 11,
                          background: '#f3f4f6', color: '#6b7280',
                        }}>
                          +{source.slots.length - 4}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        fontSize: 18, fontWeight: 700, color: status.color,
                      }}>
                        {totalAvailable}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>/ {totalSlots}</div>
                      <span style={{
                        padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                        background: status.color + '20', color: status.color,
                      }}>
                        {status.text}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{source.releaseRule}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleToggleAutoRelease(source.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                        border: 'none', borderRadius: 6, cursor: 'pointer',
                        background: source.autoRelease ? '#ecfdf5' : '#fef3c7',
                        color: source.autoRelease ? '#059669' : '#d97706',
                      }}
                    >
                      {source.autoRelease ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      <span style={{ fontSize: 12, fontWeight: 500 }}>
                        {source.autoRelease ? '已启用' : '已禁用'}
                      </span>
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleView(source)}
                        title="查看详情"
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                      >
                        <Eye size={16} />
                      </button>
                      {currentRole === '管理员' && (
                        <>
                          <button
                            onClick={() => handleEdit(source)}
                            title="编辑"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(source.id)}
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

        {filteredSources.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: 14, margin: 0 }}>暂无号源配置</p>
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
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 700, maxHeight: '90vh',
            overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                {modalType === 'view' ? '号源详情' : modalType === 'edit' ? '编辑号源' : '配置号源'}
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
                // 新建号源表单
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* 设备选择 */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>选择设备</label>
                    <select
                      value={newSource.deviceId}
                      onChange={e => handleDeviceSelect(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      <option value="">请选择设备</option>
                      {Object.entries(deviceOptions).map(([modality, devices]) => (
                        <optgroup key={modality} label={modality}>
                          {devices.map(device => (
                            <option key={device.id} value={device.id}>{device.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* 检查项目选择 */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>检查项目</label>
                    <select
                      value={newSource.examItemId}
                      onChange={e => setNewSource(prev => ({ ...prev, examItemId: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      <option value="">请选择检查项目</option>
                      {EXAM_ITEMS
                        .filter(e => newSource.deviceId === '' || e.applicableDeviceIds.includes(newSource.deviceId))
                        .map(item => (
                          <option key={item.id} value={item.id}>{item.name} ({item.modality})</option>
                        ))
                      }
                    </select>
                  </div>

                  {/* 日期 */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>号源日期</label>
                    <input
                      type="date"
                      value={newSource.date}
                      onChange={e => setNewSource(prev => ({ ...prev, date: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>

                  {/* 自动放号 */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>自动放号</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setNewSource(prev => ({ ...prev, autoRelease: true }))}
                        style={{
                          flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid',
                          borderColor: newSource.autoRelease ? '#10b981' : '#e5e7eb',
                          background: newSource.autoRelease ? '#ecfdf5' : '#fff',
                          color: newSource.autoRelease ? '#10b981' : '#6b7280',
                          fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        启用
                      </button>
                      <button
                        onClick={() => setNewSource(prev => ({ ...prev, autoRelease: false }))}
                        style={{
                          flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid',
                          borderColor: !newSource.autoRelease ? '#ef4444' : '#e5e7eb',
                          background: !newSource.autoRelease ? '#fef2f2' : '#fff',
                          color: !newSource.autoRelease ? '#ef4444' : '#6b7280',
                          fontSize: 13, cursor: 'pointer',
                        }}
                      >
                        禁用
                      </button>
                    </div>
                  </div>

                  {/* 放号规则 */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>放号规则</label>
                    <select
                      value={newSource.releaseRule}
                      onChange={e => setNewSource(prev => ({ ...prev, releaseRule: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      <option value="每日08:00自动放号">每日08:00自动放号</option>
                      <option value="每日08:30自动放号">每日08:30自动放号</option>
                      <option value="每日09:00自动放号">每日09:00自动放号</option>
                      <option value="每周一08:00放号">每周一08:00放号</option>
                      <option value="手动放号">手动放号</option>
                    </select>
                  </div>

                  {/* 提交按钮 */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '10px 20px', borderRadius: 8, border: '1px solid #e5e7eb',
                        background: '#fff', color: '#6b7280', fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleCreateSubmit}
                      style={{
                        padding: '10px 20px', borderRadius: 8, border: 'none',
                        background: '#1e40af', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      确认配置
                    </button>
                  </div>
                </div>
              ) : selectedSource ? (
                // 查看/编辑详情
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>设备名称</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedSource.deviceName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>检查项目</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedSource.examItemName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>号源日期</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedSource.date}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>放号规则</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedSource.releaseRule}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>自动放号</div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 6,
                        background: selectedSource.autoRelease ? '#ecfdf5' : '#fef3c7',
                        color: selectedSource.autoRelease ? '#059669' : '#d97706',
                        fontSize: 13, fontWeight: 500,
                      }}>
                        {selectedSource.autoRelease ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                        {selectedSource.autoRelease ? '已启用' : '已禁用'}
                      </div>
                    </div>
                  </div>

                  {/* 时段详情 */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>号源时段详情</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      {selectedSource.slots.map((slot, idx) => {
                        const status = getSlotStatus(slot.total, slot.available);
                        return (
                          <div key={idx} style={{
                            padding: 12, borderRadius: 8, border: '1px solid #e5e7eb',
                            background: '#f9fafb',
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: 18, fontWeight: 700, color: status.color }}>{slot.available}</span>
                                <span style={{ fontSize: 12, color: '#9ca3af' }}> / {slot.total}</span>
                              </div>
                              <span style={{
                                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                                background: status.color + '20', color: status.color,
                              }}>
                                {status.text}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 关闭按钮 */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '10px 24px', borderRadius: 8, border: 'none',
                        background: '#6b7280', color: '#fff', fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      关闭
                    </button>
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
