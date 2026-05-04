// G006 全院医技检查预约系统 - API 基础模块
// 包含错误处理封装和 localStorage 模拟数据响应

import type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
} from '../types/api';

// ==================== localStorage Keys ====================
const STORAGE_KEYS = {
  APPOINTMENTS: 'g006_appointments',
  PATIENTS: 'g006_patients',
  DEVICES: 'g006_devices',
  EXAM_ITEMS: 'g006_exam_items',
  NOTIFICATIONS: 'g006_notifications',
  SLOT_SOURCES: 'g006_slot_sources',
  SCHEDULES: 'g006_schedules',
} as const;

// ==================== 初始化模拟数据到 localStorage ====================
export function initializeMockData(): void {
  if (typeof window === 'undefined') return;
  
  const { APPOINTMENTS, PATIENTS, DEVICES, EXAM_ITEMS, NOTIFICATIONS, SLOT_SOURCES } = STORAGE_KEYS;
  
  // 仅在首次加载时初始化
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    // 动态导入初始数据
    import('../data/initialData').then((data) => {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.APPOINTMENTS));
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(data.PATIENTS));
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(data.DEVICES));
      localStorage.setItem(STORAGE_KEYS.EXAM_ITEMS, JSON.stringify(data.EXAM_ITEMS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.SLOT_SOURCES, JSON.stringify(data.SLOT_SOURCES));
      console.log('[API Mock] 模拟数据已初始化');
    });
  }
}

// ==================== localStorage 辅助函数 ====================
export function getStorageData<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function setStorageData<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 6)}`;
}

// ==================== API 错误类型 ====================
export class ApiError extends Error {
  code: number;
  status: number;
  
  constructor(message: string, code: number = -1, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = '网络连接失败') {
    super(message, -2, 0);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, -3, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = '资源') {
    super(`${resource}不存在`, -4, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = '未授权访问') {
    super(message, -5, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = '资源冲突') {
    super(message, -6, 409);
    this.name = 'ConflictError';
  }
}

// ==================== 模拟网络延迟 ====================
const simulateDelay = (min: number = 100, max: number = 300): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// ==================== 通用请求处理 ====================
interface RequestOptions {
  loading?: boolean;
  mock?: boolean;
}

/**
 * 创建标准 API 响应
 */
export function createApiResponse<T>(
  data: T,
  message: string = '操作成功',
  code: number = 0
): ApiResponse<T> {
  return {
    code,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T>(
  list: T[],
  pagination: PaginationParams & { total: number }
): PaginatedResponse<T> {
  return {
    list,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.pageSize),
    },
  };
}

/**
 * 统一请求处理函数（用于模拟）
 */
export async function handleApiRequest<T, R = ApiResponse<T>>(
  handler: () => T | Promise<T>,
  options: RequestOptions = {}
): Promise<R> {
  try {
    await simulateDelay();
    
    const result = await handler();
    
    return createApiResponse(result) as R;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('[API Error]', error);
    throw new ApiError(
      error instanceof Error ? error.message : '未知错误',
      -999
    );
  }
}

/**
 * 统一分页请求处理
 */
export async function handlePaginatedRequest<T>(
  getData: () => T[],
  params: { page: number; pageSize: number }
): Promise<PaginatedResponse<T>> {
  await simulateDelay();
  
  const allData = getData();
  const { page, pageSize } = params;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = allData.slice(start, end);
  
  return createPaginatedResponse(list, {
    page,
    pageSize,
    total: allData.length,
  });
}

/**
 * 统一列表请求处理
 */
export async function handleListRequest<T>(
  getData: () => T[],
  filter?: (item: T) => boolean
): Promise<{ items: T[]; total: number }> {
  await simulateDelay();
  
  let data = getData();
  if (filter) {
    data = data.filter(filter);
  }
  
  return {
    items: data,
    total: data.length,
  };
}

/**
 * 根据 ID 查找单条记录
 */
export async function handleSingleRequest<T extends { id: string }>(
  getData: () => T[],
  id: string
): Promise<T> {
  await simulateDelay();
  
  const data = getData();
  const item = data.find((item) => item.id === id);
  
  if (!item) {
    throw new NotFoundError('记录');
  }
  
  return item;
}

/**
 * 创建新记录
 */
export async function handleCreateRequest<T extends { id: string }>(
  getData: () => T[],
  setData: (data: T[]) => void,
  newItem: Omit<T, 'id'> & { id?: string },
  idPrefix: string
): Promise<T> {
  await simulateDelay();
  
  const data = getData();
  const item = {
    ...newItem,
    id: newItem.id || generateId(idPrefix),
  } as T;
  
  data.push(item);
  setData([...data]);
  
  return item;
}

/**
 * 更新记录
 */
export async function handleUpdateRequest<T extends { id: string }>(
  getData: () => T[],
  setData: (data: T[]) => void,
  id: string,
  updates: Partial<T>
): Promise<T> {
  await simulateDelay();
  
  const data = getData();
  const index = data.findIndex((item) => item.id === id);
  
  if (index === -1) {
    throw new NotFoundError('记录');
  }
  
  const updated = { ...data[index], ...updates };
  data[index] = updated;
  setData([...data]);
  
  return updated;
}

/**
 * 删除记录
 */
export async function handleDeleteRequest<T extends { id: string }>(
  getData: () => T[],
  setData: (data: T[]) => void,
  id: string
): Promise<{ success: boolean; id: string }> {
  await simulateDelay();
  
  const data = getData();
  const index = data.findIndex((item) => item.id === id);
  
  if (index === -1) {
    throw new NotFoundError('记录');
  }
  
  data.splice(index, 1);
  setData([...data]);
  
  return { success: true, id };
}

/**
 * 批量删除
 */
export async function handleBatchDeleteRequest<T extends { id: string }>(
  getData: () => T[],
  setData: (data: T[]) => void,
  ids: string[]
): Promise<{ success: boolean; deletedCount: number }> {
  await simulateDelay();
  
  const data = getData();
  const filtered = data.filter((item) => !ids.includes(item.id));
  const deletedCount = data.length - filtered.length;
  
  setData(filtered);
  
  return { success: true, deletedCount };
}

// ==================== 导出 Storage Keys ====================
export { STORAGE_KEYS };
