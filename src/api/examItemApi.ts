// G006 全院医技检查预约系统 - 检查项目 API 模块
// 基于 localStorage 模拟后端 API

import type {
  ExamItemQueryParams,
  CreateExamItemRequest,
  UpdateExamItemRequest,
  ExamItemDeviceRelation,
  ExamItemPriceStats,
  ExamItemListResponse,
  ExamItemResponse,
  ExamItemPriceStatsResponse,
  ApiResponse,
} from '../types/api';
import type { ExamItem } from '../types';
import {
  STORAGE_KEYS,
  getStorageData,
  setStorageData,
  handleApiRequest,
  createApiResponse,
  generateId,
  ApiError,
} from './base';

// ==================== 检查项目列表查询 ====================
export async function getExamItemList(
  params: ExamItemQueryParams
): Promise<ExamItemListResponse> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    
    // 筛选条件
    let filtered = allItems.filter((item) => {
      if (params.name && !item.name.includes(params.name)) return false;
      if (params.code && item.code !== params.code) return false;
      if (params.modality && item.modality !== params.modality) return false;
      if (params.departmentId && item.departmentId !== params.departmentId) return false;
      if (params.isActive !== undefined && item.isActive !== params.isActive) return false;
      return true;
    });
    
    // 按检查项目名称排序
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

// ==================== 获取单个检查项目 ====================
export async function getExamItemById(id: string): Promise<ExamItemResponse> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const item = allItems.find((i) => i.id === id);
    
    if (!item) {
      throw new ApiError('检查项目不存在', -4, 404);
    }
    
    return item;
  });
}

// ==================== 创建检查项目 ====================
export async function createExamItem(
  data: CreateExamItemRequest
): Promise<ExamItemResponse> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    
    // 检查编码是否重复
    if (allItems.some((i) => i.code === data.code)) {
      throw new ApiError(`检查项目编码 ${data.code} 已存在`, -6, 409);
    }
    
    const newItem: ExamItem = {
      ...data,
      id: generateId('EI'),
      isActive: true,
    };
    
    allItems.push(newItem);
    setStorageData(STORAGE_KEYS.EXAM_ITEMS, allItems);
    
    return newItem;
  });
}

// ==================== 更新检查项目 ====================
export async function updateExamItem(
  data: UpdateExamItemRequest
): Promise<ExamItemResponse> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const index = allItems.findIndex((i) => i.id === data.id);
    
    if (index === -1) {
      throw new ApiError('检查项目不存在', -4, 404);
    }
    
    // 如果更新编码，检查是否重复
    if (data.code && data.code !== allItems[index].code) {
      if (allItems.some((i) => i.code === data.code && i.id !== data.id)) {
        throw new ApiError(`检查项目编码 ${data.code} 已存在`, -6, 409);
      }
    }
    
    const updated: ExamItem = {
      ...allItems[index],
      ...data,
    };
    
    allItems[index] = updated;
    setStorageData(STORAGE_KEYS.EXAM_ITEMS, allItems);
    
    return updated;
  });
}

// ==================== 删除检查项目 ====================
export async function deleteExamItem(id: string): Promise<ApiResponse<{ success: boolean; id: string }>> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const index = allItems.findIndex((i) => i.id === id);
    
    if (index === -1) {
      throw new ApiError('检查项目不存在', -4, 404);
    }
    
    // 检查是否有预约使用该项目
    const appointments = getStorageData<any>(STORAGE_KEYS.APPOINTMENTS);
    const hasAppointments = appointments.some((apt: any) => apt.examItemId === id);
    
    if (hasAppointments) {
      throw new ApiError('该项目已有预约记录，无法删除', -6, 409);
    }
    
    allItems.splice(index, 1);
    setStorageData(STORAGE_KEYS.EXAM_ITEMS, allItems);
    
    return { success: true, id };
  });
}

// ==================== 更新检查项目状态 ====================
export async function updateExamItemStatus(
  id: string,
  isActive: boolean
): Promise<ExamItemResponse> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const index = allItems.findIndex((i) => i.id === id);
    
    if (index === -1) {
      throw new ApiError('检查项目不存在', -4, 404);
    }
    
    allItems[index].isActive = isActive;
    setStorageData(STORAGE_KEYS.EXAM_ITEMS, allItems);
    
    return allItems[index];
  });
}

// ==================== 获取所有检查项目（不分页） ====================
export async function getAllExamItems(): Promise<ApiResponse<ExamItem[]>> {
  return handleApiRequest(() => {
    return getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
  });
}

