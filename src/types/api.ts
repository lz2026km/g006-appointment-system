// G006 全院医技检查预约系统 - API 类型定义
// 端口: 5177

import type {
  Appointment, Patient, ExamItem, Device, Notification,
  AppointmentStatus, ReportStatus, DeviceStatus, TimeSlot,
  SlotSource, CheckInRecord, Statistics
} from './index';

// ==================== 通用 API 响应/请求类型 ====================

/** 通用 API 响应结构 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/** 分页请求参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/** 分页响应结构 */
export interface PaginatedResponse<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/** 通用列表响应 */
export interface ListResponse<T> {
  items: T[];
  total: number;
}

/** 通用删除响应 */
export interface DeleteResponse {
  id: string;
  success: boolean;
  message?: string;
}

// ==================== 预约 API 类型 ====================

/** 预约查询参数 */
export interface AppointmentQueryParams {
  patientName?: string;
  patientId?: string;
  idCard?: string;
  phone?: string;
  examItemId?: string;
  deviceId?: string;
  modality?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  appointmentDate?: string;
  startDate?: string;
  endDate?: string;
  registrationType?: string;
  isUrgent?: boolean;
  page?: number;
  pageSize?: number;
}

/** 创建预约请求 */
export interface CreateAppointmentRequest {
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  patientType: string;
  phone: string;
  idCard: string;
  examItemId: string;
  examItemName: string;
  modality: string;
  deviceId: string;
  deviceName: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  registrationType: string;
  clinicalDiagnosis: string;
  clinicalInfo: string;
  isUrgent: boolean;
  notes?: string;
}

/** 更新预约请求 */
export interface UpdateAppointmentRequest {
  id: string;
  appointmentDate?: string;
  appointmentTime?: string;
  deviceId?: string;
  examItemId?: string;
  status?: AppointmentStatus;
  isUrgent?: boolean;
  notes?: string;
}

/** 预约状态变更请求 */
export interface ChangeAppointmentStatusRequest {
  id: string;
  status: AppointmentStatus;
  operatorId?: string;
  operatorName?: string;
  reason?: string;
}

/** 签到请求 */
export interface CheckInRequest {
  appointmentId: string;
  checkInTime: string;
  queueNumber?: number;
}

/** 取消预约请求 */
export interface CancelAppointmentRequest {
  id: string;
  reason: string;
  cancelledBy?: string;
}

/** 改签请求 */
export interface RescheduleAppointmentRequest {
  id: string;
  newAppointmentDate: string;
  newAppointmentTime: string;
  newDeviceId?: string;
  reason?: string;
}

/** 预约统计查询 */
export interface AppointmentStatsQuery {
  startDate: string;
  endDate: string;
  modality?: string;
  deviceId?: string;
  departmentId?: string;
}

/** 预约统计响应 */
export interface AppointmentStatsResponse {
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  byModality: Record<string, number>;
  byDevice: Record<string, number>;
  byHour: Record<string, number>;
  trend: { date: string; count: number }[];
}

// 预约 API 响应
export type AppointmentListResponse = PaginatedResponse<Appointment>;
export type AppointmentResponse = ApiResponse<Appointment>;
export type AppointmentStatsResponse2 = ApiResponse<AppointmentStatsResponse>;

// ==================== 设备 API 类型 ====================

