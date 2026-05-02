// G006 全院医技检查预约系统 - 设备管理页面
// 汉东省人民医院全院医技检查预约系统
import React, { useState, useMemo } from 'react';
import {
  Search, Monitor, Plus, X, Edit2, Trash2, Eye, RefreshCw, ChevronDown,
  CheckCircle, AlertTriangle, XCircle, Clock, Building2, MapPin,
  Wrench, Power, Calendar, Filter, Activity
} from 'lucide-react';
import { Device, DeviceStatus } from '../types';
import { DEVICES, DEPARTMENTS } from '../data/initialData';

// 状态颜色映射
const STATUS_COLORS: Record<DeviceStatus, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  '正常': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7', icon: <CheckCircle size={14} /> },
  '维护中': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', icon: <Wrench size={14} /> },
  '停机': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', icon: <Power size={14} /> },
  '预约满': { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc', icon: <XCircle size={14} /> },
};

// 设备类型颜色
const MODALITY_COLORS: Record<string, { bg: string; text: string }> = {
  'CT': { bg: '#dbeafe', text: '#1e40af' },
  'MRI': { bg: '#e0e7ff', text: '#4338ca' },
  '超声': { bg: '#d1fae5', text: '#065f46' },
  '内镜': { bg: '#f3e8ff', text: '#6b21a8' },
  '心电': { bg: '#fef3c7', text: '#92400e' },
  'X光': { bg: '#fce7f3', text: '#9d174d' },
};

interface DevicePageProps {
  currentRole: string;
}

