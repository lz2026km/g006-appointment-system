// G006 全院医技检查预约系统 - AI智能预约推荐算法
// 基于规则引擎过滤可用时段，考虑设备负载、等候时间、患者历史

import type { Patient, ExamItem, Device, Appointment } from '../types';
import { DEVICES, EXAM_ITEMS, APPOINTMENTS, PATIENTS } from './initialData';
import { evaluateRules, type RuleEngineContext } from './rulesData';

// ==================== AI推荐结果类型 ====================
export interface AIRecommendation {
  examItemId: string;
  examItemName: string;
  modality: string;
  recommendedSlot: RecommendedSlot;
  alternativeSlots: RecommendedSlot[];
  reasons: RecommendationReason[];
  deviceLoadInfo: DeviceLoadInfo[];
  warnings: string[];
}

export interface RecommendedSlot {
  date: string;
  time: string;
  deviceId: string;
  deviceName: string;
  doctorName: string;
  estimatedWaitMinutes: number;
  queueAhead: number;
}

export interface RecommendationReason {
  type: 'load_balancing' | 'wait_time' | 'patient_history' | 'time_constraint' | 'priority';
  title: string;
  description: string;
  score: number; // 1-10, 越高越好
}

export interface DeviceLoadInfo {
  deviceId: string;
  deviceName: string;
  modality: string;
  utilizationRate: number;
  availableSlots: number;
  totalSlots: number;
  status: string;
}

// ==================== 住院患者模拟数据 ====================
export const INPATIENTS: Patient[] = [
  { id: 'P003', name: '张伟', gender: '男', age: 32, phone: '13712345603', idCard: '310103199401033456', address: '汉东省汉州市浦东区世纪大道666号', patientType: '住院', registrationDate: '2026-04-28', appointmentCount: 5 },
  { id: 'P007', name: '孙磊', gender: '男', age: 73, phone: '13312345607', idCard: '310107195301077890', address: '汉东省汉州市普陀区中山北路888号', patientType: '住院', registrationDate: '2026-04-30', appointmentCount: 6 },
  { id: 'P011', name: '王丽华', gender: '女', age: 55, phone: '13812345611', idCard: '310101197101011234', address: '汉东省汉州市静安区南京西路200号', patientType: '住院', registrationDate: '2026-05-01', appointmentCount: 3 },
  { id: 'P012', name: '李明', gender: '男', age: 48, phone: '13912345612', idCard: '310102197801022345', address: '汉东省汉州市徐汇区漕溪北路120号', patientType: '住院', registrationDate: '2026-05-01', appointmentCount: 2 },
  { id: 'P013', name: '张红', gender: '女', age: 41, phone: '13612345613', idCard: '310104198501043456', address: '汉东省汉州市黄浦区南京东路300号', patientType: '住院', registrationDate: '2026-05-02', appointmentCount: 4 },
  { id: 'P014', name: '赵强', gender: '男', age: 62, phone: '13512345614', idCard: '310105196401055678', address: '汉东省汉州市虹口区四川北路150号', patientType: '住院', registrationDate: '2026-05-02', appointmentCount: 1 },
  { id: 'P015', name: '刘洋', gender: '男', age: 35, phone: '13412345615', idCard: '310106199101066789', address: '汉东省汉州市长宁区延安西路500号', patientType: '住院', registrationDate: '2026-05-02', appointmentCount: 2 },
  { id: 'P016', name: '陈静', gender: '女', age: 29, phone: '13312345616', idCard: '310107199701077890', address: '汉东省汉州市普陀区中山北路300号', patientType: '住院', registrationDate: '2026-05-03', appointmentCount: 1 },
  { id: 'P017', name: '周勇', gender: '男', age: 58, phone: '13212345617', idCard: '310108196801088901', address: '汉东省汉州市杨浦区控江路200号', patientType: '住院', registrationDate: '2026-05-03', appointmentCount: 3 },
  { id: 'P018', name: '吴娟', gender: '女', age: 45, phone: '13112345618', idCard: '310109198101099012', address: '汉东省汉州市闵行区莘庄镇100号', patientType: '住院', registrationDate: '2026-05-03', appointmentCount: 2 },
];

