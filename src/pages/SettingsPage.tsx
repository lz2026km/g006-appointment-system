// G006 全院医技检查预约系统 - 系统设置页面
// 汉东省人民医院全院医技检查预约系统
import { useState } from 'react';
import {
  Save, RotateCcw, Bell, FileText, Printer,
  Monitor, Check, ToggleLeft, ToggleRight, Calendar
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
  });

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

  const tabs = [
    { key: 'appointment', label: '预约规则', icon: Calendar },
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
          {/* 设置卡片 */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            overflow: 'hidden',
          }}>
            {/* 卡片标题 */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${BORDER}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Calendar size={16} color={PRIMARY} />
              <span style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>
                {tabs.find(t => t.key === activeTab)?.label}
              </span>
            </div>

            {/* 设置项列表 */}
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
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
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
                          width: 200,
                          padding: '6px 10px',
                          border: `1px solid ${BORDER}`,
                          borderRadius: 6,
                          fontSize: 13,
                          outline: 'none',
                          color: '#1f2937',
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
                            width: 80,
                            padding: '6px 10px',
                            border: `1px solid ${BORDER}`,
                            borderRadius: 6,
                            fontSize: 13,
                            outline: 'none',
                            color: '#1f2937',
                          }}
                        />
                        {item.unit && (
                          <span style={{ fontSize: 12, color: GRAY }}>{item.unit}</span>
                        )}
                      </div>
                    )}

                    {item.type === 'select' && (
                      <select
                        value={String(item.value)}
                        onChange={e => handleSettingChange(item.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: `1px solid ${BORDER}`,
                          borderRadius: 6,
                          fontSize: 13,
                          outline: 'none',
                          color: '#1f2937',
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
    </div>
  );
}
