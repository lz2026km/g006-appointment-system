// G006 全院医技检查预约系统 - 初始数据
// 汉东省人民医院全院医技检查预约系统

import type {
  Appointment, Patient, ExamItem, Device, SlotSource,
  Schedule, Department, CheckInRecord, Notification, Statistics,
  NotificationTemplate, SendRecord
} from '../types';

// ==================== 科室数据 ====================
export const DEPARTMENTS: Department[] = [
  { id: 'D001', name: '放射科', code: 'RAD', type: '医技', coordinator: '张伟', examItems: ['CT', 'MRI', 'X光'] },
  { id: 'D002', name: '超声医学科', code: 'US', type: '医技', coordinator: '李娜', examItems: ['腹部超声', '心脏超声', '血管超声'] },
  { id: 'D003', name: '内镜中心', code: 'ENDO', type: '医技', coordinator: '王强', examItems: ['胃镜', '肠镜', '支气管镜'] },
  { id: 'D004', name: '心电图室', code: 'ECG', type: '医技', coordinator: '赵敏', examItems: ['常规心电图', '动态心电图', '运动负荷试验'] },
  { id: 'D005', name: '检验科', code: 'LAB', type: '医技', coordinator: '刘芳', examItems: ['血液', '生化', '免疫'] },
  { id: 'D006', name: '急诊科', code: 'ER', type: '急诊', coordinator: '孙磊', examItems: ['急诊CT', '急诊超声'] },
  { id: 'D007', name: '体检科', code: 'HEALTH', type: '体检', coordinator: '周婷', examItems: ['体检超声', '心电图', 'X光'] },
  { id: 'D008', name: '心内科', code: 'CARD', type: '临床', coordinator: '陈医生', examItems: ['心电图', '心脏超声'] },
  { id: 'D009', name: '呼吸内科', code: 'RESP', type: '临床', coordinator: '林医生', examItems: ['支气管镜', '胸部X光'] },
  { id: 'D010', name: '消化内科', code: 'GI', type: '临床', coordinator: '吴医生', examItems: ['胃镜', '肠镜'] },
];

// ==================== 检查项目数据 ====================
export const EXAM_ITEMS: ExamItem[] = [
  // CT
  { id: 'EI001', name: '头颅CT平扫', code: 'CT-BRAIN', modality: 'CT', departmentId: 'D001', departmentName: '放射科', duration: 15, price: 350, preparationNotes: '无需特殊准备', applicableDeviceIds: ['DEV001', 'DEV002'], isActive: true },
  { id: 'EI002', name: '胸部CT平扫', code: 'CT-CHEST', modality: 'CT', departmentId: 'D001', departmentName: '放射科', duration: 10, price: 380, preparationNotes: '深吸气屏气', applicableDeviceIds: ['DEV001', 'DEV002'], isActive: true },
  { id: 'EI003', name: '腹部CT平扫', code: 'CT-ABD', modality: 'CT', departmentId: 'D001', departmentName: '放射科', duration: 20, price: 420, preparationNotes: '检查前禁食4-6小时', applicableDeviceIds: ['DEV001', 'DEV002'], isActive: true },
  { id: 'EI004', name: '冠脉CTA', code: 'CTA-CORONARY', modality: 'CT', subModality: 'CTA', departmentId: 'D001', departmentName: '放射科', duration: 30, price: 1200, preparationNotes: '控制心率<70次/分', applicableDeviceIds: ['DEV001'], isActive: true },
  // MRI
  { id: 'EI005', name: '头颅MRI平扫', code: 'MRI-BRAIN', modality: 'MRI', departmentId: 'D001', departmentName: '放射科', duration: 25, price: 680, preparationNotes: '去除金属异物', applicableDeviceIds: ['DEV003', 'DEV004'], isActive: true },
  { id: 'EI006', name: '腰椎MRI', code: 'MRI-LUMBAR', modality: 'MRI', departmentId: 'D001', departmentName: '放射科', duration: 25, price: 680, preparationNotes: '去除金属异物', applicableDeviceIds: ['DEV003', 'DEV004'], isActive: true },
  // 超声
  { id: 'EI007', name: '腹部肝胆脾胰超声', code: 'US-ABD', modality: '超声', departmentId: 'D002', departmentName: '超声医学科', duration: 20, price: 180, preparationNotes: '空腹8小时', applicableDeviceIds: ['DEV005', 'DEV006'], isActive: true },
  { id: 'EI008', name: '心脏彩超', code: 'US-ECHO', modality: '超声', departmentId: 'D002', departmentName: '超声医学科', duration: 25, price: 280, preparationNotes: '无需特殊准备', applicableDeviceIds: ['DEV005', 'DEV006'], isActive: true },
  { id: 'EI009', name: '甲状腺超声', code: 'US-THYROID', modality: '超声', departmentId: 'D002', departmentName: '超声医学科', duration: 15, price: 150, preparationNotes: '无需特殊准备', applicableDeviceIds: ['DEV005', 'DEV006'], isActive: true },
  // 内镜
  { id: 'EI010', name: '电子胃镜检查', code: 'ENDO-GASTRO', modality: '内镜', departmentId: 'D003', departmentName: '内镜中心', duration: 30, price: 450, preparationNotes: '检查前禁食12小时', applicableDeviceIds: ['DEV007'], isActive: true },
  { id: 'EI011', name: '电子结肠镜检查', code: 'ENDO-COLON', modality: '内镜', departmentId: 'D003', departmentName: '内镜中心', duration: 40, price: 580, preparationNotes: '肠道准备', applicableDeviceIds: ['DEV007'], isActive: true },
  // 心电
  { id: 'EI012', name: '常规十二导联心电图', code: 'ECG-STANDARD', modality: '心电', departmentId: 'D004', departmentName: '心电图室', duration: 10, price: 35, preparationNotes: '检查前静息5分钟', applicableDeviceIds: ['DEV008'], isActive: true },
  { id: 'EI013', name: '24小时动态心电图', code: 'ECG-HOLTER', modality: '心电', departmentId: 'D004', departmentName: '心电图室', duration: 5, price: 260, preparationNotes: '保持电极贴附', applicableDeviceIds: ['DEV008'], isActive: true },
  // X光
  { id: 'EI014', name: '胸部X线正侧位片', code: 'XCHEST-PA', modality: 'X光', departmentId: 'D001', departmentName: '放射科', duration: 8, price: 80, preparationNotes: '去除颈部金属', applicableDeviceIds: ['DEV009', 'DEV010'], isActive: true },
  { id: 'EI015', name: '颈椎张口位X线', code: 'XCERVICAL', modality: 'X光', departmentId: 'D001', departmentName: '放射科', duration: 8, price: 75, preparationNotes: '去除颈部金属', applicableDeviceIds: ['DEV009', 'DEV010'], isActive: true },
];