// ==================== 可选检查项目 ====================
export const AVAILABLE_MODALITIES = ['CT', 'MRI', '超声', '内镜', '心电', 'X光'];

export const MODALITY_EXAM_ITEMS: Record<string, ExamItem[]> = {
  'CT': EXAM_ITEMS.filter(e => e.modality === 'CT'),
  'MRI': EXAM_ITEMS.filter(e => e.modality === 'MRI'),
  '超声': EXAM_ITEMS.filter(e => e.modality === '超声'),
  '内镜': EXAM_ITEMS.filter(e => e.modality === '内镜'),
  '心电': EXAM_ITEMS.filter(e => e.modality === '心电'),
  'X光': EXAM_ITEMS.filter(e => e.modality === 'X光'),
};

// ==================== 设备负载信息 ====================
export function getDeviceLoadInfo(): DeviceLoadInfo[] {
  return DEVICES.filter(d => d.status !== '停机').map(device => ({
    deviceId: device.id,
    deviceName: device.name,
    modality: device.modality,
    utilizationRate: device.totalSlots > 0 ? Math.round((device.usedSlots / device.totalSlots) * 100) : 0,
    availableSlots: device.availableTimes.reduce((sum, t) => sum + t.available, 0),
    totalSlots: device.totalSlots,
    status: device.status,
  }));
}

// ==================== 获取设备可用时段 ====================
function getAvailableSlotsForDevice(deviceId: string, examItemId: string): Array<{time: string; available: number}> {
  const device = DEVICES.find(d => d.id === deviceId);
  if (!device) return [];
  
  // 模拟更细致的时段数据
  const baseSlots = [
    { time: '08:00-09:00', available: 0 },
    { time: '09:00-10:00', available: 0 },
    { time: '10:00-11:00', available: 0 },
    { time: '11:00-12:00', available: 0 },
    { time: '14:00-15:00', available: 0 },
    { time: '15:00-16:00', available: 0 },
    { time: '16:00-17:00', available: 0 },
    { time: '17:00-18:00', available: 0 },
  ];
  
  // 根据设备负载计算可用数
  const utilizationRate = device.usedSlots / device.totalSlots;
  
  return baseSlots.map((slot, index) => {
    // 上午8-12点占60%权重，下午14-18点占40%权重
    const isMorning = index < 4;
    const baseAvailable = isMorning 
      ? Math.max(1, Math.floor(5 * (1 - utilizationRate) + Math.random() * 2))
      : Math.max(1, Math.floor(4 * (1 - utilizationRate) + Math.random() * 2));
    
    return {
      time: slot.time,
      available: baseAvailable,
    };
  });
}

// ==================== 获取患者历史预约 ====================
function getPatientHistory(patientId: string): Appointment[] {
  return APPOINTMENTS.filter(a => a.patientId === patientId && a.status !== '已取消');
}

