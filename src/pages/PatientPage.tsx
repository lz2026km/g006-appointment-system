// G006 全院医技检查预约系统 - 患者管理
// 汉东省人民医院全院医技检查预约系统
import React, { useState, useMemo } from 'react';
import {
  Search, Users, User, Phone, Calendar, MapPin, Plus, X, ChevronLeft, ChevronRight,
  Eye, Edit2, Trash2, Filter, RefreshCw, ChevronDown, ChevronUp,
  Clock, AlertCircle, CheckCircle, FileText, History, Download
} from 'lucide-react';
import { PATIENTS, APPOINTMENTS } from '../data/initialData';
import type { Patient, Appointment } from '../types';

// ==================== 类型定义 ====================
type TabKey = 'list' | 'detail'
type GenderFilter = '全部' | '男' | '女'
type PatientTypeFilter = '全部' | '门诊' | '住院' | '体检' | '急诊'

interface AdvancedFilters {
  gender: GenderFilter
  ageMin: string
  ageMax: string
  patientType: PatientTypeFilter
  dateFrom: string
  dateTo: string
}

// ==================== 工具函数 ====================
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr
}

const getPatientAppointments = (patientId: string, appointments: Appointment[]) => {
  return appointments.filter(a => a.patientId === patientId)
}

// ==================== 子组件：统计卡片 ====================
interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  bgColor: string
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px 20px',
      border: '1px solid #e8e8e8',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

// ==================== 子组件：分页控件 ====================
interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid #e8e8e8',
      background: '#f8fafc',
    }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>
        显示 {startItem}-{endItem} 条，共 {totalItems} 条记录
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid #e8e8e8',
            background: '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={16} color="#64748b" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = i + 1
          if (totalPages > 5) {
            if (currentPage > 3) {
              pageNum = currentPage - 2 + i
            }
            if (currentPage > totalPages - 2) {
              pageNum = totalPages - 4 + i
            }
          }
          if (pageNum < 1 || pageNum > totalPages) return null
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: 32,
                height: 32,
                borderRadius: 6,
                border: '1px solid',
                borderColor: currentPage === pageNum ? '#1e40af' : '#e8e8e8',
                background: currentPage === pageNum ? '#1e40af' : '#fff',
                color: currentPage === pageNum ? '#fff' : '#64748b',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                padding: '0 8px',
              }}
            >
              {pageNum}
            </button>
          )
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1px solid #e8e8e8',
            background: '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={16} color="#64748b" />
        </button>
      </div>
    </div>
  )
}

// ==================== 子组件：高级筛选面板 ====================
interface AdvancedFilterPanelProps {
  filters: AdvancedFilters
  onChange: (filters: AdvancedFilters) => void
  onReset: () => void
}

