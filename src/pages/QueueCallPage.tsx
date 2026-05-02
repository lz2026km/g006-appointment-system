// G006 全院医技检查预约系统 - 等待叫号页面
import { useState, useMemo } from 'react';
import {
  Monitor, Bell, Volume2, CheckCircle,
  RefreshCw, Play, Users
} from 'lucide-react';
import type { CheckInRecord } from '../types';
import { CHECKIN_RECORDS, DEVICES } from '../data/initialData';

interface QueueCallPageProps {
  currentRole: string;
}

interface QueueDevice {
  id: string;
  name: string;
  modality: string;
  location: string;
}

export default function QueueCallPage({ currentRole: _currentRole }: QueueCallPageProps) {
  const [checkinRecords, setCheckinRecords] = useState<CheckInRecord[]>(CHECKIN_RECORDS);
  const [selectedDevice, _setSelectedDevice] = useState<string>('全部');
  const [callingRecord, setCallingRecord] = useState<CheckInRecord | null>(null);
  const [callHistory, setCallHistory] = useState<{ record: CheckInRecord; time: string }[]>([]);
  const [volume, setVolume] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const devices: QueueDevice[] = DEVICES.slice(0, 6).map((d, i) => ({
    id: d.id,
    name: d.name,
    modality: d.modality,
    location: `${3 + i}号楼${2 + i}层`,
  }));

  const queueByDevice = useMemo(() => {
    const groups: Record<string, { deviceId: string; deviceName: string; queue: CheckInRecord[] }> = {};
    devices.forEach(device => {
      const deviceRecords = checkinRecords.filter(
        r => r.deviceName === device.name && r.status === '候检'
      ).sort((a, b) => a.queueNumber - b.queueNumber);
      if (deviceRecords.length > 0 || selectedDevice === '全部' || selectedDevice === device.id) {
        groups[device.id] = {
          deviceId: device.id,
          deviceName: device.name,
          queue: deviceRecords,
        };
      }
    });
    return groups;
  }, [checkinRecords, selectedDevice]);

  const allQueues = useMemo(() => {
    return Object.values(queueByDevice).flatMap(g => g.queue);
  }, [queueByDevice]);

  const handleCall = (record: CheckInRecord, deviceName: string) => {
    setCallingRecord(record);
    setCheckinRecords(prev => prev.map(r =>
      r.id === record.id ? { ...r, status: '检查中' } : r
    ));
    setCallHistory(prev => [...prev.slice(-19), { record, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }]);
    if (soundEnabled) {
      console.log(`🔊 叫号：${record.patientName}，到 ${deviceName} 检查`);
    }
    setTimeout(() => setCallingRecord(null), 3000);
  };

  const handleComplete = (recordId: string) => {
    setCheckinRecords(prev => prev.map(r =>
      r.id === recordId ? { ...r, status: '已完成' } : r
    ));
  };

  const getDeviceCompletedCount = (deviceName: string) =>
    checkinRecords.filter(r => r.deviceName === deviceName && r.status === '已完成').length;

  const PRIMARY = '#1e40af';
  const GRAY = '#6b7280';
  const BORDER = '#e5e7eb';
  const BG = '#f9fafb';

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>等待叫号</h2>
          <p style={{ fontSize: 13, color: GRAY, margin: '4px 0 0' }}>管理检查设备叫号队列，支持自动叫号和手动叫号</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', border: `1px solid ${BORDER}`, borderRadius: 8,
              background: soundEnabled ? '#eff6ff' : '#fff', color: soundEnabled ? PRIMARY : GRAY,
              fontSize: 13, cursor: 'pointer',
            }}>
            {soundEnabled ? <Volume2 size={15} /> : <Bell size={15} />}
            {soundEnabled ? '声音开' : '声音关'}
          </button>
          <button
            onClick={() => setVolume(!volume)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', border: `1px solid ${BORDER}`, borderRadius: 8,
              background: '#fff', color: GRAY, fontSize: 13, cursor: 'pointer',
            }}>
            <RefreshCw size={15} /> 刷新队列
          </button>
        </div>
      </div>

      {/* 全局统计 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '候检人数', value: allQueues.length, color: '#f59e0b' },
          { label: '检查中', value: checkinRecords.filter(r => r.status === '检查中').length, color: PRIMARY },
          { label: '今日已完成', value: checkinRecords.filter(r => r.status === '已完成').length, color: '#10b981' },
          { label: '设备数量', value: devices.length, color: '#7c3aed' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px',
            border: `1px solid ${BORDER}`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 叫号中提示 */}
      {callingRecord && (
        <div style={{
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 20, color: '#fff',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>正在叫号</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{callingRecord.patientName}</div>
            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
              候检号码：{callingRecord.queueNumber} | 检查项目：{callingRecord.examItemName}
            </div>
          </div>
        </div>
      )}

      {/* 叫号历史 */}
      {callHistory.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: 10, padding: '14px 16px',
          border: `1px solid ${BORDER}`, marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: GRAY, marginBottom: 8 }}>最近叫号记录</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {callHistory.slice(-5).reverse().map((item, idx) => (
              <div key={idx} style={{
                padding: '4px 10px', background: '#f3f4f6', borderRadius: 6,
                fontSize: 12, color: '#374151',
              }}>
                <span style={{ fontWeight: 600 }}>{item.record.patientName}</span>
                <span style={{ color: GRAY, marginLeft: 6 }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 设备队列 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {devices.map(device => {
          const queue = queueByDevice[device.id]?.queue || [];
          const completedCount = getDeviceCompletedCount(device.name);

          return (
            <div key={device.id} style={{
              background: '#fff', borderRadius: 10, border: `1px solid ${BORDER}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
            }}>
              {/* 设备头部 */}
              <div style={{
                padding: '14px 20px', borderBottom: `1px solid ${BORDER}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: BG,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: '#dbeafe', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Monitor size={18} color={PRIMARY} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{device.name}</div>
                    <div style={{ fontSize: 12, color: GRAY }}>{device.modality} · {device.location}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 12,
                    background: queue.length > 0 ? '#fef3c7' : '#d1fae5',
                    color: queue.length > 0 ? '#92400e' : '#065f46', fontWeight: 600,
                  }}>
                    候检 {queue.length}
                  </span>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 12,
                    background: '#d1fae5', color: '#065f46', fontWeight: 600,
                  }}>
                    已完成 {completedCount}
                  </span>
                </div>
              </div>

              {/* 队列列表 */}
              <div style={{ padding: 12, maxHeight: 280, overflowY: 'auto' }}>
                {queue.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: GRAY, fontSize: 13 }}>
                    当前无候检患者
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {queue.map((record, idx) => (
                      <div key={record.id} style={{
                        padding: '12px 14px', borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: idx === 0 ? '#fef3c7' : '#fff',
                        borderColor: idx === 0 ? '#fcd34d' : BORDER,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: idx === 0 ? '#f59e0b' : '#e5e7eb',
                            color: idx === 0 ? '#fff' : GRAY,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 13,
                          }}>
                            {record.queueNumber}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{record.patientName}</div>
                            <div style={{ fontSize: 11, color: GRAY }}>{record.examItemName}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {idx === 0 && (
                            <button
                              onClick={() => handleCall(record, device.name)}
                              style={{
                                padding: '6px 12px', border: 'none', borderRadius: 6,
                                background: PRIMARY, color: '#fff', fontSize: 12,
                                cursor: 'pointer', fontWeight: 600, display: 'flex',
                                alignItems: 'center', gap: 4,
                              }}>
                              <Play size={12} /> 叫号
                            </button>
                          )}
                          <button
                            onClick={() => handleComplete(record.id)}
                            style={{
                              padding: '6px 10px', border: `1px solid ${BORDER}`, borderRadius: 6,
                              background: '#fff', color: '#10b981', fontSize: 12,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                            <CheckCircle size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
