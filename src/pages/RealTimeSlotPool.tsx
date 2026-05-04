// G006 全院医技检查预约系统 - 实时号源池看板
// 热力图式号源看板，每30秒自动刷新
import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Clock, Monitor, AlertCircle, CheckCircle,
  XCircle, Lock, Plus, Zap, Eye, EyeOff
} from 'lucide-react';
import type { SlotSource, Device } from '../types';
import { SLOT_SOURCES, DEVICES, EXAM_ITEMS } from '../data/initialData';

// 号源状态热力图颜色
const HEATMAP_COLORS = {
  available: { bg: '#dcfce7', text: '#166534', border: '#86efac' }, // 绿色 - 充足
  limited: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },  // 黄色 - 紧张
  full: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },      // 红色 - 已满
  locked: { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' },   // 灰色 - 锁定
};

interface RealTimeSlotPoolProps {
  currentRole: string;
}

export default function RealTimeSlotPool({ currentRole }: RealTimeSlotPoolProps) {
  const [slotSources, setSlotSources] = useState<SlotSource[]>(SLOT_SOURCES);
  const [devices, setDevices] = useState<Device[]>(DEVICES);
  const [selectedDate, setSelectedDate] = useState('2026-05-02');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLocked, setShowLocked] = useState(true);
  const [selectedModality, setSelectedModality] = useState<string>('全部');
  const [selectedDevice, setSelectedDevice] = useState<string>('全部');

  // 模拟30秒自动刷新
  const autoRefresh = useCallback(() => {
    setIsRefreshing(true);
    // 模拟实时数据更新 - 随机变化号源
    setSlotSources(prev => prev.map(source => ({
      ...source,
      slots: source.slots.map(slot => ({
        ...slot,
        available: Math.max(0, Math.min(slot.total,
          slot.available + Math.floor(Math.random() * 3) - 1
        )),
      })),
    })));
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(autoRefresh, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // 手动刷新
  const handleManualRefresh = () => {
    autoRefresh();
  };

  // 按设备分组号源
  const groupedByDevice = slotSources.reduce((acc, source) => {
    if (!acc[source.deviceId]) {
      acc[source.deviceId] = [];
    }
    acc[source.deviceId].push(source);
    return acc;
  }, {} as Record<string, SlotSource[]>);

  // 获取设备信息
  const getDevice = (deviceId: string) => devices.find(d => d.id === deviceId);

  // 获取号源状态
  const getSlotStatus = (total: number, available: number, locked: number = 0) => {
    const effective = available - locked;
    if (effective <= 0) return 'full';
    if (effective <= 2) return 'limited';
    return 'available';
  };

  // 获取热力图颜色
  const getHeatmapColor = (total: number, available: number, locked: number = 0) => {
    const status = getSlotStatus(total, available, locked);
    return HEATMAP_COLORS[status];
  };

  // 计算设备总览
  const deviceOverview = devices.map(device => {
    const sources = groupedByDevice[device.id] || [];
    let totalSlots = 0;
    let totalAvailable = 0;
    let totalLocked = 0;

    sources.forEach(source => {
      source.slots.forEach(slot => {
        totalSlots += slot.total;
        totalAvailable += slot.available;
        totalLocked += (source.lockedSlots?.filter(ls => ls.slotIndex === source.slots.indexOf(slot)).length || 0);
      });
    });

    return {
      ...device,
      totalSlots,
      totalAvailable,
      totalLocked,
      utilization: totalSlots > 0 ? Math.round(((totalSlots - totalAvailable) / totalSlots) * 100) : 0,
    };
  });

  // 筛选后的设备列表
  const filteredDevices = deviceOverview.filter(device => {
    const matchesModality = selectedModality === '全部' || device.modality === selectedModality;
    const matchesDevice = selectedDevice === '全部' || device.name.includes(selectedDevice);
    return matchesModality && matchesDevice;
  });

  // 获取设备可用时段的时间格
  const getTimeGrid = (source: SlotSource) => {
    const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    return times;
  };

  // 获取某时间的号源
  const getSlotForTime = (source: SlotSource, time: string) => {
    return source.slots.find(s => s.startTime === time);
  };

  // 检查是否锁定
  const isSlotLocked = (source: SlotSource, slotIndex: number) => {
    return source.lockedSlots?.some(ls => ls.slotIndex === slotIndex);
  };

  // 检查是否临时加号
  const getTempSlot = (source: SlotSource, slotIndex: number) => {
    return source.tempSlots?.find(ts => ts.slotIndex === slotIndex);
  };

  const PRIMARY = '#1e40af';
  const modalities = ['全部', 'CT', 'MRI', '超声', '内镜', '心电', 'X光'];

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: PRIMARY, margin: 0 }}>实时号源池</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>
            热力图式号源看板，每30秒自动刷新
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} />
            最后刷新: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: PRIMARY, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={16} color='#6b7280' />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
          />
        </div>

        {/* 设备类型筛选 */}
        <div style={{ display: 'flex', gap: 6 }}>
          {modalities.map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModality(mod)}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                border: '1px solid', cursor: 'pointer',
                borderColor: selectedModality === mod ? PRIMARY : '#e5e7eb',
                background: selectedModality === mod ? '#eff6ff' : '#fff',
                color: selectedModality === mod ? PRIMARY : '#6b7280',
              }}
            >
              {mod}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowLocked(!showLocked)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6, fontSize: 12,
              border: '1px solid #e5e7eb', background: showLocked ? '#f3f4f6' : '#fff',
              color: showLocked ? '#374151' : '#9ca3af', cursor: 'pointer',
            }}
          >
            {showLocked ? <Eye size={14} /> : <EyeOff size={14} />}
            {showLocked ? '显示锁定' : '隐藏锁定'}
          </button>
        </div>
      </div>

      {/* 图例 */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '12px 20px', marginBottom: 16,
        border: '1px solid #e5e7eb', display: 'flex', gap: 24, alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>号源状态:</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: HEATMAP_COLORS.available.bg, border: `1px solid ${HEATMAP_COLORS.available.border}` }} />
            <span style={{ fontSize: 12, color: '#374151' }}>充足</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: HEATMAP_COLORS.limited.bg, border: `1px solid ${HEATMAP_COLORS.limited.border}` }} />
            <span style={{ fontSize: 12, color: '#374151' }}>紧张</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: HEATMAP_COLORS.full.bg, border: `1px solid ${HEATMAP_COLORS.full.border}` }} />
            <span style={{ fontSize: 12, color: '#374151' }}>已满</span>
          </div>
          {showLocked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: HEATMAP_COLORS.locked.bg, border: `1px solid ${HEATMAP_COLORS.locked.border}` }} />
              <span style={{ fontSize: 12, color: '#374151' }}>已锁定</span>
            </div>
          )}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={12} color='#9ca3af' />
          <span style={{ fontSize: 12, color: '#6b7280' }}>锁定号源不可预约</span>
        </div>
      </div>

      {/* 热力图看板 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredDevices.map(device => {
          const sources = groupedByDevice[device.id] || [];
          const overview = deviceOverview.find(d => d.id === device.id);
          const times = getTimeGrid(sources[0]);

          return (
            <div key={device.id} style={{
              background: '#fff', borderRadius: 10,
              border: '1px solid #e5e7eb', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              {/* 设备头部 */}
              <div style={{
                padding: '12px 16px', background: '#f8fafc',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: '#eff6ff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Monitor size={20} color={PRIMARY} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1e40af', fontSize: 14 }}>
                    {device.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {device.modality} · {device.location}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>
                      {overview?.totalAvailable || 0}
                    </div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>可用号源</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>
                      {overview?.totalSlots || 0}
                    </div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>总号源</div>
                  </div>
                  <div style={{
                    padding: '4px 12px', borderRadius: 6,
                    background: (overview?.utilization ?? 0) > 80 ? '#fee2e2' :
                      (overview?.utilization ?? 0) > 50 ? '#fef3c7' : '#dcfce7',
                    color: (overview?.utilization ?? 0) > 80 ? '#991b1b' :
                      (overview?.utilization ?? 0) > 50 ? '#92400e' : '#166534',
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {overview?.utilization || 0}% 使用率
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: device.status === '正常' ? '#10b981' :
                      device.status === '维护中' ? '#f59e0b' : '#ef4444',
                  }} />
                </div>
              </div>

              {/* 热力图网格 */}
              <div style={{ padding: '12px 16px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 4, minWidth: 800 }}>
                  {/* 时间列 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ height: 32 }} /> {/* header spacer */}
                    {times.map(time => (
                      <div key={time} style={{
                        height: 36, width: 60, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#6b7280', fontWeight: 500,
                      }}>
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* 号源格 */}
                  {sources.map(source => {
                    const examItem = EXAM_ITEMS.find(e => e.id === source.examItemId);
                    return (
                      <div key={source.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* 项目名称头 */}
                        <div style={{
                          height: 32, padding: '4px 8px', borderRadius: 6,
                          background: '#f3f4f6', display: 'flex', alignItems: 'center',
                          fontSize: 11, fontWeight: 500, color: '#374151',
                          maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }} title={source.examItemName}>
                          {source.examItemName}
                        </div>

                        {/* 时段格 */}
                        {times.map((time, idx) => {
                          const slot = getSlotForTime(source, time);
                          const locked = isSlotLocked(source, idx);
                          const tempSlot = getTempSlot(source, idx);

                          if (!slot) {
                            return (
                              <div key={time} style={{
                                height: 36, width: 80, borderRadius: 6,
                                background: '#f9fafb', border: '1px dashed #e5e7eb',
                              }} />
                            );
                          }

                          const colors = getHeatmapColor(slot.total, slot.available, locked ? 1 : 0);
                          const status = getSlotStatus(slot.total, slot.available, locked ? 1 : 0);

                          return (
                            <div
                              key={time}
                              style={{
                                height: 36, width: 80, borderRadius: 6,
                                background: locked ? HEATMAP_COLORS.locked.bg : colors.bg,
                                border: `1px solid ${locked ? HEATMAP_COLORS.locked.border : colors.border}`,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', position: 'relative',
                                transition: 'transform 0.1s',
                              }}
                              title={`${slot.available}/${slot.total}${locked ? ' (已锁定)' : ''}${tempSlot ? ' (含加号)' : ''}`}
                            >
                              <div style={{
                                fontSize: 14, fontWeight: 700,
                                color: locked ? HEATMAP_COLORS.locked.text : colors.text,
                              }}>
                                {slot.available}
                              </div>
                              <div style={{
                                fontSize: 9, color: locked ? '#9ca3af' : '#9ca3af',
                              }}>
                                /{slot.total}
                              </div>
                              {locked && (
                                <div style={{
                                  position: 'absolute', top: 2, right: 2,
                                }}>
                                  <Lock size={10} color='#9ca3af' />
                                </div>
                              )}
                              {tempSlot && (
                                <div style={{
                                  position: 'absolute', top: 2, right: 2,
                                }}>
                                  <Plus size={10} color='#10b981' />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {filteredDevices.length === 0 && (
        <div style={{
          background: '#fff', borderRadius: 10, padding: '60px 20px',
          textAlign: 'center', border: '1px solid #e5e7eb',
        }}>
          <Monitor size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>暂无号源数据</p>
        </div>
      )}
    </div>
  );
}

function Calendar({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