// ==================== AI推荐核心算法 ====================
export function generateAIRecommendation(
  patientId: string,
  examItemIds: string[]
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  const patient = INPATIENTS.find(p => p.id === patientId) || 
    (PATIENTS.find(p => p.id === patientId) as Patient) ||
    INPATIENTS[0];
  
  const patientHistory = getPatientHistory(patientId);
  
  for (const examItemId of examItemIds) {
    const examItem = EXAM_ITEMS.find(e => e.id === examItemId);
    if (!examItem) continue;
    
    const applicableDevices = DEVICES.filter(d => 
      examItem.applicableDeviceIds.includes(d.id) && d.status !== '停机'
    );
    
    if (applicableDevices.length === 0) {
      recommendations.push({
        examItemId,
        examItemName: examItem.name,
        modality: examItem.modality,
        recommendedSlot: {
          date: getNextAvailableDate(examItem.modality),
          time: '14:00-15:00',
          deviceId: '',
          deviceName: '无可用设备',
          doctorName: '-',
          estimatedWaitMinutes: 0,
          queueAhead: 0,
        },
        alternativeSlots: [],
        reasons: [],
        deviceLoadInfo: [],
        warnings: ['无可用设备，请联系管理员'],
      });
      continue;
    }
    
    // 收集设备负载信息
    const deviceLoadInfo = applicableDevices.map(d => ({
      deviceId: d.id,
      deviceName: d.name,
      modality: d.modality,
      utilizationRate: d.totalSlots > 0 ? Math.round((d.usedSlots / d.totalSlots) * 100) : 0,
      availableSlots: d.availableTimes.reduce((sum, t) => sum + t.available, 0),
      totalSlots: d.totalSlots,
      status: d.status,
    }));
    
    // 评分所有可用时段
    const scoredSlots = scoreAllSlots(
      applicableDevices, 
      examItem, 
      patientHistory,
      patient
    );
    
    // 选择最佳时段
    const bestSlot = scoredSlots[0];
    const alternativeSlots = scoredSlots.slice(1, 4);
    
    // 生成推荐理由
    const reasons = generateReasons(
      bestSlot, 
      alternativeSlots, 
      patientHistory, 
      examItem,
      patient
    );
    
    // 生成警告
    const warnings = generateWarnings(bestSlot, examItem, patient);
    
    recommendations.push({
      examItemId,
      examItemName: examItem.name,
      modality: examItem.modality,
      recommendedSlot: bestSlot,
      alternativeSlots,
      reasons,
      deviceLoadInfo,
      warnings,
    });
  }
  
  return recommendations;
}

// ==================== 时段评分 ====================
interface ScoredSlot {
  date: string;
  time: string;
  deviceId: string;
  deviceName: string;
  doctorName: string;
  estimatedWaitMinutes: number;
  queueAhead: number;
  totalScore: number;
  utilizationRate: number;
}

function scoreAllSlots(
  devices: Device[],
  examItem: ExamItem,
  patientHistory: Appointment[],
  patient: Patient
): ScoredSlot[] {
  const today = new Date();
  const results: ScoredSlot[] = [];
  
  for (const device of devices) {
    // 获取该设备今天和明天的可用时段
    for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().split('T')[0];
      
      const slots = getAvailableSlotsForDevice(device.id, examItem.id);
      
      for (const slot of slots) {
        if (slot.available <= 0) continue;
        
        // 计算各项评分
        const loadScore = calculateLoadScore(device); // 设备负载评分 (1-10)
        const waitScore = calculateWaitScore(slot.available); // 等候时间评分 (1-10)
        const historyScore = calculateHistoryScore(patientHistory, device, examItem); // 患者历史评分 (1-10)
        const timeScore = calculateTimeScore(examItem.modality, slot.time, examItem.name); // 时间约束评分 (1-10)
        const priorityScore = calculatePriorityScore(patient); // 患者优先级评分 (1-10)
        
        // 综合评分 (加权平均)
        const totalScore = 
          loadScore * 0.25 +      // 设备负载占25%
          waitScore * 0.25 +      // 等候时间占25%
          historyScore * 0.20 +   // 患者历史占20%
          timeScore * 0.15 +      // 时间约束占15%
          priorityScore * 0.15;   // 优先级占15%
        
        // 获取值班医生
        const doctorName = getDoctorForDevice(device.id);
        
        results.push({
          date: dateStr,
          time: slot.time,
          deviceId: device.id,
          deviceName: device.name,
          doctorName,
          estimatedWaitMinutes: calculateEstimatedWait(slot.available, device),
          queueAhead: slot.available > 0 ? Math.floor(Math.random() * slot.available) + 1 : 0,
          totalScore: Math.round(totalScore * 100) / 100,
          utilizationRate: device.totalSlots > 0 ? Math.round((device.usedSlots / device.totalSlots) * 100) : 0,
        });
      }
    }
  }
  
  // 按评分降序排列
  return results.sort((a, b) => b.totalScore - a.totalScore);
}

// 设备负载评分：利用率越低分数越高
function calculateLoadScore(device: Device): number {
  const utilization = device.usedSlots / device.totalSlots;
  return Math.round((1 - utilization) * 10 * 100) / 100;
}

