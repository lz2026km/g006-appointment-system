// G006 全院医技检查预约系统 - 预约规则配置页面
import { useState } from 'react';
import { 
  Shield, AlertTriangle, Clock, BarChart3, Plus, Edit2, Trash2, 
  Search, Eye, X, Check, ChevronDown, ChevronUp, Play, RotateCcw,
  ToggleLeft, ToggleRight, Filter, RefreshCw, Save, AlertCircle, Info
} from 'lucide-react';
import { 
  ALL_RULES, MUTEX_RULES, RESTRICTION_RULES, PRIORITY_RULES, TIME_CONSTRAINT_RULES,
  getRulesByType, getRuleById, getRulesStatistics, evaluateRules,
  type Rule, type RuleType, type RuleSeverity, type RuleEvaluationResult, type RuleEngineContext
} from '../data/rulesData';
import { APPOINTMENTS, EXAM_ITEMS, DEVICES, PATIENTS } from '../data/initialData';

type TabType = 'mutex' | 'restriction' | 'priority' | 'timeConstraint';
type ModalType = 'view' | 'edit' | 'create' | 'test';

const TAB_CONFIG: Record<TabType, { label: string; icon: typeof Shield; color: string; rules: Rule[] }> = {
  mutex: { label: '互斥规则', icon: AlertTriangle, color: '#ef4444', rules: MUTEX_RULES },
  restriction: { label: '限制规则', icon: Shield, color: '#f59e0b', rules: RESTRICTION_RULES },
  priority: { label: '优先级规则', icon: BarChart3, color: '#3b82f6', rules: PRIORITY_RULES },
  timeConstraint: { label: '时间约束', icon: Clock, color: '#10b981', rules: TIME_CONSTRAINT_RULES },
};

const SEVERITY_COLORS: Record<RuleSeverity, { bg: string; text: string; border: string }> = {
  error: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  warning: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  info: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
};

