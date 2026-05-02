// G006 全院医技检查预约系统 - 通知中心
import React, { useState, useMemo } from 'react';
import {
  Bell, BellOff, Check, CheckCircle, XCircle, Clock, AlertTriangle,
  Calendar, FileText, RefreshCw, Trash2, Search, Filter, Eye,
  Volume2, MessageSquare, CalendarCheck
} from 'lucide-react';
import { Notification } from '../types';
import { NOTIFICATIONS } from '../data/initialData';

interface NotificationCenterProps {
  currentRole: string;
}

// 通知类型配置
const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  '预约成功': { icon: <CalendarCheck size={16} />, color: '#059669', bgColor: '#ecfdf5' },
  '预约变更': { icon: <RefreshCw size={16} />, color: '#d97706', bgColor: '#fffbeb' },
  '检查提醒': { icon: <Bell size={16} />, color: '#1e40af', bgColor: '#eff6ff' },
  '报告完成': { icon: <FileText size={16} />, color: '#7c3aed', bgColor: '#f5f3ff' },
  '取消通知': { icon: <XCircle size={16} />, color: '#dc2626', bgColor: '#fef2f2' },
  '改签通知': { icon: <Calendar size={16} />, color: '#0891b2', bgColor: '#ecfeff' },
};

export default function NotificationCenter({ currentRole }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [filterType, setFilterType] = useState<string>('全部');
  const [filterStatus, setFilterStatus] = useState<string>('全部');
  const [searchText, setSearchText] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // 统计数据
  const statistics = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const urgent = notifications.filter(n => n.type === '检查提醒' && !n.isRead).length;
    return { total, unread, urgent };
  }, [notifications]);

  // 筛选后的通知
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = filterType === '全部' || notification.type === filterType;
      const matchesStatus = filterStatus === '全部' ||
        (filterStatus === '未读' && !notification.isRead) ||
        (filterStatus === '已读' && notification.isRead);
      const matchesSearch = searchText === '' ||
        notification.title.includes(searchText) ||
        notification.content.includes(searchText) ||
        (notification.patientName && notification.patientName.includes(searchText));
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [notifications, filterType, filterStatus, searchText]);

  // 按时间分组
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filteredNotifications.forEach(notification => {
      const date = notification.createdAt.split(' ')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(notification);
    });
    return groups;
  }, [filteredNotifications]);

  // 标记全部已读
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // 标记单条已读
  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  // 删除通知
  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 清空已读
  const handleClearRead = () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e40af', margin: 0 }}>通知中心</h1>
          <p style={{ fontSize: 14, color: '#666', margin: '8px 0 0 0' }}>
            汉东省人民医院 · {currentRole}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleMarkAllRead}
            disabled={statistics.unread === 0}
            style={{
              padding: '8px 16px',
              border: '1px solid #e8e8e8',
              borderRadius: 6,
              background: '#fff',
              color: '#333',
              fontSize: 13,
              cursor: statistics.unread === 0 ? 'not-allowed' : 'pointer',
              opacity: statistics.unread === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <CheckCircle size={14} />
            全部已读
          </button>
          <button
            onClick={handleClearRead}
            disabled={statistics.total - statistics.unread === 0}
            style={{
              padding: '8px 16px',
              border: '1px solid #e8e8e8',
              borderRadius: 6,
              background: '#fff',
              color: '#dc2626',
              fontSize: 13,
              cursor: statistics.total - statistics.unread === 0 ? 'not-allowed' : 'pointer',
              opacity: statistics.total - statistics.unread === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Trash2 size={14} />
            清空已读
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e40af',
          }}>
            <Bell size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>通知总数</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{statistics.total}</div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>未读通知</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{statistics.unread}</div>
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#fffbeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706',
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>待处理提醒</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{statistics.urgent}</div>
          </div>
        </div>
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
          <div style={{
            flex: 1,
            minWidth: 200,
            position: 'relative',
          }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="搜索通知..."
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
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e8e8e8',
                borderRadius: 6,
                background: '#fff',
                color: '#333',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Filter size={14} />
              {filterType === '全部' ? '全部类型' : filterType}
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 4,
                background: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 10,
                minWidth: 120,
              }}>
                {['全部', '预约成功', '预约变更', '检查提醒', '报告完成', '取消通知', '改签通知'].map(type => (
                  <div
                    key={type}
                    onClick={() => { setFilterType(type); setShowFilterDropdown(false); }}
                    style={{
                      padding: '8px 12px',
                      fontSize: 13,
                      cursor: 'pointer',
                      background: filterType === type ? '#eff6ff' : '#fff',
                      color: filterType === type ? '#1e40af' : '#333',
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 状态筛选 */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['全部', '未读', '已读'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid',
                  borderColor: filterStatus === status ? '#1e40af' : '#e8e8e8',
                  borderRadius: 6,
                  background: filterStatus === status ? '#eff6ff' : '#fff',
                  color: filterStatus === status ? '#1e40af' : '#666',
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

      {/* 通知列表 */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#999' }}>
            <BellOff size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <div style={{ fontSize: 14 }}>暂无通知</div>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date}>
              {/* 日期分组标题 */}
              <div style={{
                padding: '12px 16px',
                background: '#f9fafb',
                borderBottom: '1px solid #e8e8e8',
                fontSize: 13,
                fontWeight: 600,
                color: '#666',
              }}>
                {date}
              </div>
              {/* 通知项 */}
              {items.map(notification => {
                const config = NOTIFICATION_TYPE_CONFIG[notification.type] || {
                  icon: <Bell size={16} />,
                  color: '#666',
                  bgColor: '#f3f4f6',
                };
                return (
                  <div
                    key={notification.id}
                    style={{
                      padding: 16,
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      background: notification.isRead ? '#fff' : '#fafbff',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = notification.isRead ? '#fff' : '#fafbff'}
                  >
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
                        {!notification.isRead && (
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#dc2626',
                          }} />
                        )}
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>
                          {notification.title}
                        </div>
                        <div style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: config.bgColor,
                          color: config.color,
                        }}>
                          {notification.type}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: '#666', marginBottom: 4, lineHeight: 1.5 }}>
                        {notification.content}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#999' }}>
                        {notification.patientName && (
                          <span>患者：{notification.patientName}</span>
                        )}
                        {notification.appointmentDate && (
                          <span>预约日期：{notification.appointmentDate}</span>
                        )}
                        <span>{formatTime(notification.createdAt)}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          title="标记已读"
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
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        title="删除"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          border: '1px solid #e8e8e8',
                          background: '#fff',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
