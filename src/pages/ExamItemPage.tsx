// G006 全院医技检查预约系统 - 检查项目管理
// 汉东省人民医院全院医技检查预约系统
import React, { useState, useMemo } from 'react';
import {
  Search, Plus, X, ChevronLeft, ChevronRight, Eye, Edit2, Trash2,
  Filter, RefreshCw, ChevronDown, ChevronUp, Stethoscope,
  Clock, AlertCircle, CheckCircle, XCircle, FileText, Monitor, Building2,
  ToggleLeft, ToggleRight, Check
} from 'lucide-react';
import { ExamItem, Device } from '../types';
import { EXAM_ITEMS, DEVICES, DEPARTMENTS } from '../data/initialData';

// ==================== 类型定义 ====================
type ModalityFilter = '全部' | 'CT' | 'MRI' | '超声' | '内镜' | '心电' | 'X光'
type StatusFilter = '全部' | '启用' | '停用'

interface AdvancedFilters {
  modality: ModalityFilter
  department: string
  status: StatusFilter
  priceMin: string
  priceMax: string
}

// ==================== 常量 ====================
const MODALITY_OPTIONS: ModalityFilter[] = ['全部', 'CT', 'MRI', '超声', '内镜', '心电', 'X光']

const MODALITY_COLORS: Record<string, { bg: string; text: string }> = {
  'CT': { bg: '#dbeafe', text: '#1e40af' },
  'MRI': { bg: '#e0e7ff', text: '#3730a3' },
  '超声': { bg: '#d1fae5', text: '#065f46' },
  '内镜': { bg: '#fef3c7', text: '#92400e' },
  '心电': { bg: '#fce7f3', text: '#9d174d' },
  'X光': { bg: '#f3f4f6', text: '#374151' },
}

// ==================== 工具函数 ====================
const formatPrice = (price: number) => {
  return `¥${price.toFixed(2)}`
}

