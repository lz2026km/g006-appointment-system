// G006 全院医技检查预约系统
// 汉东省人民医院全院医技检查预约系统
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, Users, Stethoscope, Monitor, Grid3X3,
  Clock, Building2, ClipboardCheck, Volume2, FileText, BarChart3,
  Bell, AlertTriangle, Package, Printer, ScrollText, Settings,
  ChevronLeft, ChevronRight, User
} from 'lucide-react';
import { MENU_ITEMS, SYSTEM_ROLES } from './data/initialData';
import HomePage from './pages/HomePage';
import AppointmentPage from './pages/AppointmentPage';
import PatientPage from './pages/PatientPage';
import ExamItemPage from './pages/ExamItemPage';
import DevicePage from './pages/DevicePage';
import RealTimeSlotPool from './pages/RealTimeSlotPool';
import SlotSourcePage from './pages/SlotSourcePage';
import SchedulePage from './pages/SchedulePage';
import DepartmentPage from './pages/DepartmentPage';
import CheckinPage from './pages/CheckinPage';
import QueueCallPage from './pages/QueueCallPage';
import ReportPage from './pages/ReportPage';
import StatisticsPage from './pages/StatisticsPage';
import NotificationCenter from './pages/NotificationCenter';
import NotificationTemplatePage from './pages/NotificationTemplatePage';
import CriticalValuePage from './pages/CriticalValuePage';
import MaterialsPage from './pages/MaterialsPage';
import PrintManagementPage from './pages/PrintManagementPage';
import OperationLogPage from './pages/OperationLogPage';
import SettingsPage from './pages/SettingsPage';
import RulesConfigPage from './pages/RulesConfigPage';
import QualityControlPage from './pages/QualityControlPage';

// 样式常量
const PRIMARY = '#1e40af';
const SIDEBAR_BG = '#1e3a5f';
const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED = 64;
const HEADER_HEIGHT = 56;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, currentRole }) => {
  const filteredMenus = MENU_ITEMS.filter(menu => menu.roles.includes(currentRole));

  return (
    <div style={{
      width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
      minHeight: '100vh',
      background: SIDEBAR_BG,
      transition: 'width 0.2s',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo区 */}
      <div style={{
        height: HEADER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 12px' : '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32,
          background: PRIMARY,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 900,
          fontSize: 14,
          flexShrink: 0,
        }}>006</div>
        {!collapsed && (
          <span style={{
            marginLeft: 10,
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}>全院医技预约</span>
        )}
        {!collapsed && (
          <span style={{
            marginLeft: 10,
            color: '#94a3b8',
            fontSize: 11,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}>v0.9.0</span>
        )}
      </div>

      {/* 菜单区 */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
        {filteredMenus.map(menu => (
          <NavLink
            key={menu.path}
            to={menu.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: collapsed ? '10px 12px' : '10px 16px',
              margin: '2px 8px',
              borderRadius: 8,
              borderLeft: isActive ? '4px solid #4ade80' : '4px solid transparent',
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.8)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
          >
            {({ isActive }) => {
              const IconComponent = getIcon(menu.icon);
              return (
                <>
                  <IconComponent size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <span style={{ marginLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {menu.label}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div style={{
                      width: 3, height: 20, background: '#60a5fa',
                      borderRadius: 2, marginLeft: 'auto',
                    }} />
                  )}
                </>
              );
            }}
          </NavLink>
        ))}
      </div>

      {/* 折叠按钮 */}
      <div
        onClick={onToggle}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12,
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span style={{ marginLeft: 8 }}>收起</span></>}
      </div>
    </div>
  );
};

const Header: React.FC<{ collapsed: boolean; currentRole: string; onRoleChange: (r: string) => void }> = ({
  collapsed, currentRole, onRoleChange
}) => {
  return (
    <div style={{
      height: HEADER_HEIGHT,
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'fixed',
      top: 0,
      left: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
      right: 0,
      zIndex: 99,
      transition: 'left 0.2s',
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: PRIMARY }}>
        006 全院医技检查预约系统 v0.9.0
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <User size={14} color="#666" />
          <select
            value={currentRole}
            onChange={e => onRoleChange(e.target.value)}
            style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#333' }}
          >
            {SYSTEM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          汉东省人民医院
        </div>
      </div>
    </div>
  );
};

// 图标名称映射
function getIcon(name: string) {
  const icons: Record<string, React.FC<{ size?: number; style?: React.CSSProperties }>> = {
    LayoutDashboard, CalendarCheck, Users, Stethoscope, Monitor, Grid3X3,
    Clock, Building2, ClipboardCheck, Volume2, FileText, BarChart3,
    Bell, AlertTriangle, Package, Printer, ScrollText, Settings,
  };
  return icons[name] || LayoutDashboard;
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState('管理员');

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} currentRole={currentRole} />
        <Header collapsed={collapsed} currentRole={currentRole} onRoleChange={setCurrentRole} />

        <div style={{
          marginLeft: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
          paddingTop: HEADER_HEIGHT,
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
        }}>
          <Routes>
            <Route path="/" element={<HomePage currentRole={currentRole} />} />
            <Route path="/appointments" element={<AppointmentPage currentRole={currentRole} />} />
            <Route path="/patients" element={<PatientPage currentRole={currentRole} />} />
            <Route path="/exam-items" element={<ExamItemPage currentRole={currentRole} />} />
            <Route path="/devices" element={<DevicePage currentRole={currentRole} />} />
            <Route path="/slot-source" element={<SlotSourcePage currentRole={currentRole} />} />
            <Route path="/slot-pool" element={<RealTimeSlotPool currentRole={currentRole} />} />
            <Route path="/schedule" element={<SchedulePage currentRole={currentRole} />} />
            <Route path="/departments" element={<DepartmentPage currentRole={currentRole} />} />
            <Route path="/checkin" element={<CheckinPage currentRole={currentRole} />} />
            <Route path="/queue-call" element={<QueueCallPage currentRole={currentRole} />} />
            <Route path="/reports" element={<ReportPage currentRole={currentRole} />} />
            <Route path="/statistics" element={<StatisticsPage currentRole={currentRole} />} />
            <Route path="/notifications" element={<NotificationCenter currentRole={currentRole} />} />
            <Route path="/notification-templates" element={<NotificationTemplatePage currentRole={currentRole} />} />
            <Route path="/critical-value" element={<CriticalValuePage currentRole={currentRole} />} />
            <Route path="/materials" element={<MaterialsPage currentRole={currentRole} />} />
            <Route path="/print" element={<PrintManagementPage currentRole={currentRole} />} />
            <Route path="/operation-log" element={<OperationLogPage currentRole={currentRole} />} />
            <Route path="/settings" element={<SettingsPage currentRole={currentRole} />} />
            <Route path="/rules-config" element={<RulesConfigPage currentRole={currentRole} />} />
            <Route path="/quality-control" element={<QualityControlPage currentRole={currentRole} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
