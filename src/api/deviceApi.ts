// G006 全院医技检查预约系统 - 设备 API 模块
// 基于 localStorage 模拟后端 API

import type {
  DeviceQueryParams,
  CreateDeviceRequest,
  UpdateDeviceRequest,
  DeviceAvailableSlotsQuery,
  DeviceListResponse,
  DeviceResponse,
  DeviceStatsResponse,
  DeviceUtilizationResponse,
  ApiResponse,
} from '../types/api';
import type { Device, DeviceStatus, TimeSlot } from '../types';
import {
  STORAGE_KEYS,
  getStorageData,
  setStorageData,
  handleApiRequest,
  createApiResponse,
  generateId,
  ApiError,
} from './base';

// ==================== 设备列表查询 ====================
export async function getDeviceList(
  params: DeviceQueryParams
): Promise<DeviceListResponse> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    
    // 筛选条件
    let filtered = allDevices.filter((device) => {
      if (params.name && !device.name.includes(params.name)) return false;
      if (params.code && device.code !== params.code) return false;
      if (params.modality && device.modality !== params.modality) return false;
      if (params.departmentId && device.departmentId !== params.departmentId) return false;
      if (params.status) {
        const statuses = Array.isArray(params.status) ? params.status : [params.status];
        if (!statuses.includes(device.status)) return false;
      }
      if (params.isActive !== undefined) {
        const isActive = device.status === '正常';
        if (isActive !== params.isActive) return false;
      }
      return true;
    });
    
    // 按设备名称排序
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
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

// ==================== 获取单个设备 ====================
export async function getDeviceById(id: string): Promise<DeviceResponse> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    const device = allDevices.find((d) => d.id === id);
    
    if (!device) {
      throw new ApiError('设备不存在', -4, 404);
    }
    
    return device;
  });
}

// ==================== 创建设备 ====================
export async function createDevice(
  data: CreateDeviceRequest
): Promise<DeviceResponse> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    
    // 检查编号是否重复
    if (allDevices.some((d) => d.code === data.code)) {
      throw new ApiError(`设备编号 ${data.code} 已存在`, -6, 409);
    }
    
    const now = new Date().toISOString();
    const newDevice: Device = {
      ...data,
      id: generateId('DEV'),
      status: '正常',
      usedSlots: 0,
      createdAt: now,
      updatedAt: now,
    } as Device;
    
    allDevices.push(newDevice);
    setStorageData(STORAGE_KEYS.DEVICES, allDevices);
    
    return newDevice;
  });
}

// ==================== 更新设备 ====================
export async function updateDevice(
  data: UpdateDeviceRequest
): Promise<DeviceResponse> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    const index = allDevices.findIndex((d) => d.id === data.id);
    
    if (index === -1) {
      throw new ApiError('设备不存在', -4, 404);
    }
    
    const updated: Device = {
      ...allDevices[index],
      ...data,
      updatedAt: new Date().toISOString(),
    } as Device;
    
    allDevices[index] = updated;
    setStorageData(STORAGE_KEYS.DEVICES, allDevices);
    
    return updated;
  });
}

// ==================== 删除设备 ====================
export async function deleteDevice(id: string): Promise<ApiResponse<{ success: boolean; id: string }>> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    const index = allDevices.findIndex((d) => d.id === id);
    
    if (index === -1) {
      throw new ApiError('设备不存在', -4, 404);
    }
    
    allDevices.splice(index, 1);
    setStorageData(STORAGE_KEYS.DEVICES, allDevices);
    
    return { success: true, id };
  });
}

// ==================== 更新设备状态 ====================
export async function updateDeviceStatus(
  id: string,
  status: DeviceStatus,
  maintenanceDate?: string
): Promise<DeviceResponse> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    const index = allDevices.findIndex((d) => d.id === id);
    
    if (index === -1) {
      throw new ApiError('设备不存在', -4, 404);
    }
    
    const updated: Device = {
      ...allDevices[index],
      status,
      maintenanceDate,
      updatedAt: new Date().toISOString(),
    } as Device;
    
    allDevices[index] = updated;
    setStorageData(STORAGE_KEYS.DEVICES, allDevices);
    
    return updated;
  });
}

// ==================== 获取设备可用时间槽 ====================
export async function getDeviceAvailableSlots(
  params: DeviceAvailableSlotsQuery
): Promise<ApiResponse<TimeSlot[]>> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    const device = allDevices.find((d) => d.id === params.deviceId);
    
    if (!device) {
      throw new ApiError('设备不存在', -4, 404);
    }
    
    return device.availableTimes;
  });
}

