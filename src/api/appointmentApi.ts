// G006 全院医技检查预约系统 - 预约 API 模块
// 基于 localStorage 模拟后端 API

import type {
  AppointmentQueryParams,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  ChangeAppointmentStatusRequest,
  CheckInRequest,
  CancelAppointmentRequest,
  RescheduleAppointmentRequest,
  AppointmentStatsQuery,
  AppointmentListResponse,
  AppointmentResponse,
  AppointmentStatsResponse2,
  ApiResponse,
} from '../types/api';
import type { Appointment } from '../types';
import {
  STORAGE_KEYS,
  getStorageData,
  setStorageData,
  handlePaginatedRequest,
  handleSingleRequest,
  handleCreateRequest,
  handleUpdateRequest,
  handleDeleteRequest,
  handleApiRequest,
  createApiResponse,
  generateId,
  ApiError,
} from './base';

// ==================== 预约列表查询 ====================
export async function getAppointmentList(
  params: AppointmentQueryParams
): Promise<AppointmentListResponse> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    
    // 筛选条件
    let filtered = allAppointments.filter((apt) => {
      if (params.patientName && !apt.patientName.includes(params.patientName)) return false;
      if (params.patientId && apt.patientId !== params.patientId) return false;
      if (params.idCard && apt.idCard !== params.idCard) return false;
      if (params.phone && apt.phone !== params.phone) return false;
      if (params.examItemId && apt.examItemId !== params.examItemId) return false;
      if (params.deviceId && apt.deviceId !== params.deviceId) return false;
      if (params.modality && apt.modality !== params.modality) return false;
      if (params.appointmentDate && apt.appointmentDate !== params.appointmentDate) return false;
      if (params.registrationType && apt.registrationType !== params.registrationType) return false;
      if (params.isUrgent !== undefined && apt.isUrgent !== params.isUrgent) return false;
      
      // 状态可以是单个或数组
      if (params.status) {
        const statuses = Array.isArray(params.status) ? params.status : [params.status];
        if (!statuses.includes(apt.status)) return false;
      }
      
      // 日期范围
      if (params.startDate && apt.appointmentDate < params.startDate) return false;
      if (params.endDate && apt.appointmentDate > params.endDate) return false;
      
      return true;
    });
    
    // 排序：按预约日期时间倒序
    filtered.sort((a, b) => {
      const dateCompare = b.appointmentDate.localeCompare(a.appointmentDate);
      if (dateCompare !== 0) return dateCompare;
      return b.appointmentTime.localeCompare(a.appointmentTime);
    });
    
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

// ==================== 获取单个预约 ====================
export async function getAppointmentById(id: string): Promise<AppointmentResponse> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const appointment = allAppointments.find((apt) => apt.id === id);
    
    if (!appointment) {
      throw new ApiError('预约记录不存在', -4, 404);
    }
    
    return appointment;
  });
}

// ==================== 创建预约 ====================
export async function createAppointment(
  data: CreateAppointmentRequest
): Promise<AppointmentResponse> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    
    // 检查号源是否可用
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...data,
      id: generateId('APT'),
      status: '待确认',
      createdAt: now,
      updatedAt: now,
    };
    
    allAppointments.push(newAppointment);
    setStorageData(STORAGE_KEYS.APPOINTMENTS, allAppointments);
    
    return newAppointment;
  });
}

// ==================== 更新预约 ====================
export async function updateAppointment(
  data: UpdateAppointmentRequest
): Promise<AppointmentResponse> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = allAppointments.findIndex((apt) => apt.id === data.id);
    
    if (index === -1) {
      throw new ApiError('预约记录不存在', -4, 404);
    }
    
    const updated: Appointment = {
      ...allAppointments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    allAppointments[index] = updated;
    setStorageData(STORAGE_KEYS.APPOINTMENTS, allAppointments);
    
    return updated;
  });
}

