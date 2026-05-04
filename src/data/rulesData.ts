// G006 全院医技检查预约系统 - 预约规则引擎数据
// 包含：互斥规则、限制规则、优先级规则、时间约束规则

import type { Appointment } from '../types';

// ==================== 规则类型定义 ====================
export type RuleType = 'mutex' | 'restriction' | 'priority' | 'timeConstraint';
export type RuleCategory = 'patient' | 'device' | 'exam' | 'time' | 'department';
export type RuleSeverity = 'error' | 'warning' | 'info';
export type ConditionType = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'contains' | 'and' | 'or';

/**
 * 子条件
 */
export interface SubCondition {
  condition: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'contains' | 'regex';
  field: string;
  value: any;
}

/**
 * 规则配置
 */
export interface Rule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  category: RuleCategory;
  severity: RuleSeverity;
  enabled: boolean;
  priority: number;
  tags: string[];
  config: RuleConfig;
  message: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 规则配置
 */
export interface RuleConfig {
  mutexConfig?: {
    targetRuleId: string;
    checkSameDay: boolean;
    checkSamePatient: boolean;
    checkSameDevice: boolean;
    message?: string;
  };
  
  restrictionConfig?: {
    condition: ConditionType;
    field?: string;
    value?: any;
    message?: string;
    subConditions?: SubCondition[];
  };
  
  priorityConfig?: {
    baseScore: number;
    bonusRules: PriorityBonus[];
  };
  
  timeConstraintConfig?: {
    allowedTimeRanges: TimeRange[];
    forbiddenTimeRanges: TimeRange[];
    specificForbiddenDates?: string[];
    checkDateAhead: number;
    message?: string;
  };
}

/**
 * 优先级加分规则
 */
export interface PriorityBonus {
  condition: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'contains' | 'regex';
  field: string;
  value: any;
  bonusScore: number;
  description: string;
}

/**
 * 时间范围
 */
export interface TimeRange {
  startTime: string;
  endTime: string;
  daysOfWeek?: number[];
  specificDates?: string[];
}

// ==================== 规则执行结果 ====================
export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  type: RuleType;
  severity: RuleSeverity;
  message: string;
  details?: Record<string, any>;
  suggestedFix?: string;
}

export interface RuleEvaluationResult {
  passed: boolean;
  violations: RuleViolation[];
  warnings: RuleViolation[];
  priorityScore: number;
  suggestedSlots: string[];
}

