// G006 全院医技检查预约系统 - 报告管理页面
import { useState } from 'react';
import {
  Search, Eye, X, FileText, Printer,
  Stethoscope, CheckCircle, Calendar, Filter
} from 'lucide-react';
import { APPOINTMENTS } from '../data/initialData';

interface ReportPageProps {
  currentRole: string;
}

type ReportStatus = '未写' | '待审核' | '已审核' | '已打印';

interface ReportData {
  id: string;
  reportNo: string;
  appointmentId: string;
  patientName: string;
  gender: string;
  age: number;
  phone: string;
  examItemName: string;
  modality: string;
  deviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  reportStatus: ReportStatus;
  reportContent?: string;
  impression?: string;
  radiologist?: string;
 审核医生?: string;
  printTime?: string;
}

export default function ReportPage({ currentRole }: ReportPageProps) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [modalityFilter, setModalityFilter] = useState<string>('全部');
  const [dateFilter, setDateFilter] = useState('2026-05-02');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const today = dateFilter || '2026-05-02';
  const reports: ReportData[] = APPOINTMENTS.filter(a => a.appointmentDate === today).map((a, i) => ({
    id: `R${String(i + 1).padStart(4, '0')}`,
    reportNo: `RPT${today.replace(/-/g, '')}${String(i + 1).padStart(4, '0')}`,
    appointmentId: a.id,
    patientName: a.patientName,
    gender: a.gender,
    age: a.age,
    phone: a.phone,
    examItemName: a.examItemName,
    modality: a.modality,
    deviceName: a.deviceName,
    appointmentDate: a.appointmentDate,
    appointmentTime: a.appointmentTime,
    reportStatus: a.reportStatus || '未写',
    radiologist: a.doctorName,
  }));

  const filtered = reports.filter(r => {
    if (searchText && !r.patientName.includes(searchText) && !r.reportNo.includes(searchText) && !r.phone.includes(searchText)) return false;
    if (statusFilter !== '全部' && r.reportStatus !== statusFilter) return false;
    if (modalityFilter !== '全部' && r.modality !== modalityFilter) return false;
    return true;
  });

  const statusColors: Record<ReportStatus, string> = {
    '未写': '#6b7280',
    '待审核': '#f59e0b',
    '已审核': '#10b981',
    '已打印': '#1e40af',
  };

  const statistics = {
    total: filtered.length,
    未写: filtered.filter(r => r.reportStatus === '未写').length,
    待审核: filtered.filter(r => r.reportStatus === '待审核').length,
    已审核: filtered.filter(r => r.reportStatus === '已审核').length,
    已打印: filtered.filter(r => r.reportStatus === '已打印').length,
  };

  const modalities = ['全部', 'CT', 'MRI', '超声', '内镜', '心电', 'X光'];
  const statuses: ReportStatus[] = ['未写', '待审核', '已审核', '已打印'];
  const canAudit = currentRole === '管理员' || currentRole === '医生';

  const handleView = (report: ReportData) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const PRIMARY = '#1e40af';
  const GRAY = '#6b7280';
  const BORDER = '#e5e7eb';
  const BG = '#f9fafb';

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>报告管理</h2>
          <p style={{ fontSize: 13, color: GRAY, margin: '4px 0 0' }}>管理所有检查报告的撰写、审核与打印</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: '报告总数', value: statistics.total, color: '#1f2937' },
          { label: '未写', value: statistics.未写, color: '#6b7280' },
          { label: '待审核', value: statistics.待审核, color: '#f59e0b' },
          { label: '已审核', value: statistics.已审核, color: '#10b981' },
          { label: '已打印', value: statistics.已打印, color: '#1e40af' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px',
            border: `1px solid ${BORDER}`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '16px 20px',
        border: `1px solid ${BORDER}`, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 搜索框 */}
          <div style={{ position: 'relative', flex: '0 0 260px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: GRAY }} />
            <input
              type="text"
              placeholder="搜索患者姓名/报告号/手机"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 32px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* 日期 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color={GRAY} />
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              style={{ padding: '7px 10px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>

          {/* 设备类型 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color={GRAY} />
            <select value={modalityFilter} onChange={e => setModalityFilter(e.target.value)}
              style={{ padding: '7px 10px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: 'none' }}>
              {modalities.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* 状态 */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '7px 10px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: 'none' }}>
            <option value="全部">全部状态</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* 报告列表 */}
      <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: BG }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: `1px solid ${BORDER}` }}>报告号</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: `1px solid ${BORDER}` }}>患者信息</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: `1px solid ${BORDER}` }}>检查项目</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: `1px solid ${BORDER}` }}>检查时间</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: `1px solid ${BORDER}` }}>报告状态</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#374151', borderBottom: `1px solid ${BORDER}` }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(report => (
              <tr key={report.id} style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', color: PRIMARY, fontWeight: 600, fontFamily: 'monospace' }}>{report.reportNo}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500 }}>{report.patientName}</div>
                  <div style={{ fontSize: 12, color: GRAY }}>{report.gender}/{report.age}岁 · {report.phone}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500 }}>{report.examItemName}</div>
                  <div style={{ fontSize: 12, color: GRAY }}>{report.modality} · {report.deviceName}</div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>
                  <div>{report.appointmentDate}</div>
                  <div style={{ color: GRAY }}>{report.appointmentTime}</div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#fff',
                    background: statusColors[report.reportStatus],
                  }}>
                    {report.reportStatus}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleView(report)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '6px 12px', border: 'none', borderRadius: 6,
                      background: '#eff6ff', color: PRIMARY, fontSize: 12,
                      cursor: 'pointer', fontWeight: 500,
                    }}>
                    <Eye size={13} /> 查看
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: GRAY }}>
                  暂无报告数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 详情弹窗 */}
      {showModal && selectedReport && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 16, width: 700, maxHeight: '85vh',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }} onClick={e => e.stopPropagation()}>
            {/* 弹窗标题 */}
            <div style={{
              padding: '16px 20px', borderBottom: `1px solid ${BORDER}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: PRIMARY, color: '#fff',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>报告详情</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{selectedReport.reportNo}</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
                padding: '6px 10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <X size={16} />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              {/* 患者信息 */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} /> 患者信息
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, background: BG, padding: 12, borderRadius: 8 }}>
                  {[
                    { label: '患者姓名', value: selectedReport.patientName },
                    { label: '性别/年龄', value: `${selectedReport.gender}/${selectedReport.age}岁` },
                    { label: '联系电话', value: selectedReport.phone },
                    { label: '报告状态', value: selectedReport.reportStatus },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: GRAY, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 检查信息 */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Stethoscope size={16} /> 检查信息
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, background: BG, padding: 12, borderRadius: 8 }}>
                  {[
                    { label: '检查项目', value: selectedReport.examItemName },
                    { label: '设备类型', value: selectedReport.modality },
                    { label: '设备名称', value: selectedReport.deviceName },
                    { label: '检查时间', value: `${selectedReport.appointmentDate} ${selectedReport.appointmentTime}` },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: GRAY, marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 报告内容 */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} /> 报告内容
                </h4>
                <div style={{ background: BG, padding: 16, borderRadius: 8, minHeight: 120 }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: PRIMARY }}>检查所见：</span>
                    <div style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.6 }}>
                      {selectedReport.reportStatus === '未写' ? '（尚未撰写）' : `左肺上叶见一类圆形结节影，大小约1.2cm×1.0cm，边缘欠光滑，可见分叶征及毛刺征。余肺野未见明显异常密度影。纵隔结构清晰，无明显肿大淋巴结。胸腔无积液。`}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }}>诊断意见：</span>
                    <div style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.6 }}>
                      {selectedReport.reportStatus === '未写' ? '（尚未撰写）' : '左肺上叶结节，性质待定，建议进一步增强CT检查除外恶性病变。'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                {canAudit && selectedReport.reportStatus === '待审核' && (
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', border: 'none', borderRadius: 8,
                    background: '#10b981', color: '#fff', fontSize: 13,
                    cursor: 'pointer', fontWeight: 600,
                  }}>
                    <CheckCircle size={14} /> 审核通过
                  </button>
                )}
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', border: `1px solid ${BORDER}`, borderRadius: 8,
                  background: '#fff', color: '#374151', fontSize: 13,
                  cursor: 'pointer',
                }}>
                  <Printer size={14} /> 打印报告
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', border: 'none', borderRadius: 8,
                    background: PRIMARY, color: '#fff', fontSize: 13,
                    cursor: 'pointer',
                  }}>
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
