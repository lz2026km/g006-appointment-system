// G006 全院医技检查预约系统 - 科室管理页面
// 汉东省人民医院全院医技检查预约系统
import React, { useState, useMemo } from 'react';
import {
  Search, Building2, Plus, X, Edit2, Trash2, Eye, RefreshCw, ChevronDown,
  CheckCircle, Users, Stethoscope, Activity, Heart, Clock, Filter,
  ToggleLeft, ToggleRight, Check
} from 'lucide-react';
import { Department } from '../types';
import { DEPARTMENTS, EXAM_ITEMS } from '../data/initialData';

// 科室类型颜色映射
const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '临床': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  '医技': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  '急诊': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  '体检': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
};

interface DepartmentPageProps {
  currentRole: string;
}

export default function DepartmentPage({ currentRole }: DepartmentPageProps) {
  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('全部');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // 统计数据
  const statistics = useMemo(() => {
    return {
      total: departments.length,
      clinical: departments.filter(d => d.type === '临床').length,
      medical: departments.filter(d => d.type === '医技').length,
      emergency: departments.filter(d => d.type === '急诊').length,
      health: departments.filter(d => d.type === '体检').length,
    };
  }, [departments]);

  // 筛选后的科室列表
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const matchesSearch = searchText === '' ||
        dept.name.includes(searchText) ||
        dept.code.includes(searchText) ||
        (dept.coordinator && dept.coordinator.includes(searchText));
      const matchesType = filterType === '全部' || dept.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [departments, searchText, filterType]);

  // 获取科室关联的检查项目数量
  const getExamItemCount = (deptId: string) => {
    return EXAM_ITEMS.filter(item => item.departmentId === deptId).length;
  };

  // 获取关联的检查项目列表
  const getExamItems = (deptId: string) => {
    return EXAM_ITEMS.filter(item => item.departmentId === deptId);
  };

  // 模态框操作
  const handleView = (dept: Department) => {
    setSelectedDepartment(dept);
    setModalType('view');
    setShowModal(true);
  };

  const handleEdit = (dept: Department) => {
    setSelectedDepartment(dept);
    setModalType('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleDelete = (deptId: string) => {
    if (confirm('确定要删除此科室吗？')) {
      setDepartments(prev => prev.filter(d => d.id !== deptId));
    }
  };

  // 新建/编辑表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '临床' as '临床' | '医技' | '急诊' | '体检',
    coordinator: '',
  });

  React.useEffect(() => {
    if (selectedDepartment && (modalType === 'edit' || modalType === 'view')) {
      setFormData({
        name: selectedDepartment.name,
        code: selectedDepartment.code,
        type: selectedDepartment.type,
        coordinator: selectedDepartment.coordinator || '',
      });
    } else if (modalType === 'create') {
      setFormData({
        name: '',
        code: '',
        type: '临床',
        coordinator: '',
      });
    }
  }, [selectedDepartment, modalType]);

  const handleCreateSubmit = () => {
    const newDept: Department = {
      id: `D${String(departments.length + 1).padStart(3, '0')}`,
      name: formData.name,
      code: formData.code,
      type: formData.type,
      coordinator: formData.coordinator,
      examItems: [],
    };
    setDepartments(prev => [...prev, newDept]);
    setShowModal(false);
  };

  const handleEditSubmit = () => {
    if (!selectedDepartment) return;
    setDepartments(prev => prev.map(d =>
      d.id === selectedDepartment.id
        ? { ...d, ...formData }
        : d
    ));
    setShowModal(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', margin: 0 }}>科室管理</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>管理所有科室信息</p>
        </div>
        {currentRole === '管理员' && (
          <button
            onClick={handleCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: '#1e40af', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> 添加科室
          </button>
        )}
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '科室总数', value: statistics.total, color: '#1e40af', icon: <Building2 size={20} /> },
          { label: '临床科室', value: statistics.clinical, color: '#3b82f6', icon: <Stethoscope size={20} /> },
          { label: '医技科室', value: statistics.medical, color: '#10b981', icon: <Activity size={20} /> },
          { label: '急诊科室', value: statistics.emergency, color: '#ef4444', icon: <Heart size={20} /> },
          { label: '体检科室', value: statistics.health, color: '#f59e0b', icon: <Users size={20} /> },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px',
            border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: stat.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div style={{
        background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 16,
        border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 搜索框 */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="搜索科室名称/编号/协调员..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #e5e7eb',
                borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 类型筛选 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer',
              }}
            >
              <Filter size={14} /> {filterType} <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff',
                border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, minWidth: 120,
              }}>
                {['全部', '临床', '医技', '急诊', '体检'].map(type => (
                  <div
                    key={type}
                    onClick={() => { setFilterType(type); setShowFilterDropdown(false); }}
                    style={{
                      padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                      background: filterType === type ? '#f3f4f6' : '#fff',
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
            共 {filteredDepartments.length} 个科室
          </div>
        </div>
      </div>

      {/* 科室列表表格 */}
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>科室信息</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>科室类型</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>协调员</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>关联检查项目</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept, idx) => {
              const examItemCount = getExamItemCount(dept.id);
              return (
                <tr
                  key={dept.id}
                  style={{
                    borderBottom: idx < filteredDepartments.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: '#fff',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: TYPE_COLORS[dept.type]?.bg || '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: TYPE_COLORS[dept.type]?.text || '#374151',
                      }}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{dept.name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                          编号: {dept.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: TYPE_COLORS[dept.type]?.bg,
                      color: TYPE_COLORS[dept.type]?.text,
                      border: `1px solid ${TYPE_COLORS[dept.type]?.border}`,
                    }}>
                      {dept.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: '#e0e7ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#4338ca', fontSize: 12, fontWeight: 600,
                      }}>
                        {dept.coordinator?.charAt(0) || '-'}
                      </div>
                      <span style={{ color: '#111827' }}>{dept.coordinator || '-'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                        background: examItemCount > 0 ? '#dbeafe' : '#f3f4f6',
                        color: examItemCount > 0 ? '#1e40af' : '#6b7280',
                      }}>
                        {examItemCount} 项
                      </div>
                      {examItemCount > 0 && (
                        <span style={{ fontSize: 12, color: '#6b7280' }}>
                          {getExamItems(dept.id).slice(0, 2).map(e => e.name).join('、')}
                          {examItemCount > 2 && '...'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleView(dept)}
                        title="查看详情"
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                      >
                        <Eye size={16} />
                      </button>
                      {currentRole === '管理员' && (
                        <>
                          <button
                            onClick={() => handleEdit(dept)}
                            title="编辑"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id)}
                            title="删除"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredDepartments.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <Building2 size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: 14, margin: 0 }}>暂无科室记录</p>
          </div>
        )}
      </div>

      {/* 模态框 */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 560, maxHeight: '90vh',
            overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                {modalType === 'view' ? '科室详情' : modalType === 'edit' ? '编辑科室' : '添加科室'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}
              >
                <X size={20} color='#6b7280' />
              </button>
            </div>

            {/* 模态框内容 */}
            <div style={{ padding: 20 }}>
              {modalType === 'view' && selectedDepartment ? (
                // 详情视图
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>科室名称</label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedDepartment.name}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>科室编号</label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedDepartment.code}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>科室类型</label>
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: TYPE_COLORS[selectedDepartment.type]?.bg,
                        color: TYPE_COLORS[selectedDepartment.type]?.text,
                        border: `1px solid ${TYPE_COLORS[selectedDepartment.type]?.border}`,
                      }}>
                        {selectedDepartment.type}
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>科室协调员</label>
                      <div style={{ fontSize: 14, color: '#111827' }}>{selectedDepartment.coordinator || '-'}</div>
                    </div>
                  </div>

                  {/* 关联检查项目 */}
                  <div>
                    <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 8 }}>关联检查项目</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {getExamItems(selectedDepartment.id).length > 0 ? (
                        getExamItems(selectedDepartment.id).map(item => (
                          <div key={item.id} style={{
                            padding: '8px 12px', background: '#f3f4f6', borderRadius: 6, fontSize: 12,
                          }}>
                            <div style={{ fontWeight: 600, color: '#374151' }}>{item.name}</div>
                            <div style={{ color: '#6b7280', marginTop: 2 }}>{item.modality} · {item.duration}分钟</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#9ca3af', fontSize: 13 }}>暂未关联检查项目</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // 创建/编辑表单
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>科室名称</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入科室名称"
                      style={{
                        width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                        borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>科室编号</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      placeholder="请输入科室编号"
                      style={{
                        width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                        borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>科室类型</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      style={{
                        width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                        borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                        background: '#fff',
                      }}
                    >
                      <option value="临床">临床</option>
                      <option value="医技">医技</option>
                      <option value="急诊">急诊</option>
                      <option value="体检">体检</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>科室协调员</label>
                    <input
                      type="text"
                      value={formData.coordinator}
                      onChange={e => setFormData({ ...formData, coordinator: e.target.value })}
                      placeholder="请输入协调员姓名"
                      style={{
                        width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                        borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff', color: '#6b7280',
                      }}
                    >
                      取消
                    </button>
                    <button
                      onClick={modalType === 'create' ? handleCreateSubmit : handleEditSubmit}
                      style={{
                        padding: '10px 20px', border: 'none', borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#1e40af', color: '#fff',
                      }}
                    >
                      {modalType === 'create' ? '创建' : '保存'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