// ==================== 变更预约状态 ====================
export async function changeAppointmentStatus(
  data: ChangeAppointmentStatusRequest
): Promise<AppointmentResponse> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = allAppointments.findIndex((apt) => apt.id === data.id);
    
    if (index === -1) {
      throw new ApiError('预约记录不存在', -4, 404);
    }
    
    const statusTransitions: Record<string, string[]> = {
      '待确认': ['已确认', '已取消'],
      '已确认': ['已签到', '已取消', '超时取消'],
      '已签到': ['检查中', '已取消'],
      '检查中': ['已完成'],
      '已完成': [],
      '已取消': ['改签'],
      '超时取消': ['改签'],
      '改签': ['已确认'],
    };
    
    const currentStatus = allAppointments[index].status;
    if (!statusTransitions[currentStatus]?.includes(data.status)) {
      throw new ApiError(
        `状态不能从 ${currentStatus} 变更为 ${data.status}`,
        -6,
        409
      );
    }
    
    const updated: Appointment = {
      ...allAppointments[index],
      status: data.status,
      updatedAt: new Date().toISOString(),
    };
    
    // 签到时记录时间
    if (data.status === '已签到') {
      updated.checkInTime = new Date().toTimeString().slice(0, 5);
    }
    
    allAppointments[index] = updated;
    setStorageData(STORAGE_KEYS.APPOINTMENTS, allAppointments);
    
    return updated;
  });
}

// ==================== 预约签到 ====================
export async function checkInAppointment(
  data: CheckInRequest
): Promise<AppointmentResponse> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = allAppointments.findIndex((apt) => apt.id === data.appointmentId);
    
    if (index === -1) {
      throw new ApiError('预约记录不存在', -4, 404);
    }
    
    const appointment = allAppointments[index];
    if (appointment.status !== '已确认' && appointment.status !== '待确认') {
      throw new ApiError(`当前状态 ${appointment.status} 不允许签到`, -6, 409);
    }
    
    const updated: Appointment = {
      ...appointment,
      status: '已签到',
      checkInTime: data.checkInTime,
      updatedAt: new Date().toISOString(),
    };
    
    allAppointments[index] = updated;
    setStorageData(STORAGE_KEYS.APPOINTMENTS, allAppointments);
    
    return updated;
  });
}

// ==================== 取消预约 ====================
export async function cancelAppointment(
  data: CancelAppointmentRequest
): Promise<AppointmentResponse> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = allAppointments.findIndex((apt) => apt.id === data.id);
    
    if (index === -1) {
      throw new ApiError('预约记录不存在', -4, 404);
    }
    
    const appointment = allAppointments[index];
    if (['已完成', '已取消'].includes(appointment.status)) {
      throw new ApiError(`当前状态 ${appointment.status} 不允许取消`, -6, 409);
    }
    
    const updated: Appointment = {
      ...appointment,
      status: '已取消',
      notes: data.reason || appointment.notes,
      updatedAt: new Date().toISOString(),
    };
    
    allAppointments[index] = updated;
    setStorageData(STORAGE_KEYS.APPOINTMENTS, allAppointments);
    
    return updated;
  });
}

// ==================== 改签预约 ====================
export async function rescheduleAppointment(
  data: RescheduleAppointmentRequest
): Promise<AppointmentResponse> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = allAppointments.findIndex((apt) => apt.id === data.id);
    
    if (index === -1) {
      throw new ApiError('预约记录不存在', -4, 404);
    }
    
    const appointment = allAppointments[index];
    if (!['已取消', '超时取消'].includes(appointment.status)) {
      throw new ApiError('只有已取消的预约才能改签', -6, 409);
    }
    
    const updated: Appointment = {
      ...appointment,
      appointmentDate: data.newAppointmentDate,
      appointmentTime: data.newAppointmentTime,
      deviceId: data.newDeviceId || appointment.deviceId,
      status: '待确认',
      notes: data.reason || appointment.notes,
      updatedAt: new Date().toISOString(),
    };
    
    allAppointments[index] = updated;
    setStorageData(STORAGE_KEYS.APPOINTMENTS, allAppointments);
    
    return updated;
  });
}

// ==================== 删除预约 ====================
export async function deleteAppointment(id: string): Promise<ApiResponse<{ success: boolean; id: string }>> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = allAppointments.findIndex((apt) => apt.id === id);
    
    if (index === -1) {
      throw new ApiError('预约记录不存在', -4, 404);
    }
    
    allAppointments.splice(index, 1);
    setStorageData(STORAGE_KEYS.APPOINTMENTS, allAppointments);
    
    return { success: true, id };
  });
}