/** 设备查询参数 */
export interface DeviceQueryParams {
  name?: string;
  code?: string;
  modality?: string;
  departmentId?: string;
  status?: DeviceStatus | DeviceStatus[];
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

/** 创建设备请求 */
export interface CreateDeviceRequest {
  name: string;
  code: string;
  modality: string;
  departmentId: string;
  departmentName: string;
  location: string;
  manufacturer: string;
  model: string;
  totalSlots: number;
  availableTimes: TimeSlot[];
}

/** 更新设备请求 */
export interface UpdateDeviceRequest {
  id: string;
  name?: string;
  status?: DeviceStatus;
  location?: string;
  availableTimes?: TimeSlot[];
  maintenanceDate?: string;
  totalSlots?: number;
}

/** 设备可用时间查询 */
export interface DeviceAvailableSlotsQuery {
  deviceId: string;
  date: string;
  examItemId?: string;
  duration?: number;
}

/** 设备状态统计 */
export interface DeviceStatusStats {
  total: number;
  normal: number;
  maintenance: number;
  stopped: number;
  full: number;
}

/** 设备利用率 */
export interface DeviceUtilization {
  deviceId: string;
  deviceName: string;
  modality: string;
  utilization: number;
  totalSlots: number;
  usedSlots: number;
  availableSlots: number;
}

// 设备 API 响应
export type DeviceListResponse = PaginatedResponse<Device>;
export type DeviceResponse = ApiResponse<Device>;
export type DeviceStatsResponse = ApiResponse<DeviceStatusStats>;
export type DeviceUtilizationResponse = ApiResponse<DeviceUtilization[]>;

// ==================== 患者 API 类型 ====================

/** 患者查询参数 */
export interface PatientQueryParams {
  name?: string;
  idCard?: string;
  phone?: string;
  patientType?: string;
  registrationDate?: string;
  page?: number;
  pageSize?: number;
}

/** 创建患者请求 */
export interface CreatePatientRequest {
  name: string;
  gender: string;
  age: number;
  phone: string;
  idCard: string;
  address: string;
  patientType: string;
  registrationDate?: string;
}

/** 更新患者请求 */
export interface UpdatePatientRequest {
  id: string;
  name?: string;
  gender?: string;
  age?: number;
  phone?: string;
  idCard?: string;
  address?: string;
  patientType?: string;
}

/** 患者预约记录查询 */
export interface PatientAppointmentsQuery {
  patientId: string;
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus | AppointmentStatus[];
}

/** 患者统计 */
export interface PatientStats {
  total: number;
  byType: Record<string, number>;
  newPatientsToday: number;
  activePatients: number;
}

// 患者 API 响应
export type PatientListResponse = PaginatedResponse<Patient>;
export type PatientResponse = ApiResponse<Patient>;
export type PatientStatsResponse = ApiResponse<PatientStats>;
export type PatientAppointmentsResponse = ApiResponse<Appointment[]>;

// ==================== 检查项目 API 类型 ====================

/** 检查项目查询参数 */
export interface ExamItemQueryParams {
  name?: string;
  code?: string;
  modality?: string;
  departmentId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

/** 创建检查项目请求 */
export interface CreateExamItemRequest {
  name: string;
  code: string;
  modality: string;
  subModality?: string;
  departmentId: string;
  departmentName: string;
  duration: number;
  price: number;
  preparationNotes: string;
  applicableDeviceIds: string[];
}

/** 更新检查项目请求 */
export interface UpdateExamItemRequest {
  id: string;
  name?: string;
  code?: string;
  modality?: string;
  subModality?: string;
  departmentId?: string;
  departmentName?: string;
  duration?: number;
  price?: number;
  preparationNotes?: string;
  applicableDeviceIds?: string[];
  isActive?: boolean;
}

/** 检查项目设备关联 */
export interface ExamItemDeviceRelation {
  examItemId: string;
  deviceIds: string[];
}

/** 检查项目价格统计 */
export interface ExamItemPriceStats {
  modality: string;
  count: number;
  avgPrice: number;
  totalRevenue: number;
}

// 检查项目 API 响应
export type ExamItemListResponse = PaginatedResponse<ExamItem>;
export type ExamItemResponse = ApiResponse<ExamItem>;
export type ExamItemPriceStatsResponse = ApiResponse<ExamItemPriceStats[]>;

// ==================== 通知 API 类型 ====================

/** 通知查询参数 */
export interface NotificationQueryParams {
  type?: Notification['type'] | Notification['type'][];
  patientName?: string;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/** 创建通知请求 */
export interface CreateNotificationRequest {
  type: Notification['type'];
  title: string;
  content: string;
  patientName?: string;
  appointmentId?: string;
  appointmentDate?: string;
  receiverId?: string;
}

/** 批量标记已读请求 */
export interface MarkNotificationsReadRequest {
  ids: string[];
}

/** 发送通知请求 */
export interface SendNotificationRequest {
  type: Notification['type'];
  title: string;
  content: string;
  patientId?: string;
  appointmentId?: string;
  phone?: string;
}

/** 通知统计 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<Notification['type'], number>;
}

// 通知 API 响应
export type NotificationListResponse = PaginatedResponse<Notification>;
export type NotificationResponse = ApiResponse<Notification>;
export type NotificationStatsResponse = ApiResponse<NotificationStats>;

// ==================== 号源 API 类型 ====================

/** 号源查询参数 */
export interface SlotSourceQueryParams {
  deviceId?: string;
  examItemId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

/** 号源日期范围查询 */
export interface SlotSourceDateRangeQuery {
  deviceId: string;
  examItemId: string;
  startDate: string;
  endDate: string;
}

/** 释放号源请求 */
export interface ReleaseSlotsRequest {
  deviceId: string;
  examItemId: string;
  date: string;
  slots: { startTime: string; endTime: string; count: number }[];
}

/** 锁定号源请求 */
export interface LockSlotsRequest {
  deviceId: string;
  examItemId: string;
  date: string;
  slotIndex: number;
  reason: string;
  lockedBy: string;
  expiresAt: string;
}

// 号源 API 响应
export type SlotSourceResponse = ApiResponse<SlotSource>;
export type SlotSourceListResponse = ApiResponse<SlotSource[]>;