export default function DevicePage({ currentRole }: DevicePageProps) {
  const [devices, setDevices] = useState<Device[]>(DEVICES);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('全部');
  const [filterModality, setFilterModality] = useState<string>('全部');
  const [filterDepartment, setFilterDepartment] = useState<string>('全部');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // 统计数据
  const statistics = useMemo(() => {
    return {
      total: devices.length,
      normal: devices.filter(d => d.status === '正常').length,
      maintenance: devices.filter(d => d.status === '维护中').length,
      stopped: devices.filter(d => d.status === '停机').length,
      full: devices.filter(d => d.status === '预约满').length,
      totalSlots: devices.reduce((sum, d) => sum + d.totalSlots, 0),
      usedSlots: devices.reduce((sum, d) => sum + d.usedSlots, 0),
    };
  }, [devices]);

  // 筛选后的设备列表
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = searchText === '' ||
        device.name.includes(searchText) ||
        device.code.includes(searchText) ||
        device.location.includes(searchText) ||
        device.manufacturer.includes(searchText);
      const matchesStatus = filterStatus === '全部' || device.status === filterStatus;
      const matchesModality = filterModality === '全部' || device.modality === filterModality;
      const matchesDepartment = filterDepartment === '全部' || device.departmentName === filterDepartment;
      return matchesSearch && matchesStatus && matchesModality && matchesDepartment;
    });
  }, [devices, searchText, filterStatus, filterModality, filterDepartment]);

  // 获取设备类型列表
  const modalityList = useMemo(() => {
    const modalities = [...new Set(devices.map(d => d.modality))];
    return modalities;
  }, [devices]);

  // 获取科室列表
  const departmentList = useMemo(() => {
    const departments = [...new Set(devices.map(d => d.departmentName))];
    return departments;
  }, [devices]);

  // 模态框操作
  const handleView = (device: Device) => {
    setSelectedDevice(device);
    setModalType('view');
    setShowModal(true);
  };

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setModalType('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedDevice(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleDelete = (deviceId: string) => {
    if (confirm('确定要删除此设备吗？')) {
      setDevices(prev => prev.filter(d => d.id !== deviceId));
    }
  };

  const handleStatusChange = (deviceId: string, newStatus: DeviceStatus) => {
    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, status: newStatus } : d
    ));
  };

  // 新建设备表单状态
  const [newDevice, setNewDevice] = useState({
    name: '', code: '', modality: 'CT', departmentId: 'D001', departmentName: '放射科',
    location: '', manufacturer: '', model: '', status: '正常' as DeviceStatus,
    totalSlots: 40,
  });

  const handleCreateSubmit = () => {
    const dept = DEPARTMENTS.find(d => d.id === newDevice.departmentId);
    const device: Device = {
      id: `DEV${String(devices.length + 1).padStart(3, '0')}`,
      ...newDevice,
      departmentName: dept?.name || '',
      usedSlots: 0,
      availableTimes: [
        { startTime: '08:00', endTime: '12:00', total: Math.floor(newDevice.totalSlots / 2), available: Math.floor(newDevice.totalSlots / 2) },
        { startTime: '14:00', endTime: '18:00', total: Math.floor(newDevice.totalSlots / 2), available: Math.floor(newDevice.totalSlots / 2) },
      ],
    };
    setDevices(prev => [...prev, device]);
    setShowModal(false);
  };

  const handleEditSubmit = () => {
    if (!selectedDevice) return;
    setDevices(prev => prev.map(d =>
      d.id === selectedDevice.id ? { ...d, ...newDevice, departmentName: DEPARTMENTS.find(dep => dep.id === newDevice.departmentId)?.name || d.departmentName } : d
    ));
    setShowModal(false);
  };

  const handleDepartmentChange = (deptId: string) => {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    setNewDevice(prev => ({
      ...prev,
      departmentId: deptId,
      departmentName: dept?.name || '',
    }));
  };

  // 计算使用率
  const getUtilization = (device: Device) => {
    if (device.totalSlots === 0) return 0;
    return Math.round((device.usedSlots / device.totalSlots) * 100);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', margin: 0 }}>设备管理</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>管理所有检查设备信息</p>
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
            <Plus size={16} /> 添加设备
          </button>
        )}
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '设备总数', value: statistics.total, color: '#1e40af' },
          { label: '正常运行', value: statistics.normal, color: '#10b981' },
          { label: '维护中', value: statistics.maintenance, color: '#f59e0b' },
          { label: '已停机', value: statistics.stopped, color: '#ef4444' },
          { label: '预约已满', value: statistics.full, color: '#8b5cf6' },
          { label: '总预约量', value: statistics.totalSlots, color: '#6b7280' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px',
            border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
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
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="搜索设备名称/编号/位置/厂商..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #e5e7eb',
                borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 状态筛选 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer',
              }}
            >
              <Filter size={14} /> {filterStatus} <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff',
                border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, minWidth: 120,
              }}>
                {['全部', '正常', '维护中', '停机', '预约满'].map(status => (
                  <div
                    key={status}
                    onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                    style={{
                      padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                      background: filterStatus === status ? '#f3f4f6' : '#fff',
                    }}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 设备类型筛选 */}
          <select
            value={filterModality}
            onChange={e => setFilterModality(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
          >
            <option value="全部">全部设备类型</option>
            {modalityList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* 科室筛选 */}
          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
          >
            <option value="全部">全部科室</option>
            {departmentList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
            共 {filteredDevices.length} 台设备
          </div>
        </div>
      </div>

      {/* 设备列表表格 */}
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>设备信息</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>设备类型</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>位置/科室</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>厂商/型号</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>预约情况</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device, idx) => {
              const utilization = getUtilization(device);
              return (
                <tr
                  key={device.id}
                  style={{
                    borderBottom: idx < filteredDevices.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: device.status === '停机' ? '#fef2f2' : device.status === '维护中' ? '#fffbeb' : '#fff',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{device.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      编号: {device.code}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: MODALITY_COLORS[device.modality]?.bg || '#f3f4f6',
                      color: MODALITY_COLORS[device.modality]?.text || '#374151',
                    }}>
                      {device.modality}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} color='#6b7280' />
                      <span style={{ color: '#111827' }}>{device.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Building2 size={12} color='#9ca3af' />
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{device.departmentName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: '#111827' }}>{device.manufacturer}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{device.model}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: '#6b7280' }}>使用率</span>
                          <span style={{ fontWeight: 600, color: utilization > 90 ? '#ef4444' : utilization > 70 ? '#f59e0b' : '#10b981' }}>{utilization}%</span>
                        </div>
                        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            width: `${utilization}%`,
                            height: '100%',
                            background: utilization > 90 ? '#ef4444' : utilization > 70 ? '#f59e0b' : '#10b981',
                            borderRadius: 3,
                          }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                      {device.usedSlots} / {device.totalSlots} 时段
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: STATUS_COLORS[device.status].bg, color: STATUS_COLORS[device.status].text,
                      border: `1px solid ${STATUS_COLORS[device.status].border}`,
                    }}>
                      {STATUS_COLORS[device.status].icon}
                      {device.status}
                    </span>
                    {device.maintenanceDate && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                        维护日期: {device.maintenanceDate}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleView(device)}
                        title="查看详情"
                        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                      >
                        <Eye size={16} />
                      </button>
                      {currentRole === '管理员' && (
                        <>
                          <button
                            onClick={() => handleEdit(device)}
                            title="编辑"
                            style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4, color: '#6b7280' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(device.id)}
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

        {filteredDevices.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <Monitor size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: 14, margin: 0 }}>暂无设备记录</p>
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
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '90vh',
            overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 模态框头部 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                {modalType === 'view' ? '设备详情' : modalType === 'edit' ? '编辑设备' : '添加设备'}
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
              {modalType === 'view' && selectedDevice ? (
                // 详情视图
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>设备名称</label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedDevice.name}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>设备编号</label>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{selectedDevice.code}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>设备类型</label>
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: MODALITY_COLORS[selectedDevice.modality]?.bg,
                        color: MODALITY_COLORS[selectedDevice.modality]?.text,
                      }}>
                        {selectedDevice.modality}
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>设备状态</label>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: STATUS_COLORS[selectedDevice.status].bg, color: STATUS_COLORS[selectedDevice.status].text,
                        border: `1px solid ${STATUS_COLORS[selectedDevice.status].border}`,
                      }}>
                        {STATUS_COLORS[selectedDevice.status].icon}
                        {selectedDevice.status}
                      </span>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>所属科室</label>
                      <div style={{ fontSize: 14, color: '#111827' }}>{selectedDevice.departmentName}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>设备位置</label>
                      <div style={{ fontSize: 14, color: '#111827' }}>{selectedDevice.location}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>生产厂商</label>
                      <div style={{ fontSize: 14, color: '#111827' }}>{selectedDevice.manufacturer}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>设备型号</label>
                      <div style={{ fontSize: 14, color: '#111827' }}>{selectedDevice.model}</div>
                    </div>
                  </div>

                  {/* 时段信息 */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 8 }}>可用时段</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {selectedDevice.availableTimes.map((slot, idx) => (
                        <div key={idx} style={{
                          flex: 1, padding: 12, background: '#f8fafc', borderRadius: 8,
                          border: '1px solid #e5e7eb',
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            总计: {slot.total} | 可用: {slot.available}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 预约统计 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#1e40af' }}>{selectedDevice.totalSlots}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>总预约量</div>
                    </div>
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{selectedDevice.usedSlots}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>已用量</div>
                    </div>
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{selectedDevice.totalSlots - selectedDevice.usedSlots}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>剩余</div>
                    </div>
                  </div>

                  {selectedDevice.maintenanceDate && (
                    <div style={{ marginTop: 16, padding: 12, background: '#fef3c7', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Wrench size={16} color='#92400e' />
                      <span style={{ fontSize: 13, color: '#92400e' }}>维护日期: {selectedDevice.maintenanceDate}</span>
                    </div>
                  )}
                </div>
              ) : (
                // 创建/编辑表单
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>设备名称</label>
                    <input
                      type="text"
                      value={newDevice.name}
                      onChange={e => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>设备编号</label>
                    <input
                      type="text"
                      value={newDevice.code}
                      onChange={e => setNewDevice(prev => ({ ...prev, code: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>设备类型</label>
                    <select
                      value={newDevice.modality}
                      onChange={e => setNewDevice(prev => ({ ...prev, modality: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      <option value="CT">CT</option>
                      <option value="MRI">MRI</option>
                      <option value="超声">超声</option>
                      <option value="内镜">内镜</option>
                      <option value="心电">心电</option>
                      <option value="X光">X光</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>所属科室</label>
                    <select
                      value={newDevice.departmentId}
                      onChange={e => handleDepartmentChange(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      {DEPARTMENTS.filter(d => d.type === '医技').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>设备位置</label>
                    <input
                      type="text"
                      value={newDevice.location}
                      onChange={e => setNewDevice(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="如: 医技楼1层CT-1室"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>生产厂商</label>
                    <input
                      type="text"
                      value={newDevice.manufacturer}
                      onChange={e => setNewDevice(prev => ({ ...prev, manufacturer: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>设备型号</label>
                    <input
                      type="text"
                      value={newDevice.model}
                      onChange={e => setNewDevice(prev => ({ ...prev, model: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>设备状态</label>
                    <select
                      value={newDevice.status}
                      onChange={e => setNewDevice(prev => ({ ...prev, status: e.target.value as DeviceStatus }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    >
                      <option value="正常">正常</option>
                      <option value="维护中">维护中</option>
                      <option value="停机">停机</option>
                      <option value="预约满">预约满</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>每日预约总量</label>
                    <input
                      type="number"
                      value={newDevice.totalSlots}
                      onChange={e => setNewDevice(prev => ({ ...prev, totalSlots: parseInt(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                    />
                  </div>

                  {/* 提交按钮 */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: 8,
                        fontSize: 13, fontWeight: 500, background: '#fff', cursor: 'pointer',
                      }}
                    >
                      取消
                    </button>
                    <button
                      onClick={modalType === 'create' ? handleCreateSubmit : handleEditSubmit}
                      style={{
                        padding: '10px 20px', border: 'none', borderRadius: 8,
                        fontSize: 13, fontWeight: 600, background: '#1e40af', color: '#fff', cursor: 'pointer',
                      }}
                    >
                      {modalType === 'create' ? '添加' : '保存'}
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