// 等候时间评分：可用号源越多分数越高
function calculateWaitScore(available: number): number {
  if (available >= 5) return 10;
  if (available >= 3) return 8;
  if (available >= 2) return 6;
  if (available >= 1) return 4;
  return 2;
}

// 患者历史评分：避免重复设备和项目
function calculateHistoryScore(
  history: Appointment[], 
  device: Device, 
  examItem: ExamItem
): number {
  let score = 10; // 默认高分
  
  for (const appt of history) {
    // 如果之前做过同类检查，降低分数
    if (appt.examItemId === examItem.id) {
      score -= 3;
    }
    // 如果之前用过同类设备，降低分数
    if (appt.deviceId === device.id) {
      score -= 2;
    }
    // 如果之前在同时段，降低分数
    if (appt.appointmentTime === '09:00-10:00') {
      score -= 1;
    }
  }
  
  return Math.max(1, score);
}

// 时间约束评分：根据检查类型评分
function calculateTimeScore(modality: string, time: string, examItemName?: string): number {
  const hour = parseInt(time.split(':')[0]);
  let baseScore = 5;
  
  // 腹部超声等空腹检查优先上午
  if (modality === '超声' && hour >= 8 && hour <= 11) {
    baseScore = 10;
  }
  // CT增强建议下午
  else if (modality === 'CT' && examItemName && examItemName.includes('增强') && hour >= 14) {
    baseScore = 10;
  }
  // 内镜建议上午
  else if (modality === '内镜' && hour >= 8 && hour <= 10) {
    baseScore = 10;
  }
  // 动态心电图必须上午
  else if (modality === '心电' && hour >= 8 && hour <= 10) {
    baseScore = 10;
  }
  // 避开高峰时段
  else if (hour === 9 || hour === 10) {
    baseScore = 4; // 高峰时段
  }
  // 非常早或非常晚的时段
  else if (hour === 8 || hour === 17) {
    baseScore = 6;
  }
  
  return baseScore;
}

// 优先级评分
function calculatePriorityScore(patient: Patient): number {
  let score = 5; // 基础分
  
  if (patient.patientType === '住院') {
    score += 3;
  } else if (patient.patientType === '急诊') {
    score += 5;
  } else if (patient.patientType === '体检') {
    score -= 2;
  }
  
  // 年龄因素
  if (patient.age < 8 || patient.age > 80) {
    score += 2; // 老人儿童优先
  }
  
  return Math.min(10, Math.max(1, score));
}

// 估算等候时间
function calculateEstimatedWait(available: number, device: Device): number {
  // 假设每个患者检查时间约15分钟，平均队列长度
  const avgCheckTime = 15; // 分钟
  const queueLength = Math.max(0, 5 - available); // 假设设备容量5
  return queueLength * avgCheckTime;
}

// 获取设备值班医生
function getDoctorForDevice(deviceId: string): string {
  const doctorMap: Record<string, string[]> = {
    'DEV001': ['张伟', '李娜'],
    'DEV002': ['王芳', '刘静'],
    'DEV003': ['张伟', '李娜'],
    'DEV004': ['王芳'],
    'DEV005': ['李娜', '孙磊'],
    'DEV006': ['王芳', '刘静'],
    'DEV007': ['王强'],
    'DEV008': ['赵敏'],
    'DEV009': ['张伟'],
    'DEV010': ['王芳'],
  };
  
  const doctors = doctorMap[deviceId] || ['待定'];
  return doctors[Math.floor(Math.random() * doctors.length)];
}

// 获取下一个可用日期
function getNextAvailableDate(modality: string): string {
  const today = new Date();
  let nextDate = new Date(today);
  
  // 如果是内镜，跳过周末
  if (modality === '内镜') {
    while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
  }
  
  return nextDate.toISOString().split('T')[0];
}

