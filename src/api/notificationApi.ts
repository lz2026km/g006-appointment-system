// G006 全院医技检查预约系统 - 通知 API 模块
// 基于 localStorage 模拟后端 API

import type {
  NotificationQueryParams,
  CreateNotificationRequest,
  MarkNotificationsReadRequest,
  SendNotificationRequest,
  NotificationStats,
  NotificationListResponse,
  NotificationResponse,
  NotificationStatsResponse,
  ApiResponse,
} from '../types/api';
import type { Notification } from '../types';
import {
  STORAGE_KEYS,
  getStorageData,
  setStorageData,
  handleApiRequest,
  createApiResponse,
  generateId,
  ApiError,
} from './base';

// ==================== 通知列表查询 ====================
export async function getNotificationList(
  params: NotificationQueryParams
): Promise<NotificationListResponse> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    
    // 筛选条件
    let filtered = allNotifications.filter((notif) => {
      if (params.type) {
        const types = Array.isArray(params.type) ? params.type : [params.type];
        if (!types.includes(notif.type)) return false;
      }
      if (params.patientName && !notif.patientName?.includes(params.patientName)) return false;
      if (params.isRead !== undefined && notif.isRead !== params.isRead) return false;
      if (params.startDate && notif.createdAt < params.startDate) return false;
      if (params.endDate && notif.createdAt > params.endDate) return false;
      return true;
    });
    
    // 按创建时间倒序
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    
    // 分页
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);
    
    return {
      list,
      pagination: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  });
}

// ==================== 获取单个通知 ====================
export async function getNotificationById(id: string): Promise<NotificationResponse> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const notification = allNotifications.find((n) => n.id === id);
    
    if (!notification) {
      throw new ApiError('通知不存在', -4, 404);
    }
    
    return notification;
  });
}

// ==================== 创建通知 ====================
export async function createNotification(
  data: CreateNotificationRequest
): Promise<NotificationResponse> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    
    const newNotification: Notification = {
      id: generateId('N'),
      type: data.type,
      title: data.title,
      content: data.content,
      patientName: data.patientName,
      appointmentDate: data.appointmentDate,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    allNotifications.push(newNotification);
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    
    return newNotification;
  });
}

// ==================== 发送通知（创建并标记为发送） ====================
export async function sendNotification(
  data: SendNotificationRequest
): Promise<NotificationResponse> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    
    const newNotification: Notification = {
      id: generateId('N'),
      type: data.type,
      title: data.title,
      content: data.content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    // 如果有患者ID，查询患者信息
    if (data.patientId) {
      const patients = getStorageData<any>(STORAGE_KEYS.PATIENTS);
      const patient = patients.find((p: any) => p.id === data.patientId);
      if (patient) {
        newNotification.patientName = patient.name;
      }
    }
    
    // 如果有预约ID，查询预约信息
    if (data.appointmentId) {
      const appointments = getStorageData<any>(STORAGE_KEYS.APPOINTMENTS);
      const appointment = appointments.find((apt: any) => apt.id === data.appointmentId);
      if (appointment) {
        newNotification.patientName = appointment.patientName;
        newNotification.appointmentDate = appointment.appointmentDate;
      }
    }
    
    allNotifications.push(newNotification);
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    
    return newNotification;
  });
}

// ==================== 删除通知 ====================
export async function deleteNotification(id: string): Promise<ApiResponse<{ success: boolean; id: string }>> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const index = allNotifications.findIndex((n) => n.id === id);
    
    if (index === -1) {
      throw new ApiError('通知不存在', -4, 404);
    }
    
    allNotifications.splice(index, 1);
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    
    return { success: true, id };
  });
}

// ==================== 标记通知已读 ====================
export async function markAsRead(id: string): Promise<NotificationResponse> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const index = allNotifications.findIndex((n) => n.id === id);
    
    if (index === -1) {
      throw new ApiError('通知不存在', -4, 404);
    }
    
    allNotifications[index].isRead = true;
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    
    return allNotifications[index];
  });
}

// ==================== 批量标记已读 ====================
export async function markNotificationsAsRead(
  data: MarkNotificationsReadRequest
): Promise<ApiResponse<{ success: boolean; markedCount: number }>> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    let markedCount = 0;
    
    allNotifications.forEach((notif, index) => {
      if (data.ids.includes(notif.id) && !notif.isRead) {
        allNotifications[index].isRead = true;
        markedCount++;
      }
    });
    
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    
    return { success: true, markedCount };
  });
}

// ==================== 全部标记为已读 ====================
export async function markAllAsRead(): Promise<ApiResponse<{ success: boolean; markedCount: number }>> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    let markedCount = 0;
    
    allNotifications.forEach((notif, index) => {
      if (!notif.isRead) {
        allNotifications[index].isRead = true;
        markedCount++;
      }
    });
    
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    
    return { success: true, markedCount };
  });
}