// ==================== 设备数据 ====================
export const DEVICES: Device[] = [
  { id: 'DEV001', name: 'CT-01 (西门子 Definition AS+)', code: 'CT01', modality: 'CT', departmentId: 'D001', departmentName: '放射科', location: '医技楼1层CT-1室', manufacturer: '西门子', model: 'Definition AS+', status: '正常', totalSlots: 40, usedSlots: 28, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 20, available: 8 }, { startTime: '14:00', endTime: '18:00', total: 20, available: 4 }] },
  { id: 'DEV002', name: 'CT-02 (GE Revolution)', code: 'CT02', modality: 'CT', departmentId: 'D001', departmentName: '放射科', location: '医技楼1层CT-2室', manufacturer: 'GE', model: 'Revolution', status: '正常', totalSlots: 40, usedSlots: 35, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 20, available: 3 }, { startTime: '14:00', endTime: '18:00', total: 20, available: 2 }] },
  { id: 'DEV003', name: 'MRI-01 (西门子 MAGNETOM Vida)', code: 'MRI01', modality: 'MRI', departmentId: 'D001', departmentName: '放射科', location: '医技楼1层MRI-1室', manufacturer: '西门子', model: 'MAGNETOM Vida', status: '正常', totalSlots: 25, usedSlots: 20, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 12, available: 3 }, { startTime: '14:00', endTime: '18:00', total: 13, available: 2 }] },
  { id: 'DEV004', name: 'MRI-02 (飞利浦 Ingenia)', code: 'MRI02', modality: 'MRI', departmentId: 'D001', departmentName: '放射科', location: '医技楼1层MRI-2室', manufacturer: '飞利浦', model: 'Ingenia', status: '维护中', totalSlots: 25, usedSlots: 0, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 12, available: 0 }, { startTime: '14:00', endTime: '18:00', total: 13, available: 0 }], maintenanceDate: '2026-05-02' },
  { id: 'DEV005', name: '超声-01 (迈瑞 Resona 7)', code: 'US01', modality: '超声', departmentId: 'D002', departmentName: '超声医学科', location: '医技楼2层超声-1室', manufacturer: '迈瑞', model: 'Resona 7', status: '正常', totalSlots: 50, usedSlots: 32, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 25, available: 10 }, { startTime: '14:00', endTime: '18:00', total: 25, available: 8 }] },
  { id: 'DEV006', name: '超声-02 (GE Voluson E10)', code: 'US02', modality: '超声', departmentId: 'D002', departmentName: '超声医学科', location: '医技楼2层超声-2室', manufacturer: 'GE', model: 'Voluson E10', status: '正常', totalSlots: 50, usedSlots: 18, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 25, available: 18 }, { startTime: '14:00', endTime: '18:00', total: 25, available: 14 }] },
  { id: 'DEV007', name: '电子内镜系统 (奥林巴斯 290)', code: 'ENDO01', modality: '内镜', departmentId: 'D003', departmentName: '内镜中心', location: '门诊楼3层内镜室', manufacturer: '奥林巴斯', model: 'CV-290', status: '正常', totalSlots: 20, usedSlots: 12, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 10, available: 5 }, { startTime: '14:00', endTime: '18:00', total: 10, available: 3 }] },
  { id: 'DEV008', name: '心电图机 (GE MAC 2000)', code: 'ECG01', modality: '心电', departmentId: 'D004', departmentName: '心电图室', location: '门诊楼2层心电图室', manufacturer: 'GE', model: 'MAC 2000', status: '正常', totalSlots: 80, usedSlots: 45, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 40, available: 20 }, { startTime: '14:00', endTime: '18:00', total: 40, available: 15 }] },
  { id: 'DEV009', name: 'DR-01 (西门子 Ysio)', code: 'DR01', modality: 'X光', departmentId: 'D001', departmentName: '放射科', location: '医技楼1层DR-1室', manufacturer: '西门子', model: 'Ysio', status: '正常', totalSlots: 60, usedSlots: 30, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 30, available: 18 }, { startTime: '14:00', endTime: '18:00', total: 30, available: 12 }] },
  { id: 'DEV010', name: 'DR-02 (GE Definium 6000)', code: 'DR02', modality: 'X光', departmentId: 'D001', departmentName: '放射科', location: '医技楼1层DR-2室', manufacturer: 'GE', model: 'Deficium 6000', status: '正常', totalSlots: 60, usedSlots: 22, availableTimes: [{ startTime: '08:00', endTime: '12:00', total: 30, available: 22 }, { startTime: '14:00', endTime: '18:00', total: 30, available: 16 }] },
];

