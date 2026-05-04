// G006 全院医技检查预约系统 - 系统设置页面
// 汉东省人民医院全院医技检查预约系统
import { useState } from 'react';
import {
  Save, RotateCcw, Bell, FileText, Printer,
  Monitor, Check, ToggleLeft, ToggleRight, Calendar, Grid3X3, Zap, Lock
} from 'lucide-react';

interface SettingItem {
  id: string;
  category: string;
  name: string;
  description: string;
  type: 'toggle' | 'input' | 'select' | 'number';
  value: unknown;
  options?: { label: string; value: string }[];
  unit?: string;
}

interface SlotReleaseStrategy {
  id: string;
  name: string;
  deviceId?: string;
  modality?: string;
  policyType: 'daily' | 'weekly' | 'manual' | 'smart';
  dailyTime?: string;
  weeklyDay?: number;
  smartThreshold?: number;
  releaseInAdvance: number;
  isActive: boolean;
}

interface SettingsPageProps {
  currentRole: string;
}

export default function SettingsPage({ currentRole: _currentRole }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('appointment');
  const [settings, setSettings] = useState<Record<string, SettingItem[]>>({
    appointment: [
      { id: 'autoConfirm', category: 'appointment', name: '自动确认预约', description: '患者预约后自动确认，无需人工审核', type: 'toggle', value: true },
      { id: 'advanceDays', category: 'appointment', name: '预约提前天数', description: '患者可提前预约的天数范围', type: 'number', value: 14, unit: '天' },
      { id: 'advanceHours', category: 'appointment', name: '最晚预约时间', description: '预约开放的最晚时间（提前）', type: 'number', value: 2, unit: '小时' },
      { id: 'cancelHours', category: 'appointment', name: '取消预约时限', description: '预约取消需提前的小时数', type: 'number', value: 2, unit: '小时' },
      { id: 'noShowLimit', category: 'appointment', name: '爽约次数限制', description: '超过此次数将限制预约', type: 'number', value: 3, unit: '次' },
      { id: 'autoRelease', category: 'appointment', name: '自动放号', description: '每日自动放号时间', type: 'input', value: '08:00' },
      { id: 'reschedule', category: 'appointment', name: '允许改签', description: '是否允许患者自行改签', type: 'toggle', value: true },
    ],
    notification: [
      { id: 'smsNotify', category: 'notification', name: '短信通知', description: '预约成功/变更时发送短信', type: 'toggle', value: true },
      { id: 'wechatNotify', category: 'notification', name: '微信通知', description: '通过微信服务号推送通知', type: 'toggle', value: true },
      { id: 'appNotify', category: 'notification', name: 'APP通知', description: '通过医院APP推送通知', type: 'toggle', value: false },
      { id: 'reminderTime', category: 'notification', name: '检查提醒时间', description: '检查前提醒患者的时间', type: 'number', value: 30, unit: '分钟' },
      { id: 'urgentNotify', category: 'notification', name: '危急值通知', description: '发现危急值时自动通知医生', type: 'toggle', value: true },
    ],
    report: [
      { id: 'autoGenerate', category: 'report', name: '自动生成报告', description: '检查完成后自动生成模板报告', type: 'toggle', value: false },
      { id: 'watermark', category: 'report', name: '报告水印', description: '打印报告时添加水印防伪', type: 'toggle', value: true },
      { id: 'archivePeriod', category: 'report', name: '报告归档期限', description: '报告自动归档的保留期限', type: 'select', value: '7年', options: [{ label: '5年', value: '5年' }, { label: '7年', value: '7年' }, { label: '10年', value: '10年' }, { label: '永久', value: '永久' }] },
      { id: 'autoAudit', category: 'report', name: '自动审核', description: '主治医师自动审核住院报告', type: 'toggle', value: false },
    ],
    print: [
      { id: 'defaultPrinter', category: 'print', name: '默认打印机', description: '系统默认使用的打印机', type: 'input', value: 'HP LaserJet Pro M404dn' },
      { id: 'paperSize', category: 'print', name: '纸张大小', description: '报告打印默认纸张大小', type: 'select', value: 'A4', options: [{ label: 'A4', value: 'A4' }, { label: 'A5', value: 'A5' }, { label: 'B5', value: 'B5' }] },
      { id: 'autoPrint', category: 'print', name: '自动打印', description: '报告审核后自动打印', type: 'toggle', value: false },
      { id: 'copies', category: 'print', name: '默认份数', description: '报告打印的默认份数', type: 'number', value: 2, unit: '份' },
    ],
    system: [
      { id: 'hospitalName', category: 'system', name: '医院名称', description: '系统显示的医院名称', type: 'input', value: '汉东省人民医院' },
      { id: 'sessionTimeout', category: 'system', name: '会话超时', description: '用户无操作自动登出时间', type: 'number', value: 30, unit: '分钟' },
      { id: 'backupEnabled', category: 'system', name: '自动备份', description: '启用系统自动数据备份', type: 'toggle', value: true },
      { id: 'backupTime', category: 'system', name: '备份时间', description: '每日自动备份执行时间', type: 'input', value: '02:00' },
      { id: 'logDays', category: 'system', name: '日志保留', description: '操作日志保留天数', type: 'number', value: 90, unit: '天' },
    ],
    slotRelease: [
      { id: 'globalAutoRelease', category: 'slotRelease', name: '全局自动放号', description: '启用后所有设备按策略自动放号', type: 'toggle', value: true },
      { id: 'globalReleaseTime', category: 'slotRelease', name: '默认放号时间', description: '每日自动放号的默认时间', type: 'input', value: '08:00' },
      { id: 'releaseAdvanceMinutes', category: 'slotRelease', name: '放号提前时间', description: '放号提前多少分钟释放号源', type: 'number', value: 30, unit: '分钟' },
      { id: 'smartReleaseEnabled', category: 'slotRelease', name: '智能放号', description: '根据设备利用率自动调整放号策略', type: 'toggle', value: true },
      { id: 'smartThreshold', category: 'slotRelease', name: '智能放号阈值', description: '利用率超过此阈值时启动智能放号', type: 'number', value: 80, unit: '%' },
      { id: 'tempSlotEnabled', category: 'slotRelease', name: '允许临时加号', description: '是否允许操作员临时增加号源', type: 'toggle', value: true },
      { id: 'tempSlotMaxCount', category: 'slotRelease', name: '临时加号上限', description: '每个时段最多临时增加的号源数', type: 'number', value: 5, unit: '个' },
      { id: 'lockEnabled', category: 'slotRelease', name: '允许号源锁定', description: '是否允许锁定号源供特殊患者使用', type: 'toggle', value: true },
      { id: 'lockDuration', category: 'slotRelease', name: '锁定默认时长', description: '号源锁定的默认保留时间', type: 'number', value: 30, unit: '分钟' },
    ],
  });

  // 放号策略列表
  const [releaseStrategies, setReleaseStrategies] = useState<SlotReleaseStrategy[]>([
    { id: 'RS001', name: '默认策略', policyType: 'daily', dailyTime: '08:00', releaseInAdvance: 30, isActive: true },
    { id: 'RS002', name: 'CT室智能放号', modality: 'CT', policyType: 'smart', smartThreshold: 80, releaseInAdvance: 15, isActive: false },
    { id: 'RS003', name: 'MRI室每周一放号', modality: 'MRI', policyType: 'weekly', weeklyDay: 1, dailyTime: '08:00', releaseInAdvance: 60, isActive: false },
    { id: 'RS004', name: '内镜室手动放号', modality: '内镜', policyType: 'manual', releaseInAdvance: 0, isActive: false },
  ]);

  const [editingStrategy, setEditingStrategy] = useState<SlotReleaseStrategy | null>(null);
  const [showStrategyModal, setShowStrategyModal] = useState(false);

  const currentSettings = settings[activeTab] || [];

  const handleSettingChange = (id: string, newValue: unknown) => {
    setSettings(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(item =>
        item.id === id ? { ...item, value: newValue } : item
      ),
    }));
  };

  const handleSave = () => {
    alert('设置已保存（模拟）');
  };

  const handleReset = () => {
    if (confirm('确定要重置所有设置为默认值吗？')) {
      setSettings(prev => {
        const reset: Record<string, SettingItem[]> = {};
        Object.keys(prev).forEach(key => {
          reset[key] = prev[key].map(item => ({ ...item, value: item.type === 'toggle' ? false : item.type === 'number' ? 0 : '' }));
        });
        return reset;
      });
    }
  };

  // 策略编辑相关
  const handleEditStrategy = (strategy: SlotReleaseStrategy) => {
    setEditingStrategy({ ...strategy });
    setShowStrategyModal(true);
  };

  const handleSaveStrategy = () => {
    if (!editingStrategy) return;
    setReleaseStrategies(prev => prev.map(s => s.id === editingStrategy.id ? editingStrategy : s));
    setShowStrategyModal(false);
    setEditingStrategy(null);
  };

  const handleToggleStrategyActive = (id: string) => {
    setReleaseStrategies(prev => prev.map(s =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const handleDeleteStrategy = (id: string) => {
    if (confirm('确定要删除此放号策略吗？')) {
      setReleaseStrategies(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAddStrategy = () => {
    const newStrategy: SlotReleaseStrategy = {
      id: `RS${Date.now()}`,
      name: '新策略',
      policyType: 'daily',
      dailyTime: '08:00',
      releaseInAdvance: 30,
      isActive: false,
    };
    setEditingStrategy(newStrategy);
    setShowStrategyModal(true);
  };

  const tabs = [
    { key: 'appointment', label: '预约规则', icon: Calendar },
    { key: 'slotRelease', label: '放号策略', icon: Grid3X3 },
    { key: 'notification', label: '通知设置', icon: Bell },
    { key: 'report', label: '报告设置', icon: FileText },
    { key: 'print', label: '打印设置', icon: Printer },
    { key: 'system', label: '系统参数', icon: Monitor },
  ];

  const PRIMARY = '#1e40af';
  const GRAY = '#6b7280';
  const BORDER = '#e5e7eb';

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>系统设置</h2>
        <p style={{ fontSize: 13, color: GRAY, margin: '4px 0 0' }}>配置全院医技检查预约系统的各项参数</p>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* 左侧标签页 */}
        <div style={{
          width: 200,
          background: '#fff',
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
          padding: '8px',
          flexShrink: 0,
          height: 'fit-content',
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <div
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: activeTab === tab.key ? '#eff6ff' : 'transparent',
                  color: activeTab === tab.key ? PRIMARY : GRAY,
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  fontSize: 13,
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </div>
            );
          })}
        </div>

        {/* 右侧设置内容 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeTab === 'slotRelease' ? (
            // 放号策略配置页面
            <>
              {/* 放号策略卡片 */}
              <div style={{
                background: '#fff',
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <Grid3X3 size={16} color={PRIMARY} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>放号策略配置</span>
                </div>

                {/* 策略列表 */}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {releaseStrategies.map(strategy => (
                      <div key={strategy.id} style={{
                        padding: 16, borderRadius: 8, border: `1px solid ${BORDER}`,
                        background: strategy.isActive ? '#ecfdf5' : '#f9fafb',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 600, color: '#1f2937', fontSize: 14 }}>
                                {strategy.name}
                              </span>
                              {strategy.modality && (
                                <span style={{
                                  padding: '2px 8px', borderRadius: 4,
                                  background: '#e0e7ff', color: '#4338ca',
                                  fontSize: 11, fontWeight: 500,
                                }}>
                                  {strategy.modality}
                                </span>
                              )}
                              {strategy.isActive && (
                                <span style={{
                                  padding: '2px 8px', borderRadius: 4,
                                  background: '#10b981', color: '#fff',
                                  fontSize: 11, fontWeight: 500,
                                }}>
                                  启用中
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>
                              {strategy.policyType === 'daily' && `每日 ${strategy.dailyTime} 自动放号`}
                              {strategy.policyType === 'weekly' && `每周第${strategy.weeklyDay}天 ${strategy.dailyTime} 放号`}
                              {strategy.policyType === 'smart' && `智能放号 (利用率>${strategy.smartThreshold}%时触发)`}
                              {strategy.policyType === 'manual' && '手动放号'}
                              {' | 提前'}{strategy.releaseInAdvance}分钟释放
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleToggleStrategyActive(strategy.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '6px 12px', borderRadius: 6,
                                border: 'none', cursor: 'pointer',
                                background: strategy.isActive ? '#fef3c7' : '#ecfdf5',
                                color: strategy.isActive ? '#d97706' : '#059669',
                                fontSize: 12, fontWeight: 500,
                              }}
                            >
                              {strategy.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                              {strategy.isActive ? '已启用' : '已禁用'}
                            </button>
                            <button
                              onClick={() => handleEditStrategy(strategy)}
                              style={{
                                padding: '6px 12px', borderRadius: 6,
                                border: `1px solid ${BORDER}`, background: '#fff',
                                color: GRAY, fontSize: 12, cursor: 'pointer',
                              }}
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteStrategy(strategy.id)}
                              style={{
                                padding: '6px 12px', borderRadius: 6,
                                border: 'none', background: '#fef2f2',
                                color: '#ef4444', fontSize: 12, cursor: 'pointer',
                              }}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 添加策略按钮 */}
                  <button
                    onClick={handleAddStrategy}
                    style={{
                      marginTop: 16, display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 16px', borderRadius: 8,
                      border: `1px dashed ${BORDER}`, background: '#fafafa',
                      color: PRIMARY, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    <Zap size={14} /> 添加新策略
                  </button>
                </div>
              </div>

              {/* 全局放号设置 */}
              <div style={{
                background: '#fff',
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <Lock size={16} color={PRIMARY} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>全局放号设置</span>
                </div>

                <div style={{ padding: '8px 0' }}>
                  {settings.slotRelease.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 20px',
                        borderBottom: index < settings.slotRelease.length - 1 ? `1px solid ${BORDER}` : 'none',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{item.description}</div>
                      </div>

                      <div style={{ marginLeft: 24 }}>
                        {item.type === 'toggle' && (
                          <div
                            onClick={() => handleSettingChange(item.id, !item.value)}
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          >
                            {item.value ? (
                              <ToggleRight size={32} color={PRIMARY} />
                            ) : (
                              <ToggleLeft size={32} color={GRAY} />
                            )}
                          </div>
                        )}

                        {item.type === 'input' && (
                          <input
                            type="text"
                            value={String(item.value)}
                            onChange={e => handleSettingChange(item.id, e.target.value)}
                            style={{
                              width: 200, padding: '6px 10px', border: `1px solid ${BORDER}`,
                              borderRadius: 6, fontSize: 13, outline: 'none', color: '#1f2937',
                            }}
                          />
                        )}

                        {item.type === 'number' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                              type="number"
                              value={Number(item.value)}
                              onChange={e => handleSettingChange(item.id, Number(e.target.value))}
                              style={{
                                width: 80, padding: '6px 10px', border: `1px solid ${BORDER}`,
                                borderRadius: 6, fontSize: 13, outline: 'none', color: '#1f2937',
                              }}
                            />
                            {item.unit && <span style={{ fontSize: 12, color: GRAY }}>{item.unit}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // 普通设置页面
            <div style={{
              background: '#fff',
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                {activeTab === 'appointment' && <Calendar size={16} color={PRIMARY} />}
                {activeTab === 'notification' && <Bell size={16} color={PRIMARY} />}
                {activeTab === 'report' && <FileText size={16} color={PRIMARY} />}
                {activeTab === 'print' && <Printer size={16} color={PRIMARY} />}
                {activeTab === 'system' && <Monitor size={16} color={PRIMARY} />}
                <span style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>
                  {tabs.find(t => t.key === activeTab)?.label}
                </span>
              </div>

              <div style={{ padding: '8px 0' }}>
                {currentSettings.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      borderBottom: index < currentSettings.length - 1 ? `1px solid ${BORDER}` : 'none',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{item.description}</div>
                    </div>

                    <div style={{ marginLeft: 24 }}>
                      {item.type === 'toggle' && (
                        <div
                          onClick={() => handleSettingChange(item.id, !item.value)}
                          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        >
                          {item.value ? (
                            <ToggleRight size={32} color={PRIMARY} />
                          ) : (
                            <ToggleLeft size={32} color={GRAY} />
                          )}
                        </div>
                      )}

                      {item.type === 'input' && (
                        <input
                          type="text"
                          value={String(item.value)}
                          onChange={e => handleSettingChange(item.id, e.target.value)}
                          style={{
                            width: 200, padding: '6px 10px', border: `1px solid ${BORDER}`,
                            borderRadius: 6, fontSize: 13, outline: 'none', color: '#1f2937',
                          }}
                        />
                      )}

                      {item.type === 'number' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="number"
                            value={Number(item.value)}
                            onChange={e => handleSettingChange(item.id, Number(e.target.value))}
                            style={{
                              width: 80, padding: '6px 10px', border: `1px solid ${BORDER}`,
                              borderRadius: 6, fontSize: 13, outline: 'none', color: '#1f2937',
                            }}
                          />
                          {item.unit && <span style={{ fontSize: 12, color: GRAY }}>{item.unit}</span>}
                        </div>
                      )}

                      {item.type === 'select' && (
                        <select
                          value={String(item.value)}
                          onChange={e => handleSettingChange(item.id, e.target.value)}
                          style={{
                            padding: '6px 10px', border: `1px solid ${BORDER}`,
                            borderRadius: 6, fontSize: 13, outline: 'none', color: '#1f2937',
                            minWidth: 120,
                          }}
                        >
                          {item.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 保存/重置按钮 */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 13, color: GRAY }}>
              <Check size={14} style={{ display: 'inline', marginRight: 4 }} />
              所有更改会自动保存到本地配置
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  background: '#fff',
                  color: GRAY,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                重置
              </button>
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: 8,
                  background: PRIMARY,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Save size={14} />
                保存设置
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 策略编辑模态框 */}
      {showStrategyModal && editingStrategy && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 500,
            maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: `1px solid ${BORDER}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                {editingStrategy.id.startsWith('RS') && !releaseStrategies.find(s => s.id === editingStrategy.id) ? '添加策略' : '编辑策略'}
              </h3>
              <button
                onClick={() => { setShowStrategyModal(false); setEditingStrategy(null); }}
                style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 20, display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>策略名称</label>
                <input
                  type="text"
                  value={editingStrategy.name}
                  onChange={e => setEditingStrategy({ ...editingStrategy, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>适用设备类型</label>
                <select
                  value={editingStrategy.modality || ''}
                  onChange={e => setEditingStrategy({ ...editingStrategy, modality: e.target.value || undefined })}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13 }}
                >
                  <option value="">全部设备</option>
                  <option value="CT">CT</option>
                  <option value="MRI">MRI</option>
                  <option value="超声">超声</option>
                  <option value="内镜">内镜</option>
                  <option value="心电">心电</option>
                  <option value="X光">X光</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>放号策略类型</label>
                <select
                  value={editingStrategy.policyType}
                  onChange={e => setEditingStrategy({ ...editingStrategy, policyType: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13 }}
                >
                  <option value="daily">每日自动放号</option>
                  <option value="weekly">每周固定日放号</option>
                  <option value="smart">智能放号</option>
                  <option value="manual">手动放号</option>
                </select>
              </div>

              {(editingStrategy.policyType === 'daily' || editingStrategy.policyType === 'weekly') && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>放号时间</label>
                  <input
                    type="time"
                    value={editingStrategy.dailyTime || '08:00'}
                    onChange={e => setEditingStrategy({ ...editingStrategy, dailyTime: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13 }}
                  />
                </div>
              )}

              {editingStrategy.policyType === 'weekly' && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>每周放号日</label>
                  <select
                    value={editingStrategy.weeklyDay || 1}
                    onChange={e => setEditingStrategy({ ...editingStrategy, weeklyDay: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13 }}
                  >
                    <option value={1}>周一</option>
                    <option value={2}>周二</option>
                    <option value={3}>周三</option>
                    <option value={4}>周四</option>
                    <option value={5}>周五</option>
                    <option value={6}>周六</option>
                    <option value={0}>周日</option>
                  </select>
                </div>
              )}

              {editingStrategy.policyType === 'smart' && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>智能放号阈值</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingStrategy.smartThreshold || 80}
                      onChange={e => setEditingStrategy({ ...editingStrategy, smartThreshold: Number(e.target.value) })}
                      style={{ width: 100, padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13 }}
                    />
                    <span style={{ fontSize: 13, color: GRAY }}>% 利用率</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    当设备利用率超过此阈值时，自动释放更多号源
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>提前释放时间</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min="0"
                    value={editingStrategy.releaseInAdvance}
                    onChange={e => setEditingStrategy({ ...editingStrategy, releaseInAdvance: Number(e.target.value) })}
                    style={{ width: 100, padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13 }}
                  />
                  <span style={{ fontSize: 13, color: GRAY }}>分钟</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => { setShowStrategyModal(false); setEditingStrategy(null); }}
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: `1px solid ${BORDER}`,
                    background: '#fff', color: GRAY, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveStrategy}
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: 'none',
                    background: PRIMARY, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  保存策略
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