// ==================== 生成推荐理由 ====================
function generateReasons(
  bestSlot: ScoredSlot,
  alternatives: ScoredSlot[],
  history: Appointment[],
  examItem: ExamItem,
  patient: Patient
): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];
  
  // 1. 设备负载理由
  if (bestSlot.utilizationRate < 70) {
    reasons.push({
      type: 'load_balancing',
      title: '设备利用率低',
      description: `${bestSlot.deviceName}当前利用率仅${bestSlot.utilizationRate}%，设备负载较低，检查体验更好`,
      score: 9,
    });
  } else if (bestSlot.utilizationRate < 85) {
    reasons.push({
      type: 'load_balancing',
      title: '设备负载适中',
      description: `${bestSlot.deviceName}当前利用率${bestSlot.utilizationRate}%，负载处于合理范围`,
      score: 7,
    });
  } else {
    reasons.push({
      type: 'load_balancing',
      title: '设备负载较高',
      description: `${bestSlot.deviceName}当前利用率${bestSlot.utilizationRate}%，等候时间可能较长`,
      score: 4,
    });
  }
  
  // 2. 等候时间理由
  if (bestSlot.queueAhead <= 2) {
    reasons.push({
      type: 'wait_time',
      title: '排队人数少',
      description: `预计前面排队的患者约${bestSlot.queueAhead}人，预计等候约${bestSlot.estimatedWaitMinutes}分钟`,
      score: 9,
    });
  } else if (bestSlot.queueAhead <= 5) {
    reasons.push({
      type: 'wait_time',
      title: '等候时间适中',
      description: `预计前面排队的患者约${bestSlot.queueAhead}人，预计等候约${bestSlot.estimatedWaitMinutes}分钟`,
      score: 6,
    });
  } else {
    reasons.push({
      type: 'wait_time',
      title: '排队人数较多',
      description: `预计前面排队的患者约${bestSlot.queueAhead}人，预计等候约${bestSlot.estimatedWaitMinutes}分钟`,
      score: 3,
    });
  }
  
  // 3. 患者历史理由
  const deviceUsedBefore = history.some(h => h.deviceId === bestSlot.deviceId);
  const itemDoneBefore = history.some(h => h.examItemId === examItem.id);
  
  if (!deviceUsedBefore && !itemDoneBefore) {
    reasons.push({
      type: 'patient_history',
      title: '首次检查',
      description: `患者之前未进行过${examItem.name}检查，也未使用过该设备，符合检查规范`,
      score: 8,
    });
  } else if (deviceUsedBefore) {
    reasons.push({
      type: 'patient_history',
      title: '设备复用',
      description: `患者之前使用过${bestSlot.deviceName}，对环境和流程更熟悉`,
      score: 6,
    });
  }
  
  // 4. 时间约束理由
  const hour = parseInt(bestSlot.time.split(':')[0]);
  if (examItem.modality === '超声' && hour >= 8 && hour <= 11) {
    reasons.push({
      type: 'time_constraint',
      title: '符合空腹检查时间',
      description: `${examItem.name}需要空腹，优先安排在上午${bestSlot.time}时段，符合检查要求`,
      score: 10,
    });
  } else if (examItem.modality === '内镜' && hour >= 8 && hour <= 10) {
    reasons.push({
      type: 'time_constraint',
      title: '符合内镜检查时间',
      description: `内镜检查建议安排在上午${bestSlot.time}时段，${bestSlot.time}时段符合推荐`,
      score: 10,
    });
  } else if (examItem.modality === 'CT' && examItem.name.includes('增强') && hour >= 14) {
    reasons.push({
      type: 'time_constraint',
      title: '符合增强CT时间',
      description: `增强CT建议安排在下午，${bestSlot.time}时段符合要求，可避开上午空腹检查高峰`,
      score: 10,
    });
  }
  
  // 5. 为什么没选其他时段
  if (alternatives.length > 0) {
    const alt1 = alternatives[0];
    if (bestSlot.utilizationRate < alt1.utilizationRate) {
      reasons.push({
        type: 'priority',
        title: '优先选择低负载设备',
        description: `对比${alt1.deviceName}（利用率${alt1.utilizationRate}%），${bestSlot.deviceName}（利用率${bestSlot.utilizationRate}%）负载更低`,
        score: 8,
      });
    }
  }
  
  return reasons.sort((a, b) => b.score - a.score);
}