// ==================== 按检查类型获取项目 ====================
export async function getExamItemsByModality(
  modality: string
): Promise<ApiResponse<ExamItem[]>> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    return allItems.filter((i) => i.modality === modality && i.isActive);
  });
}

// ==================== 按科室获取项目 ====================
export async function getExamItemsByDepartment(
  departmentId: string
): Promise<ApiResponse<ExamItem[]>> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    return allItems.filter((i) => i.departmentId === departmentId && i.isActive);
  });
}

// ==================== 获取项目可用的设备 ====================
export async function getExamItemDevices(
  examItemId: string
): Promise<ApiResponse<string[]>> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const item = allItems.find((i) => i.id === examItemId);
    
    if (!item) {
      throw new ApiError('检查项目不存在', -4, 404);
    }
    
    return item.applicableDeviceIds;
  });
}

// ==================== 更新项目设备关联 ====================
export async function updateExamItemDevices(
  data: ExamItemDeviceRelation
): Promise<ExamItemResponse> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const index = allItems.findIndex((i) => i.id === data.examItemId);
    
    if (index === -1) {
      throw new ApiError('检查项目不存在', -4, 404);
    }
    
    allItems[index].applicableDeviceIds = data.deviceIds;
    setStorageData(STORAGE_KEYS.EXAM_ITEMS, allItems);
    
    return allItems[index];
  });
}

// ==================== 获取价格统计 ====================
export async function getExamItemPriceStats(): Promise<ExamItemPriceStatsResponse> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const appointments = getStorageData<any>(STORAGE_KEYS.APPOINTMENTS);
    
    // 按检查类型分组统计
    const modalityMap: Record<string, { count: number; totalPrice: number }> = {};
    
    allItems.forEach((item) => {
      if (!modalityMap[item.modality]) {
        modalityMap[item.modality] = { count: 0, totalPrice: 0 };
      }
      modalityMap[item.modality].count++;
      modalityMap[item.modality].totalPrice += item.price;
    });
    
    const stats: ExamItemPriceStats[] = Object.entries(modalityMap).map(
      ([modality, data]) => ({
        modality,
        count: data.count,
        avgPrice: Math.round(data.totalPrice / data.count),
        totalRevenue: data.totalPrice,
      })
    );
    
    return stats;
  });
}

// ==================== 获取所有检查类型 ====================
export async function getAllModalities(): Promise<ApiResponse<string[]>> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const modalities = [...new Set(allItems.map((i) => i.modality))];
    return modalities.sort();
  });
}

// ==================== 搜索检查项目 ====================
export async function searchExamItems(
  keyword: string
): Promise<ApiResponse<ExamItem[]>> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const lowerKeyword = keyword.toLowerCase();
    
    return allItems.filter((i) => 
      i.name.toLowerCase().includes(lowerKeyword) ||
      i.code.toLowerCase().includes(lowerKeyword) ||
      i.modality.toLowerCase().includes(lowerKeyword)
    );
  });
}

// ==================== 根据项目编码获取 ====================
export async function getExamItemByCode(
  code: string
): Promise<ExamItemResponse> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    const item = allItems.find((i) => i.code === code);
    
    if (!item) {
      throw new ApiError('检查项目不存在', -4, 404);
    }
    
    return item;
  });
}

// ==================== 批量更新检查项目状态 ====================
export async function batchUpdateExamItemStatus(
  ids: string[],
  isActive: boolean
): Promise<ApiResponse<{ success: boolean; updatedCount: number }>> {
  return handleApiRequest(() => {
    const allItems = getStorageData<ExamItem>(STORAGE_KEYS.EXAM_ITEMS);
    let updatedCount = 0;
    
    allItems.forEach((item, index) => {
      if (ids.includes(item.id)) {
        allItems[index].isActive = isActive;
        updatedCount++;
      }
    });
    
    setStorageData(STORAGE_KEYS.EXAM_ITEMS, allItems);
    
    return { success: true, updatedCount };
  });
}

// ==================== 导出所有检查项目 API ====================
export const examItemApi = {
  getList: getExamItemList,
  getById: getExamItemById,
  create: createExamItem,
  update: updateExamItem,
  delete: deleteExamItem,
  updateStatus: updateExamItemStatus,
  getAll: getAllExamItems,
  getByModality: getExamItemsByModality,
  getByDepartment: getExamItemsByDepartment,
  getDevices: getExamItemDevices,
  updateDevices: updateExamItemDevices,
  getPriceStats: getExamItemPriceStats,
  getAllModalities: getAllModalities,
  search: searchExamItems,
  getByCode: getExamItemByCode,
  batchUpdateStatus: batchUpdateExamItemStatus,
};

export default examItemApi;
