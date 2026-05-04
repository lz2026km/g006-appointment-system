// G006 全院医技检查预约系统 - 通知模板管理页面
import React, { useState, useMemo } from 'react';
import {
  Bell, MessageSquare, Smartphone, Mail, Search, Plus, Edit2, Trash2,
  Eye, Copy, CheckCircle, XCircle, Clock, Send, RefreshCw, ChevronDown,
  FileText, Volume2, AlertTriangle, Check, X, Save, ToggleLeft, ToggleRight
} from 'lucide-react';
import { NotificationTemplate, NotificationTemplateType, SendRecord, SendRecordStatus } from '../types';
import { NOTIFICATION_TEMPLATES, SEND_RECORDS } from '../data/initialData';

interface NotificationTemplatePageProps {
  currentRole: string;
}

// 模板类型配置
const TEMPLATE_TYPE_CONFIG: Record<NotificationTemplateType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  '短信': { icon: <MessageSquare size={16} />, color: '#059669', bgColor: '#ecfdf5' },
  '微信': { icon: <Bell size={16} />, color: '#1e40af', bgColor: '#eff6ff' },
  'APP推送': { icon: <Smartphone size={16} />, color: '#7c3aed', bgColor: '#f5f3ff' },
};

// 状态颜色配置
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  '启用': { bg: '#ecfdf5', text: '#059669' },
  '停用': { bg: '#fef2f2', text: '#dc2626' },
};

// 发送状态配置
const SEND_STATUS_CONFIG: Record<SendRecordStatus, { color: string; bgColor: string }> = {
  '待发送': { color: '#d97706', bgColor: '#fffbeb' },
  '发送中': { color: '#2563eb', bgColor: '#eff6ff' },
  '已发送': { color: '#059669', bgColor: '#ecfdf5' },
  '发送失败': { color: '#dc2626', bgColor: '#fef2f2' },
  '已送达': { color: '#0891b2', bgColor: '#ecfeff' },
  '已阅读': { color: '#7c3aed', bgColor: '#f5f3ff' },
};

