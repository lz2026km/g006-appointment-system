// G006 全院医技检查预约系统 - 患者 API 模块
// 基于 localStorage 模拟后端 API

import type {
  PatientQueryParams,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientAppointmentsQuery,
  PatientListResponse,
  PatientResponse,
  PatientStatsResponse,
  PatientAppointmentsResponse,
  ApiResponse,
} from '../types/api';
import type { Patient, Appointment } from '../types';
import {
  STORAGE_KEYS,
  getStorageData,
  setStorageData,
  handleApiRequest,
  createApiResponse,
  generateId,
  ApiError,
} from './base';
import { getAppointmentsByPatientId } from './appointmentApi';

// ==================== 患者列表查询 ====================
export async function getPatientList(
  params: PatientQueryParams
): Promise<PatientListResponse> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    
    // 筛选条件
    let filtered = allPatients.filter((patient) => {
      if (params.name && !patient.name.includes(params.name)) return false;
      if (params.idCard && patient.idCard !== params.idCard) return false;
      if (params.phone && patient.phone !== params.phone) return false;
      if (params.patientType && patient.patientType !== params.patientType) return false;
      if (params.registrationDate && patient.registrationDate !== params.registrationDate) return false;
      return true;
    });
    
    // 按注册日期倒序
    filtered.sort((a, b) => b.registrationDate.localeCompare(a.registrationDate));
    
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

// ==================== 获取单个患者 ====================
export async function getPatientById(id: string): Promise<PatientResponse> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    const patient = allPatients.find((p) => p.id === id);
    
    if (!patient) {
      throw new ApiError('患者不存在', -4, 404);
    }
    
    return patient;
  });
}

// ==================== 创建患者 ====================
export async function createPatient(
  data: CreatePatientRequest
): Promise<PatientResponse> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    
    // 检查身份证号是否重复
    if (allPatients.some((p) => p.idCard === data.idCard)) {
      throw new ApiError(`身份证号 ${data.idCard} 已存在`, -6, 409);
    }
    
    // 检查手机号是否重复
    if (allPatients.some((p) => p.phone === data.phone)) {
      throw new ApiError(`手机号 ${data.phone} 已存在`, -6, 409);
    }
    
    const newPatient: Patient = {
      ...data,
      id: generateId('P'),
      registrationDate: data.registrationDate || new Date().toISOString().slice(0, 10),
      appointmentCount: 0,
    };
    
    allPatients.push(newPatient);
    setStorageData(STORAGE_KEYS.PATIENTS, allPatients);
    
    return newPatient;
  });
}

// ==================== 更新患者 ====================
export async function updatePatient(
  data: UpdatePatientRequest
): Promise<PatientResponse> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    const index = allPatients.findIndex((p) => p.id === data.id);
    
    if (index === -1) {
      throw new ApiError('患者不存在', -4, 404);
    }
    
    // 如果更新身份证号，检查是否重复
    if (data.idCard && data.idCard !== allPatients[index].idCard) {
      if (allPatients.some((p) => p.idCard === data.idCard && p.id !== data.id)) {
        throw new ApiError(`身份证号 ${data.idCard} 已存在`, -6, 409);
      }
    }
    
    // 如果更新手机号，检查是否重复
    if (data.phone && data.phone !== allPatients[index].phone) {
      if (allPatients.some((p) => p.phone === data.phone && p.id !== data.id)) {
        throw new ApiError(`手机号 ${data.phone} 已存在`, -6, 409);
      }
    }
    
    const updated: Patient = {
      ...allPatients[index],
      ...data,
    };
    
    allPatients[index] = updated;
    setStorageData(STORAGE_KEYS.PATIENTS, allPatients);
    
    return updated;
  });
}

// ==================== 删除患者 ====================
export async function deletePatient(id: string): Promise<ApiResponse<{ success: boolean; id: string }>> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    const index = allPatients.findIndex((p) => p.id === id);
    
    if (index === -1) {
      throw new ApiError('患者不存在', -4, 404);
    }
    
    allPatients.splice(index, 1);
    setStorageData(STORAGE_KEYS.PATIENTS, allPatients);
    
    return { success: true, id };
  });
}

