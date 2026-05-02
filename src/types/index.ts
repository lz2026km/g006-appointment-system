// G006 全院医技检查预约系统 - 类型定义
// 端口: 5177

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  patientType: string; // 普通/急诊/住院/体检
  phone: string;
  idCard: string;
  examItemId: string;
  examItemName: string;
  modality: string; // CT/MRI/超声/X光/内镜/心电等
  deviceId: string;
  deviceName: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string; // 时段: 08:00-09:00
  status: AppointmentStatus;
  registrationType: string; // 门诊/住院/体检
  clinicalDiagnosis: string;
  clinicalInfo: string;
  isUrgent: boolean;
  checkInTime?: string;
  reportStatus?: ReportStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | '待确认'
  | '已确认'
  | '已签到'
  | '检查中'
  | '已完成'
  | '已取消'
  | '超时取消'
  | '改签';

export type ReportStatus = '未写' | '待审核' | '已审核' | '已打印';

export interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  idCard: string;
  address: string;
  patientType: string;
  registrationDate: string;
  lastAppointment?: string;
  appointmentCount: number;
}

export interface ExamItem {
  id: string;
  name: string;
  code: string;
  modality: string;
  subModality?: string;
  departmentId: string;
  departmentName: string;
  duration: number; // 分钟
  price: number;
  preparationNotes: string;
  applicableDeviceIds: string[];
  isActive: boolean;
}

export interface Device {
  id: string;
  name: string;
  code: string;
  modality: string;
  departmentId: string;
  departmentName: string;
  location: string;
  manufacturer: string;
  model: string;
  status: DeviceStatus;
  availableTimes: TimeSlot[];
  maintenanceDate?: string;
  totalSlots: number;
  usedSlots: number;
}

export type DeviceStatus = '正常' | '维护中' | '停机' | '预约满';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  total: number;
  available: number;
}

export interface SlotSource {
  id: string;
  deviceId: string;
  deviceName: string;
  examItemId: string;
  examItemName: string;
  date: string;
  slots: TimeSlot[];
  autoRelease: boolean;
  releaseRule: string; // '每日08:00自动放号'
}

export interface Schedule {
  id: string;
  deviceId: string;
  deviceName: string;
  date: string;
  shiftType: '上午' | '下午' | '晚上' | '全天';
  Technicians: string[];
  doctors: string[];
  totalCapacity: number;
  bookedCount: number;
  status: '已排班' | '未排班' | '已满';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  type: '临床' | '医技' | '急诊' | '体检';
  coordinator?: string;
  examItems: string[];
}

export interface CheckInRecord {
  id: string;
  appointmentId: string;
  patientName: string;
  examItemName: string;
  deviceName: string;
  checkInTime: string;
  queueNumber: number;
  estimatedTime: string;
  status: '候检' | '检查中' | '已完成' | '离开';
}

export interface QueueInfo {
  deviceId: string;
  deviceName: string;
  currentQueue: CheckInRecord[];
  waitingCount: number;
  avgWaitTime: number;
  currentNumber?: string;
}

export interface Notification {
  id: string;
  type: '预约成功' | '预约变更' | '检查提醒' | '报告完成' | '取消通知' | '改签通知';
  title: string;
  content: string;
  patientName?: string;
  appointmentDate?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Statistics {
  totalAppointments: number;
  todayAppointments: number;
  checkedIn: number;
  completed: number;
  cancelled: number;
  deviceUtilization: { name: string; value: number }[];
  appointmentTrend: { date: string; count: number }[];
  modalityDistribution: { name: string; value: number }[];
  peakHours: { hour: string; count: number }[];
  noShowRate: number;
  avgWaitTime: number;
}