const formatDuration = (minutes: number) => {
  return `${minutes}分钟`
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
  const departmentOptions = ['全部', ...DEPARTMENTS.map(d => d.name)]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #e8e8e8',
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {/* 设备类型筛选 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>设备类型</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {MODALITY_OPTIONS.map(m => (
              <button
                key={m}
                onClick={() => onChange({ ...filters, modality: m })}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: filters.modality === m ? '#1e40af' : '#e8e8e8',
                  background: filters.modality === m ? '#1e40af' : '#fff',
                  color: filters.modality === m ? '#fff' : '#64748b',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* 科室筛选 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>所属科室</label>
          <select
            value={filters.department}
            onChange={e => onChange({ ...filters, department: e.target.value })}
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
            {departmentOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* 状态筛选 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>状态</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['全部', '启用', '停用'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => onChange({ ...filters, status: s })}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: filters.status === s ? '#1e40af' : '#e8e8e8',
                  background: filters.status === s ? '#1e40af' : '#fff',
                  color: filters.status === s ? '#fff' : '#64748b',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 价格范围 */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>价格范围</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="number"
              value={filters.priceMin}
              onChange={e => onChange({ ...filters, priceMin: e.target.value })}
              placeholder="最低"
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
              value={filters.priceMax}
              onChange={e => onChange({ ...filters, priceMax: e.target.value })}
              placeholder="最高"
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

        {/* 操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, gridColumn: 'span 4' }}>
          <button
            onClick={onReset}
            style={{
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
              gap: 4,
            }}
          >
            <RefreshCw size={12} />
            重置
          </button>
          <button
            style={{
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

// ==================== 子组件：详情弹窗 ====================
interface DetailModalProps {
  examItem: ExamItem
  devices: Device[]
  onClose: () => void
}

function DetailModal({ examItem, devices, onClose }: DetailModalProps) {
  const applicableDevices = devices.filter(d => examItem.applicableDeviceIds.includes(d.id))

  return (
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
        width: 600,
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e40af' }}>检查项目详情</h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
          }}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* 内容 */}
        <div style={{ padding: 20 }}>
          {/* 基本信息 */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e8e8e8' }}>
              基本信息
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InfoRow label="项目名称" value={examItem.name} />
              <InfoRow label="项目代码" value={examItem.code} />
              <InfoRow label="设备类型" value={
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: MODALITY_COLORS[examItem.modality]?.bg || '#f3f4f6',
                  color: MODALITY_COLORS[examItem.modality]?.text || '#374151',
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {examItem.modality}
                </span>
              } />
              {examItem.subModality && <InfoRow label="子类型" value={examItem.subModality} />}
              <InfoRow label="所属科室" value={examItem.departmentName} />
              <InfoRow label="执行时长" value={formatDuration(examItem.duration)} />
              <InfoRow label="收费标准" value={formatPrice(examItem.price)} />
              <InfoRow label="启用状态" value={
                examItem.isActive
                  ? <span style={{ color: '#10b981', fontWeight: 600 }}>启用</span>
                  : <span style={{ color: '#ef4444', fontWeight: 600 }}>停用</span>
              } />
            </div>
          </div>

          {/* 适用设备 */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e8e8e8' }}>
              适用设备
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {applicableDevices.length > 0 ? applicableDevices.map(d => (
                <div key={d.id} style={{
                  padding: '8px 12px',
                  background: '#f3f4f6',
                  borderRadius: 6,
                  fontSize: 12,
                }}>
                  <div style={{ fontWeight: 600, color: '#374151' }}>{d.name}</div>
                  <div style={{ color: '#64748b' }}>{d.location}</div>
                </div>
              )) : (
                <div style={{ color: '#64748b', fontSize: 12 }}>暂无可用设备</div>
              )}
            </div>
          </div>

          {/* 检查须知 */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e8e8e8' }}>
              检查须知
            </h4>
            <div style={{
              padding: 12,
              background: '#fef3c7',
              borderRadius: 6,
              border: '1px solid #fcd34d',
              fontSize: 13,
              color: '#92400e',
              lineHeight: 1.6,
            }}>
              {examItem.preparationNotes}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{value}</div>
    </div>
  )
}

// ==================== 子组件：编辑/新建弹窗 ====================
interface FormModalProps {
  examItem: ExamItem | null
  devices: Device[]
  departments: typeof DEPARTMENTS
  onSave: (item: ExamItem) => void
  onClose: () => void
}

function FormModal({ examItem, devices, departments, onSave, onClose }: FormModalProps) {
  const [formData, setFormData] = useState({
    name: examItem?.name || '',
    code: examItem?.code || '',
    modality: examItem?.modality || 'CT',
    subModality: examItem?.subModality || '',
    departmentId: examItem?.departmentId || '',
    departmentName: examItem?.departmentName || '',
    duration: examItem?.duration || 15,
    price: examItem?.price || 0,
    preparationNotes: examItem?.preparationNotes || '',
    applicableDeviceIds: examItem?.applicableDeviceIds || [],
    isActive: examItem?.isActive ?? true,
  })

  const handleDepartmentChange = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId)
    setFormData(prev => ({
      ...prev,
      departmentId: deptId,
      departmentName: dept?.name || '',
    }))
  }

  const handleDeviceToggle = (deviceId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableDeviceIds: prev.applicableDeviceIds.includes(deviceId)
        ? prev.applicableDeviceIds.filter(id => id !== deviceId)
        : [...prev.applicableDeviceIds, deviceId],
    }))
  }

  const handleSubmit = () => {
    const newItem: ExamItem = {
      id: examItem?.id || `EI${String(Date.now()).slice(-6)}`,
      ...formData,
    }
    onSave(newItem)
  }

  const modalityDevices = devices.filter(d => d.modality === formData.modality)

  return (
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
        width: 650,
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e40af' }}>
            {examItem ? '编辑检查项目' : '新建检查项目'}
          </h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
          }}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* 表单 */}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* 项目名称 */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                项目名称 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e8e8e8',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 项目代码 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                项目代码 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e8e8e8',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 设备类型 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                设备类型 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.modality}
                onChange={e => setFormData(prev => ({ ...prev, modality: e.target.value, applicableDeviceIds: [] }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e8e8e8',
                  fontSize: 13,
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                }}
              >
                {MODALITY_OPTIONS.filter(m => m !== '全部').map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 子类型 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                子类型
              </label>
              <input
                type="text"
                value={formData.subModality}
                onChange={e => setFormData(prev => ({ ...prev, subModality: e.target.value }))}
                placeholder="如：CTA、增强等"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e8e8e8',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 所属科室 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                所属科室 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.departmentId}
                onChange={e => handleDepartmentChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e8e8e8',
                  fontSize: 13,
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">请选择科室</option>
                {departments.filter(d => d.type === '医技' || d.type === '临床').map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* 执行时长 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                执行时长(分钟) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e8e8e8',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 收费标准 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                收费标准(元) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e8e8e8',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 启用状态 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                启用状态
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e8e8e8',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {formData.isActive ? (
                    <>
                      <CheckCircle size={16} color="#10b981" />
                      <span style={{ color: '#10b981', fontWeight: 600 }}>启用</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} color="#ef4444" />
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>停用</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 检查须知 */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                检查须知
              </label>
              <textarea
                value={formData.preparationNotes}
                onChange={e => setFormData(prev => ({ ...prev, preparationNotes: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e8e8e8',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 适用设备 */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                适用设备
              </label>
              <div style={{
                border: '1px solid #e8e8e8',
                borderRadius: 6,
                padding: 12,
                maxHeight: 150,
                overflow: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}>
                {modalityDevices.length > 0 ? modalityDevices.map(d => (
                  <label
                    key={d.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: formData.applicableDeviceIds.includes(d.id) ? '#1e40af' : '#e8e8e8',
                      background: formData.applicableDeviceIds.includes(d.id) ? '#eff6ff' : '#fff',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.applicableDeviceIds.includes(d.id)}
                      onChange={() => handleDeviceToggle(d.id)}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: formData.applicableDeviceIds.includes(d.id) ? '#1e40af' : '#d1d5db',
                      background: formData.applicableDeviceIds.includes(d.id) ? '#1e40af' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {formData.applicableDeviceIds.includes(d.id) && (
                        <Check size={10} color="#fff" />
                      )}
                    </span>
                    {d.name}
                  </label>
                )) : (
                  <div style={{ color: '#64748b', fontSize: 12, padding: 8 }}>
                    请先选择设备类型
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: '1px solid #e8e8e8',
                background: '#fff',
                color: '#64748b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: 'none',
                background: '#1e40af',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
interface ExamItemPageProps {
  currentRole: string
}

export default function ExamItemPage({ currentRole }: ExamItemPageProps) {
  const [examItems, setExamItems] = useState<ExamItem[]>(EXAM_ITEMS)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<AdvancedFilters>({
    modality: '全部',
    department: '全部',
    status: '全部',
    priceMin: '',
    priceMax: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // 详情/编辑弹窗
  const [detailItem, setDetailItem] = useState<ExamItem | null>(null)
  const [formItem, setFormItem] = useState<ExamItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  // 过滤后的检查项目列表
  const filteredExamItems = useMemo(() => {
    let list = [...examItems]

    // 关键词搜索
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      list = list.filter(item =>
        item.name.toLowerCase().includes(kw) ||
        item.code.toLowerCase().includes(kw) ||
        item.modality.toLowerCase().includes(kw)
      )
    }

    // 设备类型筛选
    if (filters.modality !== '全部') {
      list = list.filter(item => item.modality === filters.modality)
    }

    // 科室筛选
    if (filters.department !== '全部') {
      list = list.filter(item => item.departmentName === filters.department)
    }

    // 状态筛选
    if (filters.status !== '全部') {
      list = list.filter(item =>
        filters.status === '启用' ? item.isActive : !item.isActive
      )
    }

    // 价格筛选
    if (filters.priceMin) {
      list = list.filter(item => item.price >= parseFloat(filters.priceMin))
    }
    if (filters.priceMax) {
      list = list.filter(item => item.price <= parseFloat(filters.priceMax))
    }

    return list
  }, [examItems, searchKeyword, filters])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredExamItems.length / pageSize))
  const paginatedExamItems = filteredExamItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // 统计
  const stats = useMemo(() => {
    return {
      total: examItems.length,
      active: examItems.filter(item => item.isActive).length,
      inactive: examItems.filter(item => !item.isActive).length,
      avgPrice: examItems.length > 0
        ? Math.round(examItems.reduce((sum, item) => sum + item.price, 0) / examItems.length)
        : 0,
    }
  }, [examItems])

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({
      modality: '全部',
      department: '全部',
      status: '全部',
      priceMin: '',
      priceMax: '',
    })
    setSearchKeyword('')
    setCurrentPage(1)
  }

  // 新建/编辑
  const handleOpenForm = (item?: ExamItem) => {
    setFormItem(item || null)
    setShowForm(true)
  }

  const handleSave = (item: ExamItem) => {
    if (formItem) {
      // 编辑
      setExamItems(prev => prev.map(i => i.id === item.id ? item : i))
    } else {
      // 新建
      setExamItems(prev => [...prev, item])
    }
    setShowForm(false)
    setFormItem(null)
  }

  const handleDelete = (itemId: string) => {
    if (confirm('确定要删除此检查项目吗？')) {
      setExamItems(prev => prev.filter(i => i.id !== itemId))
    }
  }

  const handleToggleStatus = (item: ExamItem) => {
    setExamItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, isActive: !i.isActive } : i
    ))
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', margin: 0 }}>检查项目管理</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>管理系统中所有检查项目配置</p>
        </div>
        {currentRole === '管理员' && (
          <button
            onClick={() => handleOpenForm()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: '#1e40af', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> 新建检查项目
          </button>
        )}
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard
          label="检查项目总数"
          value={stats.total}
          icon={<Stethoscope size={24} />}
          color="#1e40af"
          bgColor="#dbeafe"
        />
        <StatCard
          label="启用中"
          value={stats.active}
          icon={<CheckCircle size={24} />}
          color="#10b981"
          bgColor="#d1fae5"
        />
        <StatCard
          label="已停用"
          value={stats.inactive}
          icon={<XCircle size={24} />}
          color="#ef4444"
          bgColor="#fee2e2"
        />
        <StatCard
          label="平均价格"
          value={`¥${stats.avgPrice}`}
          icon={<FileText size={24} />}
          color="#f59e0b"
          bgColor="#fef3c7"
        />
      </div>

      {/* 搜索栏 */}
      <div style={{
        background: '#fff',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 16,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 搜索框 */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="搜索项目名称、代码或设备类型..."
              value={searchKeyword}
              onChange={e => {
                setSearchKeyword(e.target.value)
                setCurrentPage(1)
              }}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 高级筛选按钮 */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: 13,
              fontWeight: 600,
              color: showAdvanced ? '#1e40af' : '#64748b',
              cursor: 'pointer',
            }}
          >
            <Filter size={16} />
            高级筛选
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* 重置按钮 */}
          <button
            onClick={handleResetFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: 13,
              fontWeight: 600,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            重置
          </button>
        </div>

        {/* 快速筛选标签 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {MODALITY_OPTIONS.map(m => (
            <button
              key={m}
              onClick={() => {
                setFilters(prev => ({ ...prev, modality: m }))
                setCurrentPage(1)
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: filters.modality === m ? '#1e40af' : '#e5e7eb',
                background: filters.modality === m ? '#1e40af' : '#fff',
                color: filters.modality === m ? '#fff' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* 高级筛选面板 */}
        {showAdvanced && (
          <AdvancedFilterPanel
            filters={filters}
            onChange={f => {
              setFilters(f)
              setCurrentPage(1)
            }}
            onReset={handleResetFilters}
          />
        )}
      </div>

      {/* 数据表格 */}
      <div style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>项目名称</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>项目代码</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>设备类型</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>所属科室</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b' }}>时长</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b' }}>价格</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExamItems.length > 0 ? paginatedExamItems.map((item, index) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: index < paginatedExamItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.name}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: '#f3f4f6',
                    fontSize: 12,
                    color: '#64748b',
                    fontFamily: 'monospace',
                  }}>
                    {item.code}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    background: MODALITY_COLORS[item.modality]?.bg || '#f3f4f6',
                    color: MODALITY_COLORS[item.modality]?.text || '#374151',
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {item.modality}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={14} color="#64748b" />
                    <span style={{ fontSize: 13, color: '#374151' }}>{item.departmentName}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Clock size={14} color="#64748b" />
                    <span style={{ fontSize: 13, color: '#374151' }}>{formatDuration(item.duration)}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{formatPrice(item.price)}</span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleToggleStatus(item)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 20,
                      border: 'none',
                      background: item.isActive ? '#d1fae5' : '#fee2e2',
                      color: item.isActive ? '#10b981' : '#ef4444',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {item.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {item.isActive ? '启用' : '停用'}
                  </button>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <button
                      onClick={() => setDetailItem(item)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: 'none',
                        background: '#eff6ff',
                        cursor: 'pointer',
                      }}
                      title="查看详情"
                    >
                      <Eye size={16} color="#3b82f6" />
                    </button>
                    {currentRole === '管理员' && (
                      <>
                        <button
                          onClick={() => handleOpenForm(item)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            border: 'none',
                            background: '#fef3c7',
                            cursor: 'pointer',
                          }}
                          title="编辑"
                        >
                          <Edit2 size={16} color="#f59e0b" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            border: 'none',
                            background: '#fee2e2',
                            cursor: 'pointer',
                          }}
                          title="删除"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: 14 }}>暂无检查项目数据</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 分页 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredExamItems.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 详情弹窗 */}
      {detailItem && (
        <DetailModal
          examItem={detailItem}
          devices={DEVICES}
          onClose={() => setDetailItem(null)}
        />
      )}

      {/* 编辑/新建弹窗 */}
      {showForm && (
        <FormModal
          examItem={formItem}
          devices={DEVICES}
          departments={DEPARTMENTS}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setFormItem(null)
          }}
        />
      )}
    </div>
  )
}
