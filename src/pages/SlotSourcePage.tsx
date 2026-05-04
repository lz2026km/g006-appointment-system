// G006 全院医技检查预约系统 - 号源管理页面（增强版）
// 实时号源池视图 + 动态放号策略 + 临时加号 + 号源锁定
import { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, Calendar, Clock, Monitor, X, ChevronDown,
  Edit2, Trash2, Eye, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight,
  CalendarDays, Filter, Lock, Unlock, Zap, RefreshCw, EyeOff, Grid3X3
} from 'lucide-react';
import type { SlotSource, TimeSlot, Device, TempSlot, LockedSlot, ReleasePolicy, SlotReleaseStrategy } from '../types';
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

// 放号策略预设
const RELEASE_POLICY_PRESETS: Record<string, ReleasePolicy> = {
  daily0800: { type: 'daily', dailyTime: '08:00', releaseInAdvance: 30 },
  daily0830: { type: 'daily', dailyTime: '08:30', releaseInAdvance: 30 },
  daily0900: { type: 'daily', dailyTime: '09:00', releaseInAdvance: 30 },
  weeklyMonday: { type: 'weekly', weeklyDay: 1, dailyTime: '08:00', releaseInAdvance: 60 },
  manual: { type: 'manual', releaseInAdvance: 0 },
  smart: { type: 'smart', smartThreshold: 80, releaseInAdvance: 15 },
};

