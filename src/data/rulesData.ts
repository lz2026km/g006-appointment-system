// G006 全院医技检查预约系统 - 预约规则引擎数据
// 包含：互斥规则、限制规则、优先级规则、时间约束规则

import type { Appointment } from '../types';

// ==================== 规则类型定义 ====================
export type RuleType = 'mutex' | 'restriction' | 'priority' | 'timeConstraint';
export type RuleCategory = 'patient' | 'device' | 'exam' | 'time' | 'department' | 'insurance' | 'emergency';
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
  {
    id: 'MUTEX013',
    name: '乳腺钼靶与乳腺MRI同月互斥',
    description: '乳腺钼靶和乳腺MRI检查同月内不应重复进行',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['乳腺', '钼靶', 'MRI', '互斥'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '乳腺钼靶和乳腺MRI检查同月内不应重复'
      }
    },
    message: '该患者本月已进行乳腺钼靶检查，乳腺MRI建议安排在下月进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX014',
    name: '骨密度检测与CT定量分析同周互斥',
    description: '骨密度检测（DEXA）和CT定量分析（QCT）功能相似，同周内不应重复',
    type: 'mutex',
    category: 'exam',
    severity: 'info',
    enabled: true,
    priority: 40,
    tags: ['骨密度', 'CT', 'QCT', 'DEXA'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '骨密度检测与CT定量分析功能相似，同周内不建议重复进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX015',
    name: '眼底造影与眼底照相同日前后互斥',
    description: '眼底造影（FFA）和眼底照相检查不宜在同日前后进行',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['眼底', '造影', '照相', '眼科'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '眼底造影与眼底照相不宜安排在同一天，请分开预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX016',
    name: '核素肾图与CT尿路造影同日前后互斥',
    description: '核素肾图（ECT）和CT尿路造影（CTU）均为泌尿系统检查，不宜同日前后进行',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 28,
    tags: ['肾图', 'CTU', '泌尿系统', '核素'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '核素肾图与CT尿路造影均为泌尿系统检查，不宜同日前后进行'
      }
    },
    message: '核素肾图与CT尿路造影功能有重叠，建议选择其中一种检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX017',
    name: 'PET-MRI与PET-CT同月互斥',
    description: 'PET-MRI和PET-CT均为PET融合检查，同月内不应重复进行',
    type: 'mutex',
    category: 'exam',
    severity: 'error',
    enabled: true,
    priority: 15,
    tags: ['PET', 'MRI', 'CT', '肿瘤'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: 'PET-MRI和PET-CT均为PET融合检查，同月内不应重复进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX018',
    name: '睡眠监测与脑电图同夜互斥',
    description: '睡眠监测（PSG）和脑电图（EEG）同时进行会相互干扰',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['睡眠监测', '脑电图', '神经内科'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '睡眠监测与脑电图同时进行会相互干扰'
      }
    },
    message: '睡眠监测和脑电图不宜在同夜进行，请分开预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX019',
    name: '胶囊内镜与小肠镜同月互斥',
    description: '胶囊内镜和小肠镜均为小肠检查手段，同月内不应重复',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 32,
    tags: ['胶囊内镜', '小肠镜', '消化道'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '胶囊内镜和小肠镜均为小肠检查手段，同月内不建议重复进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX020',
    name: '超声造影与CT增强同日前后互斥',
    description: '超声造影（SonoVue）和CT增强检查均需使用造影剂，同日使用增加肾负担',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['超声造影', 'CT增强', '造影剂', '肾功能'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '超声造影与CT增强同日进行增加肾负担'
      }
    },
    message: '超声造影与CT增强检查不宜安排在同一天，以免造影剂叠加增加肾脏负担',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX021',
    name: 'ERCP与腹部MRCP同日前后互斥',
    description: 'ERCP和MRCP均为胆胰管检查，不宜同日前后进行',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 28,
    tags: ['ERCP', 'MRCP', '胆胰管', '内镜'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: 'ERCP和MRCP均为胆胰管检查，不宜同日前后进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX022',
    name: '心肌灌注显像与冠脉CTA同月互斥',
    description: '心肌灌注显像（MPI）和冠脉CTA均为冠心病检查，同月内不应重复',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 26,
    tags: ['心肌灌注', '冠脉CTA', '冠心病', '核医学'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '心肌灌注显像与冠脉CTA均为冠心病检查，同月内不建议重复',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX023',
    name: '孕妇超声与CT同日前后互斥',
    description: '孕妇应避免CT检查，孕期内超声与CT不能同日前后进行',
    type: 'mutex',
    category: 'patient',
    severity: 'error',
    enabled: true,
    priority: 5,
    tags: ['孕妇', 'CT', '辐射', '安全'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '孕妇应避免CT检查，孕期内超声与CT不能同日前后进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX024',
    name: '儿童CT与儿童MRI同周互斥',
    description: '儿童多次接受辐射检查应谨慎，CT和MRI同周内不宜重复',
    type: 'mutex',
    category: 'patient',
    severity: 'warning',
    enabled: true,
    priority: 20,
    tags: ['儿童', 'CT', 'MRI', '辐射'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '儿童多次接受辐射检查应谨慎，CT和MRI同周内不宜重复',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX025',
    name: '肺功能检测与支气管镜同日前后互斥',
    description: '肺功能检测和支气管镜检查不宜在同日前后进行',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['肺功能', '支气管镜', '呼吸科'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '肺功能检测和支气管镜检查不宜在同日前后进行'
      }
    },
    message: '肺功能检测和支气管镜检查不宜在同日前后进行，请分开预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX026',
    name: '动态心电图与运动负荷试验同日前后互斥',
    description: '动态心电图（Holter）和运动负荷试验不宜在同日前后进行',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['心电图', 'Holter', '运动负荷', '心脏'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '动态心电图和运动负荷试验不宜在同日前后进行，请分开预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX027',
    name: '甲状腺摄碘率与甲状腺核素显像同周互斥',
    description: '甲状腺摄碘率检测和甲状腺核素显像不宜同周进行',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 28,
    tags: ['甲状腺', '摄碘率', '核素显像', '内分泌'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '甲状腺摄碘率检测和甲状腺核素显像不宜同周进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX028',
    name: '骨扫描与PET-CT同月互斥',
    description: '骨扫描（ECT骨）和PET-CT均为全身扫描，同月内不应重复',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 22,
    tags: ['骨扫描', 'PET-CT', '肿瘤', '核医学'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '骨扫描与PET-CT均为全身扫描，同月内不应重复'
      }
    },
    message: '骨扫描和PET-CT均为全身性检查，同月内不建议重复进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX029',
    name: '电子胃镜与电子结肠镜同日前后互斥',
    description: '电子胃镜和电子结肠镜同时进行会增加患者不适，肠道准备会相互影响',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['胃镜', '结肠镜', '内镜', '肠道准备'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '电子胃镜和电子结肠镜同时进行会影响肠道准备效果'
      }
    },
    message: '电子胃镜和电子结肠镜不宜安排在同一天，建议分两天进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX030',
    name: '肝脏弹性成像与肝脏CT增强同日前后互斥',
    description: '肝脏弹性成像（FibroScan）和肝脏CT增强检查均涉及肝脏评估，不宜同日前后进行',
    type: 'mutex',
    category: 'exam',
    severity: 'info',
    enabled: true,
    priority: 35,
    tags: ['肝脏', '弹性成像', 'CT增强', '肝病'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '肝脏弹性成像与肝脏CT增强检查不宜同日前后进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX031',
    name: '肾动态显像与肾CT增强同日前后互斥',
    description: '肾动态显像和肾CT增强检查均涉及肾脏评估，不宜同日前后进行',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 28,
    tags: ['肾脏', '肾动态显像', 'CT增强', '泌尿系统'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '肾动态显像和肾CT增强检查不宜同日前后进行，请分开预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX032',
    name: '颅脑CT与颅脑MRI同日前后互斥',
    description: '颅脑CT和颅脑MRI均为颅脑检查，同日进行意义重复',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['颅脑', 'CT', 'MRI', '神经科'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '颅脑CT和颅脑MRI均为颅脑检查，同日进行意义重复'
      }
    },
    message: '颅脑CT和颅脑MRI不宜安排在同一天，请根据临床需要选择其一',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX033',
    name: '全身PET-CT与局部PET-CT同月互斥',
    description: '全身PET-CT和局部PET-CT不应在同月内重复进行',
    type: 'mutex',
    category: 'exam',
    severity: 'error',
    enabled: true,
    priority: 15,
    tags: ['PET-CT', '肿瘤', '全身', '局部'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '全身PET-CT和局部PET-CT不应在同月内重复进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX034',
    name: '64排以上CT与双源CT同月互斥',
    description: '高端CT设备检查具有高辐射剂量，同月内不应重复进行',
    type: 'mutex',
    category: 'device',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['CT', '高端CT', '辐射', '设备'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: true,
        message: '高端CT设备检查辐射剂量较高，同月内不应重复'
      }
    },
    message: '高端CT设备检查具有高辐射剂量，建议改用低剂量检查方式',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX035',
    name: '儿童透视与儿童X线片同周互斥',
    description: '儿童透视检查辐射量较大，与X线片同周内不应重复',
    type: 'mutex',
    category: 'patient',
    severity: 'warning',
    enabled: true,
    priority: 18,
    tags: ['儿童', '透视', 'X线', '辐射'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '儿童透视检查辐射量较大，与X线片同周内不建议重复',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX036',
    name: '放射性核素治疗前与治疗后同位素显像互斥',
    description: '放射性核素治疗（如碘131）前后一定时间内不宜进行同位素显像',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 22,
    tags: ['核素治疗', '同位素显像', '碘131', '核医学'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '放射性核素治疗后需间隔一定时间才能进行同位素显像'
      }
    },
    message: '放射性核素治疗前后一定时间内不宜进行同位素显像检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX037',
    name: '心脏MRI与心脏CT同月互斥',
    description: '心脏MRI和心脏CT均为心脏检查，同月内不应重复',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 26,
    tags: ['心脏', 'MRI', 'CT', '心血管'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '心脏MRI和心脏CT均为心脏检查，同月内不建议重复进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX038',
    name: '增强MRA与增强CTA同月互斥',
    description: '增强磁共振血管造影（MRA）和增强CT血管造影（CTA）均为血管检查，同月内不应重复',
    type: 'mutex',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['MRA', 'CTA', '血管造影', '互斥'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: false,
        checkSamePatient: true,
        checkSameDevice: false,
      }
    },
    message: '增强MRA和增强CTA均为血管检查，同月内不建议重复进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX039',
    name: '急诊CT与急诊MRI同日前后互斥',
    description: '急诊CT和急诊MRI均为急诊检查，但因设备资源限制，不宜同日前后进行',
    type: 'mutex',
    category: 'emergency',
    severity: 'warning',
    enabled: true,
    priority: 35,
    tags: ['急诊', 'CT', 'MRI', '设备'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: false,
        message: '急诊CT和急诊MRI因设备资源限制，不宜同日前后进行'
      }
    },
    message: '急诊CT和急诊MRI不宜同日前后进行，请根据病情优先级选择',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'MUTEX040',
    name: '轮椅患者CT与轮椅患者MRI设备互斥',
    description: '部分CT和MRI设备不支持轮椅患者，需使用专用设备',
    type: 'mutex',
    category: 'device',
    severity: 'info',
    enabled: true,
    priority: 45,
    tags: ['轮椅', 'CT', 'MRI', '设备'],
    config: {
      mutexConfig: {
        targetRuleId: '',
        checkSameDay: true,
        checkSamePatient: true,
        checkSameDevice: true,
        message: '轮椅患者需使用专用检查设备'
      }
    },
    message: '部分CT和MRI设备不支持轮椅患者，请预约专用设备',
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
  {
    id: 'REST007',
    name: '设备维护期间限制',
    description: '设备维护期间不接受新的预约申请',
    type: 'restriction',
    category: 'device',
    severity: 'error',
    enabled: true,
    priority: 90,
    tags: ['设备维护', '暂停服务'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'equipmentStatus',
        value: '维护中',
        message: '设备正在维护中'
      }
    },
    message: '该设备目前处于维护状态，暂不接受预约，请稍后再试',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST008',
    name: '检查项目互斥规则',
    description: '某些检查项目不能同时进行，如PET-CT与CT增强不可同天',
    type: 'restriction',
    category: 'exam',
    severity: 'error',
    enabled: true,
    priority: 85,
    tags: ['互斥检查', '项目冲突'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'examTypeA', value: 'PET-CT' },
          { condition: 'eq', field: 'examTypeB', value: 'CT增强' },
          { condition: 'eq', field: 'sameDayFlag', value: true },
        ],
        message: 'PET-CT与CT增强不能同天进行'
      }
    },
    message: 'PET-CT与CT增强检查不能安排在同一日，请调整检查日期',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST009',
    name: '空腹检查前饮食限制',
    description: '需要空腹的检查项目，检查前8小时内禁止进食',
    type: 'restriction',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 50,
    tags: ['空腹', '饮食限制', '检查前准备'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'requiresFasting', value: true },
          { condition: 'gt', field: 'hoursSinceLastMeal', value: 8 },
        ],
        message: '空腹检查前需禁食8小时'
      }
    },
    message: '该检查需要空腹，请确认患者已禁食8小时以上',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST010',
    name: '造影剂过敏筛查',
    description: '进行含碘造影剂检查前需确认患者无过敏史',
    type: 'restriction',
    category: 'exam',
    severity: 'error',
    enabled: true,
    priority: 95,
    tags: ['造影剂', '过敏', '安全检查'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'requiresContrast', value: true },
          { condition: 'eq', field: 'iodineContrastAllergy', value: true },
        ],
        message: '患者有碘造影剂过敏史'
      }
    },
    message: '患者有碘造影剂过敏史，不宜进行增强扫描，请考虑其他检查方案',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST011',
    name: '胎儿辐射剂量限制',
    description: '孕妇进行X线或CT检查时需评估胎儿辐射暴露风险',
    type: 'restriction',
    category: 'patient',
    severity: 'error',
    enabled: true,
    priority: 100,
    tags: ['孕妇', '辐射', '安全限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isPregnant', value: true },
          { condition: 'in', field: 'examModality', value: ['X线', 'CT'] },
        ],
        message: '孕妇进行X线或CT检查需评估辐射风险'
      }
    },
    message: '孕妇进行辐射检查需充分评估利弊，建议与临床医生沟通后决定',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST012',
    name: '儿童镇静剂使用限制',
    description: '6岁以下儿童进行CT或MRI检查如需镇静，需主治医生确认',
    type: 'restriction',
    category: 'patient',
    severity: 'warning',
    enabled: true,
    priority: 70,
    tags: ['儿童', '镇静', '年龄限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'lt', field: 'patientAge', value: 6 },
          { condition: 'in', field: 'examModality', value: ['CT', 'MRI'] },
          { condition: 'eq', field: 'requiresSedation', value: true },
        ],
        message: '6岁以下儿童镇静检查需主治医生确认'
      }
    },
    message: '该患者年龄较小，镇静检查需经主治医生确认后方可预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST013',
    name: '预约时间窗口限制',
    description: '门诊患者检查只能预约30天以内的工作时间',
    type: 'restriction',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 30,
    tags: ['预约窗口', '时间限制'],
    config: {
      restrictionConfig: {
        condition: 'or',
        subConditions: [
          { condition: 'gt', field: 'daysUntilAppointment', value: 30 },
          { condition: 'eq', field: 'isWeekend', value: true },
        ],
        message: '门诊检查只能在30天内工作日预约'
      }
    },
    message: '门诊检查只能预约30天以内的工作日，请调整预约时间',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST014',
    name: '检查部位数量限制',
    description: '单次预约最多只能检查3个部位，超出需分次预约',
    type: 'restriction',
    category: 'exam',
    severity: 'info',
    enabled: true,
    priority: 40,
    tags: ['部位数量', '限制'],
    config: {
      restrictionConfig: {
        condition: 'gt',
        field: 'examBodyPartsCount',
        value: 3,
        message: '单次预约最多3个检查部位'
      }
    },
    message: '单次预约最多只能检查3个部位，超出部分请另行预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST015',
    name: '植入物MRI兼容性检查',
    description: '带有心脏起搏器等植入物的患者不可进行MRI检查',
    type: 'restriction',
    category: 'device',
    severity: 'error',
    enabled: true,
    priority: 100,
    tags: ['植入物', 'MRI', '安全限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'examModality', value: 'MRI' },
          { condition: 'eq', field: 'hasImplant', value: true },
          { condition: 'eq', field: 'implantMRISafe', value: false },
        ],
        message: '患者体内植入物不兼容MRI'
      }
    },
    message: '患者体内植入物经确认不支持MRI检查，请考虑其他影像学方法',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST016',
    name: '急诊检查优先级强制',
    description: '急诊检查项目必须优先安排，30分钟内完成确认',
    type: 'restriction',
    category: 'patient',
    severity: 'error',
    enabled: true,
    priority: 100,
    tags: ['急诊', '优先处理'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'patientType', value: '急诊' },
          { condition: 'eq', field: 'isEmergencyExam', value: true },
        ],
        message: '急诊检查需30分钟内响应'
      }
    },
    message: '急诊检查需优先处理，请在30分钟内完成预约确认',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST017',
    name: '重复检查间隔限制',
    description: '相同检查项目两次预约间隔至少14天',
    type: 'restriction',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 55,
    tags: ['重复检查', '间隔限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isRepeatedExam', value: true },
          { condition: 'lt', field: 'daysSinceLastSameExam', value: 14 },
        ],
        message: '相同检查项目需间隔14天以上'
      }
    },
    message: '该检查项目14天内已有记录，短期内不宜重复检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST018',
    name: '检查准备完整度检查',
    description: '检查项目需要100%完成准备清单才能预约',
    type: 'restriction',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 60,
    tags: ['准备清单', '完整度'],
    config: {
      restrictionConfig: {
        condition: 'lt',
        field: 'preparationCompletePercent',
        value: 100,
        message: '检查准备清单未完成'
      }
    },
    message: '请先完成所有检查前准备工作，再进行预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST019',
    name: '体重限制-特定检查设备',
    description: '某些检查设备有体重限制，超过200kg无法使用',
    type: 'restriction',
    category: 'device',
    severity: 'error',
    enabled: true,
    priority: 80,
    tags: ['体重限制', '设备限制'],
    config: {
      restrictionConfig: {
        condition: 'gt',
        field: 'patientWeight',
        value: 200,
        message: '患者体重超过设备限制'
      }
    },
    message: '该设备最大承重为200kg，请选择其他检查设备或方式',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST020',
    name: '检查报告补打限制',
    description: '住院患者可补打报告，门诊患者需缴费后补打',
    type: 'restriction',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 20,
    tags: ['报告补打', '门诊住院'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isReportReprint', value: true },
          { condition: 'eq', field: 'patientType', value: '门诊' },
          { condition: 'eq', field: 'hasPaidReportFee', value: false },
        ],
        message: '门诊患者补打报告需先缴纳费用'
      }
    },
    message: '门诊患者补打检查报告需先至收费窗口缴纳报告费',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST021',
    name: '检查取消时间限制',
    description: '检查前24小时内不允许取消预约',
    type: 'restriction',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 50,
    tags: ['取消预约', '时间限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isCancelRequest', value: true },
          { condition: 'lt', field: 'hoursUntilAppointment', value: 24 },
        ],
        message: '检查前24小时内不可取消'
      }
    },
    message: '距检查开始不足24小时，不允许取消预约，如有特殊情况请联系科室',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST022',
    name: '改签次数限制',
    description: '同一预约号最多只能改签2次',
    type: 'restriction',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 30,
    tags: ['改签', '次数限制'],
    config: {
      restrictionConfig: {
        condition: 'gte',
        field: 'rescheduleCount',
        value: 2,
        message: '改签次数已达上限'
      }
    },
    message: '该预约已改签2次，不再允许改签，请取消后重新预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST023',
    name: '住院患者检查转移限制',
    description: '住院患者检查如需跨院区，需科室主任审批',
    type: 'restriction',
    category: 'patient',
    severity: 'warning',
    enabled: true,
    priority: 65,
    tags: ['住院', '跨院区', '审批'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'patientType', value: '住院' },
          { condition: 'eq', field: 'requiresCrossCampus', value: true },
          { condition: 'eq', field: 'departmentDirectorApproved', value: false },
        ],
        message: '住院患者跨院区检查需科室主任审批'
      }
    },
    message: '住院患者跨院区检查需要科室主任审批通过后才能预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST024',
    name: '特需门诊检查限制',
    description: '特需门诊患者享受优先服务，但每天每医生限20个特需号',
    type: 'restriction',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 45,
    tags: ['特需门诊', '数量限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'patientType', value: '特需' },
          { condition: 'gte', field: 'dailySpecialCountForDoctor', value: 20 },
        ],
        message: '该医生今日特需号已满'
      }
    },
    message: '该医生今日特需门诊预约已满，建议选择其他医生或普通门诊',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST025',
    name: '医保账户状态检查',
    description: '使用医保支付前需确认账户状态正常',
    type: 'restriction',
    category: 'insurance',
    severity: 'error',
    enabled: true,
    priority: 85,
    tags: ['医保', '账户状态'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'insuranceAccountStatus',
        value: '冻结',
        message: '医保账户已被冻结'
      }
    },
    message: '患者医保账户状态异常，请先至医保中心办理解冻手续',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST026',
    name: '欠费患者检查限制',
    description: '存在未缴清费用的患者再次就诊需先结清欠费',
    type: 'restriction',
    category: 'insurance',
    severity: 'error',
    enabled: true,
    priority: 90,
    tags: ['欠费', '结算'],
    config: {
      restrictionConfig: {
        condition: 'gt',
        field: 'outstandingBalance',
        value: 0,
        message: '患者存在未结算费用'
      }
    },
    message: '患者存在未结清费用，请先至收费窗口完成结算后再预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST027',
    name: '检查项目匹配科室限制',
    description: '检查项目必须在对应科室可提供服务的时间段内预约',
    type: 'restriction',
    category: 'device',
    severity: 'warning',
    enabled: true,
    priority: 55,
    tags: ['科室', '时间段', '匹配'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isOutsideDepartmentServiceHours', value: true },
        ],
        message: '该检查项目在所选时间段不可用'
      }
    },
    message: '所选时间段该检查项目尚未提供服务，请查看科室可预约时间',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST028',
    name: '传染病患者检查隔离要求',
    description: '传染病患者检查后需进行设备消毒，间隔时间不少于30分钟',
    type: 'restriction',
    category: 'patient',
    severity: 'warning',
    enabled: true,
    priority: 75,
    tags: ['传染病', '消毒', '隔离'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'hasInfectiousDisease', value: true },
          { condition: 'lt', field: 'minutesSinceLastDisinfection', value: 30 },
        ],
        message: '设备消毒后需间隔30分钟才能再次使用'
      }
    },
    message: '该设备刚完成传染病患者检查消毒，请30分钟后再进行下一位患者检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST029',
    name: '节假日检查服务限制',
    description: '法定节假日期间只提供急诊检查服务',
    type: 'restriction',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 25,
    tags: ['节假日', '服务限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isHoliday', value: true },
          { condition: 'ne', field: 'patientType', value: '急诊' },
          { condition: 'ne', field: 'isEmergencyExam', value: true },
        ],
        message: '节假日只提供急诊检查服务'
      }
    },
    message: '法定节假日期间只提供急诊检查服务，普通检查请选择工作日',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'REST030',
    name: '海外设备使用授权检查',
    description: '使用海外引进的特供设备需核实患者身份和预约渠道',
    type: 'restriction',
    category: 'device',
    severity: 'warning',
    enabled: true,
    priority: 60,
    tags: ['特供设备', '授权', '身份核实'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isSpecialtyEquipment', value: true },
          { condition: 'eq', field: 'requiresSpecialAuth', value: true },
          { condition: 'eq', field: 'hasSpecialAuthCode', value: false },
        ],
        message: '特供设备需要特别授权码'
      }
    },
    message: '该设备为特供进口设备，需要特殊授权码才能预约，请联系设备管理员',
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
  {
    id: 'PRIO007',
    name: '术后复查优先级',
    description: '手术后复查患者获得较高优先级',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 85,
    tags: ['术后', '复查', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '术后', bonusScore: 45, description: '术后复查加45分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO008',
    name: '危重症患者优先级',
    description: '危重症患者自动获得最高优先级保障',
    type: 'priority',
    category: 'patient',
    severity: 'error',
    enabled: true,
    priority: 100,
    tags: ['危重症', '优先级', '最高优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'patientStatus', value: '危重症', bonusScore: 100, description: '危重症患者加100分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO009',
    name: '发热患者CT检查优先级',
    description: '发热患者进行CT检查时提升优先级',
    type: 'priority',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 90,
    tags: ['发热', 'CT', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'contains', field: 'symptoms', value: '发热', bonusScore: 40, description: '发热患者加40分' },
          { condition: 'eq', field: 'examType', value: 'CT', bonusScore: 20, description: 'CT检查加20分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO010',
    name: '儿童患者优先检查',
    description: '14岁以下儿童患者获得优先检查权',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 88,
    tags: ['儿童', '优先', '年龄'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'lt', field: 'age', value: 14, bonusScore: 50, description: '14岁以下儿童加50分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO011',
    name: '孕产妇影像检查优先',
    description: '孕产妇进行影像检查时获得优先权',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 92,
    tags: ['孕产妇', '优先', '特殊人群'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'isPregnant', value: true, bonusScore: 60, description: '孕产妇加60分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO012',
    name: '当日已达最大检查量预警',
    description: '当科室当日检查量已达最大容量时触发预警',
    type: 'priority',
    category: 'device',
    severity: 'warning',
    enabled: true,
    priority: 50,
    tags: ['容量', '预警', '资源调度'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'gte', field: 'dailyExamCount', value: 'maxCapacity', bonusScore: -30, description: '达最大容量减30分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO013',
    name: '复查患者优先级',
    description: '定期复查患者根据复查周期调整优先级',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 75,
    tags: ['复查', '周期', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'isFollowUp', value: true, bonusScore: 25, description: '复查患者加25分' },
          { condition: 'lte', field: 'followUpDays', value: 7, bonusScore: 35, description: '7天内复查加35分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO014',
    name: '医保患者优先级调整',
    description: '医保患者与自费患者优先级差异化处理',
    type: 'priority',
    category: 'insurance',
    severity: 'info',
    enabled: true,
    priority: 70,
    tags: ['医保', '优先级', '费用类别'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'paymentType', value: '医保', bonusScore: 15, description: '医保患者加15分' },
          { condition: 'eq', field: 'paymentType', value: '自费', bonusScore: -10, description: '自费患者减10分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO015',
    name: '军人及优抚对象优先',
    description: '现役军人及优抚对象享受优先检查',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 95,
    tags: ['军人', '优抚', '优先'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'patientCategory', value: '军人', bonusScore: 70, description: '军人加70分' },
          { condition: 'eq', field: 'patientCategory', value: '优抚对象', bonusScore: 65, description: '优抚对象加65分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO016',
    name: '大型设备检查优先级',
    description: 'MRI、高端CT等大型设备检查需要优先安排',
    type: 'priority',
    category: 'device',
    severity: 'info',
    enabled: true,
    priority: 78,
    tags: ['大型设备', 'MRI', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'examEquipment', value: 'MRI', bonusScore: 30, description: 'MRI检查加30分' },
          { condition: 'eq', field: 'examEquipment', value: 'PET-CT', bonusScore: 35, description: 'PET-CT检查加35分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO017',
    name: '检查项目冲突优先级',
    description: '需要同一设备的不同检查项目冲突时优先处理',
    type: 'priority',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 65,
    tags: ['冲突', '设备', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'hasConflict', value: true, bonusScore: 40, description: '有冲突加40分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO018',
    name: '空腹检查项目优先级',
    description: '需要空腹的检查项目优先安排在上午',
    type: 'priority',
    category: 'exam',
    severity: 'info',
    enabled: true,
    priority: 72,
    tags: ['空腹', '上午', '检查要求'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'requiresFasting', value: true, bonusScore: 35, description: '空腹检查加35分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO019',
    name: '急诊绿色通道扩展',
    description: '急诊发热患者开辟专用绿色通道',
    type: 'priority',
    category: 'patient',
    severity: 'error',
    enabled: true,
    priority: 100,
    tags: ['急诊', '绿色通道', '发热'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'patientType', value: '急诊', bonusScore: 80, description: '急诊患者加80分' },
          { condition: 'contains', field: 'symptoms', value: '发热', bonusScore: 60, description: '发热症状加60分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO020',
    name: '偏远地区患者优先',
    description: '偏远地区转诊患者获得优先安排',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 82,
    tags: ['偏远地区', '转诊', '优先'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'fromRemoteArea', value: true, bonusScore: 40, description: '偏远地区加40分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO021',
    name: '检查等待超时升级',
    description: '检查预约等待超过设定时间自动升级优先级',
    type: 'priority',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 80,
    tags: ['等待超时', '自动升级', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'gt', field: 'waitingHours', value: 24, bonusScore: 50, description: '等待超24小时加50分' },
          { condition: 'gt', field: 'waitingHours', value: 48, bonusScore: 80, description: '等待超48小时加80分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO022',
    name: '周末节假日检查优先级',
    description: '周末节假日进行的检查根据紧急程度调整',
    type: 'priority',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 60,
    tags: ['周末', '节假日', '时间调整'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'isWeekend', value: true, bonusScore: -15, description: '周末减15分' },
          { condition: 'eq', field: 'isHoliday', value: true, bonusScore: -20, description: '节假日减20分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO023',
    name: '增强检查优先级',
    description: '需要注射造影剂的增强检查获得特殊优先级',
    type: 'priority',
    category: 'exam',
    severity: 'info',
    enabled: true,
    priority: 76,
    tags: ['增强检查', '造影剂', '特殊检查'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'requiresContrast', value: true, bonusScore: 35, description: '增强检查加35分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO024',
    name: '床旁检查优先级',
    description: '危重症患者床旁检查获得最高优先级',
    type: 'priority',
    category: 'patient',
    severity: 'error',
    enabled: true,
    priority: 100,
    tags: ['床旁检查', '危重症', '最高优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'examLocation', value: '床旁', bonusScore: 90, description: '床旁检查加90分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO025',
    name: '健康体检优先级最低',
    description: '常规健康体检优先级设为最低',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['健康体检', '优先级最低'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'examPurpose', value: '健康体检', bonusScore: -40, description: '健康体检减40分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO026',
    name: '团体体检优先级',
    description: '团体体检统一安排，优先级适当降低',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 55,
    tags: ['团体体检', '批量', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'isGroupExam', value: true, bonusScore: -30, description: '团体体检减30分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO027',
    name: '择期手术前检查优先级',
    description: '择期手术前的影像检查优先安排',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 88,
    tags: ['择期手术', '术前检查', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'preSurgeryExam', value: true, bonusScore: 55, description: '术前检查加55分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO028',
    name: '肿瘤随访检查优先级',
    description: '肿瘤患者定期随访检查保持较高优先级',
    type: 'priority',
    category: 'patient',
    severity: 'info',
    enabled: true,
    priority: 85,
    tags: ['肿瘤随访', '复查', '优先级'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'tumorFollowUp', value: true, bonusScore: 60, description: '肿瘤随访加60分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO029',
    name: '急诊影像报告优先出具',
    description: '急诊影像检查报告需要优先出具',
    type: 'priority',
    category: 'exam',
    severity: 'warning',
    enabled: true,
    priority: 90,
    tags: ['急诊', '报告', '优先出具'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'patientType', value: '急诊', bonusScore: 50, description: '急诊报告加50分' },
        ]
      }
    },
    message: '',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'PRIO030',
    name: '设备故障时检查重排',
    description: '设备故障期间，受影响检查自动提升优先级',
    type: 'priority',
    category: 'device',
    severity: 'error',
    enabled: true,
    priority: 95,
    tags: ['设备故障', '重排', '优先级调整'],
    config: {
      priorityConfig: {
        baseScore: 0,
        bonusRules: [
          { condition: 'eq', field: 'affectedByOutage', value: true, bonusScore: 70, description: '受故障影响加70分' },
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
  {
    id: 'TIME007',
    name: '产科超声仅上午检查',
    description: '产科超声检查因需要憋尿，仅能在上午时段进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 40,
    tags: ['产科', '超声', '憋尿', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '11:30', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '产科超声检查需在上午8:00-11:30进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME008',
    name: '乳腺钼靶仅下午进行',
    description: '乳腺钼靶检查因需要暴露上半身，仅能在下午时段进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 45,
    tags: ['乳腺', '钼靶', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '13:30', endTime: '17:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '乳腺钼靶检查建议安排在下午13:30-17:00',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME009',
    name: '骨密度检查时间灵活',
    description: '骨密度检查可在工作日全天进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['骨密度', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5] },
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [],
        checkDateAhead: 0,
      }
    },
    message: '骨密度检查可在工作日8:00-12:00或14:00-18:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME010',
    name: 'PET-CT仅工作日上午',
    description: 'PET-CT检查因设备特殊性，仅能在工作日上午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'error',
    enabled: true,
    priority: 25,
    tags: ['PET-CT', '核医学', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '11:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
          { startTime: '08:00', endTime: '18:00', daysOfWeek: [6, 7] },
        ],
        checkDateAhead: 0,
      }
    },
    message: 'PET-CT检查仅能在工作日上午8:00-11:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME011',
    name: '胶囊内镜仅工作日下午',
    description: '胶囊内镜检查准备流程较长，仅能在工作日下午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 45,
    tags: ['胶囊内镜', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '14:00', endTime: '16:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '胶囊内镜检查仅能在下午14:00-16:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME012',
    name: '眼底造影仅上午',
    description: '眼底荧光血管造影检查需要在上午完成',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 40,
    tags: ['眼底', '造影', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '10:30', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '眼底荧光血管造影检查需在上午8:00-10:30进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME013',
    name: '肺功能检查全天可做',
    description: '肺功能检查可在工作日全天进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['肺功能', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5] },
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [],
        checkDateAhead: 0,
      }
    },
    message: '肺功能检查可在工作日8:00-12:00或14:00-18:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME014',
    name: '睡眠监测仅夜间',
    description: '多导睡眠监测需要在夜间进行，仅能在指定夜间时段预约',
    type: 'timeConstraint',
    category: 'time',
    severity: 'error',
    enabled: true,
    priority: 20,
    tags: ['睡眠监测', '夜间', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '20:00', endTime: '23:00', daysOfWeek: [1, 2, 3, 4, 5, 6, 7] },
        ],
        forbiddenTimeRanges: [
          { startTime: '08:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5, 6, 7] },
        ],
        checkDateAhead: 7,
      }
    },
    message: '多导睡眠监测需要在夜间20:00-23:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME015',
    name: '动态血压仅白天',
    description: '24小时动态血压监测需要在白天佩戴',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['动态血压', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '10:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [],
        checkDateAhead: 0,
      }
    },
    message: '24小时动态血压监测需在上午8:00-10:00佩戴',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME016',
    name: 'CT引导穿刺仅下午',
    description: 'CT引导下穿刺活检因需要准备，仅能在下午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 35,
    tags: ['CT引导', '穿刺', '时间限制'],
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
    message: 'CT引导下穿刺活检建议安排在下午14:00-17:00',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME017',
    name: 'ERCP仅上午',
    description: '逆行胰胆管造影检查需要空腹，仅能在上午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'error',
    enabled: true,
    priority: 25,
    tags: ['ERCP', '空腹', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '11:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: 'ERCP检查需要空腹，仅能在上午8:00-11:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME018',
    name: '膀胱镜仅下午',
    description: '膀胱镜检查因需要憋尿，仅能在下午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 45,
    tags: ['膀胱镜', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '13:30', endTime: '16:30', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '膀胱镜检查建议安排在下午13:30-16:30',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME019',
    name: '宫腔镜仅上午',
    description: '宫腔镜检查需要在上午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 40,
    tags: ['宫腔镜', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '11:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '宫腔镜检查需在上午8:00-11:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME020',
    name: '周六仅开放常规检查',
    description: '周六仅开放常规超声和心电图检查',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['周六', '时间限制', '常规检查'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [6] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [6] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '周六仅开放常规超声和心电图检查（上午8:00-12:00）',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME021',
    name: '周日不提供服务',
    description: '周日全科休息，不提供任何检查服务',
    type: 'timeConstraint',
    category: 'time',
    severity: 'error',
    enabled: true,
    priority: 10,
    tags: ['周日', '休息日', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [],
        forbiddenTimeRanges: [
          { startTime: '08:00', endTime: '18:00', daysOfWeek: [7] },
        ],
        checkDateAhead: 30,
      }
    },
    message: '周日全科休息，不提供任何检查服务',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME022',
    name: '增强MR仅下午时段',
    description: '增强磁共振检查因打造影剂，仅能在下午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 35,
    tags: ['增强MR', '造影剂', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '13:30', endTime: '17:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '增强磁共振检查建议安排在下午13:30-17:00',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME023',
    name: 'DR检查全天可做',
    description: '数字化X线摄影检查可在任意工作时段进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['DR', 'X线', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [],
        checkDateAhead: 0,
      }
    },
    message: '数字化X线摄影检查可在工作日8:00-18:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME024',
    name: '胃肠造影仅上午',
    description: '胃肠道造影检查需要空腹，仅能在上午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'error',
    enabled: true,
    priority: 30,
    tags: ['胃肠造影', '空腹', '时间限制'],
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
    message: '胃肠道造影检查需要空腹，仅能在上午8:00-10:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME025',
    name: '糖耐量试验仅上午',
    description: '口服葡萄糖耐量试验需要多次抽血，仅能在上午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 40,
    tags: ['糖耐量', '空腹', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '09:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '口服葡萄糖耐量试验需要在上午8:00-9:00开始',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME026',
    name: '细菌培养样本采集时段',
    description: '各类细菌培养样本采集仅能在特定时段进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['细菌培养', '样本采集', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '10:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [],
        checkDateAhead: 0,
      }
    },
    message: '细菌培养样本采集需要在上午8:00-10:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME027',
    name: '输血前检查仅上午',
    description: '输血前检查因项目较多，仅能在上午进行',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 40,
    tags: ['输血', '检查', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '08:00', endTime: '11:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        forbiddenTimeRanges: [
          { startTime: '14:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] },
        ],
        checkDateAhead: 0,
      }
    },
    message: '输血前检查需要在上午8:00-11:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME028',
    name: '急诊检查24小时可做',
    description: '标注为急诊的检查24小时均可预约',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['急诊', '24小时', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [
          { startTime: '00:00', endTime: '23:59', daysOfWeek: [1, 2, 3, 4, 5, 6, 7] },
        ],
        forbiddenTimeRanges: [],
        checkDateAhead: 0,
      }
    },
    message: '急诊检查24小时均可预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME029',
    name: '实习生操作仅下午',
    description: '实习生进行操作检查仅能在带教老师上班的下午时段',
    type: 'timeConstraint',
    category: 'time',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['实习生', '教学', '时间限制'],
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
    message: '实习生操作检查仅能在下午14:00-17:00进行',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'TIME030',
    name: '特殊检查需提前预约',
    description: '某些特殊检查项目需要提前至少3天预约',
    type: 'timeConstraint',
    category: 'time',
    severity: 'warning',
    enabled: true,
    priority: 35,
    tags: ['特殊检查', '提前预约', '时间限制'],
    config: {
      timeConstraintConfig: {
        allowedTimeRanges: [],
        forbiddenTimeRanges: [],
        checkDateAhead: 3,
      }
    },
    message: '某些特殊检查项目需要提前至少3天预约',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
];

// ==================== 科室协同规则（20个） ====================
export const DEPT_RULES: Rule[] = [
  {
    id: 'DEPT001',
    name: '放射科与急诊科协同-创伤患者',
    description: '急诊创伤患者需优先协调放射科CT检查，确保30分钟内完成',
    type: 'restriction',
    category: 'department',
    severity: 'error',
    enabled: true,
    priority: 15,
    tags: ['放射科', '急诊科', '创伤', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'patientType', value: '急诊' },
          { condition: 'contains', field: 'clinicalDiagnosis', value: '创伤' },
          { condition: 'in', field: 'modality', value: ['CT', 'X线'] },
        ],
        message: '急诊创伤患者CT检查需在30分钟内完成'
      }
    },
    message: '急诊创伤患者优先使用放射科绿色通道，请在30分钟内完成检查预约确认',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT002',
    name: '心内科与影像科协同-胸痛患者',
    description: '胸痛患者心电图和心脏超声检查需心内科与影像科协同',
    type: 'restriction',
    category: 'department',
    severity: 'error',
    enabled: true,
    priority: 20,
    tags: ['心内科', '影像科', '胸痛', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '胸痛' },
          { condition: 'in', field: 'examType', value: ['心电图', '心脏超声', '冠脉CTA'] },
        ],
        message: '胸痛患者检查需心内科与影像科协同'
      }
    },
    message: '胸痛患者检查涉及多科室协同，请联系心内科和影像科确认检查顺序',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT003',
    name: '消化内科与内镜中心协同-胃肠道检查',
    description: '胃肠道疾病患者胃镜肠镜检查需消化内科与内镜中心协同预约',
    type: 'restriction',
    category: 'department',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['消化内科', '内镜中心', '胃肠', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '胃肠' },
          { condition: 'in', field: 'examType', value: ['胃镜', '肠镜'] },
        ],
        message: '胃肠道检查需消化内科与内镜中心协同'
      }
    },
    message: '胃肠道内镜检查需消化内科医生开单后与内镜中心预约协同',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT004',
    name: '神经内科与影像科协同-卒中患者',
    description: '卒中患者需优先协调影像科进行头颅CT/MRI检查',
    type: 'restriction',
    category: 'department',
    severity: 'error',
    enabled: true,
    priority: 10,
    tags: ['神经内科', '影像科', '卒中', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '卒中' },
          { condition: 'in', field: 'modality', value: ['CT', 'MRI'] },
        ],
        message: '卒中患者影像检查需开启绿色通道'
      }
    },
    message: '卒中患者头颅影像检查为紧急任务，请立即协调影像科优先处理',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT005',
    name: '产科与超声科协同-孕妇检查',
    description: '孕妇产前超声检查需产科与超声科协同安排',
    type: 'restriction',
    category: 'department',
    severity: 'info',
    enabled: true,
    priority: 35,
    tags: ['产科', '超声科', '孕妇', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'patientPregnant', value: true },
          { condition: 'contains', field: 'examType', value: '超声' },
        ],
        message: '孕妇超声检查需产科与超声科协同'
      }
    },
    message: '孕妇产前超声检查请提前与产科和超声科协调时间',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT006',
    name: '骨科与放射科协同-骨折患者',
    description: '骨折患者X线片和CT检查需骨科与放射科协同',
    type: 'restriction',
    category: 'department',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['骨科', '放射科', '骨折', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '骨折' },
          { condition: 'in', field: 'modality', value: ['X线', 'CT'] },
        ],
        message: '骨折患者检查需骨科与放射科协同'
      }
    },
    message: '骨折患者影像检查请骨科医生与放射科协同安排',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT007',
    name: '肿瘤科与核医学科协同-PET-CT',
    description: '肿瘤患者PET-CT检查需肿瘤科与核医学科协同',
    type: 'restriction',
    category: 'department',
    severity: 'warning',
    enabled: true,
    priority: 28,
    tags: ['肿瘤科', '核医学科', 'PET-CT', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '癌' },
          { condition: 'eq', field: 'modality', value: 'PET-CT' },
        ],
        message: '肿瘤患者PET-CT需肿瘤科与核医学科协同'
      }
    },
    message: 'PET-CT检查需经肿瘤科确认后与核医学科预约协同',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT008',
    name: '呼吸科与内镜中心协同-支气管镜',
    description: '呼吸疾病患者支气管镜检查需呼吸科与内镜中心协同',
    type: 'restriction',
    category: 'department',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['呼吸科', '内镜中心', '支气管镜', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '肺' },
          { condition: 'eq', field: 'examType', value: '支气管镜' },
        ],
        message: '支气管镜检查需呼吸科与内镜中心协同'
      }
    },
    message: '支气管镜检查请呼吸科与内镜中心协调安排',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT009',
    name: '泌尿外科与影像科协同-泌尿系统检查',
    description: '泌尿系统检查需泌尿外科与影像科协同',
    type: 'restriction',
    category: 'department',
    severity: 'info',
    enabled: true,
    priority: 40,
    tags: ['泌尿外科', '影像科', '泌尿', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '肾' },
          { condition: 'in', field: 'examType', value: ['CTU', '泌尿超声', '肾动态显像'] },
        ],
        message: '泌尿系统检查需泌尿外科与影像科协同'
      }
    },
    message: '泌尿系统检查请泌尿外科与影像科协同安排',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT010',
    name: '内分泌科与超声科协同-甲状腺检查',
    description: '甲状腺疾病患者检查需内分泌科与超声科协同',
    type: 'restriction',
    category: 'department',
    severity: 'info',
    enabled: true,
    priority: 45,
    tags: ['内分泌科', '超声科', '甲状腺', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '甲状腺' },
          { condition: 'contains', field: 'examType', value: '超声' },
        ],
        message: '甲状腺检查需内分泌科与超声科协同'
      }
    },
    message: '甲状腺超声检查请内分泌科与超声科协调',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT011',
    name: '儿科与影像科协同-儿童检查',
    description: '儿童患者影像检查需儿科与影像科协同，确保适合儿童的检查方案',
    type: 'restriction',
    category: 'department',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['儿科', '影像科', '儿童', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'lt', field: 'patientAge', value: 14 },
          { condition: 'in', field: 'modality', value: ['CT', 'MRI', 'X线'] },
        ],
        message: '儿童影像检查需儿科与影像科协同'
      }
    },
    message: '儿童患者影像检查需儿科医生与影像科协商适合儿童的检查方案',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT012',
    name: '康复科与放射科协同-康复评定',
    description: '康复期患者放射检查需康复科与放射科协同',
    type: 'restriction',
    category: 'department',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['康复科', '放射科', '康复', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '康复' },
          { condition: 'in', field: 'modality', value: ['X线', 'CT'] },
        ],
        message: '康复期患者检查需康复科与放射科协同'
      }
    },
    message: '康复期患者影像检查请康复科与放射科协调安排',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT013',
    name: '血管外科与影像科协同-血管检查',
    description: '血管疾病患者检查需血管外科与影像科协同',
    type: 'restriction',
    category: 'department',
    severity: 'warning',
    enabled: true,
    priority: 28,
    tags: ['血管外科', '影像科', '血管', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '血管' },
          { condition: 'in', field: 'examType', value: ['CTA', 'MRA', '血管超声'] },
        ],
        message: '血管检查需血管外科与影像科协同'
      }
    },
    message: '血管影像检查请血管外科与影像科协同安排',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT014',
    name: '眼科与影像科协同-眼底检查',
    description: '眼底疾病患者检查需眼科与影像科协同',
    type: 'restriction',
    category: 'department',
    severity: 'info',
    enabled: true,
    priority: 45,
    tags: ['眼科', '影像科', '眼底', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '眼' },
          { condition: 'in', field: 'examType', value: ['眼底造影', '眼底照相', '眼眶CT'] },
        ],
        message: '眼底检查需眼科与影像科协同'
      }
    },
    message: '眼底影像检查请眼科与影像科协调安排',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT015',
    name: '皮肤科与病理科协同-皮肤活检',
    description: '皮肤活检需皮肤科与病理科协同',
    type: 'restriction',
    category: 'department',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['皮肤科', '病理科', '活检', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '皮肤' },
          { condition: 'contains', field: 'examType', value: '活检' },
        ],
        message: '皮肤活检需皮肤科与病理科协同'
      }
    },
    message: '皮肤活检请皮肤科与病理科协调取材和检测时间',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT016',
    name: '感染科与影像科协同-感染患者',
    description: '感染性疾病患者影像检查需感染科与影像科协同',
    type: 'restriction',
    category: 'department',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['感染科', '影像科', '感染', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '感染' },
          { condition: 'in', field: 'modality', value: ['CT', 'X线'] },
        ],
        message: '感染患者影像检查需感染科与影像科协同'
      }
    },
    message: '感染性疾病患者影像检查需做好防护并与影像科协同安排',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT017',
    name: '老年科与多科室协同-老年患者',
    description: '老年患者多系统检查需老年科与多个影像科室协同',
    type: 'restriction',
    category: 'department',
    severity: 'info',
    enabled: true,
    priority: 40,
    tags: ['老年科', '多科室', '老年', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'gt', field: 'patientAge', value: 65 },
          { condition: 'gt', field: 'examBodyPartsCount', value: 2 },
        ],
        message: '老年患者多部位检查需老年科协调'
      }
    },
    message: '老年患者多部位检查请老年科统一协调各影像科室安排',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT018',
    name: 'ICU与影像科协同-危重患者',
    description: 'ICU危重患者影像检查需ICU与影像科床旁协同',
    type: 'restriction',
    category: 'department',
    severity: 'error',
    enabled: true,
    priority: 5,
    tags: ['ICU', '影像科', '危重', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'patientType', value: '住院' },
          { condition: 'eq', field: 'departmentName', value: 'ICU' },
          { condition: 'in', field: 'modality', value: ['床旁X线', '床旁超声', 'CT'] },
        ],
        message: 'ICU危重患者检查需ICU与影像科床旁协同'
      }
    },
    message: 'ICU危重患者影像检查需提前与影像科预约床旁检查服务',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT019',
    name: '中医科与影像科协同-中医辨证检查',
    description: '中医辨证需影像学支持时需中医科与影像科协同',
    type: 'restriction',
    category: 'department',
    severity: 'info',
    enabled: true,
    priority: 55,
    tags: ['中医科', '影像科', '中医', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'contains', field: 'clinicalDiagnosis', value: '中医' },
          { condition: 'in', field: 'modality', value: ['CT', 'MRI', '超声'] },
        ],
        message: '中医辨证影像检查需中医科与影像科协同'
      }
    },
    message: '中医辨证所需影像学检查请中医科与影像科协调',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'DEPT020',
    name: '体检科与各科室协同-团体体检',
    description: '团体体检需体检科与各检查科室协同安排',
    type: 'restriction',
    category: 'department',
    severity: 'info',
    enabled: true,
    priority: 50,
    tags: ['体检科', '多科室', '团体', '协同'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'patientType', value: '体检' },
          { condition: 'gt', field: 'examBodyPartsCount', value: 3 },
        ],
        message: '团体体检需体检科统一协调'
      }
    },
    message: '团体体检请体检科提前与各检查科室协调分流安排',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
];