// ==================== 号源数据 ====================
export const SLOT_SOURCES: SlotSource[] = [
  { id: 'SS001', deviceId: 'DEV001', deviceName: 'CT-01 (西门子 Definition AS+)', examItemId: 'EI001', examItemName: '头颅CT平扫', date: '2026-05-02', slots: [{ startTime: '08:00', endTime: '09:00', total: 4, available: 1 }, { startTime: '09:00', endTime: '10:00', total: 4, available: 0 }, { startTime: '10:00', endTime: '11:00', total: 4, available: 2 }, { startTime: '11:00', endTime: '12:00', total: 4, available: 1 }], autoRelease: true, releaseRule: '每日08:00自动放号' },
  { id: 'SS002', deviceId: 'DEV005', deviceName: '超声-01 (迈瑞 Resona 7)', examItemId: 'EI007', examItemName: '腹部肝胆脾胰超声', date: '2026-05-02', slots: [{ startTime: '08:00', endTime: '09:00', total: 5, available: 2 }, { startTime: '09:00', endTime: '10:00', total: 5, available: 3 }, { startTime: '10:00', endTime: '11:00', total: 5, available: 1 }, { startTime: '11:00', endTime: '12:00', total: 5, available: 4 }], autoRelease: true, releaseRule: '每日08:00自动放号' },
];

// ==================== 排班数据 ====================
export const SCHEDULES: Schedule[] = [
  { id: 'SCH001', deviceId: 'DEV001', deviceName: 'CT-01', date: '2026-05-02', shiftType: '上午', Technicians: ['刘建国', '马力'], doctors: ['张伟', '李娜'], totalCapacity: 20, bookedCount: 16, status: '已排班' },
  { id: 'SCH002', deviceId: 'DEV001', deviceName: 'CT-01', date: '2026-05-02', shiftType: '下午', Technicians: ['王磊', '赵强'], doctors: ['张伟'], totalCapacity: 20, bookedCount: 12, status: '已排班' },
  { id: 'SCH003', deviceId: 'DEV003', deviceName: 'MRI-01', date: '2026-05-02', shiftType: '上午', Technicians: ['李明', '周涛'], doctors: ['王芳', '刘静'], totalCapacity: 12, bookedCount: 10, status: '已排班' },
  { id: 'SCH004', deviceId: 'DEV005', deviceName: '超声-01', date: '2026-05-02', shiftType: '上午', Technicians: ['陈晨', '吴琳'], doctors: ['李娜', '孙磊'], totalCapacity: 25, bookedCount: 18, status: '已排班' },
  { id: 'SCH005', deviceId: 'DEV007', deviceName: '内镜-01', date: '2026-05-02', shiftType: '上午', Technicians: ['马云飞'], doctors: ['王强'], totalCapacity: 10, bookedCount: 7, status: '已排班' },
  { id: 'SCH006', deviceId: 'DEV008', deviceName: '心电图-01', date: '2026-05-02', shiftType: '上午', Technicians: ['张丽', '赵敏'], doctors: ['赵敏'], totalCapacity: 40, bookedCount: 25, status: '已排班' },
];

// ==================== 患者数据 ====================
export const PATIENTS: Patient[] = [
  { id: 'P001', name: '李建国', gender: '男', age: 58, phone: '13812345601', idCard: '310101196801011234', address: '汉东省汉州市滨湖区解放路88号', patientType: '门诊', registrationDate: '2026-05-01', appointmentCount: 3 },
  { id: 'P002', name: '王秀英', gender: '女', age: 45, phone: '13912345602', idCard: '310102197911022345', address: '汉东省汉州市江北区人民路200号', patientType: '门诊', registrationDate: '2026-05-01', appointmentCount: 1 },
  { id: 'P003', name: '张伟', gender: '男', age: 32, phone: '13712345603', idCard: '310103199401033456', address: '汉东省汉州市浦东区世纪大道666号', patientType: '住院', registrationDate: '2026-04-28', appointmentCount: 5 },
  { id: 'P004', name: '刘芳', gender: '女', age: 67, phone: '13612345604', idCard: '310104195901044567', address: '汉东省汉州市静安区南京西路100号', patientType: '体检', registrationDate: '2026-05-02', appointmentCount: 2 },
  { id: 'P005', name: '陈强', gender: '男', age: 28, phone: '13512345605', idCard: '310105199801055678', address: '汉东省汉州市徐汇区漕溪北路88号', patientType: '门诊', registrationDate: '2026-05-01', appointmentCount: 1 },
  { id: 'P006', name: '赵敏', gender: '女', age: 51, phone: '13412345606', idCard: '310106197501066789', address: '汉东省汉州市长宁区延安西路300号', patientType: '门诊', registrationDate: '2026-05-01', appointmentCount: 4 },
  { id: 'P007', name: '孙磊', gender: '男', age: 73, phone: '13312345607', idCard: '310107195301077890', address: '汉东省汉州市普陀区中山北路888号', patientType: '住院', registrationDate: '2026-04-30', appointmentCount: 6 },
  { id: 'P008', name: '周婷', gender: '女', age: 39, phone: '13212345608', idCard: '310108198701088901', address: '汉东省汉州市虹口区四川北路200号', patientType: '门诊', registrationDate: '2026-05-02', appointmentCount: 1 },
  { id: 'P009', name: '吴浩', gender: '男', age: 44, phone: '13112345609', idCard: '310109198201099012', address: '汉东省汉州市杨浦区控江路100号', patientType: '体检', registrationDate: '2026-05-02', appointmentCount: 2 },
  { id: 'P010', name: '郑静', gender: '女', age: 62, phone: '13012345610', idCard: '310110196401101123', address: '汉东省汉州市黄浦区南京东路500号', patientType: '门诊', registrationDate: '2026-05-01', appointmentCount: 3 },
];