export default function SlotSourcePage({ currentRole }: SlotSourcePageProps) {
  const [slotSources, setSlotSources] = useState<SlotSource[]>(SLOT_SOURCES);
  const [searchText, setSearchText] = useState('');
  const [filterDevice, setFilterDevice] = useState<string>('全部');
  const [filterDate, setFilterDate] = useState<string>('2026-05-02');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | 'tempAdd' | 'lockSlot'>('view');
  const [selectedSource, setSelectedSource] = useState<SlotSource | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'pool'>('list');

  // 临时加号表单
  const [tempSlotForm, setTempSlotForm] = useState({
    slotIndex: 0,
    reason: '',
    extraCount: 1,
  });

  // 锁定号源表单
  const [lockSlotForm, setLockSlotForm] = useState({
    slotIndex: 0,
    reason: '',
    duration: 30, // 分钟
  });

  // 放号策略
  const [releaseStrategies, setReleaseStrategies] = useState<SlotReleaseStrategy[]>([
    { id: 'RS001', name: '默认每日08:00放号', policy: RELEASE_POLICY_PRESETS.daily0800, isActive: true, createdAt: '2026-05-01' },
    { id: 'RS002', name: 'CT室智能放号', deviceId: 'DEV001', modality: 'CT', policy: RELEASE_POLICY_PRESETS.smart, isActive: false, createdAt: '2026-05-01' },
  ]);

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
      lockedCount: todaySources.reduce((acc, s) => acc + (s.lockedSlots?.length || 0), 0),
      tempAddedCount: todaySources.reduce((acc, s) => acc + (s.tempSlots?.reduce((a, t) => a + t.extraCount, 0) || 0), 0),
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

  // 打开临时加号
  const handleTempAdd = (source: SlotSource, slotIndex: number) => {
    setSelectedSource(source);
    setTempSlotForm({ slotIndex, reason: '', extraCount: 1 });
    setModalType('tempAdd');
    setShowModal(true);
  };

  // 打开锁定号源
  const handleLockSlot = (source: SlotSource, slotIndex: number) => {
    setSelectedSource(source);
    setLockSlotForm({ slotIndex, reason: '', duration: 30 });
    setModalType('lockSlot');
    setShowModal(true);
  };

  // 提交临时加号
  const handleTempAddSubmit = () => {
    if (!selectedSource) return;
    const slot = selectedSource.slots[tempSlotForm.slotIndex];
    if (!slot) return;

    const newTempSlot: TempSlot = {
      id: `TEMP${Date.now()}`,
      slotIndex: tempSlotForm.slotIndex,
      startTime: slot.startTime,
      endTime: slot.endTime,
      addedBy: currentRole,
      addedAt: new Date().toISOString(),
      reason: tempSlotForm.reason,
      extraCount: tempSlotForm.extraCount,
    };

    setSlotSources(prev => prev.map(s => {
      if (s.id === selectedSource.id) {
        return {
          ...s,
          slots: s.slots.map((sl, idx) =>
            idx === tempSlotForm.slotIndex
              ? { ...sl, available: sl.available + tempSlotForm.extraCount, total: sl.total + tempSlotForm.extraCount }
              : sl
          ),
          tempSlots: [...(s.tempSlots || []), newTempSlot],
        };
      }
      return s;
    }));

    setShowModal(false);
  };

  // 提交锁定号源
  const handleLockSubmit = () => {
    if (!selectedSource) return;
    const slot = selectedSource.slots[lockSlotForm.slotIndex];
    if (!slot) return;

    const expiresAt = new Date(Date.now() + lockSlotForm.duration * 60000).toISOString();

    const newLockedSlot: LockedSlot = {
      id: `LOCK${Date.now()}`,
      slotIndex: lockSlotForm.slotIndex,
      startTime: slot.startTime,
      endTime: slot.endTime,
      lockedBy: currentRole,
      lockedAt: new Date().toISOString(),
      reason: lockSlotForm.reason,
      expiresAt,
    };

    setSlotSources(prev => prev.map(s => {
      if (s.id === selectedSource.id) {
        return {
          ...s,
          slots: s.slots.map((sl, idx) =>
            idx === lockSlotForm.slotIndex
              ? { ...sl, available: Math.max(0, sl.available - 1) }
              : sl
          ),
          lockedSlots: [...(s.lockedSlots || []), newLockedSlot],
        };
      }
      return s;
    }));

    setShowModal(false);
  };

  // 解锁号源
  const handleUnlock = (sourceId: string, lockId: string) => {
    setSlotSources(prev => prev.map(s => {
      if (s.id === sourceId) {
        const lock = s.lockedSlots?.find(l => l.id === lockId);
        const slotIndex = lock?.slotIndex ?? -1;
        return {
          ...s,
          slots: s.slots.map((sl, idx) =>
            idx === slotIndex ? { ...sl, available: sl.available + 1 } : sl
          ),
          lockedSlots: s.lockedSlots?.filter(l => l.id !== lockId),
        };
      }
      return s;
    }));
  };

  // 手动放号
  const handleManualRelease = (sourceId: string) => {
    if (!confirm('确定要手动放号吗？')) return;
    setSlotSources(prev => prev.map(s => {
      if (s.id === sourceId) {
        return {
          ...s,
          slots: s.slots.map(slot => ({
            ...slot,
            available: slot.total,
          })),
        };
      }
      return s;
    }));
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
    releasePolicyType: 'daily' as 'daily' | 'weekly' | 'manual' | 'smart',
    releaseTime: '08:00',
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
      { start: '08:00', end: '09:00' }, { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' }, { start: '11:00', end: '12:00' },
      { start: '14:00', end: '15:00' }, { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' }, { start: '17:00', end: '18:00' },
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

    const policy = RELEASE_POLICY_PRESETS[newSource.releasePolicyType] || RELEASE_POLICY_PRESETS.daily0800;

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
      releasePolicy: policy,
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

  // 检查号源是否已锁定
  const isSlotLocked = (source: SlotSource, slotIndex: number) => {
    return source.lockedSlots?.some(ls => ls.slotIndex === slotIndex && new Date(ls.expiresAt) > new Date());
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', margin: 0 }}>号源管理</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>号源池视图 · 放号策略 · 临时加号 · 号源锁定</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {currentRole === '管理员' && (
            <>
              <button
                onClick={() => setActiveView(activeView === 'list' ? 'pool' : 'list')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', background: '#f3f4f6', color: '#374151',
                  border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Grid3X3 size={16} />
                {activeView === 'list' ? '号源池视图' : '列表视图'}
              </button>
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
            </>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
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
        <div style={{
          background: '#fff', borderRadius: 10, padding: '14px 16px',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} color='#ef4444' />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>已锁定</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{statistics.lockedCount}</div>
            </div>
          </div>
        </div>
        <div style={{
          background: '#fff', borderRadius: 10, padding: '14px 16px',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color='#1e40af' />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>临时加号</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1e40af' }}>{statistics.tempAddedCount}</div>
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
                        const locked = isSlotLocked(source, i);
                        return (
                          <div key={i} style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 11,
                            background: locked ? '#f3f4f6' : slotStatus.color + '20',
                            color: locked ? '#6b7280' : slotStatus.color,
                            display: 'flex', alignItems: 'center', gap: 2,
                          }}>
                            {locked && <Lock size={10} />}
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
                    {source.releasePolicy && (
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        {source.releasePolicy.type === 'smart' && '智能放号'}
                        {source.releasePolicy.type === 'daily' && `每日${source.releasePolicy.dailyTime}`}
                        {source.releasePolicy.type === 'manual' && '手动放号'}
                      </div>
                    )}
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
                            onClick={() => handleManualRelease(source.id)}
                            title="手动放号"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#10b981' }}
                          >
                            <Zap size={16} />
                          </button>
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
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: modalType === 'view' ? 800 : 600,
            maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                {modalType === 'view' && '号源详情'}
                {modalType === 'edit' && '编辑号源'}
                {modalType === 'create' && '配置号源'}
                {modalType === 'tempAdd' && '临时加号'}
                {modalType === 'lockSlot' && '锁定号源'}
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
              {modalType === 'create' && (
                // 新建号源表单
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                        ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>号源日期</label>
                    <input
                      type="date"
                      value={newSource.date}
                      onChange={e => setNewSource(prev => ({ ...prev, date: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>放号策略</label>
                    <select
                      value={newSource.releasePolicyType}
                      onChange={e => setNewSource(prev => ({ ...prev, releasePolicyType: e.target.value as any }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      <option value="daily">每日自动放号</option>
                      <option value="weekly">每周自动放号</option>
                      <option value="smart">智能放号</option>
                      <option value="manual">手动放号</option>
                    </select>
                  </div>

                  {newSource.releasePolicyType === 'daily' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>放号时间</label>
                      <input
                        type="time"
                        value={newSource.releaseTime}
                        onChange={e => setNewSource(prev => ({ ...prev, releaseTime: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                      />
                    </div>
                  )}

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
              )}

              {modalType === 'tempAdd' && selectedSource && (
                // 临时加号表单
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>选择时段</label>
                    <select
                      value={tempSlotForm.slotIndex}
                      onChange={e => setTempSlotForm(prev => ({ ...prev, slotIndex: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      {selectedSource.slots.map((slot, idx) => (
                        <option key={idx} value={idx}>
                          {slot.startTime} - {slot.endTime} (当前可用: {slot.available})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>加号数量</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tempSlotForm.extraCount}
                      onChange={e => setTempSlotForm(prev => ({ ...prev, extraCount: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>加号原因</label>
                    <textarea
                      value={tempSlotForm.reason}
                      onChange={e => setTempSlotForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="请输入临时加号原因..."
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, minHeight: 80, resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
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
                      onClick={handleTempAddSubmit}
                      style={{
                        padding: '10px 20px', borderRadius: 8, border: 'none',
                        background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      确认加号
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'lockSlot' && selectedSource && (
                // 锁定号源表单
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>选择时段</label>
                    <select
                      value={lockSlotForm.slotIndex}
                      onChange={e => setLockSlotForm(prev => ({ ...prev, slotIndex: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      {selectedSource.slots.map((slot, idx) => (
                        <option key={idx} value={idx}>
                          {slot.startTime} - {slot.endTime} (当前可用: {slot.available})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>锁定时长</label>
                    <select
                      value={lockSlotForm.duration}
                      onChange={e => setLockSlotForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      <option value={15}>15分钟</option>
                      <option value={30}>30分钟</option>
                      <option value={60}>1小时</option>
                      <option value={120}>2小时</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>锁定原因</label>
                    <textarea
                      value={lockSlotForm.reason}
                      onChange={e => setLockSlotForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="请输入锁定原因..."
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, minHeight: 80, resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
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
                      onClick={handleLockSubmit}
                      style={{
                        padding: '10px 20px', borderRadius: 8, border: 'none',
                        background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      确认锁定
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'view' && selectedSource && (
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
                    {selectedSource.releasePolicy && (
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>放号策略</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                          {selectedSource.releasePolicy.type === 'daily' && `每日 ${selectedSource.releasePolicy.dailyTime} 放号`}
                          {selectedSource.releasePolicy.type === 'weekly' && `每周第${selectedSource.releasePolicy.weeklyDay}天放号`}
                          {selectedSource.releasePolicy.type === 'smart' && `智能放号 (阈值${selectedSource.releasePolicy.smartThreshold}%)`}
                          {selectedSource.releasePolicy.type === 'manual' && '手动放号'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 时段详情 */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>号源时段详情</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      {selectedSource.slots.map((slot, idx) => {
                        const status = getSlotStatus(slot.total, slot.available);
                        const locked = isSlotLocked(selectedSource, idx);
                        const tempSlot = selectedSource.tempSlots?.find(t => t.slotIndex === idx);
                        return (
                          <div key={idx} style={{
                            padding: 12, borderRadius: 8, border: '1px solid #e5e7eb',
                            background: locked ? '#f3f4f6' : '#f9fafb',
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                              {slot.startTime} - {slot.endTime}
                              {locked && <Lock size={12} style={{ marginLeft: 4, color: '#9ca3af' }} />}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: 18, fontWeight: 700, color: locked ? '#9ca3af' : status.color }}>{slot.available}</span>
                                <span style={{ fontSize: 12, color: '#9ca3af' }}> / {slot.total}</span>
                              </div>
                              <span style={{
                                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                                background: locked ? '#e5e7eb' : status.color + '20',
                                color: locked ? '#6b7280' : status.color,
                              }}>
                                {locked ? '已锁定' : status.text}
                              </span>
                            </div>
                            {tempSlot && (
                              <div style={{ fontSize: 10, color: '#10b981', marginTop: 4 }}>
                                +{tempSlot.extraCount} 临时号
                              </div>
                            )}
                            {currentRole === '管理员' && !locked && (
                              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                                <button
                                  onClick={() => handleTempAdd(selectedSource, idx)}
                                  style={{
                                    flex: 1, padding: '4px 8px', borderRadius: 4,
                                    border: '1px solid #10b981', background: '#ecfdf5',
                                    color: '#059669', fontSize: 11, cursor: 'pointer',
                                  }}
                                >
                                  <Plus size={10} style={{ marginRight: 2 }} />加号
                                </button>
                                <button
                                  onClick={() => handleLockSlot(selectedSource, idx)}
                                  style={{
                                    flex: 1, padding: '4px 8px', borderRadius: 4,
                                    border: '1px solid #ef4444', background: '#fef2f2',
                                    color: '#dc2626', fontSize: 11, cursor: 'pointer',
                                  }}
                                >
                                  <Lock size={10} style={{ marginRight: 2 }} />锁定
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 锁定列表 */}
                  {selectedSource.lockedSlots && selectedSource.lockedSlots.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>已锁定号源</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedSource.lockedSlots.map(lock => (
                          <div key={lock.id} style={{
                            padding: 10, borderRadius: 6, border: '1px solid #fee2e2',
                            background: '#fef2f2', display: 'flex', alignItems: 'center', gap: 12,
                          }}>
                            <Lock size={14} color='#ef4444' />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 500, color: '#991b1b' }}>
                                {lock.startTime} - {lock.endTime}
                              </div>
                              <div style={{ fontSize: 11, color: '#6b7280' }}>
                                锁定人: {lock.lockedBy} | 原因: {lock.reason} | 有效期至: {new Date(lock.expiresAt).toLocaleTimeString()}
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnlock(selectedSource.id, lock.id)}
                              style={{
                                padding: '4px 10px', borderRadius: 4,
                                border: 'none', background: '#10b981',
                                color: '#fff', fontSize: 11, cursor: 'pointer',
                              }}
                            >
                              <Unlock size={10} style={{ marginRight: 2 }} />解锁
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