// ==================== 保险规则（25个） ====================
export const INSURANCE_RULES: Rule[] = [
  {
    id: 'INSU001',
    name: '医保患者CT检查限制',
    description: '医保患者CT检查每月限报销5次，超过需自费',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['医保', 'CT', '限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '医保' },
          { condition: 'eq', field: 'modality', value: 'CT' },
          { condition: 'gt', field: 'monthlyCTCount', value: 5 },
        ],
        message: '医保患者CT检查每月限报销5次'
      }
    },
    message: '该患者本月CT检查已超过5次医保报销限额，超出部分需自费',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU002',
    name: '自费患者MRI检查优惠',
    description: '自费患者MRI检查可享受8折优惠',
    type: 'restriction',
    category: 'insurance',
    severity: 'info',
    enabled: true,
    priority: 20,
    tags: ['自费', 'MRI', '优惠'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'insuranceType',
        value: '自费',
        message: '自费患者MRI检查可享受8折优惠'
      }
    },
    message: '自费患者MRI检查可享受8折优惠',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU003',
    name: '商业保险与医保互斥',
    description: '同一检查不能同时使用商业保险和医保',
    type: 'restriction',
    category: 'insurance',
    severity: 'error',
    enabled: true,
    priority: 40,
    tags: ['商业保险', '医保', '互斥'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'hasCommercialInsurance', value: true },
          { condition: 'eq', field: 'useMedicalInsurance', value: true },
        ],
        message: '同一检查不能同时使用商业保险和医保'
      }
    },
    message: '商业保险和医保不能同时使用，请选择一种支付方式',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU004',
    name: '生育保险CT检查限制',
    description: '生育保险参保人员CT检查需提前审批',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 35,
    tags: ['生育保险', 'CT', '审批'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '生育保险' },
          { condition: 'eq', field: 'modality', value: 'CT' },
        ],
        message: '生育保险CT检查需提前审批'
      }
    },
    message: '生育保险参保人员CT检查需提前到医保办审批',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU005',
    name: '工伤保险专项检查限制',
    description: '工伤保险患者只能进行与工伤相关的检查项目',
    type: 'restriction',
    category: 'insurance',
    severity: 'error',
    enabled: true,
    priority: 50,
    tags: ['工伤保险', '检查项目', '限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '工伤保险' },
          { condition: 'eq', field: 'isWorkRelated', value: false },
        ],
        message: '工伤保险只能报销与工伤相关的检查'
      }
    },
    message: '工伤保险只能报销与工伤相关的检查项目，非工伤相关费用自理',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU006',
    name: '居民医保MRI年度限制',
    description: '居民医保MRI检查每年限报销3次',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['居民医保', 'MRI', '年度限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '居民医保' },
          { condition: 'eq', field: 'modality', value: 'MRI' },
          { condition: 'gt', field: 'yearlyMRICount', value: 3 },
        ],
        message: '居民医保MRI每年限报销3次'
      }
    },
    message: '该患者本年MRI检查已超过3次居民医保报销限额',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU007',
    name: '职工医保超声检查限制',
    description: '职工医保超声检查每月限报销8次',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['职工医保', '超声', '限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '职工医保' },
          { condition: 'eq', field: 'modality', value: '超声' },
          { condition: 'gt', field: 'monthlyUltrasoundCount', value: 8 },
        ],
        message: '职工医保超声检查每月限报销8次'
      }
    },
    message: '该患者本月超声检查已超过8次职工医保报销限额',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU008',
    name: '大学生医保寒暑假检查限制',
    description: '大学生医保在寒暑假期间检查费用自理',
    type: 'restriction',
    category: 'insurance',
    severity: 'info',
    enabled: true,
    priority: 20,
    tags: ['大学生医保', '寒暑假', '限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '大学生医保' },
          { condition: 'in', field: 'isVacationPeriod', value: [true] },
        ],
        message: '大学生医保寒暑假期间检查费用自理'
      }
    },
    message: '大学生医保在寒暑假期间需自费，请知悉',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU009',
    name: '新农合CT平扫限制',
    description: '新农合参保人员CT平扫限每月2次',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['新农合', 'CT平扫', '限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '新农合' },
          { condition: 'contains', field: 'examItemName', value: 'CT平扫' },
          { condition: 'gt', field: 'monthlyCTPlainCount', value: 2 },
        ],
        message: '新农合CT平扫每月限2次'
      }
    },
    message: '该患者本月CT平扫已超过2次新农合报销限额',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU010',
    name: '补充医疗保险二次报销',
    description: '拥有补充医疗保险的患者可享受二次报销',
    type: 'restriction',
    category: 'insurance',
    severity: 'info',
    enabled: true,
    priority: 15,
    tags: ['补充医疗保险', '二次报销'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'hasSupplementaryInsurance',
        value: true,
        message: '补充医疗保险可享受二次报销'
      }
    },
    message: '该患者有补充医疗保险，可申请二次报销',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU011',
    name: '离休干部医疗证检查全免',
    description: '离休干部持医疗证检查费用全免',
    type: 'restriction',
    category: 'insurance',
    severity: 'info',
    enabled: true,
    priority: 10,
    tags: ['离休干部', '全免'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'isRetiredCadre',
        value: true,
        message: '离休干部检查费用全免'
      }
    },
    message: '离休干部持医疗证检查费用全额报销',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU012',
    name: '儿童医保PET-CT限制',
    description: '儿童医保PET-CT检查需主任医师审批',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 40,
    tags: ['儿童医保', 'PET-CT', '审批'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '儿童医保' },
          { condition: 'eq', field: 'modality', value: 'PET-CT' },
          { condition: 'lt', field: 'patientAge', value: 18 },
        ],
        message: '儿童PET-CT检查需主任医师审批'
      }
    },
    message: '未成年人PET-CT检查需主任医师签字审批',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU013',
    name: '特殊药品检查互斥',
    description: '使用特殊药品的患者不能进行某些影像检查',
    type: 'restriction',
    category: 'insurance',
    severity: 'error',
    enabled: true,
    priority: 45,
    tags: ['特殊药品', '影像检查', '互斥'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isOnSpecialMedication', value: true },
          { condition: 'in', field: 'modality', value: ['PET-CT', 'SPECT'] },
        ],
        message: '使用特殊药物的患者不能进行PET-CT或SPECT检查'
      }
    },
    message: '患者正在使用特殊药品，需咨询医生后才能预约PET-CT或SPECT',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU014',
    name: '器官移植抗排异检查限制',
    description: '器官移植患者抗排异治疗期间影像检查需审批',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 35,
    tags: ['器官移植', '抗排异', '审批'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isOrganTransplant', value: true },
          { condition: 'eq', field: 'isOnAntirejection', value: true },
          { condition: 'in', field: 'modality', value: ['CT', 'MRI', 'X线'] },
        ],
        message: '器官移植抗排异期间影像检查需审批'
      }
    },
    message: '器官移植患者抗排异治疗期间影像检查需提前到医保办审批',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU015',
    name: '慢性病档案患者检查优惠',
    description: '慢性病档案患者可享受检查费用优惠',
    type: 'restriction',
    category: 'insurance',
    severity: 'info',
    enabled: true,
    priority: 15,
    tags: ['慢性病', '优惠'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'hasChronicDisease档案',
        value: true,
        message: '慢性病档案患者检查可优惠10%'
      }
    },
    message: '慢性病档案患者检查费用可优惠10%',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU016',
    name: '跨省医保备案检查限制',
    description: '跨省医保患者需提前备案才能报销',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['跨省医保', '备案', '限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '跨省医保' },
          { condition: 'eq', field: 'hasCrossProvince备案', value: false },
        ],
        message: '跨省医保需提前办理备案才能报销'
      }
    },
    message: '跨省医保患者需提前到参保地医保中心办理备案，否则费用自理',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU017',
    name: '城乡居民医保CT增强限制',
    description: '城乡居民医保CT增强检查限每年2次',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['城乡居民医保', 'CT增强', '限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '城乡居民医保' },
          { condition: 'contains', field: 'examItemName', value: 'CT增强' },
          { condition: 'gt', field: 'yearlyCTContrastCount', value: 2 },
        ],
        message: '城乡居民医保CT增强每年限2次'
      }
    },
    message: '该患者本年CT增强检查已超过2次城乡居民医保报销限额',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU018',
    name: '企业补充医保检查限额',
    description: '企业补充医保检查项目限每年10次',
    type: 'restriction',
    category: 'insurance',
    severity: 'info',
    enabled: true,
    priority: 20,
    tags: ['企业补充医保', '限额'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '企业补充医保' },
          { condition: 'gt', field: 'yearlyExamCount', value: 10 },
        ],
        message: '企业补充医保检查每年限10次'
      }
    },
    message: '该患者本年检查已超过10次企业补充医保限额',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU019',
    name: '军保干部检查全免',
    description: '军保干部持保障卡检查费用全免',
    type: 'restriction',
    category: 'insurance',
    severity: 'info',
    enabled: true,
    priority: 10,
    tags: ['军保', '全免'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'isMilitaryInsurance',
        value: true,
        message: '军保干部检查费用全免'
      }
    },
    message: '军保干部持保障卡检查费用全额报销',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU020',
    name: '低保患者检查费用减免',
    description: '低保患者凭低保证可享受检查费用减免',
    type: 'restriction',
    category: 'insurance',
    severity: 'info',
    enabled: true,
    priority: 15,
    tags: ['低保', '减免'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'isLowIncome',
        value: true,
        message: '低保患者检查费用可申请减免'
      }
    },
    message: '低保患者凭低保证可到收费窗口申请检查费用减免',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU021',
    name: '特需医疗与医保互斥',
    description: '特需医疗服务不能使用医保支付',
    type: 'restriction',
    category: 'insurance',
    severity: 'error',
    enabled: true,
    priority: 45,
    tags: ['特需医疗', '医保', '互斥'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'isSpecialNeeds', value: true },
          { condition: 'eq', field: 'useMedicalInsurance', value: true },
        ],
        message: '特需医疗服务不能使用医保支付'
      }
    },
    message: '特需医疗项目需自费，医保不覆盖此类服务',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU022',
    name: '康复保险检查项目限制',
    description: '康复保险检查项目需在康复科医师指导下进行',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['康复保险', '限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '康复保险' },
          { condition: 'in', field: 'modality', value: ['超声', 'X线', 'CT'] },
        ],
        message: '康复保险检查需在康复科医师指导下进行'
      }
    },
    message: '康复保险患者影像检查需经康复科医师开单方可报销',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU023',
    name: '省医保CT季度限制',
    description: '省医保CT检查每季度限报销4次',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 28,
    tags: ['省医保', 'CT', '季度限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '省医保' },
          { condition: 'eq', field: 'modality', value: 'CT' },
          { condition: 'gt', field: 'quarterlyCTCount', value: 4 },
        ],
        message: '省医保CT每季度限4次'
      }
    },
    message: '该患者本季度CT检查已超过4次省医保报销限额',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU024',
    name: '家庭共济账户使用限制',
    description: '医保家庭共济账户只能用于直系亲属',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 30,
    tags: ['家庭共济', '限制'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'useFamilyAccount', value: true },
          { condition: 'eq', field: 'isDirectRelative', value: false },
        ],
        message: '医保家庭共济账户只能用于直系亲属'
      }
    },
    message: '家庭共济账户仅限父母、配偶、子女使用',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'INSU025',
    name: '跨境劳务人员医保备案限制',
    description: '跨境劳务人员需提前备案才能使用医保',
    type: 'restriction',
    category: 'insurance',
    severity: 'warning',
    enabled: true,
    priority: 25,
    tags: ['跨境劳务', '医保', '备案'],
    config: {
      restrictionConfig: {
        condition: 'and',
        subConditions: [
          { condition: 'eq', field: 'insuranceType', value: '跨境劳务医保' },
          { condition: 'eq', field: 'hasOverseasWork备案', value: false },
        ],
        message: '跨境劳务人员医保需提前备案'
      }
    },
    message: '跨境劳务人员需到医保中心办理境外工作备案后方可使用医保',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
];