// ==================== 根据身份证号获取患者 ====================
export async function getPatientByIdCard(
  idCard: string
): Promise<PatientResponse> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    const patient = allPatients.find((p) => p.idCard === idCard);
    
    if (!patient) {
      throw new ApiError('患者不存在', -4, 404);
    }
    
    return patient;
  });
}

// ==================== 根据手机号获取患者 ====================
export async function getPatientByPhone(
  phone: string
): Promise<PatientResponse> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    const patient = allPatients.find((p) => p.phone === phone);
    
    if (!patient) {
      throw new ApiError('患者不存在', -4, 404);
    }
    
    return patient;
  });
}

// ==================== 获取患者预约记录 ====================
export async function getPatientAppointments(
  params: PatientAppointmentsQuery
): Promise<PatientAppointmentsResponse> {
  return getAppointmentsByPatientId(params.patientId, { status: params.status as Appointment['status'][] | undefined });
}

// ==================== 获取患者统计 ====================
export async function getPatientStats(): Promise<PatientStatsResponse> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    const appointments = getStorageData<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const today = new Date().toISOString().slice(0, 10);
    
    // 按类型统计
    const byType: Record<string, number> = {};
    allPatients.forEach((p) => {
      byType[p.patientType] = (byType[p.patientType] || 0) + 1;
    });
    
    // 今日新增患者
    const newPatientsToday = allPatients.filter(
      (p) => p.registrationDate === today
    ).length;
    
    // 有未完成预约的患者（活跃患者）
    const activePatientIds = new Set(
      appointments
        .filter((apt) => !['已完成', '已取消', '超时取消'].includes(apt.status))
        .map((apt) => apt.patientId)
    );
    
    return {
      total: allPatients.length,
      byType,
      newPatientsToday,
      activePatients: activePatientIds.size,
    };
  });
}

// ==================== 搜索患者（模糊匹配） ====================
export async function searchPatients(
  keyword: string
): Promise<ApiResponse<Patient[]>> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    const lowerKeyword = keyword.toLowerCase();
    
    return allPatients.filter((p) => 
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.idCard.includes(keyword) ||
      p.phone.includes(keyword)
    );
  });
}

// ==================== 获取所有患者（不分页） ====================
export async function getAllPatients(): Promise<ApiResponse<Patient[]>> {
  return handleApiRequest(() => {
    return getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
  });
}

// ==================== 更新患者预约次数 ====================
export async function updatePatientAppointmentCount(
  patientId: string,
  increment: number = 1
): Promise<void> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    const index = allPatients.findIndex((p) => p.id === patientId);
    
    if (index !== -1) {
      allPatients[index].appointmentCount += increment;
      allPatients[index].lastAppointment = new Date().toISOString().slice(0, 10);
      setStorageData(STORAGE_KEYS.PATIENTS, allPatients);
    }
  });
}

// ==================== 患者充值/更新余额 ====================
export async function updatePatientBalance(
  patientId: string,
  amount: number
): Promise<ApiResponse<{ patientId: string; newBalance: number }>> {
  return handleApiRequest(() => {
    const allPatients = getStorageData<Patient>(STORAGE_KEYS.PATIENTS);
    const index = allPatients.findIndex((p) => p.id === patientId);
    
    if (index === -1) {
      throw new ApiError('患者不存在', -4, 404);
    }
    
    // 注意：Patient 类型目前没有 balance 字段，这里假设有或有其他机制
    // 实际使用时可能需要扩展 Patient 类型
    const currentBalance = (allPatients[index] as any).balance || 0;
    const newBalance = currentBalance + amount;
    
    (allPatients[index] as any).balance = newBalance;
    setStorageData(STORAGE_KEYS.PATIENTS, allPatients);
    
    return { patientId, newBalance };
  });
}

// ==================== 导出所有患者 API ====================
export const patientApi = {
  getList: getPatientList,
  getById: getPatientById,
  create: createPatient,
  update: updatePatient,
  delete: deletePatient,
  getByIdCard: getPatientByIdCard,
  getByPhone: getPatientByPhone,
  getAppointments: getPatientAppointments,
  getStats: getPatientStats,
  search: searchPatients,
  getAll: getAllPatients,
  updateAppointmentCount: updatePatientAppointmentCount,
  updateBalance: updatePatientBalance,
};

export default patientApi;