// ==================== 生成警告 ====================
function generateWarnings(
  slot: ScoredSlot,
  examItem: ExamItem,
  patient: Patient
): string[] {
  const warnings: string[] = [];
  
  // 检查规则
  const context: RuleEngineContext = {
    appointment: {
      patientId: patient.id,
      patientName: patient.name,
      examItemId: examItem.id,
      examItemName: examItem.name,
      modality: examItem.modality,
      deviceId: slot.deviceId,
      deviceName: slot.deviceName,
      appointmentDate: slot.date,
      appointmentTime: slot.time,
    },
    existingAppointments: APPOINTMENTS,
    patientAge: patient.age,
    patientGender: patient.gender,
    patientType: patient.patientType,
    deviceUsedSlots: slot.utilizationRate,
  };
  
  const result = evaluateRules(context);
  
  // 添加规则警告
  for (const warning of result.warnings) {
    warnings.push(warning.message);
  }
  
  // 年龄相关警告
  if (patient.age < 8) {
    warnings.push(`${patient.name}年龄较小（${patient.age}岁），进行检查时可能需要家长陪同`);
  }
  if (patient.age > 80) {
    warnings.push(`${patient.name}年龄较大（${patient.age}岁），建议安排在上午时段，方便家属陪同`);
  }
  
  // 空腹检查警告
  if (examItem.name.includes('腹部') || examItem.name.includes('肝胆')) {
    warnings.push(`${patient.name}需空腹8小时以上方可进行检查，请提醒患者检查前禁食`);
  }
  
  return warnings;
}

// ==================== 验证预约规则 ====================
export function validateBooking(
  patientId: string,
  examItemId: string,
  deviceId: string,
  date: string,
  time: string
): { valid: boolean; errors: string[]; warnings: string[] } {
  const examItem = EXAM_ITEMS.find(e => e.id === examItemId);
  const device = DEVICES.find(d => d.id === deviceId);
  const patient = [...INPATIENTS, ...PATIENTS].find(p => p.id === patientId);
  
  if (!examItem || !device || !patient) {
    return { valid: false, errors: ['患者、检查项目或设备信息不完整'], warnings: [] };
  }
  
  const context: RuleEngineContext = {
    appointment: {
      patientId,
      patientName: patient.name,
      examItemId,
      examItemName: examItem.name,
      modality: examItem.modality,
      deviceId,
      deviceName: device.name,
      appointmentDate: date,
      appointmentTime: time,
    },
    existingAppointments: APPOINTMENTS,
    patientAge: patient.age,
    patientGender: patient.gender,
    patientType: patient.patientType,
    deviceUsedSlots: device.usedSlots,
  };
  
  const result = evaluateRules(context);
  
  return {
    valid: result.passed,
    errors: result.violations.map(v => v.message),
    warnings: result.warnings.map(w => w.message),
  };
}

// ==================== 创建预约 ====================
export function createBooking(
  patientId: string,
  examItemId: string,
  deviceId: string,
  date: string,
  time: string
): { success: boolean; appointmentId?: string; message: string } {
  const validation = validateBooking(patientId, examItemId, deviceId, date, time);
  
  if (!validation.valid) {
    return { success: false, message: validation.errors.join('; ') };
  }
  
  const examItem = EXAM_ITEMS.find(e => e.id === examItemId);
  const device = DEVICES.find(d => d.id === deviceId);
  const patient = [...INPATIENTS, ...PATIENTS].find(p => p.id === patientId);
  
  if (!examItem || !device || !patient) {
    return { success: false, message: '信息不完整' };
  }
  
  // 生成预约ID
  const appointmentId = `APT${String(APPOINTMENTS.length + 1).padStart(3, '0')}`;
  
  // 这里应该调用API创建预约
  // 模拟成功
  return { 
    success: true, 
    appointmentId,
    message: `预约成功！\n患者：${patient.name}\n检查项目：${examItem.name}\n设备：${device.name}\n日期：${date}\n时段：${time}\n\n请提醒患者按时签到。` 
  };
}