// ==================== 互斥规则（12个） ====================
export const MUTEX_RULES: Rule[] = [
  {
    id: 'MUTEX001',
    name: '增强CT与增强MRI同日内互斥',
    description: '患者同一天内不能同时进行增强CT和增强MRI检查，因两类造影剂需要足够间隔时间',
    type: 'mutex',
    category: 'exam',
    severity: 'error',
    enabled: true,
    priority: 10,
    tags: ['造影剂', '互斥', '重要'],
    config: {
      mutexConfig: {
        targetRuleId: 'MUTEX002',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '患者同日不能同时进行增强CT和增强MRI检查，请调整检查时间（建议间隔24小时以上）',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX002',
    name: '增强MRI与增强CT同日内互斥',
    description: '患者同一天内不能同时进行增强MRI和增强CT检查',
    type: 'mutex',
    category: 'exam',
    severity: 'error',
    enabled: true,
    priority: 10,
    tags: ['造影剂', '互斥', '重要'],
    config: {
      mutexConfig: {
        targetRuleId: 'MUTEX001',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '患者同日不能同时进行增强MRI和增强CT检查，请调整检查时间',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX003',
    name: 'PET-CT与CT平扫互斥',
    description: 'PET-CT检查包含诊断性CT，若同患者同日已做PET-CT，不建议再做普通CT平扫',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 20,
    tags: ['PET-CT', 'CT', '辐射'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '患者同日已安排PET-CT检查，是否仍需要进行普通CT平扫？'
      }
    },
    message: '患者同日已安排PET-CT（含诊断性CT），普通CT平扫可能造成不必要的辐射暴露',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX004',
    name: '胃镜与结肠镜同日前后互斥',
    description: '胃镜和结肠镜检查同时进行会增加患者不适，且肠道准备会相互影响',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['内镜', '肠道准备', '互斥'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '胃镜和结肠镜同时进行会影响肠道准备效果'
      }
    },
    message: '胃镜和结肠镜不宜安排在同一天，建议分两天进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX005',
    name: 'CT冠脉造影与心脏彩超同科室互斥',
    description: 'CT冠脉造影和心脏彩超均为心脏检查，同日同科室检查意义重复',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['心脏', 'CT', '超声'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: 'CT冠脉造影和心脏彩超均为心脏检查，同日检查可能重复'
      }
    },
    message: 'CT冠脉造影和心脏彩超不宜安排在同一天，请确认是否需要同时进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX006',
    name: '上消化道造影与胃镜互斥',
    description: '上消化道造影（GI）和胃镜检查功能相似，同日检查意义重复',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['消化道', '造影', '胃镜'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '上消化道造影和胃镜检查功能相似，不建议同日进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX007',
    name: '钡餐检查与腹部CT互斥',
    description: '钡餐检查残留的钡剂会影响腹部CT图像质量',
    type: 'mutex',
    category: 'exam',
    severity: 'error',
    enabled: true,
    priority: 15,
    tags: ['钡剂', 'CT', '图像质量'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '钡餐检查残留的钡剂会影响腹部CT图像质量，请安排在其他日期（建议3天后）',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX008',
    name: '磁控胶囊胃镜与普通胃镜互斥',
    description: '磁控胶囊胃镜和普通胃镜功能重叠，同日检查浪费资源',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 35,
    tags: ['胶囊胃镜', '内镜', '互斥'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '磁控胶囊胃镜和普通胃镜功能重叠，不建议同日进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX009',
    name: '同一患者同一设备同一时段互斥',
    description: '防止同一患者在同一设备上重复预约同一时段',
    type: 'mutex',
    category: 'device',
    severity: 'error',
    enabled: true,
    priority: 5,
    tags: ['重复预约', '设备', '时段'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: true,
      }
    },
    message: '该患者在此设备此时段已有预约记录，请勿重复预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX010',
    name: '空腹检查与餐后检查同日上午互斥',
    description: '需要空腹的检查（如腹部超声、腹部CT）和餐后检查不应安排在同日上午',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 28,
    tags: ['空腹', '饮食', '检查顺序'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '空腹检查应安排在上午，餐后检查安排在下午'
      }
    },
    message: '空腹检查与餐后检查不宜安排在同日上午，请分开预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX011',
    name: '增强CT同部位短期重复限制',
    description: '增强CT检查后，短期内（30天内）不建议重复同一部位CT检查',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 22,
    tags: ['增强CT', '辐射', '重复检查'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '短期内重复CT增强检查将增加辐射暴露'
      }
    },
    message: '患者30天内已有同部位增强CT检查记录，短期内重复检查需慎重',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX012',
    name: 'MRI植入物检查互斥',
    description: '带有心脏起搏器、支架等植入物的患者，不能进行MRI检查',
    type: 'mutex',
    category: 'patient',
    severity: 'error',
    enabled: true,
    priority: 3,
    tags: ['MRI', '植入物', '安全'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '患者体内有MRI禁忌植入物（如心脏起搏器），不能进行MRI检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
];

// ==================== 限制规则（6个） ====================
export const RESTRICTION_RULES: Rule[] = [
  {
    id: 'REST001',
    name: '患者年龄限制-增强CT',
    description: '8岁以下儿童及80岁以上老人进行增强CT需额外评估',
    type: 'restriction',
    category: 'patient',
    severity: 'warning',
    enabled: true,
    priority: 40,
    tags: ['年龄', '增强CT', '儿科'],
    config: {
      restrictionConfig: {
        condition: 'or',
        subConditions: [
          { condition: 'lt', field: 'patientAge', value: 8 },
          { condition: 'gt', field: 'patientAge', value: 80 },
        ],
        message: '年龄小于8岁或大于80岁的患者进行增强CT需慎重评估'
      }
    },
    message: '患者年龄为{age}岁，进行增强CT需额外评估风险',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST002',
    name: '孕妇禁忌检查项目',
    description: '孕妇禁止进行有辐射的检查项目（CT、X光、透视等）',
    type: 'restriction',
    category: 'patient',
    severity: 'error',
    enabled: true,
    priority: 1,
    tags: ['孕妇', '辐射', '禁忌'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'patientGender', value: '女' },
          { condition: 'eq', field: 'patientPregnant', value: true },
          { condition: 'in', field: 'modality', value: ['CT', 'X光', '透视', '乳腺钼靶'] },
        ],
        message: '孕妇禁止进行有辐射的检查'
      }
    },
    message: '孕妇禁止进行有辐射的检查（CT、X光、透视等），请重新选择检查项目',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST003',
    name: '设备容量限制-CT',
    description: '每台CT每日最大预约量不超过50人次',
    type: 'restriction',
    category: 'device',
    severity: 'error',
    enabled: true,
    priority: 45,
    tags: ['容量', 'CT', '设备'],
    config: {
      restrictionConfig: {
        condition: 'gte',
        field: 'deviceUsedSlots',
        value: 50,
        message: '该设备当日预约已满'
      }
    },
    message: '该CT设备当日预约量已达上限（50人次），请选择其他设备或日期',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST004',
    name: '住院患者预约提前量限制',
    description: '住院患者检查预约需提前至少4小时，以便接送安排',
    type: 'restriction',
    category: 'patient',
    severity: 'warning',
    enabled: true,
    priority: 50,
    tags: ['住院', '提前预约', '时间'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'patientType', value: '住院' },
          { condition: 'lt', field: 'hoursUntilAppointment', value: 4 },
        ],
        message: '住院患者检查需提前至少4小时预约'
      }
    },
    message: '住院患者检查需提前至少4小时预约，请调整预约时间',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST005',
    name: '急诊患者绿色通道限制',
    description: '急诊患者享受绿色通道，但同一患者同时最多3个检查项目',
    type: 'restriction',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 60,
    tags: ['急诊', '绿色通道', '数量限制'],
    config: {
      restrictionConfig: {
        condition: 'gt',
        field: 'patientEmergencyExamCount',
        value: 3,
        message: '急诊患者同时检查项目不宜超过3个'
      }
    },
    message: '急诊患者同时预约检查项目已达3个上限，建议分期分批检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST006',
    name: '心率限制-冠脉CTA',
    description: '进行冠脉CTA检查前，患者心率需控制在70次/分以下',
    type: 'restriction',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 35,
    tags: ['心率', '冠脉CTA', '检查前准备'],
    config: {
      restrictionConfig: {
        condition: 'gt',
        field: 'patientHeartRate',
        value: 70,
        message: '冠脉CTA检查前需控制心率'
      }
    },
    message: '患者当前心率为{heartRate}次/分，进行冠脉CTA需先控制心率在70次/分以下',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
];