// ==================== 预约数据 ====================
const today = '2026-05-02';
export const APPOINTMENTS: Appointment[] = [
  { id: 'APT001', patientId: 'P001', patientName: '李建国', gender: '男', age: 58, patientType: '门诊', phone: '13812345601', idCard: '310101196801011234', examItemId: 'EI001', examItemName: '头颅CT平扫', modality: 'CT', deviceId: 'DEV001', deviceName: 'CT-01', departmentId: 'D001', departmentName: '放射科', doctorId: 'DOC001', doctorName: '张伟', appointmentDate: today, appointmentTime: '08:00-09:00', status: '已签到', registrationType: '门诊', clinicalDiagnosis: '头痛待查', clinicalInfo: '持续性隐痛2周', isUrgent: false, checkInTime: '07:55', reportStatus: '未写', createdAt: '2026-05-01 09:00:00', updatedAt: '2026-05-02 07:55:00' },
  { id: 'APT002', patientId: 'P002', patientName: '王秀英', gender: '女', age: 45, patientType: '门诊', phone: '13912345602', idCard: '310102197911022345', examItemId: 'EI002', examItemName: '胸部CT平扫', modality: 'CT', deviceId: 'DEV001', deviceName: 'CT-01', departmentId: 'D001', departmentName: '放射科', doctorId: 'DOC001', doctorName: '张伟', appointmentDate: today, appointmentTime: '09:00-10:00', status: '检查中', registrationType: '门诊', clinicalDiagnosis: '咳嗽伴胸痛1周', clinicalInfo: '低热37.8°C', isUrgent: false, checkInTime: '08:50', reportStatus: '未写', createdAt: '2026-05-01 10:30:00', updatedAt: '2026-05-02 08:50:00' },
  { id: 'APT003', patientId: 'P003', patientName: '张伟', gender: '男', age: 32, patientType: '住院', phone: '13712345603', idCard: '310103199401033456', examItemId: 'EI004', examItemName: '冠脉CTA', modality: 'CT', deviceId: 'DEV001', deviceName: 'CT-01', departmentId: 'D001', departmentName: '放射科', doctorId: 'DOC002', doctorName: '李娜', appointmentDate: today, appointmentTime: '10:00-11:00', status: '已确认', registrationType: '住院', clinicalDiagnosis: '冠心病复查', clinicalInfo: '心电图ST段改变', isUrgent: true, checkInTime: undefined, reportStatus: '未写', createdAt: '2026-05-01 14:00:00', updatedAt: '2026-05-01 14:00:00' },
  { id: 'APT004', patientId: 'P004', patientName: '刘芳', gender: '女', age: 67, patientType: '体检', phone: '13612345604', idCard: '310104195901044567', examItemId: 'EI007', examItemName: '腹部肝胆脾胰超声', modality: '超声', deviceId: 'DEV005', deviceName: '超声-01', departmentId: 'D002', departmentName: '超声医学科', doctorId: 'DOC003', doctorName: '王芳', appointmentDate: today, appointmentTime: '08:00-09:00', status: '已完成', registrationType: '体检', clinicalDiagnosis: '健康体检', clinicalInfo: '无特殊不适', isUrgent: false, checkInTime: '07:50', reportStatus: '已审核', createdAt: '2026-04-30 16:00:00', updatedAt: '2026-05-02 08:30:00' },
  { id: 'APT005', patientId: 'P005', patientName: '陈强', gender: '男', age: 28, patientType: '门诊', phone: '13512345605', idCard: '310105199801055678', examItemId: 'EI012', examItemName: '常规十二导联心电图', modality: '心电', deviceId: 'DEV008', deviceName: '心电图-01', departmentId: 'D004', departmentName: '心电图室', doctorId: 'DOC004', doctorName: '赵敏', appointmentDate: today, appointmentTime: '08:30-09:00', status: '已签到', registrationType: '门诊', clinicalDiagnosis: '心悸待查', clinicalInfo: '偶发早搏', isUrgent: false, checkInTime: '08:25', reportStatus: '已审核', createdAt: '2026-05-01 11:00:00', updatedAt: '2026-05-02 08:25:00' },
  { id: 'APT006', patientId: 'P006', patientName: '赵敏', gender: '女', age: 51, patientType: '门诊', phone: '13412345606', idCard: '310106197501066789', examItemId: 'EI010', examItemName: '电子胃镜检查', modality: '内镜', deviceId: 'DEV007', deviceName: '内镜-01', departmentId: 'D003', departmentName: '内镜中心', doctorId: 'DOC005', doctorName: '王强', appointmentDate: today, appointmentTime: '09:00-10:00', status: '待确认', registrationType: '门诊', clinicalDiagnosis: '上腹部不适2月', clinicalInfo: '伴反酸嗳气', isUrgent: false, checkInTime: undefined, reportStatus: '未写', createdAt: '2026-05-02 08:00:00', updatedAt: '2026-05-02 08:00:00' },
  { id: 'APT007', patientId: 'P007', patientName: '孙磊', gender: '男', age: 73, patientType: '住院', phone: '13312345607', idCard: '310107195301077890', examItemId: 'EI005', examItemName: '头颅MRI平扫', modality: 'MRI', deviceId: 'DEV003', deviceName: 'MRI-01', departmentId: 'D001', departmentName: '放射科', doctorId: 'DOC002', doctorName: '李娜', appointmentDate: today, appointmentTime: '10:00-11:00', status: '已确认', registrationType: '住院', clinicalDiagnosis: '脑梗死后遗症', clinicalInfo: '左侧肢体偏瘫', isUrgent: false, checkInTime: undefined, reportStatus: '未写', createdAt: '2026-04-30 10:00:00', updatedAt: '2026-05-01 09:00:00' },
  { id: 'APT008', patientId: 'P008', patientName: '周婷', gender: '女', age: 39, patientType: '门诊', phone: '13212345608', idCard: '310108198701088901', examItemId: 'EI009', examItemName: '甲状腺超声', modality: '超声', deviceId: 'DEV006', deviceName: '超声-02', departmentId: 'D002', departmentName: '超声医学科', doctorId: 'DOC003', doctorName: '王芳', appointmentDate: today, appointmentTime: '14:00-15:00', status: '待确认', registrationType: '门诊', clinicalDiagnosis: '甲状腺结节复查', clinicalInfo: '甲状腺功能正常', isUrgent: false, checkInTime: undefined, reportStatus: '未写', createdAt: '2026-05-02 09:00:00', updatedAt: '2026-05-02 09:00:00' },
  { id: 'APT009', patientId: 'P009', patientName: '吴浩', gender: '男', age: 44, patientType: '体检', phone: '13112345609', idCard: '310109198201099012', examItemId: 'EI014', examItemName: '胸部X线正侧位片', modality: 'X光', deviceId: 'DEV009', deviceName: 'DR-01', departmentId: 'D001', departmentName: '放射科', doctorId: 'DOC001', doctorName: '张伟', appointmentDate: today, appointmentTime: '10:00-11:00', status: '已确认', registrationType: '体检', clinicalDiagnosis: '健康体检', clinicalInfo: '无特殊', isUrgent: false, checkInTime: undefined, reportStatus: '未写', createdAt: '2026-05-01 15:00:00', updatedAt: '2026-05-01 15:00:00' },
  { id: 'APT010', patientId: 'P010', patientName: '郑静', gender: '女', age: 62, patientType: '门诊', phone: '13012345610', idCard: '310110196401101123', examItemId: 'EI003', examItemName: '腹部CT平扫', modality: 'CT', deviceId: 'DEV002', deviceName: 'CT-02', departmentId: 'D001', departmentName: '放射科', doctorId: 'DOC001', doctorName: '张伟', appointmentDate: today, appointmentTime: '14:00-15:00', status: '已确认', registrationType: '门诊', clinicalDiagnosis: '腹痛待查', clinicalInfo: '右下腹压痛', isUrgent: true, checkInTime: undefined, reportStatus: '未写', createdAt: '2026-05-02 07:30:00', updatedAt: '2026-05-02 07:30:00' },
  { id: 'APT011', patientId: 'P001', patientName: '李建国', gender: '男', age: 58, patientType: '门诊', phone: '13812345601', idCard: '310101196801011234', examItemId: 'EI008', examItemName: '心脏彩超', modality: '超声', deviceId: 'DEV005', deviceName: '超声-01', departmentId: 'D002', departmentName: '超声医学科', doctorId: 'DOC003', doctorName: '王芳', appointmentDate: today, appointmentTime: '09:00-10:00', status: '已取消', registrationType: '门诊', clinicalDiagnosis: '心脏常规检查', clinicalInfo: '高血压病史', isUrgent: false, checkInTime: undefined, reportStatus: '未写', createdAt: '2026-05-01 09:30:00', updatedAt: '2026-05-02 08:00:00' },
  { id: 'APT012', patientId: 'P003', patientName: '张伟', gender: '男', age: 32, patientType: '住院', phone: '13712345603', idCard: '310103199401033456', examItemId: 'EI013', examItemName: '24小时动态心电图', modality: '心电', deviceId: 'DEV008', deviceName: '心电图-01', departmentId: 'D004', departmentName: '心电图室', doctorId: 'DOC004', doctorName: '赵敏', appointmentDate: today, appointmentTime: '11:00-12:00', status: '已完成', registrationType: '住院', clinicalDiagnosis: '心律失常', clinicalInfo: '阵发性房颤', isUrgent: false, checkInTime: '10:50', reportStatus: '已审核', createdAt: '2026-04-30 11:00:00', updatedAt: '2026-05-02 11:00:00' },
];