function AdvancedFilterPanel({ filters, onChange, onReset }: AdvancedFilterPanelProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #e8e8e8',
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {/* 性别筛选 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>性别</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['全部', '男', '女'] as GenderFilter[]).map(g => (
              <button
                key={g}
                onClick={() => onChange({ ...filters, gender: g })}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: filters.gender === g ? '#1e40af' : '#e8e8e8',
                  background: filters.gender === g ? '#1e40af' : '#fff',
                  color: filters.gender === g ? '#fff' : '#64748b',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 年龄范围 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>年龄范围</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="number"
              value={filters.ageMin}
              onChange={e => onChange({ ...filters, ageMin: e.target.value })}
              placeholder="最小"
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid #e8e8e8',
                fontSize: 12,
                outline: 'none',
                width: '100%',
              }}
            />
            <span style={{ color: '#64748b', fontSize: 12 }}>-</span>
            <input
              type="number"
              value={filters.ageMax}
              onChange={e => onChange({ ...filters, ageMax: e.target.value })}
              placeholder="最大"
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid #e8e8e8',
                fontSize: 12,
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* 患者类型 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>患者类型</label>
          <select
            value={filters.patientType}
            onChange={e => onChange({ ...filters, patientType: e.target.value as PatientTypeFilter })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e8e8e8',
              fontSize: 12,
              outline: 'none',
              background: '#fff',
            }}
          >
            {(['全部', '门诊', '住院', '体检', '急诊'] as PatientTypeFilter[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* 建档日期从 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>建档日期从</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e8e8e8',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        {/* 建档日期至 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>建档日期至</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => onChange({ ...filters, dateTo: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #e8e8e8',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button
            onClick={onReset}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e8e8e8',
              background: '#fff',
              color: '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <RefreshCw size={12} />
            重置
          </button>
          <button
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: '#1e40af',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Search size={12} />
            筛选
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
interface PatientPageProps {
  currentRole: string
}

export default function PatientPage({ currentRole }: PatientPageProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<AdvancedFilters>({
    gender: '全部',
    ageMin: '',
    ageMax: '',
    patientType: '全部',
    dateFrom: '',
    dateTo: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // 详情相关
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('list')

  // 新建/编辑表单
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    age: '',
    phone: '',
    idCard: '',
    address: '',
    patientType: '门诊',
    registrationDate: new Date().toISOString().split('T')[0],
  })

  // 过滤后的患者列表
  const filteredPatients = useMemo(() => {
    let list = [...PATIENTS]
    
    // 关键词搜索
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(kw) ||
        p.id.toLowerCase().includes(kw) ||
        p.phone.includes(kw) ||
        p.idCard.includes(kw)
      )
    }

    // 性别筛选
    if (filters.gender !== '全部') {
      list = list.filter(p => p.gender === filters.gender)
    }

    // 年龄筛选
    if (filters.ageMin) {
      list = list.filter(p => p.age >= parseInt(filters.ageMin))
    }
    if (filters.ageMax) {
      list = list.filter(p => p.age <= parseInt(filters.ageMax))
    }

    // 患者类型筛选
    if (filters.patientType !== '全部') {
      list = list.filter(p => p.patientType === filters.patientType)
    }

    // 日期筛选
    if (filters.dateFrom) {
      list = list.filter(p => p.registrationDate >= filters.dateFrom)
    }
    if (filters.dateTo) {
      list = list.filter(p => p.registrationDate <= filters.dateTo)
    }

    return list
  }, [searchKeyword, filters])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize))
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // 统计
  const stats = useMemo(() => {
    return {
      total: PATIENTS.length,
      male: PATIENTS.filter(p => p.gender === '男').length,
      female: PATIENTS.filter(p => p.gender === '女').length,
      today: PATIENTS.filter(p => p.registrationDate === new Date().toISOString().split('T')[0]).length,
    }
  }, [])

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({
      gender: '全部',
      ageMin: '',
      ageMax: '',
      patientType: '全部',
      dateFrom: '',
      dateTo: '',
    })
    setSearchKeyword('')
    setCurrentPage(1)
  }

  // 打开详情
  const handleViewDetail = (patient: Patient) => {
    setSelectedPatient(patient)
    setActiveTab('detail')
  }

  // 打开新建表单
  const handleOpenForm = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient)
      setFormData({
        name: patient.name,
        gender: patient.gender,
        age: String(patient.age),
        phone: patient.phone,
        idCard: patient.idCard,
        address: patient.address,
        patientType: patient.patientType,
        registrationDate: patient.registrationDate,
      })
    } else {
      setEditingPatient(null)
      setFormData({
        name: '',
        gender: '男',
        age: '',
        phone: '',
        idCard: '',
        address: '',
        patientType: '门诊',
        registrationDate: new Date().toISOString().split('T')[0],
      })
    }
    setShowForm(true)
  }

  // 提交表单
  const handleSubmitForm = () => {
    if (!formData.name || !formData.age || !formData.phone) {
      alert('请填写必填字段')
      return
    }
    alert(editingPatient ? '患者信息已更新' : '患者信息已创建')
    setShowForm(false)
  }

  // 获取患者预约记录
  const getPatientAppointmentsList = (patientId: string) => {
    return APPOINTMENTS.filter(a => a.patientId === patientId)
  }

  // 状态颜色配置
  const statusColors: Record<string, { bg: string; color: string }> = {
    '待确认': { bg: '#fef9c3', color: '#ca8a04' },
    '已确认': { bg: '#d1fae5', color: '#059669' },
    '已签到': { bg: '#dbeafe', color: '#2563eb' },
    '检查中': { bg: '#e0e7ff', color: '#4f46e5' },
    '已完成': { bg: '#d1fae5', color: '#059669' },
    '已取消': { bg: '#f1f5f9', color: '#64748b' },
    '超时取消': { bg: '#fee2e2', color: '#dc2626' },
    '改签': { bg: '#fef3c7', color: '#d97706' },
  }

  return (
    <div style={{ padding: 20 }}>
      {/* 头部 */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>患者管理</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>管理患者信息，查看预约记录</p>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard
          label="患者总数"
          value={stats.total}
          icon={<Users size={24} />}
          color="#1e40af"
          bgColor="#dbeafe"
        />
        <StatCard
          label="男性患者"
          value={stats.male}
          icon={<User size={24} />}
          color="#0f766e"
          bgColor="#ccfbf1"
        />
        <StatCard
          label="女性患者"
          value={stats.female}
          icon={<User size={24} />}
          color="#c026d3"
          bgColor="#f5d0fe"
        />
        <StatCard
          label="今日新增"
          value={stats.today}
          icon={<Calendar size={24} />}
          color="#d97706"
          bgColor="#fef3c7"
        />
      </div>

      {/* 标签页 */}
      <div style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #e8e8e8',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e8e8e8',
          background: '#f8fafc'
        }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'list' ? '3px solid #1e40af' : '3px solid transparent',
              background: activeTab === 'list' ? '#fff' : 'transparent',
              color: activeTab === 'list' ? '#1e40af' : '#64748b',
              fontWeight: activeTab === 'list' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <Users size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            患者列表
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            disabled={!selectedPatient}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'detail' ? '3px solid #1e40af' : '3px solid transparent',
              background: activeTab === 'detail' ? '#fff' : 'transparent',
              color: activeTab === 'detail' ? '#1e40af' : '#64748b',
              fontWeight: activeTab === 'detail' ? 700 : 500,
              fontSize: 13,
              cursor: selectedPatient ? 'pointer' : 'not-allowed',
              opacity: selectedPatient ? 1 : 0.5,
            }}
          >
            <FileText size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            患者详情
          </button>
        </div>

        {/* 列表视图 */}
        {activeTab === 'list' && (
          <div>
            {/* 搜索和筛选工具栏 */}
            <div style={{ padding: 16, borderBottom: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: showAdvanced ? 16 : 0 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="搜索患者姓名、身份证号、手机号..."
                    value={searchKeyword}
                    onChange={e => { setSearchKeyword(e.target.value); setCurrentPage(1); }}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    background: showAdvanced ? '#1e40af' : '#fff',
                    color: showAdvanced ? '#fff' : '#64748b',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Filter size={16} />
                  高级筛选
                  {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {(currentRole === '管理员' || currentRole === '前台') && (
                  <button
                    onClick={() => handleOpenForm()}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#1e40af',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Plus size={16} />
                    新建患者
                  </button>
                )}
              </div>

              {showAdvanced && (
                <AdvancedFilterPanel
                  filters={filters}
                  onChange={setFilters}
                  onReset={handleResetFilters}
                />
              )}
            </div>

            {/* 患者列表 */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>患者信息</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>性别/年龄</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>联系电话</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>患者类型</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>建档日期</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>预约次数</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map(patient => (
                    <tr key={patient.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: patient.gender === '男' ? '#dbeafe' : '#f5d0fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: patient.gender === '男' ? '#1e40af' : '#c026d3',
                            fontWeight: 700,
                            fontSize: 14,
                          }}>
                            {patient.name.slice(0, 1)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#1e3a5f' }}>{patient.name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: {patient.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                        {patient.gender} / {patient.age}岁
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                        {patient.phone}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: patient.patientType === '住院' ? '#dbeafe' :
                            patient.patientType === '体检' ? '#d1fae5' :
                              patient.patientType === '急诊' ? '#fee2e2' : '#f1f5f9',
                          color: patient.patientType === '住院' ? '#1e40af' :
                            patient.patientType === '体检' ? '#059669' :
                              patient.patientType === '急诊' ? '#dc2626' : '#64748b',
                        }}>
                          {patient.patientType}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                        {formatDate(patient.registrationDate)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                        {patient.appointmentCount} 次
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleViewDetail(patient)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid #e8e8e8',
                            background: '#fff',
                            color: '#1e40af',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginRight: 8,
                          }}
                        >
                          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          详情
                        </button>
                        {(currentRole === '管理员' || currentRole === '前台') && (
                          <button
                            onClick={() => handleOpenForm(patient)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: '1px solid #e8e8e8',
                              background: '#fff',
                              color: '#64748b',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            编辑
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginatedPatients.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }}>
                        <Users size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
                        <div>暂无患者数据</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPatients.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* 详情视图 */}
        {activeTab === 'detail' && selectedPatient && (
          <div style={{ padding: 24 }}>
            {/* 返回按钮 */}
            <button
              onClick={() => setActiveTab('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #e8e8e8',
                background: '#fff',
                color: '#64748b',
                fontSize: 13,
                cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              <ChevronLeft size={16} />
              返回列表
            </button>

            {/* 患者基本信息 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={{
                background: '#f8fafc',
                borderRadius: 12,
                padding: 20,
                border: '1px solid #e8e8e8',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: selectedPatient.gender === '男' ? '#1e40af' : '#c026d3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 24,
                  }}>
                    {selectedPatient.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>{selectedPatient.name}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>ID: {selectedPatient.id}</p>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: selectedPatient.patientType === '住院' ? '#dbeafe' :
                        selectedPatient.patientType === '体检' ? '#d1fae5' :
                          selectedPatient.patientType === '急诊' ? '#fee2e2' : '#f1f5f9',
                      color: selectedPatient.patientType === '住院' ? '#1e40af' :
                        selectedPatient.patientType === '体检' ? '#059669' :
                          selectedPatient.patientType === '急诊' ? '#dc2626' : '#64748b',
                    }}>
                      {selectedPatient.patientType}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={14} color="#64748b" />
                    <span style={{ fontSize: 13, color: '#64748b' }}>{selectedPatient.gender} / {selectedPatient.age}岁</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={14} color="#64748b" />
                    <span style={{ fontSize: 13, color: '#64748b' }}>{selectedPatient.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: 'span 2' }}>
                    <MapPin size={14} color="#64748b" />
                    <span style={{ fontSize: 13, color: '#64748b' }}>{selectedPatient.address}</span>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: 12,
                padding: 20,
                border: '1px solid #e8e8e8',
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', margin: '0 0 16px 0' }}>详细信息</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>身份证号</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{selectedPatient.idCard}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>建档日期</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{formatDate(selectedPatient.registrationDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>预约次数</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>{selectedPatient.appointmentCount} 次</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 预约记录 */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e8e8e8',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e8e8e8',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <History size={18} color="#1e40af" />
                <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: 14 }}>预约记录</span>
                <span style={{
                  marginLeft: 'auto',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#dbeafe',
                  color: '#1e40af',
                }}>
                  {getPatientAppointmentsList(selectedPatient.id).length} 条
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>预约ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>检查项目</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>设备</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>预约时间</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>时段</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e8e8e8' }}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {getPatientAppointmentsList(selectedPatient.id).map(apt => (
                    <tr key={apt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{apt.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>
                        <div style={{ fontWeight: 500 }}>{apt.examItemName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{apt.modality}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{apt.deviceName}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{formatDate(apt.appointmentDate)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{apt.appointmentTime}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: statusColors[apt.status]?.bg || '#f1f5f9',
                          color: statusColors[apt.status]?.color || '#64748b',
                        }}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {getPatientAppointmentsList(selectedPatient.id).length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }}>
                        暂无预约记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 新建/编辑患者表单弹窗 */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            width: 500,
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e8e8e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
                {editingPatient ? '编辑患者' : '新建患者'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: 4,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                  姓名 <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    性别 <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    年龄 <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    手机号 <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    患者类型
                  </label>
                  <select
                    value={formData.patientType}
                    onChange={e => setFormData({ ...formData, patientType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="门诊">门诊</option>
                    <option value="住院">住院</option>
                    <option value="体检">体检</option>
                    <option value="急诊">急诊</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                  身份证号
                </label>
                <input
                  type="text"
                  value={formData.idCard}
                  onChange={e => setFormData({ ...formData, idCard: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                  地址
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                  建档日期
                </label>
                <input
                  type="date"
                  value={formData.registrationDate}
                  onChange={e => setFormData({ ...formData, registrationDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    background: '#fff',
                    color: '#64748b',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitForm}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#1e40af',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editingPatient ? '保存修改' : '创建患者'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