export default function RulesConfigPage({ currentRole }: { currentRole: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('mutex');
  const [rules, setRules] = useState<Rule[]>(ALL_RULES);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('view');
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [testResult, setTestResult] = useState<RuleEvaluationResult | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  
  // 测试模拟状态
  const [testContext, setTestContext] = useState<RuleEngineContext>({
    appointment: {
      patientId: 'P001',
      patientName: '李建国',
      examItemId: 'EI001',
      examItemName: '头颅CT平扫',
      modality: 'CT',
      deviceId: 'DEV001',
      deviceName: 'CT-01',
      appointmentDate: '2026-05-02',
      appointmentTime: '10:00-11:00',
    },
    existingAppointments: APPOINTMENTS,
    patientAge: 58,
    patientGender: '男',
    patientType: '门诊',
    isUrgent: false,
    waitingDays: 1,
    deviceUsedSlots: 28,
  });

  const currentTabConfig = TAB_CONFIG[activeTab];
  const currentRules = rules.filter(r => r.type === activeTab);
  
  const filteredRules = currentRules.filter(rule => {
    if (!searchText) return true;
    return rule.name.includes(searchText) || 
           rule.description.includes(searchText) || 
           rule.id.includes(searchText);
  });

  const stats = getRulesStatistics();

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled, updatedAt: new Date().toLocaleString() } : r
    ));
  };

  const handleView = (rule: Rule) => { setSelectedRule(rule); setModalType('view'); setShowModal(true); };
  const handleEdit = (rule: Rule) => { setSelectedRule(rule); setModalType('edit'); setShowModal(true); };
  const handleCreate = () => { setSelectedRule(null); setModalType('create'); setShowModal(true); };
  
  const handleTest = () => {
    setShowTestPanel(true);
    setTestResult(null);
  };

  const runTest = () => {
    const result = evaluateRules(testContext);
    setTestResult(result);
  };

  const handleTestContextChange = (key: string, value: any) => {
    if (key.startsWith('appointment.')) {
      const apptKey = key.replace('appointment.', '');
      setTestContext(prev => ({
        ...prev,
        appointment: { ...prev.appointment, [apptKey]: value },
      }));
    } else {
      setTestContext(prev => ({ ...prev, [key]: value }));
    }
  };

  const severityTag = (severity: RuleSeverity) => {
    const s = SEVERITY_COLORS[severity];
    return { padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: s.bg, color: s.text, border: `1px solid ${s.border}` };
  };

  return (
    <div style={{ padding: 24, background: '#f0f4f8', minHeight: '100vh', fontFamily: '"Segoe UI", sans-serif' }}>
      {/* 页面标题 */}
      <div style={{ background: '#ffffff', borderRadius: 8, padding: '20px 24px', marginBottom: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1e40af', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={24} />预约规则配置
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0 0' }}>配置和管理预约规则引擎，支持互斥、限制、优先级和时间约束</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleTest} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#ffffff', color: '#10b981', border: '1px solid #10b981', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Play size={14} />规则测试
            </button>
            {currentRole === '管理员' && (
              <button onClick={handleCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#1e40af', color: '#ffffff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <Plus size={16} />新建规则
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '总规则', value: stats.total, color: '#1e40af' },
          { label: '已启用', value: stats.enabled, color: '#10b981' },
          { label: '已禁用', value: stats.disabled, color: '#6b7280' },
          { label: '互斥规则', value: stats.mutexCount, color: '#ef4444' },
          { label: '限制规则', value: stats.restrictionCount, color: '#f59e0b' },
          { label: '时间约束', value: stats.timeConstraintCount, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#ffffff', borderRadius: 8, padding: '14px 16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tab切换 */}
      <div style={{ background: '#ffffff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: 16 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {(Object.keys(TAB_CONFIG) as TabType[]).map(tab => {
            const config = TAB_CONFIG[tab];
            const Icon = config.icon;
            const isActive = activeTab === tab;
            const tabRules = rules.filter(r => r.type === tab);
            const enabledCount = tabRules.filter(r => r.enabled).length;
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  borderBottom: isActive ? `2px solid ${config.color}` : '2px solid transparent',
                  color: isActive ? config.color : '#6b7280', fontWeight: isActive ? 600 : 500,
                  fontSize: 13, transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                {config.label}
                <span style={{ 
                  padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                  background: isActive ? `${config.color}20` : '#f3f4f6',
                  color: isActive ? config.color : '#6b7280',
                }}>
                  {enabledCount}/{tabRules.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab内容 */}
        <div style={{ padding: 16 }}>
          {/* 搜索栏 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="text" 
                placeholder={`搜索${currentTabConfig.label}...`} 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 38px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center' }}>
              共 {filteredRules.length} 条规则
            </div>
          </div>

          {/* 规则列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredRules.map(rule => (
              <div 
                key={rule.id}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '14px 16px',
                  background: rule.enabled ? '#ffffff' : '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: 8, gap: 12, opacity: rule.enabled ? 1 : 0.6,
                  transition: 'all 0.2s',
                }}
              >
                {/* 状态指示 */}
                <div style={{ 
                  width: 8, height: 40, borderRadius: 4,
                  background: rule.enabled ? currentTabConfig.color : '#d1d5db',
                }} />
                
                {/* 规则信息 */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{rule.name}</span>
                    <span style={severityTag(rule.severity)}>{rule.severity === 'error' ? '错误' : rule.severity === 'warning' ? '警告' : '提示'}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#f3f4f6', color: '#6b7280' }}>
                      优先级 {rule.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{rule.description}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    {rule.tags.map(tag => (
                      <span key={tag} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: '#e0e7ff', color: '#4338ca' }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => handleToggleRule(rule.id)} title={rule.enabled ? '禁用' : '启用'} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}>
                    {rule.enabled ? <ToggleRight size={22} color="#10b981" /> : <ToggleLeft size={22} color="#9ca3af" />}
                  </button>
                  <button onClick={() => handleView(rule)} title="查看" style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}>
                    <Eye size={16} />
                  </button>
                  {currentRole === '管理员' && (
                    <>
                      <button onClick={() => handleEdit(rule)} title="编辑" style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(rule.id)} title="删除" style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 规则测试面板 */}
      {showTestPanel && (
        <div style={{ background: '#ffffff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Play size={18} color="#10b981" />规则引擎测试
            </h3>
            <button onClick={() => setShowTestPanel(false)} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <X size={20} color="#6b7280" />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* 左侧：测试上下文 */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>测试上下文</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>患者</label>
                  <select 
                    value={testContext.appointment.patientId || ''}
                    onChange={e => {
                      const patient = PATIENTS.find(p => p.id === e.target.value);
                      if (patient) {
                        handleTestContextChange('appointment.patientId', patient.id);
                        handleTestContextChange('appointment.patientName', patient.name);
                        handleTestContextChange('patientGender', patient.gender);
                        handleTestContextChange('patientAge', patient.age);
                        handleTestContextChange('patientType', patient.patientType);
                      }
                    }}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
                  >
                    <option value="">选择患者</option>
                    {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.age}岁/{p.gender})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>检查项目</label>
                  <select 
                    value={testContext.appointment.examItemId || ''}
                    onChange={e => {
                      const item = EXAM_ITEMS.find(i => i.id === e.target.value);
                      if (item) {
                        handleTestContextChange('appointment.examItemId', item.id);
                        handleTestContextChange('appointment.examItemName', item.name);
                        handleTestContextChange('modality', item.modality);
                        handleTestContextChange('appointment.modality', item.modality);
                      }
                    }}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
                  >
                    <option value="">选择项目</option>
                    {EXAM_ITEMS.map(i => <option key={i.id} value={i.id}>{i.name} ({i.modality})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>设备</label>
                  <select 
                    value={testContext.appointment.deviceId || ''}
                    onChange={e => {
                      const device = DEVICES.find(d => d.id === e.target.value);
                      if (device) {
                        handleTestContextChange('appointment.deviceId', device.id);
                        handleTestContextChange('appointment.deviceName', device.name);
                        handleTestContextChange('deviceUsedSlots', device.usedSlots);
                      }
                    }}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
                  >
                    <option value="">选择设备</option>
                    {DEVICES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>预约日期</label>
                  <input 
                    type="date" 
                    value={testContext.appointment.appointmentDate || ''}
                    onChange={e => handleTestContextChange('appointment.appointmentDate', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>预约时段</label>
                  <select 
                    value={testContext.appointment.appointmentTime || ''}
                    onChange={e => handleTestContextChange('appointment.appointmentTime', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
                  >
                    <option value="">选择时段</option>
                    {['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>是否加急</label>
                  <select 
                    value={testContext.isUrgent ? 'true' : 'false'}
                    onChange={e => handleTestContextChange('isUrgent', e.target.value === 'true')}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
                  >
                    <option value="false">否</option>
                    <option value="true">是</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>等候天数</label>
                  <input 
                    type="number" 
                    value={testContext.waitingDays || 0}
                    onChange={e => handleTestContextChange('waitingDays', Number(e.target.value))}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>临床诊断</label>
                  <input 
                    type="text" 
                    value={testContext.clinicalDiagnosis || ''}
                    onChange={e => handleTestContextChange('clinicalDiagnosis', e.target.value)}
                    placeholder="如: 冠心病, 肺癌"
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}
                  />
                </div>
              </div>
              <button 
                onClick={runTest}
                style={{ 
                  marginTop: 14, padding: '10px 20px', background: '#10b981', color: '#ffffff',
                  border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Play size={14} />执行测试
              </button>
            </div>

            {/* 右侧：测试结果 */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>测试结果</h4>
              {testResult ? (
                <div style={{ 
                  padding: 14, borderRadius: 8, 
                  background: testResult.passed ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${testResult.passed ? '#86efac' : '#fca5a5'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    {testResult.passed ? (
                      <><Check size={18} color="#10b981" /><span style={{ fontWeight: 600, color: '#10b981' }}>验证通过</span></>
                    ) : (
                      <><AlertCircle size={18} color="#ef4444" /><span style={{ fontWeight: 600, color: '#ef4444' }}>验证失败</span></>
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
                      优先级分数: <strong style={{ color: '#1e40af' }}>{testResult.priorityScore}</strong>
                    </span>
                  </div>
                  
                  {/* 违规详情 */}
                  {testResult.violations.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', marginBottom: 6 }}>错误 ({testResult.violations.length})</div>
                      {testResult.violations.map(v => (
                        <div key={v.ruleId} style={{ 
                          padding: '8px 10px', background: '#fee2e2', borderRadius: 4, marginBottom: 6, fontSize: 12,
                          borderLeft: `3px solid ${v.severity === 'error' ? '#ef4444' : '#f59e0b'}`
                        }}>
                          <div style={{ fontWeight: 600, color: '#991b1b' }}>{v.ruleName}</div>
                          <div style={{ color: '#7f1d1d', marginTop: 2 }}>{v.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 警告详情 */}
                  {testResult.warnings.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>警告 ({testResult.warnings.length})</div>
                      {testResult.warnings.map(w => (
                        <div key={w.ruleId} style={{ 
                          padding: '8px 10px', background: '#fef3c7', borderRadius: 4, marginBottom: 6, fontSize: 12,
                          borderLeft: '3px solid #f59e0b'
                        }}>
                          <div style={{ fontWeight: 600, color: '#92400e' }}>{w.ruleName}</div>
                          <div style={{ color: '#78350f', marginTop: 2 }}>{w.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 建议时段 */}
                  {testResult.suggestedSlots.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>建议时段</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {testResult.suggestedSlots.map(slot => (
                          <span key={slot} style={{ padding: '4px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: 4, fontSize: 11 }}>
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', background: '#f9fafb', borderRadius: 8 }}>
                  <Info size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: 13, margin: 0 }}>点击"执行测试"查看结果</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 模态框 */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: 8, width: '90%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            {/* 模态框头部 */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
                {modalType === 'view' ? '规则详情' : modalType === 'edit' ? '编辑规则' : '新建规则'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>

            {/* 模态框内容 */}
            <div style={{ padding: 20 }}>
              {selectedRule && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>规则ID</label>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{selectedRule.id}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>规则名称</label>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{selectedRule.name}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>描述</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>{selectedRule.description}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>类型</label>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                      background: TAB_CONFIG[selectedRule.type as TabType]?.color + '20' || '#f3f4f6',
                      color: TAB_CONFIG[selectedRule.type as TabType]?.color || '#6b7280',
                    }}>
                      {TAB_CONFIG[selectedRule.type as TabType]?.label || selectedRule.type}
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>严重级别</label>
                    <span style={severityTag(selectedRule.severity)}>
                      {selectedRule.severity === 'error' ? '错误' : selectedRule.severity === 'warning' ? '警告' : '提示'}
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>优先级</label>
                    <div style={{ fontSize: 14, color: '#111827' }}>{selectedRule.priority}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>状态</label>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 4, fontSize: 12,
                      background: selectedRule.enabled ? '#dcfce7' : '#f3f4f6',
                      color: selectedRule.enabled ? '#166534' : '#6b7280',
                    }}>
                      {selectedRule.enabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>标签</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {selectedRule.tags.map(tag => (
                        <span key={tag} style={{ padding: '4px 8px', background: '#e0e7ff', color: '#4338ca', borderRadius: 4, fontSize: 11 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>拦截提示</label>
                    <div style={{ 
                      padding: 10, background: '#fef3c7', borderRadius: 4, fontSize: 13, color: '#92400e',
                      borderLeft: '3px solid #f59e0b'
                    }}>
                      {selectedRule.message}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>创建时间</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>{selectedRule.createdAt}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>更新时间</label>
                    <div style={{ fontSize: 14, color: '#374151' }}>{selectedRule.updatedAt}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>规则配置</label>
                    <pre style={{ 
                      padding: 12, background: '#1f2937', color: '#e5e7eb', borderRadius: 4, 
                      fontSize: 11, overflow: 'auto', maxHeight: 200
                    }}>
                      {JSON.stringify(selectedRule.config, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* 模态框底部 */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, background: '#ffffff', cursor: 'pointer' }}>
                关闭
              </button>
              {modalType === 'edit' && (
                <button style={{ padding: '10px 20px', border: 'none', borderRadius: 4, fontSize: 13, background: '#1e40af', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }}>
                  保存修改
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function handleDelete(ruleId: string) {
  if (confirm('确定要删除此规则吗？')) {
    // 实际应该调用删除API
    console.log('Delete rule:', ruleId);
  }
}