// ==================== 批量取消预约 ====================
export async function batchCancelAppointments(
  ids: string[],
  reason: string
): Promise<ApiResponse<{ success: boolean; cancelledCount: number }>> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    let cancelledCount = 0;
    
    const updated = allAppointments.map((apt) => {
      if (ids.includes(apt.id) && !['已完成', '已取消'].includes(apt.status)) {
        cancelledCount++;
        return {
          ...apt,
          status: '已取消' as const,
          notes: reason || apt.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return apt;
    });
    
    setStorageData(STORAGE_KEYS.APPOINTMENTS, updated);
    
    return { success: true, cancelledCount };
  });
}

// ==================== 获取今日预约 ====================
export async function getTodayAppointments(): Promise<AppointmentListResponse> {
  const today = new Date().toISOString().slice(0, 10);
  return getAppointmentList({
    appointmentDate: today,
    page: 1,
    pageSize: 100,
  });
}

// ==================== 获取待签到预约 ====================
export async function getPendingCheckInList(): Promise<AppointmentListResponse> {
  const today = new Date().toISOString().slice(0, 10);
  return getAppointmentList({
    appointmentDate: today,
    status: ['已确认', '待确认'],
    page: 1,
    pageSize: 50,
  });
}

// ==================== 获取检查中预约 ====================
export async function getInProgressAppointments(): Promise<AppointmentListResponse> {
  const today = new Date().toISOString().slice(0, 10);
  return getAppointmentList({
    appointmentDate: today,
    status: ['已签到', '检查中'],
    page: 1,
    pageSize: 50,
  });
}

// ==================== 预约统计 ====================
export async function getAppointmentStats(
  query: AppointmentStatsQuery
): Promise<AppointmentStatsResponse2> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    
    // 筛选日期范围
    let filtered = allAppointments.filter((apt) => {
      if (apt.appointmentDate < query.startDate) return false;
      if (apt.appointmentDate > query.endDate) return false;
      if (query.modality && apt.modality !== query.modality) return false;
      if (query.deviceId && apt.deviceId !== query.deviceId) return false;
      if (query.departmentId && apt.departmentId !== query.departmentId) return false;
      return true;
    });
    
    // 统计
    const byStatus: Record<string, number> = {};
    const byModality: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    const byHour: Record<string, number> = {};
    
    filtered.forEach((apt) => {
      byStatus[apt.status] = (byStatus[apt.status] || 0) + 1;
      byModality[apt.modality] = (byModality[apt.modality] || 0) + 1;
      byDevice[apt.deviceName] = (byDevice[apt.deviceName] || 0) + 1;
      
      const hour = apt.appointmentTime.split('-')[0];
      byHour[hour] = (byHour[hour] || 0) + 1;
    });
    
    // 趋势数据
    const trendMap: Record<string, number> = {};
    filtered.forEach((apt) => {
      trendMap[apt.appointmentDate] = (trendMap[apt.appointmentDate] || 0) + 1;
    });
    const trend = Object.entries(trendMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      total: filtered.length,
      byStatus: byStatus as any,
      byModality,
      byDevice,
      byHour,
      trend,
    };
  });
}

// ==================== 根据患者ID获取预约 ====================
export async function getAppointmentsByPatientId(
  patientId: string,
  params?: { status?: Appointment['status'][] }
): Promise<ApiResponse<Appointment[]>> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    
    let filtered = allAppointments.filter((apt) => apt.patientId === patientId);
    
    if (params?.status) {
      filtered = filtered.filter((apt) => params.status!.includes(apt.status));
    }
    
    // 按日期倒序
    filtered.sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));
    
    return filtered;
  });
}

// ==================== 批量获取预约 ====================
export async function getAppointmentsByIds(
  ids: string[]
): Promise<ApiResponse<Appointment[]>> {
  return handleApiRequest(() => {
    const allAppointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    return allAppointments.filter((apt) => ids.includes(apt.id));
  });
}

// ==================== 导出所有预约 API ====================
export const appointmentApi = {
  getList: getAppointmentList,
  getById: getAppointmentById,
  create: createAppointment,
  update: updateAppointment,
  changeStatus: changeAppointmentStatus,
  checkIn: checkInAppointment,
  cancel: cancelAppointment,
  reschedule: rescheduleAppointment,
  delete: deleteAppointment,
  batchCancel: batchCancelAppointments,
  getToday: getTodayAppointments,
  getPendingCheckIn: getPendingCheckInList,
  getInProgress: getInProgressAppointments,
  getStats: getAppointmentStats,
  getByPatientId: getAppointmentsByPatientId,
  getByIds: getAppointmentsByIds,
};

export default appointmentApi;