// ==================== 更新设备可用时间 ====================
export async function updateDeviceAvailableTimes(
  id: string,
  availableTimes: TimeSlot[]
): Promise<DeviceResponse> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    const index = allDevices.findIndex((d) => d.id === id);
    
    if (index === -1) {
      throw new ApiError('设备不存在', -4, 404);
    }
    
    const updated: Device = {
      ...allDevices[index],
      availableTimes,
      updatedAt: new Date().toISOString(),
    } as Device;
    
    allDevices[index] = updated;
    setStorageData(STORAGE_KEYS.DEVICES, allDevices);
    
    return updated;
  });
}

// ==================== 获取设备状态统计 ====================
export async function getDeviceStats(): Promise<DeviceStatsResponse> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    
    const stats = {
      total: allDevices.length,
      normal: allDevices.filter((d) => d.status === '正常').length,
      maintenance: allDevices.filter((d) => d.status === '维护中').length,
      stopped: allDevices.filter((d) => d.status === '停机').length,
      full: allDevices.filter((d) => d.status === '预约满').length,
    };
    
    return stats;
  });
}

// ==================== 获取设备利用率 ====================
export async function getDeviceUtilization(): Promise<DeviceUtilizationResponse> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    
    const utilization = allDevices.map((device) => {
      const utilizationRate = device.totalSlots > 0 
        ? Math.round((device.usedSlots / device.totalSlots) * 100) 
        : 0;
      
      return {
        deviceId: device.id,
        deviceName: device.name,
        modality: device.modality,
        utilization: utilizationRate,
        totalSlots: device.totalSlots,
        usedSlots: device.usedSlots,
        availableSlots: device.totalSlots - device.usedSlots,
      };
    });
    
    // 按利用率排序
    utilization.sort((a, b) => b.utilization - a.utilization);
    
    return utilization;
  });
}

// ==================== 按设备类型获取设备列表 ====================
export async function getDevicesByModality(
  modality: string
): Promise<ApiResponse<Device[]>> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    return allDevices.filter((d) => d.modality === modality && d.status === '正常');
  });
}

// ==================== 按科室获取设备列表 ====================
export async function getDevicesByDepartment(
  departmentId: string
): Promise<ApiResponse<Device[]>> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    return allDevices.filter((d) => d.departmentId === departmentId);
  });
}

// ==================== 获取所有设备（不分页） ====================
export async function getAllDevices(): Promise<ApiResponse<Device[]>> {
  return handleApiRequest(() => {
    return getStorageData<Device>(STORAGE_KEYS.DEVICES);
  });
}

// ==================== 检查设备冲突 ====================
export async function checkDeviceConflict(
  deviceId: string,
  date: string,
  timeSlot: string
): Promise<ApiResponse<{ hasConflict: boolean; conflictingAppointmentId?: string }>> {
  return handleApiRequest(() => {
    const appointments = getStorageData<any>(STORAGE_KEYS.APPOINTMENTS);
    
    const conflicting = appointments.find(
      (apt: any) => 
        apt.deviceId === deviceId &&
        apt.appointmentDate === date &&
        apt.appointmentTime === timeSlot &&
        !['已取消', '超时取消'].includes(apt.status)
    );
    
    return {
      hasConflict: !!conflicting,
      conflictingAppointmentId: conflicting?.id,
    };
  });
}

// ==================== 获取需要维护的设备 ====================
export async function getDevicesNeedingMaintenance(): Promise<ApiResponse<Device[]>> {
  return handleApiRequest(() => {
    const allDevices = getStorageData<Device>(STORAGE_KEYS.DEVICES);
    const today = new Date().toISOString().slice(0, 10);
    
    // 查找已到维护日期或正在维护的设备
    return allDevices.filter((d) => {
      if (d.status === '维护中') return true;
      if (d.maintenanceDate && d.maintenanceDate <= today) return true;
      return false;
    });
  });
}

// ==================== 导出所有设备 API ====================
export const deviceApi = {
  getList: getDeviceList,
  getById: getDeviceById,
  create: createDevice,
  update: updateDevice,
  delete: deleteDevice,
  updateStatus: updateDeviceStatus,
  getAvailableSlots: getDeviceAvailableSlots,
  updateAvailableTimes: updateDeviceAvailableTimes,
  getStats: getDeviceStats,
  getUtilization: getDeviceUtilization,
  getByModality: getDevicesByModality,
  getByDepartment: getDevicesByDepartment,
  getAll: getAllDevices,
  checkConflict: checkDeviceConflict,
  getNeedingMaintenance: getDevicesNeedingMaintenance,
};

export default deviceApi;