// ==================== 优先级规则（6个） ====================
export const PRIORITY_RULES: Rule[] = [
  {
    id: 'PRIO001',
    name: '急诊患者优先级',
    description: '急诊患者自动获得最高优先级',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['急诊', '优先级', '绿色通道'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'patientType', value: '急诊', bonusScore: 100, description: '急诊患者加100分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO002',
    name: '住院患者优先级',
    description: '住院患者获得较高优先级',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 90,
    tags: ['住院', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'patientType', value: '住院', bonusScore: 50, description: '住院患者加50分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO003',
    name: '加急检查优先级',
    description: '标记为加急的检查自动提升优先级',
    type: 'priority',
    category: 'exam',
    severity: 'info',
    enabled: true,
    priority: 95,
    tags: ['加急', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'isUrgent', value: true, bonusScore: 80, description: '加急检查加80分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO004',
    name: '等候时间过长自动提升',
    description: '预约等候时间超过3天自动提升优先级',
    type: 'priority',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 85,
    tags: ['等候时间', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'gt', field: 'waitingDays', value: 3, bonusScore: 30, description: '等候超3天加30分' },
          { condition: 'gt', field: 'waitingDays', value: 7, bonusScore: 60, description: '等候超7天加60分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO005',
    name: '恶性肿瘤患者优先级',
    description: '诊断为恶性肿瘤的患者检查自动提升优先级',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 88,
    tags: ['肿瘤', '优先级', '特殊患者'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '癌', bonusScore: 70, description: '恶性肿瘤加70分' },
          { condition: 'contains', field: 'clinicalDiagnosis', value: '肿瘤', bonusScore: 70, description: '肿瘤患者加70分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO006',
    name: '体检患者优先级最低',
    description: '体检患者优先级最低，优先保证诊疗需求',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 80,
    tags: ['体检', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'patientType', value: '体检', bonusScore: -20, description: '体检患者减20分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
];

// ==================== 时间约束规则（6个） ====================
export const TIME_CONSTRAINT_RULES: Rule[] = [
  {
    id: 'TIME001',
    name: '内镜检查仅限工作时间',
    description: '胃镜、肠镜等内镜检查仅能在工作时间（周一至周六 8:00-17:00）进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'error',
    enabled: true,
    priority: 30,
    tags: ['内镜', '工作时间', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
          { startTime: '14:00', endTime: '17:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
        ],
        forbiddenTimeRanges: [],
        checkDateAhead: 0,
      }
    },
    message: '内镜检查仅能在周一至周六的工作时间（8:00-12:00, 14:00-17:00）进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME002',
    name: '增强CT仅下午进行',
    description: '增强CT检查因需要打造影剂，仅能在下午时段进行（避开上午空腹检查高峰）',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 35,
    tags: ['增强CT', '造影剂', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '14:00', endTime: '17:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '增强CT建议安排在下午时段（14:00-17:00），可避开上午空腹检查高峰',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME003',
    name: '动态心电图仅上午检查',
    description: '24小时动态心电图检查需要在上午完成佩戴',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['动态心电图', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '10:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '24小时动态心电图检查需在上午8:00-10:00完成佩戴',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME004',
    name: '超声空腹检查仅上午',
    description: '腹部超声等需要空腹的检查仅能在上午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 40,
    tags: ['空腹', '超声', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '11:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '腹部超声等空腹检查仅能在上午（8:00-11:00）进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME005',
    name: 'MRI心脏检查时间约束',
    description: '心脏MRI检查因配合度高，仅能在下午特定时段进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 45,
    tags: ['心脏MRI', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '14:00', endTime: '16:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [],
        checkDateAhead: 0,
      }
    },
    message: '心脏MRI检查仅能在下午14:00-16:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME006',
    name: '节假日不安排内镜检查',
    description: '内镜中心节假日不提供服务',
    type: 'timeConstraint',
    category: 'time',
    severity: 'error',
    enabled: true,
    priority: 10,
    tags: ['节假日', '内镜', '休息日'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [],
        forbiddenTimeRanges: [],
        specificForbiddenDates: ['2026-01-01', '2026-02-10', '2026-02-11', '2026-02-12', '2026-04-04', '2026-05-01', '2026-06-01', '2026-10-01', '2026-10-02', '2026-10-03'],
        checkDateAhead: 30,
      }
    },
    message: '内镜中心节假日不提供服务，请选择工作日',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
];

// ==================== 规则组合导出 ====================
export const ALL_RULES: Rule[] = [
  ...MUTEX_RULES,
  ...RESTRICTION_RULES,
  ...PRIORITY_RULES,
  ...TIME_CONSTRAINT_RULES,
];

// ==================== 规则引擎核心函数 ====================

/**
 * 规则引擎上下文
 */
export interface RuleEngineContext {
  appointment: Partial<Appointment>;
  existingAppointments: Appointment[];
  patientAge?: number;
  patientGender?: string;
  patientPregnant?: boolean;
  patientType?: string;
  patientHeartRate?: number;
  waitingDays?: number;
  isUrgent?: boolean;
  clinicalDiagnosis?: string;
  deviceUsedSlots?: number;
  hoursUntilAppointment?: number;
  patientEmergencyExamCount?: number;
  modality?: string;
}

/**
 * 评估所有规则
 */
export function evaluateRules(context: RuleEngineContext): RuleEvaluationResult {
  const violations: RuleViolation[] = [];
  const warnings: RuleViolation[] = [];
  let priorityScore = 0;
  let passed = true;

  for (const rule of MUTEX_RULES) {
    if (!rule.enabled) continue;
    const result = evaluateMutexRule(rule, context);
    if (!result.passed) {
      if (result.severity === 'error') {
        violations.push(toViolation(result, rule));
        passed = false;
      } else {
        warnings.push(toViolation(result, rule));
      }
    }
  }

  for (const rule of RESTRICTION_RULES) {
    if (!rule.enabled) continue;
    const result = evaluateRestrictionRule(rule, context);
    if (!result.passed) {
      if (result.severity === 'error') {
        violations.push(toViolation(result, rule));
        passed = false;
      } else {
        warnings.push(toViolation(result, rule));
      }
    }
  }

  for (const rule of TIME_CONSTRAINT_RULES) {
    if (!rule.enabled) continue;
    const result = evaluateTimeConstraintRule(rule, context);
    if (!result.passed) {
      if (result.severity === 'error') {
        violations.push(toViolation(result, rule));
        passed = false;
      } else {
        warnings.push(toViolation(result, rule));
      }
    }
  }

  for (const rule of PRIORITY_RULES) {
    if (!rule.enabled) continue;
    priorityScore += calculatePriorityScore(rule, context);
  }

  const suggestedSlots = generateSuggestedSlots(context);

  return {
    passed,
    violations,
    warnings,
    priorityScore,
    suggestedSlots,
  };
}

function toViolation(result: { passed: boolean; severity: RuleSeverity; message: string; ruleId: string; ruleName: string }, rule: Rule): RuleViolation {
  return {
    ruleId: result.ruleId,
    ruleName: result.ruleName,
    type: rule.type,
    severity: result.severity,
    message: result.message,
  };
}

function evaluateMutexRule(rule: Rule, context: RuleEngineContext): { passed: boolean; severity: RuleSeverity; message: string; ruleId: string; ruleName: string } {
  const { appointment, existingAppointments } = context;
  
  if (rule.config.mutexConfig?.checkSameDay && rule.config.mutexConfig?.checkSamePatient) {
    const sameDayExams = existingAppointments.filter(existing => 
      existing.patientId === appointment.patientId &&
      existing.appointmentDate === appointment.appointmentDate &&
      existing.status !== '已取消' &&
      existing.id !== appointment.id
    );

    if (sameDayExams.length > 0) {
      if (rule.id === 'MUTEX001' || rule.id === 'MUTEX002') {
        const hasContrastCT = sameDayExams.some(e => 
          e.modality === 'CT' && (e.examItemName.includes('增强') || e.examItemName.includes('CTA'))
        );
        const hasMRI = appointment.modality === 'MRI' || appointment.modality === '核磁';
        const targetIsMRI = sameDayExams.some(e => e.modality === 'MRI' || e.modality === '核磁');
        const currentIsCT = appointment.modality === 'CT';

        if ((hasContrastCT && hasMRI) || (targetIsMRI && currentIsCT)) {
          return { passed: false, severity: rule.severity, message: rule.message, ruleId: rule.id, ruleName: rule.name };
        }
      }

      if (rule.config.mutexConfig?.message) {
        return { passed: false, severity: rule.severity, message: rule.config.mutexConfig.message, ruleId: rule.id, ruleName: rule.name };
      }
    }
  }

  if (rule.config.mutexConfig?.checkSameDevice) {
    const conflict = existingAppointments.find(existing =>
      existing.patientId === appointment.patientId &&
      existing.deviceId === appointment.deviceId &&
      existing.appointmentTime === appointment.appointmentTime &&
      existing.appointmentDate === appointment.appointmentDate &&
      existing.status !== '已取消' &&
      existing.id !== appointment.id
    );

    if (conflict) {
      return { passed: false, severity: rule.severity, message: rule.message, ruleId: rule.id, ruleName: rule.name };
    }
  }

  return { passed: true, severity: rule.severity, message: '', ruleId: rule.id, ruleName: rule.name };
}

function evaluateRestrictionRule(rule: Rule, context: RuleEngineContext): { passed: boolean; severity: RuleSeverity; message: string; ruleId: string; ruleName: string } {
  const { config } = rule;
  
  if (config.restrictionConfig) {
    const { condition, subConditions, message } = config.restrictionConfig;
    
    if (subConditions && (condition === 'and' || condition === 'or')) {
      const results = subConditions.map(sub => evaluateCondition(sub.condition, sub.field, sub.value, context));
      const allMatch = condition === 'and' ? results.every(Boolean) : results.some(Boolean);
      if (allMatch) {
        return { passed: false, severity: rule.severity, message: message || rule.message, ruleId: rule.id, ruleName: rule.name };
      }
      return { passed: true, severity: rule.severity, message: '', ruleId: rule.id, ruleName: rule.name };
    }
    
    const { field, value } = config.restrictionConfig;
    if (field && evaluateCondition(condition as string, field, value, context)) {
      return { passed: false, severity: rule.severity, message: message || rule.message, ruleId: rule.id, ruleName: rule.name };
    }
  }
  
  return { passed: true, severity: rule.severity, message: '', ruleId: rule.id, ruleName: rule.name };
}

function evaluateCondition(condition: string, field: string, value: any, context: RuleEngineContext): boolean {
  const fieldValue = getFieldValue(context, field);
  
  switch (condition) {
    case 'eq': return fieldValue === value;
    case 'ne': return fieldValue !== value;
    case 'gt': return Number(fieldValue) > Number(value);
    case 'lt': return Number(fieldValue) < Number(value);
    case 'gte': return Number(fieldValue) >= Number(value);
    case 'lte': return Number(fieldValue) <= Number(value);
    case 'in': return Array.isArray(value) && value.includes(fieldValue);
    case 'notIn': return Array.isArray(value) && !value.includes(fieldValue);
    case 'contains': return typeof fieldValue === 'string' && fieldValue.includes(value);
    default: return false;
  }
}

function getFieldValue(context: RuleEngineContext, field: string): any {
  const fieldMap: Record<string, any> = {
    patientAge: context.patientAge,
    patientGender: context.patientGender,
    patientPregnant: context.patientPregnant,
    patientType: context.patientType,
    patientHeartRate: context.patientHeartRate,
    waitingDays: context.waitingDays,
    isUrgent: context.isUrgent,
    clinicalDiagnosis: context.clinicalDiagnosis,
    deviceUsedSlots: context.deviceUsedSlots,
    hoursUntilAppointment: context.hoursUntilAppointment,
    patientEmergencyExamCount: context.patientEmergencyExamCount,
    modality: context.modality,
    ...context.appointment,
  };
  
  return fieldMap[field];
}

function evaluateTimeConstraintRule(rule: Rule, context: RuleEngineContext): { passed: boolean; severity: RuleSeverity; message: string; ruleId: string; ruleName: string } {
  const { appointment } = context;
  const { timeConstraintConfig } = rule.config;
  
  if (!timeConstraintConfig) return { passed: true, severity: rule.severity, message: '', ruleId: rule.id, ruleName: rule.name };
  
  const appointmentDate = appointment.appointmentDate || '';
  const appointmentTime = appointment.appointmentTime || '';
  
  const timeMatch = appointmentTime.match(/(\d{2}):(\d{2})/);
  if (!timeMatch) return { passed: true, severity: rule.severity, message: '', ruleId: rule.id, ruleName: rule.name };
  
  const hour = parseInt(timeMatch[1]);
  const minute = parseInt(timeMatch[2]);
  const timeValue = hour * 60 + minute;
  
  const date = new Date(appointmentDate);
  const dayOfWeek = date.getDay();
  
  if (timeConstraintConfig.allowedTimeRanges.length > 0) {
    const isAllowed = timeConstraintConfig.allowedTimeRanges.some(range => {
      const daysMatch = !range.daysOfWeek || range.daysOfWeek.includes(dayOfWeek);
      if (!daysMatch) return false;
      
      const [startHour, startMin] = range.startTime.split(':').map(Number);
      const [endHour, endMin] = range.endTime.split(':').map(Number);
      const startValue = startHour * 60 + startMin;
      const endValue = endHour * 60 + endMin;
      
      return timeValue >= startValue && timeValue < endValue;
    });
    
    if (!isAllowed) {
      return { passed: false, severity: rule.severity, message: rule.message, ruleId: rule.id, ruleName: rule.name };
    }
  }
  
  if (timeConstraintConfig.forbiddenTimeRanges.length > 0) {
    const isForbidden = timeConstraintConfig.forbiddenTimeRanges.some(range => {
      const daysMatch = !range.daysOfWeek || range.daysOfWeek.includes(dayOfWeek);
      if (!daysMatch) return false;
      
      const [startHour, startMin] = range.startTime.split(':').map(Number);
      const [endHour, endMin] = range.endTime.split(':').map(Number);
      const startValue = startHour * 60 + startMin;
      const endValue = endHour * 60 + endMin;
      
      return timeValue >= startValue && timeValue < endValue;
    });
    
    if (isForbidden) {
      return { passed: false, severity: rule.severity, message: rule.message, ruleId: rule.id, ruleName: rule.name };
    }
  }
  
  return { passed: true, severity: rule.severity, message: '', ruleId: rule.id, ruleName: rule.name };
}

function calculatePriorityScore(rule: Rule, context: RuleEngineContext): number {
  const { priorityConfig } = rule.config;
  
  if (!priorityConfig) return 0;
  
  let score = priorityConfig.baseScore || 0;
  
  for (const bonus of priorityConfig.bonusRules) {
    if (evaluateCondition(bonus.condition, bonus.field, bonus.value, context)) {
      score += bonus.bonusScore;
    }
  }
  
  return score;
}

function generateSuggestedSlots(context: RuleEngineContext): string[] {
  const suggested: string[] = [];
  const modality = context.modality || context.appointment?.modality;
  
  if (modality === 'CT' || modality === '超声' || modality === 'MRI') {
    suggested.push('14:00-15:00', '15:00-16:00', '16:00-17:00');
  } else if (modality === '内镜') {
    suggested.push('08:00-09:00', '09:00-10:00');
  }
  
  return suggested.slice(0, 3);
}

export function getRulesByType(type: RuleType): Rule[] {
  return ALL_RULES.filter(r => r.type === type);
}

export function getRuleById(id: string): Rule | undefined {
  return ALL_RULES.find(r => r.id === id);
}

export function getRulesStatistics() {
  return {
    total: ALL_RULES.length,
    enabled: ALL_RULES.filter(r => r.enabled).length,
    disabled: ALL_RULES.filter(r => !r.enabled).length,
    mutexCount: MUTEX_RULES.length,
    restrictionCount: RESTRICTION_RULES.length,
    priorityCount: PRIORITY_RULES.length,
    timeConstraintCount: TIME_CONSTRAINT_RULES.length,
  };
}