// ==================== 危急/急诊规则（24个） ====================
export const EMERGENCY_RULES: Rule[] = [
  {
    id: 'EMRG001',
    name: '急性胸痛患者绿色通道',
    description: '急性胸痛患者直接进入绿色通道，优先预约冠脉CTA',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['胸痛', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性胸痛',
        message: '急性胸痛患者享受绿色通道'
      }
    },
    message: '急性胸痛患者优先安排冠脉CTA检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG002',
    name: '急性脑卒中患者绿色通道',
    description: '急性脑卒中患者直接进入绿色通道，优先预约头颅CT/MRI',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['脑卒中', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性脑卒中',
        message: '急性脑卒中患者享受绿色通道'
      }
    },
    message: '急性脑卒中患者优先安排头颅CT或MRI检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG003',
    name: '多发伤患者优先检查',
    description: '多发伤患者可同时预约多个部位CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['多发伤', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '多发伤',
        message: '多发伤患者可同时预约多个部位'
      }
    },
    message: '多发伤患者可同时预约多个部位CT检查，不受同日检查数量限制',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG004',
    name: '急性腹痛患者快速检查',
    description: '急腹症患者24小时内完成腹部CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 95,
    tags: ['急腹症', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急腹症',
        message: '急腹症患者24小时内完成检查'
      }
    },
    message: '急腹症患者应在24小时内完成腹部CT检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG005',
    name: '咯血患者紧急检查',
    description: '咯血患者优先预约胸部CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 95,
    tags: ['咯血', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '咯血',
        message: '咯血患者优先检查'
      }
    },
    message: '咯血患者优先预约胸部CT检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG006',
    name: '消化道出血紧急检查',
    description: '消化道出血患者优先胃镜/肠镜检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 95,
    tags: ['消化道出血', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '消化道出血',
        message: '消化道出血患者优先检查'
      }
    },
    message: '消化道出血患者优先预约胃镜或肠镜检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG007',
    name: '高危孕产妇紧急检查',
    description: '高危孕产妇可随时预约产科超声检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['孕产妇', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '高危孕产妇',
        message: '高危孕产妇优先检查'
      }
    },
    message: '高危孕产妇可随时预约产科超声检查，享受绿色通道',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG008',
    name: '急性呼吸衰竭患者检查',
    description: '急性呼吸衰竭患者优先床旁X光检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['呼吸衰竭', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性呼吸衰竭',
        message: '急性呼吸衰竭患者优先检查'
      }
    },
    message: '急性呼吸衰竭患者优先安排床旁X光检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG009',
    name: '急性心肌梗死绿色通道',
    description: '急性心肌梗死患者直接进入绿色通道，优先冠脉造影',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['心肌梗死', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性心肌梗死',
        message: '急性心肌梗死患者享受绿色通道'
      }
    },
    message: '急性心肌梗死患者优先冠脉造影检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG010',
    name: '主动脉夹层紧急检查',
    description: '主动脉夹层患者优先全身CT血管造影',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['主动脉夹层', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '主动脉夹层',
        message: '主动脉夹层患者享受绿色通道'
      }
    },
    message: '主动脉夹层患者优先CT血管造影检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG011',
    name: '急性肺栓塞绿色通道',
    description: '急性肺栓塞患者优先CT肺动脉造影',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['肺栓塞', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性肺栓塞',
        message: '急性肺栓塞患者享受绿色通道'
      }
    },
    message: '急性肺栓塞患者优先CT肺动脉造影检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG012',
    name: '骨折患者急诊检查',
    description: '骨折患者优先X光检查，24小时内出具报告',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 80,
    tags: ['骨折', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '骨折',
        message: '骨折患者优先检查'
      }
    },
    message: '骨折患者优先X光检查，24小时内出具报告',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG013',
    name: '儿童高热惊厥紧急检查',
    description: '儿童高热惊厥优先头颅CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 95,
    tags: ['高热惊厥', '绿色通道', '儿童急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '高热惊厥',
        message: '儿童高热惊厥优先检查'
      }
    },
    message: '儿童高热惊厥优先头颅CT检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG014',
    name: '急性中毒患者检查',
    description: '急性中毒患者优先相关毒物检测检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 95,
    tags: ['中毒', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性中毒',
        message: '急性中毒患者优先检查'
      }
    },
    message: '急性中毒患者优先安排相关影像检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG015',
    name: '急性胰腺炎紧急检查',
    description: '急性胰腺炎患者优先腹部CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 90,
    tags: ['胰腺炎', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性胰腺炎',
        message: '急性胰腺炎患者优先检查'
      }
    },
    message: '急性胰腺炎患者优先腹部CT检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG016',
    name: '肠梗阻紧急检查',
    description: '肠梗阻患者优先腹部X光及CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 90,
    tags: ['肠梗阻', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '肠梗阻',
        message: '肠梗阻患者优先检查'
      }
    },
    message: '肠梗阻患者优先腹部X光及CT检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG017',
    name: '泌尿系结石急性发作',
    description: '泌尿系结石急性发作优先超声及CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 85,
    tags: ['泌尿系结石', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '泌尿系结石',
        message: '泌尿系结石急性发作优先检查'
      }
    },
    message: '泌尿系结石急性发作优先超声及CT检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG018',
    name: '急性阑尾炎检查',
    description: '急性阑尾炎患者优先腹部超声及CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 85,
    tags: ['阑尾炎', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性阑尾炎',
        message: '急性阑尾炎患者优先检查'
      }
    },
    message: '急性阑尾炎患者优先腹部超声及CT检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG019',
    name: '肝破裂出血紧急检查',
    description: '肝破裂出血患者优先腹部CT及超声检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['肝破裂', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '肝破裂',
        message: '肝破裂出血患者享受绿色通道'
      }
    },
    message: '肝破裂出血患者优先腹部CT及超声检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG020',
    name: '脾破裂出血紧急检查',
    description: '脾破裂出血患者优先腹部CT及超声检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['脾破裂', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '脾破裂',
        message: '脾破裂出血患者享受绿色通道'
      }
    },
    message: '脾破裂出血患者优先腹部CT及超声检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG021',
    name: '肾破裂出血紧急检查',
    description: '肾破裂出血患者优先腹部CT及超声检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['肾破裂', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '肾破裂',
        message: '肾破裂出血患者享受绿色通道'
      }
    },
    message: '肾破裂出血患者优先腹部CT及超声检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG022',
    name: '颅脑外伤紧急检查',
    description: '颅脑外伤患者优先头颅CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 95,
    tags: ['颅脑外伤', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '颅脑外伤',
        message: '颅脑外伤患者优先检查'
      }
    },
    message: '颅脑外伤患者优先头颅CT检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG023',
    name: '急性心衰患者检查',
    description: '急性心力衰竭患者优先心脏超声及胸部X光检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 95,
    tags: ['心力衰竭', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性心力衰竭',
        message: '急性心衰患者优先检查'
      }
    },
    message: '急性心力衰竭患者优先心脏超声及胸部X光检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
  {
    id: 'EMRG024',
    name: '急性消化道穿孔检查',
    description: '急性消化道穿孔患者优先腹部X光及CT检查',
    type: 'restriction',
    category: 'emergency',
    severity: 'info',
    enabled: true,
    priority: 100,
    tags: ['消化道穿孔', '绿色通道', '急诊'],
    config: {
      restrictionConfig: {
        condition: 'eq',
        field: 'clinicalDiagnosis',
        value: '急性消化道穿孔',
        message: '消化道穿孔患者享受绿色通道'
      }
    },
    message: '急性消化道穿孔患者优先腹部X光及CT检查',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
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

// ==================== 规则组合导出 ====================
export const ALL_RULES: Rule[] = [
  ...MUTEX_RULES,
  ...RESTRICTION_RULES,
  ...PRIORITY_RULES,
  ...TIME_CONSTRAINT_RULES,
  ...DEPT_RULES,
  ...INSURANCE_RULES,
  ...EMERGENCY_RULES,
];

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
    deptCount: DEPT_RULES.length,
    insuranceCount: INSURANCE_RULES.length,
    emergencyCount: EMERGENCY_RULES.length,
  };
}