// ==================== 获取未读通知数 ====================
export async function getUnreadCount(): Promise<ApiResponse<number>> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    return allNotifications.filter((n) => !n.isRead).length;
  });
}

// ==================== 获取通知统计 ====================
export async function getNotificationStats(): Promise<NotificationStatsResponse> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    
    const stats: NotificationStats = {
      total: allNotifications.length,
      unread: allNotifications.filter((n) => !n.isRead).length,
      byType: {
        '预约成功': 0,
        '预约变更': 0,
        '检查提醒': 0,
        '报告完成': 0,
        '取消通知': 0,
        '改签通知': 0,
      },
    };
    
    allNotifications.forEach((n) => {
      if (stats.byType[n.type] !== undefined) {
        stats.byType[n.type]++;
      }
    });
    
    return stats;
  });
}

// ==================== 获取患者通知列表 ====================
export async function getNotificationsByPatient(
  patientName: string
): Promise<NotificationListResponse> {
  return getNotificationList({
    patientName,
    page: 1,
    pageSize: 50,
  });
}

// ==================== 按类型获取通知 ====================
export async function getNotificationsByType(
  type: Notification['type']
): Promise<NotificationListResponse> {
  return getNotificationList({
    type,
    page: 1,
    pageSize: 50,
  });
}

// ==================== 批量删除通知 ====================
export async function batchDeleteNotifications(
  ids: string[]
): Promise<ApiResponse<{ success: boolean; deletedCount: number }>> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const filtered = allNotifications.filter((n) => !ids.includes(n.id));
    const deletedCount = allNotifications.length - filtered.length;
    
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, filtered);
    
    return { success: true, deletedCount };
  });
}

// ==================== 清空所有通知 ====================
export async function clearAllNotifications(): Promise<ApiResponse<{ success: boolean; clearedCount: number }>> {
  return handleApiRequest(() => {
    const allNotifications = getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const clearedCount = allNotifications.length;
    
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, []);
    
    return { success: true, clearedCount };
  });
}

// ==================== 发送预约成功通知 ====================
export async function sendAppointmentSuccessNotification(
  appointmentId: string,
  appointmentDate: string,
  appointmentTime: string,
  deviceName: string,
  patientName: string
): Promise<NotificationResponse> {
  return sendNotification({
    type: '预约成功',
    title: '预约成功',
    content: `您的检查已预约成功，请于${appointmentDate} ${appointmentTime}至${deviceName}进行检查。`,
    appointmentId,
  });
}

// ==================== 发送检查提醒通知 ====================
export async function sendCheckReminderNotification(
  appointmentId: string,
  patientName: string,
  examItemName: string
): Promise<NotificationResponse> {
  return sendNotification({
    type: '检查提醒',
    title: '检查提醒',
    content: `您有一项检查（${examItemName}）待完成，请提前30分钟签到。`,
    appointmentId,
  });
}

// ==================== 发送报告完成通知 ====================
export async function sendReportReadyNotification(
  appointmentId: string,
  patientName: string
): Promise<NotificationResponse> {
  return sendNotification({
    type: '报告完成',
    title: '报告完成',
    content: '您的检查报告已完成，请到自助机打印。',
    appointmentId,
  });
}

// ==================== 发送取消通知 ====================
export async function sendCancelNotification(
  appointmentId: string,
  patientName: string,
  reason: string
): Promise<NotificationResponse> {
  return sendNotification({
    type: '取消通知',
    title: '预约取消',
    content: `您的检查预约已取消${reason ? `，原因：${reason}` : ''}。`,
    appointmentId,
  });
}

// ==================== 发送改签通知 ====================
export async function sendRescheduleNotification(
  appointmentId: string,
  patientName: string,
  oldDate: string,
  newDate: string,
  newTime: string
): Promise<NotificationResponse> {
  return sendNotification({
    type: '改签通知',
    title: '预约改签',
    content: `您的检查已由${oldDate}改至${newDate} ${newTime}。`,
    appointmentId,
  });
}

// ==================== 导出所有通知 API ====================
export const notificationApi = {
  getList: getNotificationList,
  getById: getNotificationById,
  create: createNotification,
  send: sendNotification,
  delete: deleteNotification,
  markAsRead,
  markAsReadBatch: markNotificationsAsRead,
  markAllAsRead,
  getUnreadCount,
  getStats: getNotificationStats,
  getByPatient: getNotificationsByPatient,
  getByType: getNotificationsByType,
  batchDelete: batchDeleteNotifications,
  clearAll: clearAllNotifications,
  sendSuccess: sendAppointmentSuccessNotification,
  sendCheckReminder: sendCheckReminderNotification,
  sendReportReady: sendReportReadyNotification,
  sendCancel: sendCancelNotification,
  sendReschedule: sendRescheduleNotification,
};

export default notificationApi;