// ==================== 签到数据 ====================
export const CHECKIN_RECORDS: CheckInRecord[] = [
  { id: 'CI001', appointmentId: 'APT001', patientName: '李建国', examItemName: '头颅CT平扫', deviceName: 'CT-01', checkInTime: '07:55', queueNumber: 1, estimatedTime: '08:00', status: '检查中' },
  { id: 'CI002', appointmentId: 'APT005', patientName: '陈强', examItemName: '常规十二导联心电图', deviceName: '心电图-01', checkInTime: '08:25', queueNumber: 1, estimatedTime: '08:30', status: '已完成' },
  { id: 'CI003', appointmentId: 'APT002', patientName: '王秀英', examItemName: '胸部CT平扫', deviceName: 'CT-01', checkInTime: '08:50', queueNumber: 2, estimatedTime: '09:00', status: '候检' },
];

// ==================== 通知模板数据 ====================
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // 短信模板 (6个)
  { id: 'T001', name: '预约成功短信', type: '短信', title: '医技预约成功', content: '尊敬的患者您好，您的${patientName}的${examItemName}检查已预约成功，请于${appointmentDate} ${appointmentTime}携带有效证件至${location}进行检查，如有疑问请致电${hospitalPhone}。', variables: ['patientName', 'examItemName', 'appointmentDate', 'appointmentTime', 'location', 'hospitalPhone'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'T002', name: '检查提醒短信', type: '短信', title: '检查前一天提醒', content: '您的${examItemName}检查将于明天${appointmentTime}进行，请提前30分钟至${location}签到，如需改期请致电${hospitalPhone}。', variables: ['examItemName', 'appointmentTime', 'location', 'hospitalPhone'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'T003', name: '报告完成短信', type: '短信', title: '报告已完成', content: '您的${examItemName}检查报告已完成，请于工作日8:00-17:00至${reportLocation}自助机打印，或通过微信在线查看。', variables: ['examItemName', 'reportLocation'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'T004', name: '改签通知短信', type: '短信', title: '预约改签提醒', content: '您的${examItemName}检查已改期，由原${oldDate}改至${appointmentDate} ${appointmentTime}，如有疑问请致电${hospitalPhone}。', variables: ['examItemName', 'oldDate', 'appointmentDate', 'appointmentTime', 'hospitalPhone'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'T005', name: '取消预约短信', type: '短信', title: '预约已取消', content: '您的${examItemName}检查（${appointmentDate} ${appointmentTime}）已取消，如需重新预约请通过微信或拨打${hospitalPhone}。', variables: ['examItemName', 'appointmentDate', 'appointmentTime', 'hospitalPhone'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'T006', name: '迟到提醒短信', type: '短信', title: '签到迟到提醒', content: '您的${examItemName}检查已过预约时间${appointmentTime}，请尽快至${location}签到，当前排队号${queueNumber}，如需帮助请致电${hospitalPhone}。', variables: ['examItemName', 'appointmentTime', 'location', 'queueNumber', 'hospitalPhone'], status: '停用', createdAt: '2026-04-10 10:00:00', updatedAt: '2026-04-15 14:30:00' },

  // 微信模板 (6个)
  { id: 'W001', name: '预约成功微信', type: '微信', title: '预约成功通知', content: '【医技预约】\n尊敬的患者，您的检查预约已成功！\n\n患者姓名：${patientName}\n检查项目：${examItemName}\n预约时间：${appointmentDate} ${appointmentTime}\n检查地点：${location}\n\n请提前30分钟携带有效证件至指定地点签到检查。', variables: ['patientName', 'examItemName', 'appointmentDate', 'appointmentTime', 'location'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'W002', name: '检查提醒微信', type: '微信', title: '明日检查提醒', content: '【检查提醒】\n您的${examItemName}检查将于明天进行！\n\n预约时间：${appointmentTime}\n检查地点：${location}\n排队号：${queueNumber}\n\n请提前30分钟签到，如有特殊情况无法按时检查，请提前联系。', variables: ['examItemName', 'appointmentTime', 'location', 'queueNumber'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'W003', name: '报告完成微信', type: '微信', title: '报告完成通知', content: '【报告完成】\n您的${examItemName}检查报告已完成！\n\n报告时间：${reportTime}\n报告医生：${doctorName}\n\n您可以：\n1. 前往${reportLocation}自助打印\n2. 点击详情在线查看电子报告', variables: ['examItemName', 'reportTime', 'doctorName', 'reportLocation'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'W004', name: '改签通知微信', type: '微信', title: '预约变更通知', content: '【预约变更】\n您的检查预约已有变更！\n\n检查项目：${examItemName}\n原预约时间：${oldDate} ${oldTime}\n改期时间：${appointmentDate} ${appointmentTime}\n\n如有疑问请致电${hospitalPhone}', variables: ['examItemName', 'oldDate', 'oldTime', 'appointmentDate', 'appointmentTime', 'hospitalPhone'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'W005', name: '取消通知微信', type: '微信', title: '预约取消通知', content: '【预约取消】\n您的${examItemName}检查已取消！\n\n原预约时间：${appointmentDate} ${appointmentTime}\n取消原因：${cancelReason}\n\n如需重新预约，请通过公众号菜单或致电${hospitalPhone}。', variables: ['examItemName', 'appointmentDate', 'appointmentTime', 'cancelReason', 'hospitalPhone'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'W006', name: '签到排队微信', type: '微信', title: '签到排队通知', content: '【签到成功】\n您已成功签到！\n\n检查项目：${examItemName}\n当前排队号：${queueNumber}\n预计等候时间：${waitTime}分钟\n\n请在候检区等待叫号，过号需重新排队。', variables: ['examItemName', 'queueNumber', 'waitTime'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },

  // APP推送模板 (5个)
  { id: 'A001', name: '预约成功推送', type: 'APP推送', title: '预约成功', content: '您的${examItemName}检查已预约成功，请于${appointmentDate} ${appointmentTime}至${location}进行检查。', variables: ['examItemName', 'appointmentDate', 'appointmentTime', 'location'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'A002', name: '检查提醒推送', type: 'APP推送', title: '检查提醒：明天${examItemName}', content: '您的${examItemName}检查将于明天${appointmentTime}进行，请提前30分钟签到，地点：${location}。', variables: ['examItemName', 'appointmentTime', 'location'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'A003', name: '报告完成推送', type: 'APP推送', title: '报告已完成，点击查看', content: '您的${examItemName}检查报告已完成，可点击查看详细报告内容。', variables: ['examItemName'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'A004', name: '叫号通知推送', type: 'APP推送', title: '轮到您检查了！', content: '患者${patientName}，您的${examItemName}检查现在开始，请携带申请单至${location}进行检查。', variables: ['patientName', 'examItemName', 'location'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
  { id: 'A005', name: '危急值推送', type: 'APP推送', title: '⚠️ 危急值通知', content: '患者${patientName}的${examItemName}检查发现危急值，请医生立即查看：${criticalValue}。', variables: ['patientName', 'examItemName', 'criticalValue'], status: '启用', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-15 14:30:00' },
];

// ==================== 发送记录数据 ====================
export const SEND_RECORDS: SendRecord[] = [
  { id: 'SR001', templateId: 'T001', templateName: '预约成功短信', templateType: '短信', recipientName: '李建国', recipientPhone: '138****5601', content: '尊敬的患者您好，您的李建国的头颅CT平扫检查已预约成功，请于2026-05-02 08:00-09:00携带有效证件至医技楼1层CT-1室进行检查。', status: '已送达', sentAt: '2026-05-01 09:05:00', deliveredAt: '2026-05-01 09:05:12', createdAt: '2026-05-01 09:00:00' },
  { id: 'SR002', templateId: 'W001', templateName: '预约成功微信', templateType: '微信', recipientName: '王秀英', recipientPhone: '139****5602', content: '【医技预约】\n尊敬的患者，您的检查预约已成功！\n\n患者姓名：王秀英\n检查项目：胸部CT平扫\n预约时间：2026-05-02 09:00-10:00\n检查地点：医技楼1层CT-1室\n\n请提前30分钟携带有效证件至指定地点签到检查。', status: '已阅读', sentAt: '2026-05-01 10:35:00', deliveredAt: '2026-05-01 10:35:08', readAt: '2026-05-01 11:20:00', createdAt: '2026-05-01 10:30:00' },
  { id: 'SR003', templateId: 'A001', templateName: '预约成功推送', templateType: 'APP推送', recipientName: '张伟', content: '您的冠脉CTA检查已预约成功，请于2026-05-02 10:00-11:00至医技楼1层CT-1室进行检查。', status: '已发送', sentAt: '2026-05-01 14:05:00', createdAt: '2026-05-01 14:00:00' },
  { id: 'SR004', templateId: 'T002', templateName: '检查提醒短信', templateType: '短信', recipientName: '刘芳', recipientPhone: '136****5604', content: '您的腹部肝胆脾胰超声检查将于明天09:00进行，请提前30分钟至医技楼2层超声-1室签到。', status: '已送达', sentAt: '2026-05-01 20:00:00', deliveredAt: '2026-05-01 20:00:05', createdAt: '2026-05-01 20:00:00' },
  { id: 'SR005', templateId: 'W002', templateName: '检查提醒微信', templateType: '微信', recipientName: '陈强', recipientPhone: '135****5605', content: '【检查提醒】\n您的常规十二导联心电图检查将于明天进行！\n\n预约时间：08:30-09:00\n检查地点：门诊楼2层心电图室\n排队号：001\n\n请提前30分钟签到。', status: '待发送', createdAt: '2026-05-01 20:00:00' },
  { id: 'SR006', templateId: 'T003', templateName: '报告完成短信', templateType: '短信', recipientName: '刘芳', recipientPhone: '136****5604', content: '您的腹部肝胆脾胰超声检查报告已完成，请于工作日8:00-17:00至医技楼2层自助机打印。', status: '已送达', sentAt: '2026-05-02 09:35:00', deliveredAt: '2026-05-02 09:35:03', readAt: '2026-05-02 10:15:00', createdAt: '2026-05-02 09:30:00' },
  { id: 'SR007', templateId: 'W003', templateName: '报告完成微信', templateType: '微信', recipientName: '孙磊', recipientPhone: '133****5607', content: '【报告完成】\n您的头颅MRI平扫检查报告已完成！\n\n报告时间：2026-05-02 11:30\n报告医生：李娜\n\n您可以前往放射科自助打印或点击详情查看电子报告。', status: '发送失败', sentAt: '2026-05-02 11:35:00', errorMessage: '用户已取消关注公众号', createdAt: '2026-05-02 11:30:00' },
  { id: 'SR008', templateId: 'A004', templateName: '叫号通知推送', templateType: 'APP推送', recipientName: '李建国', content: '患者李建国，您的头颅CT平扫检查现在开始，请携带申请单至医技楼1层CT-1室进行检查。', status: '已送达', sentAt: '2026-05-02 07:58:00', deliveredAt: '2026-05-02 07:58:02', createdAt: '2026-05-02 07:55:00' },
  { id: 'SR009', templateId: 'A005', templateName: '危急值推送', templateType: 'APP推送', recipientName: '张伟(医生)', content: '患者张伟的CT检查发现危急值，请医生立即查看：肺部大面积阴影。', status: '已送达', sentAt: '2026-05-02 14:20:00', deliveredAt: '2026-05-02 14:20:01', createdAt: '2026-05-02 14:20:00' },
  { id: 'SR010', templateId: 'T004', templateName: '改签通知短信', templateType: '短信', recipientName: '赵敏', recipientPhone: '134****5606', content: '您的电子胃镜检查已由2026-05-03 09:00改至2026-05-02 14:00，如有疑问请致电汉东省人民医院。', status: '已送达', sentAt: '2026-05-02 08:35:00', deliveredAt: '2026-05-02 08:35:06', createdAt: '2026-05-02 08:30:00' },
  { id: 'SR011', templateId: 'W004', templateName: '改签通知微信', templateType: '微信', recipientName: '郑静', recipientPhone: '130****5610', content: '【预约变更】\n您的腹部CT平扫检查已有变更！\n\n原预约时间：2026-05-03 10:00\n改期时间：2026-05-02 14:00\n\n如有疑问请致电。', status: '发送中', sentAt: '2026-05-02 08:40:00', createdAt: '2026-05-02 08:35:00' },
  { id: 'SR012', templateId: 'T005', templateName: '取消预约短信', templateType: '短信', recipientName: '李建国', recipientPhone: '138****5601', content: '您的心脏彩超检查（2026-05-02 09:00）已取消，如需重新预约请通过微信或拨打医院电话。', status: '已送达', sentAt: '2026-05-02 08:05:00', deliveredAt: '2026-05-02 08:05:03', createdAt: '2026-05-02 08:00:00' },
];

// ==================== 通知数据 ====================
export const NOTIFICATIONS: Notification[] = [
  { id: 'N001', type: '预约成功', title: '预约成功', content: '您的头颅CT平扫检查已预约成功，请于2026-05-02 08:00-09:00至医技楼1层CT-1室进行检查。', patientName: '李建国', appointmentDate: '2026-05-02', isRead: true, createdAt: '2026-05-01 09:00:00' },
  { id: 'N002', type: '检查提醒', title: '检查提醒', content: '您今天有1项检查待完成：冠脉CTA，请提前30分钟签到。', patientName: '张伟', appointmentDate: '2026-05-02', isRead: false, createdAt: '2026-05-02 07:00:00' },
  { id: 'N003', type: '报告完成', title: '报告完成', content: '您的腹部肝胆脾胰超声检查报告已完成，请到自助机打印。', patientName: '刘芳', appointmentDate: '2026-05-02', isRead: true, createdAt: '2026-05-02 09:30:00' },
  { id: 'N004', type: '改签通知', title: '预约改签', content: '您的电子胃镜检查已由2026-05-03 09:00改至2026-05-02 14:00。', patientName: '赵敏', appointmentDate: '2026-05-02', isRead: false, createdAt: '2026-05-02 08:30:00' },
  { id: 'N005', type: '取消通知', title: '预约取消', content: '您的心脏彩超检查（2026-05-02 09:00）已取消。', patientName: '李建国', appointmentDate: '2026-05-02', isRead: false, createdAt: '2026-05-02 08:00:00' },
];

// ==================== 统计数据 ====================
export const STATISTICS: Statistics = {
  totalAppointments: 158,
  todayAppointments: 45,
  checkedIn: 12,
  completed: 8,
  cancelled: 3,
  noShowRate: 4.2,
  avgWaitTime: 18,
  deviceUtilization: [
    { name: 'CT-01', value: 85 },
    { name: 'CT-02', value: 92 },
    { name: 'MRI-01', value: 78 },
    { name: '超声-01', value: 68 },
    { name: '超声-02', value: 45 },
    { name: '内镜-01', value: 62 },
    { name: '心电图-01', value: 58 },
    { name: 'DR-01', value: 52 },
  ],
  appointmentTrend: [
    { date: '04-26', count: 142 },
    { date: '04-27', count: 138 },
    { date: '04-28', count: 155 },
    { date: '04-29', count: 148 },
    { date: '04-30', count: 162 },
    { date: '05-01', count: 98 },
    { date: '05-02', count: 158 },
  ],
  modalityDistribution: [
    { name: 'CT', value: 38 },
    { name: 'MRI', value: 15 },
    { name: '超声', value: 28 },
    { name: '内镜', value: 8 },
    { name: '心电', value: 18 },
    { name: 'X光', value: 10 },
  ],
  peakHours: [
    { hour: '08:00', count: 35 },
    { hour: '09:00', count: 48 },
    { hour: '10:00', count: 52 },
    { hour: '11:00', count: 42 },
    { hour: '14:00', count: 38 },
    { hour: '15:00', count: 45 },
    { hour: '16:00', count: 32 },
  ],
};

// ==================== 菜单配置 ====================
export const MENU_ITEMS = [
  { path: '/', label: '首页', icon: 'LayoutDashboard', roles: ['管理员', '医生', '技师', '护士', '前台'] },
  { path: '/appointments', label: '预约管理', icon: 'CalendarCheck', roles: ['管理员', '前台'] },
  { path: '/patients', label: '患者管理', icon: 'Users', roles: ['管理员', '医生', '护士', '前台'] },
  { path: '/exam-items', label: '检查项目管理', icon: 'Stethoscope', roles: ['管理员'] },
  { path: '/devices', label: '设备管理', icon: 'Monitor', roles: ['管理员', '技师'] },
  { path: '/slot-source', label: '号源管理', icon: 'Grid3X3', roles: ['管理员', '前台'] },
  { path: '/slot-pool', label: '实时号源池', icon: 'Grid3X3', roles: ['管理员'] },
  { path: '/schedule', label: '排班管理', icon: 'Clock', roles: ['管理员', '技师'] },
  { path: '/departments', label: '科室管理', icon: 'Building2', roles: ['管理员'] },
  { path: '/checkin', label: '签到管理', icon: 'ClipboardCheck', roles: ['管理员', '护士', '前台'] },
  { path: '/queue-call', label: '等待叫号', icon: 'Volume2', roles: ['管理员', '技师', '护士'] },
  { path: '/reports', label: '报告管理', icon: 'FileText', roles: ['管理员', '医生'] },
  { path: '/statistics', label: '统计分析', icon: 'BarChart3', roles: ['管理员'] },
  { path: '/quality-control', label: '质控统计', icon: 'ShieldCheck', roles: ['管理员'] },
  { path: '/notifications', label: '通知管理', icon: 'Bell', roles: ['管理员', '医生', '护士', '前台'] },
  { path: '/notification-templates', label: '模板管理', icon: 'FileText', roles: ['管理员'] },
  { path: '/critical-value', label: '危急值', icon: 'AlertTriangle', roles: ['管理员', '医生'] },
  { path: '/materials', label: '物资管理', icon: 'Package', roles: ['管理员'] },
  { path: '/print', label: '打印管理', icon: 'Printer', roles: ['管理员', '前台'] },
  { path: '/rules-config', label: '规则配置', icon: 'ShieldCheck', roles: ['管理员'] },
  { path: '/operation-log', label: '操作日志', icon: 'ScrollText', roles: ['管理员'] },
  { path: '/settings', label: '系统设置', icon: 'Settings', roles: ['管理员'] },
];

export const SYSTEM_ROLES = ['管理员', '医生', '技师', '护士', '前台'];