export default function NotificationTemplatePage({ currentRole }: NotificationTemplatePageProps) {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(NOTIFICATION_TEMPLATES);
  const [records, setRecords] = useState<SendRecord[]>(SEND_RECORDS);
  const [activeTab, setActiveTab] = useState<'templates' | 'records'>('templates');
  const [activeType, setActiveType] = useState<NotificationTemplateType | '全部'>('全部');
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | 'test' | 'preview'>('view');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editForm, setEditForm] = useState<Partial<NotificationTemplate>>({});
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [recordFilterType, setRecordFilterType] = useState<NotificationTemplateType | '全部'>('全部');
  const [recordFilterStatus, setRecordFilterStatus] = useState<SendRecordStatus | '全部'>('全部');

  // 变量替换示例值
  const VARIABLE_EXAMPLES: Record<string, string> = {
    patientName: '张三',
    examItemName: '头颅CT平扫',
    appointmentDate: '2026-05-02',
    appointmentTime: '08:00-09:00',
    location: '医技楼1层CT-1室',
    hospitalPhone: '027-88888888',
    reportLocation: '医技楼1层自助机',
    reportTime: '2026-05-02 10:30',
    doctorName: '张伟医生',
    oldDate: '2026-05-03',
    oldTime: '09:00',
    cancelReason: '患者主动取消',
    queueNumber: '001',
    waitTime: '15',
    criticalValue: '肺部大面积阴影',
  };

  // 筛选后的模板
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesType = activeType === '全部' || t.type === activeType;
      const matchesSearch = searchText === '' ||
        t.name.includes(searchText) ||
        t.title.includes(searchText) ||
        t.content.includes(searchText);
      return matchesType && matchesSearch;
    });
  }, [templates, activeType, searchText]);

  // 按类型统计
  const templateStats = useMemo(() => {
    return {
      '短信': templates.filter(t => t.type === '短信').length,
      '微信': templates.filter(t => t.type === '微信').length,
      'APP推送': templates.filter(t => t.type === 'APP推送').length,
      '启用': templates.filter(t => t.status === '启用').length,
    };
  }, [templates]);

  // 发送记录统计
  const recordStats = useMemo(() => {
    return {
      total: records.length,
      sent: records.filter(r => ['已发送', '已送达', '已阅读'].includes(r.status)).length,
      failed: records.filter(r => r.status === '发送失败').length,
      pending: records.filter(r => ['待发送', '发送中'].includes(r.status)).length,
    };
  }, [records]);

  // 筛选后的发送记录
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesType = recordFilterType === '全部' || r.templateType === recordFilterType;
      const matchesStatus = recordFilterStatus === '全部' || r.status === recordFilterStatus;
      const matchesSearch = searchText === '' ||
        r.recipientName.includes(searchText) ||
        r.templateName.includes(searchText);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [records, recordFilterType, recordFilterStatus, searchText]);

  // 分页
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  // 变量替换
  const replaceVariables = (content: string, vars: Record<string, string>) => {
    let result = content;
    Object.entries(vars).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value || `[${key}]`);
    });
    return result;
  };

  // 预览模板
  const handlePreview = (template: NotificationTemplate) => {
    const vars: Record<string, string> = {};
    template.variables.forEach(v => {
      vars[v] = VARIABLE_EXAMPLES[v] || '';
    });
    setTestVariables(vars);
    setPreviewContent(replaceVariables(template.content, vars));
    setSelectedTemplate(template);
    setModalType('preview');
    setShowModal(true);
  };

  // 测试发送
  const handleTestSend = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    const vars: Record<string, string> = {};
    template.variables.forEach(v => {
      vars[v] = VARIABLE_EXAMPLES[v] || '';
    });
    setTestVariables(vars);
    setPreviewContent(replaceVariables(template.content, vars));
    setModalType('test');
    setShowModal(true);
  };

  // 更新测试变量
  const handleVariableChange = (key: string, value: string) => {
    const newVars = { ...testVariables, [key]: value };
    setTestVariables(newVars);
    if (selectedTemplate) {
      setPreviewContent(replaceVariables(selectedTemplate.content, newVars));
    }
  };

  // 切换模板状态
  const toggleStatus = (id: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === '启用' ? '停用' : '启用', updatedAt: new Date().toLocaleString() } : t
    ));
  };

  // 复制模板内容
  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // 格式化时间
  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return createdAt.split(' ')[0];
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 标题区 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e40af', margin: 0 }}>通知模板管理</h1>
          <p style={{ fontSize: 14, color: '#666', margin: '8px 0 0 0' }}>
            汉东省人民医院 · {currentRole}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setActiveTab('templates'); setShowModal(false); }}
            style={{
              padding: '8px 16px',
              border: '1px solid',
              borderColor: activeTab === 'templates' ? '#1e40af' : '#e8e8e8',
              borderRadius: 6,
              background: activeTab === 'templates' ? '#eff6ff' : '#fff',
              color: activeTab === 'templates' ? '#1e40af' : '#666',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            模板管理
          </button>
          <button
            onClick={() => { setActiveTab('records'); setShowModal(false); }}
            style={{
              padding: '8px 16px',
              border: '1px solid',
              borderColor: activeTab === 'records' ? '#1e40af' : '#e8e8e8',
              borderRadius: 6,
              background: activeTab === 'records' ? '#eff6ff' : '#fff',
              color: activeTab === 'records' ? '#1e40af' : '#666',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            发送记录
          </button>
        </div>
      </div>

      {activeTab === 'templates' ? (
        <>
          {/* 统计卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: '短信模板', value: templateStats['短信'], icon: <MessageSquare size={20} />, color: '#059669', bgColor: '#ecfdf5' },
              { label: '微信模板', value: templateStats['微信'], icon: <Bell size={20} />, color: '#1e40af', bgColor: '#eff6ff' },
              { label: 'APP推送模板', value: templateStats['APP推送'], icon: <Smartphone size={20} />, color: '#7c3aed', bgColor: '#f5f3ff' },
              { label: '启用模板', value: templateStats['启用'], icon: <CheckCircle size={20} />, color: '#059669', bgColor: '#ecfdf5' },
            ].map((stat, idx) => (
              <div key={idx} style={{
                background: '#fff',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: stat.bgColor,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 筛选区 */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* 搜索框 */}
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input
                  type="text"
                  placeholder="搜索模板名称或内容..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    border: '1px solid #e8e8e8',
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 类型筛选 */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['全部', '短信', '微信', 'APP推送'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid',
                      borderColor: activeType === type ? '#1e40af' : '#e8e8e8',
                      borderRadius: 6,
                      background: activeType === type ? '#eff6ff' : '#fff',
                      color: activeType === type ? '#1e40af' : '#666',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 模板列表 */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>
            {filteredTemplates.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#999' }}>
                <FileText size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <div style={{ fontSize: 14 }}>暂无模板</div>
              </div>
            ) : (
              filteredTemplates.map((template, idx) => {
                const config = TEMPLATE_TYPE_CONFIG[template.type];
                const statusStyle = STATUS_STYLES[template.status];
                return (
                  <div
                    key={template.id}
                    style={{
                      padding: 16,
                      borderBottom: idx < filteredTemplates.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* 类型图标 */}
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: config.bgColor,
                        color: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {config.icon}
                      </div>

                      {/* 内容区 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{template.name}</div>
                          <div style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: config.bgColor,
                            color: config.color,
                          }}>
                            {template.type}
                          </div>
                          <div style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: statusStyle.bg,
                            color: statusStyle.text,
                          }}>
                            {template.status}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{template.title}</div>
                        <div style={{ fontSize: 12, color: '#999', marginBottom: 8, lineHeight: 1.5 }}>
                          {template.content.substring(0, 120)}{template.content.length > 120 ? '...' : ''}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#999' }}>
                          <span>变量：{template.variables.length}个</span>
                          <span>更新：{formatTime(template.updatedAt)}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button
                          onClick={() => handlePreview(template)}
                          title="预览"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: '1px solid #e8e8e8',
                            background: '#fff',
                            color: '#666',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleTestSend(template)}
                          title="测试发送"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: '1px solid #e8e8e8',
                            background: '#fff',
                            color: '#1e40af',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Send size={14} />
                        </button>
                        <button
                          onClick={() => copyContent(template.content)}
                          title="复制内容"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: '1px solid #e8e8e8',
                            background: '#fff',
                            color: '#666',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => toggleStatus(template.id)}
                          title={template.status === '启用' ? '停用' : '启用'}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: '1px solid #e8e8e8',
                            background: '#fff',
                            color: template.status === '启用' ? '#dc2626' : '#059669',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {template.status === '启用' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* 发送记录统计卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: '总发送量', value: recordStats.total, icon: <Send size={20} />, color: '#1e40af', bgColor: '#eff6ff' },
              { label: '成功发送', value: recordStats.sent, icon: <CheckCircle size={20} />, color: '#059669', bgColor: '#ecfdf5' },
              { label: '发送失败', value: recordStats.failed, icon: <XCircle size={20} />, color: '#dc2626', bgColor: '#fef2f2' },
              { label: '待发送', value: recordStats.pending, icon: <Clock size={20} />, color: '#d97706', bgColor: '#fffbeb' },
            ].map((stat, idx) => (
              <div key={idx} style={{
                background: '#fff',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: stat.bgColor,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 发送记录筛选区 */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* 搜索框 */}
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input
                  type="text"
                  placeholder="搜索接收人或模板名称..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    border: '1px solid #e8e8e8',
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 类型筛选 */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['全部', '短信', '微信', 'APP推送'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => { setRecordFilterType(type); setCurrentPage(1); }}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid',
                      borderColor: recordFilterType === type ? '#1e40af' : '#e8e8e8',
                      borderRadius: 6,
                      background: recordFilterType === type ? '#eff6ff' : '#fff',
                      color: recordFilterType === type ? '#1e40af' : '#666',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* 状态筛选 */}
              <div style={{ display: 'flex', gap: 4 }}>
                {(['全部', '待发送', '发送中', '已发送', '发送失败', '已送达', '已阅读'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => { setRecordFilterStatus(status as SendRecordStatus | '全部'); setCurrentPage(1); }}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid',
                      borderColor: recordFilterStatus === status ? '#1e40af' : '#e8e8e8',
                      borderRadius: 6,
                      background: recordFilterStatus === status ? '#eff6ff' : '#fff',
                      color: recordFilterStatus === status ? '#1e40af' : '#666',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 发送记录列表 */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>
            {filteredRecords.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#999' }}>
                <FileText size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <div style={{ fontSize: 14 }}>暂无发送记录</div>
              </div>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e8e8e8' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>接收人</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>模板名称</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>类型</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>状态</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>发送时间</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((record, idx) => {
                      const config = TEMPLATE_TYPE_CONFIG[record.templateType];
                      const statusConfig = SEND_STATUS_CONFIG[record.status];
                      return (
                        <tr key={record.id} style={{ borderBottom: idx < paginatedRecords.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#333' }}>
                            <div style={{ fontWeight: 500 }}>{record.recipientName}</div>
                            {record.recipientPhone && (
                              <div style={{ fontSize: 12, color: '#999' }}>{record.recipientPhone}</div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#333' }}>{record.templateName}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: config.bgColor,
                              color: config.color,
                              fontSize: 12,
                            }}>
                              {config.icon}
                              {record.templateType}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: statusConfig.bgColor,
                              color: statusConfig.color,
                              fontSize: 12,
                            }}>
                              {record.status}
                            </span>
                            {record.errorMessage && (
                              <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{record.errorMessage}</div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>
                            {record.sentAt ? (
                              <>
                                <div>发送: {record.sentAt}</div>
                                {record.deliveredAt && <div style={{ color: '#999' }}>送达: {record.deliveredAt}</div>}
                                {record.readAt && <div style={{ color: '#999' }}>阅读: {record.readAt}</div>}
                              </>
                            ) : (
                              <span style={{ color: '#999' }}>{record.createdAt}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <button
                              onClick={() => {
                                setSelectedTemplate(templates.find(t => t.id === record.templateId) || null);
                                setPreviewContent(record.content);
                                setModalType('view');
                                setShowModal(true);
                              }}
                              style={{
                                padding: '4px 8px',
                                border: '1px solid #e8e8e8',
                                borderRadius: 4,
                                background: '#fff',
                                color: '#666',
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              查看
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div style={{
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #e8e8e8',
                  }}>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      共 {filteredRecords.length} 条记录，第 {currentPage}/{totalPages} 页
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #e8e8e8',
                          borderRadius: 6,
                          background: '#fff',
                          color: currentPage === 1 ? '#999' : '#333',
                          fontSize: 13,
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #e8e8e8',
                          borderRadius: 6,
                          background: '#fff',
                          color: currentPage === totalPages ? '#999' : '#333',
                          fontSize: 13,
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        }}
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* 预览/测试模态框 */}
      {showModal && selectedTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            width: modalType === 'view' ? 600 : 700,
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            {/* 模态框标题 */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e8e8e8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {TEMPLATE_TYPE_CONFIG[selectedTemplate.type].icon}
                <span style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>
                  {modalType === 'preview' ? '模板预览' : modalType === 'test' ? '测试发送' : '发送内容'}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: '#999',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 模态框内容 */}
            <div style={{ padding: 20 }}>
              {/* 模板信息 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{selectedTemplate.name}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: TEMPLATE_TYPE_CONFIG[selectedTemplate.type].bgColor,
                    color: TEMPLATE_TYPE_CONFIG[selectedTemplate.type].color,
                    fontSize: 12,
                  }}>
                    {selectedTemplate.type}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>{selectedTemplate.title}</div>
              </div>

              {/* 变量输入（仅测试模式） */}
              {modalType === 'test' && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 8 }}>变量设置</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable}>
                        <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                          {variable}
                        </label>
                        <input
                          type="text"
                          value={testVariables[variable] || ''}
                          onChange={e => handleVariableChange(variable, e.target.value)}
                          placeholder={VARIABLE_EXAMPLES[variable]}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #e8e8e8',
                            borderRadius: 6,
                            fontSize: 13,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 预览内容 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 8 }}>
                  {modalType === 'test' ? '预览效果' : '发送内容'}
                </div>
                <div style={{
                  padding: 12,
                  background: '#f9fafb',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#333',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  border: '1px solid #e8e8e8',
                }}>
                  {previewContent}
                </div>
              </div>

              {/* 变量说明 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 8 }}>可用变量</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedTemplate.variables.map(v => (
                    <span
                      key={v}
                      style={{
                        padding: '4px 8px',
                        background: '#eff6ff',
                        color: '#1e40af',
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: 'monospace',
                      }}
                    >
                      ${'{' + v + '}'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 模态框底部 */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e8e8e8',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}>
              <button
                onClick={() => copyContent(previewContent)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e8e8e8',
                  borderRadius: 6,
                  background: '#fff',
                  color: '#666',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <Copy size={14} style={{ marginRight: 4 }} />
                复制
              </button>
              {modalType === 'test' && (
                <button
                  onClick={() => {
                    alert(`模拟发送成功！\n模板: ${selectedTemplate.name}\n内容: ${previewContent.substring(0, 50)}...`);
                    setShowModal(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 6,
                    background: '#1e40af',
                    color: '#fff',
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Send size={14} style={{ marginRight: 4 }} />
                  确认测试发送
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e8e8e8',
                  borderRadius: 6,
                  background: '#fff',
                  color: '#333',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
