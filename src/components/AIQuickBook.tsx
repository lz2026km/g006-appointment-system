// G006 全院医技检查预约系统 - AI智能一键预约组件
import React, { useState, useMemo } from 'react';
import {
  Search, User, Calendar, Clock, Monitor, CheckCircle, AlertCircle,
  Sparkles, ChevronDown, ChevronUp, X, Loader2, Info, RefreshCw,
  Stethoscope, Zap, Award, TrendingDown, History
} from 'lucide-react';
import {
  INPATIENTS,
  AVAILABLE_MODALITIES,
  MODALITY_EXAM_ITEMS,
  getDeviceLoadInfo,
  generateAIRecommendation,
  validateBooking,
  createBooking,
  type AIRecommendation,
  type RecommendedSlot,
  type DeviceLoadInfo,
} from '../data/aiRecommendation';
import { EXAM_ITEMS, DEVICES } from '../data/initialData';
import type { Patient, ExamItem } from '../types';

// 样式常量
const PRIMARY = '#1e40af';
const PRIMARY_HOVER = '#1e3a8a';
const CARD_BG = '#ffffff';
const BORDER_COLOR = '#e5e7eb';

export default function AIQuickBook() {
  // 搜索状态
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 选择状态
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedExamItems, setSelectedExamItems] = useState<string[]>([]);
  
  // 推荐结果
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 预约确认
  const [confirmingSlot, setConfirmingSlot] = useState<{
    examItemId: string;
    slot: RecommendedSlot;
  } | null>(null);
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // 展开状态
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});

  // 过滤患者
  const filteredPatients = useMemo(() => {
    if (!searchText) return INPATIENTS.slice(0, 10);
    const lower = searchText.toLowerCase();
    return INPATIENTS.filter(p =>
      p.id.toLowerCase().includes(lower) ||
      p.name.toLowerCase().includes(lower) ||
      p.phone.includes(searchText)
    );
  }, [searchText]);

  // 设备负载信息
  const deviceLoads = useMemo(() => getDeviceLoadInfo(), []);

  // 处理模态选择
  const handleModalityToggle = (modality: string) => {
    setSelectedModalities(prev => {
      if (prev.includes(modality)) {
        return prev.filter(m => m !== modality);
      }
      return [...prev, modality];
    });
    // 清空已选检查项目
    setSelectedExamItems([]);
  };

  // 处理检查项目选择
  const handleExamItemToggle = (examItemId: string) => {
    setSelectedExamItems(prev => {
      if (prev.includes(examItemId)) {
        return prev.filter(id => id !== examItemId);
      }
      return [...prev, examItemId];
    });
  };

  // AI推荐
  const handleAIRecommend = async () => {
    if (!selectedPatient || selectedExamItems.length === 0) return;
    
    setIsLoading(true);
    setShowRecommendations(true);
    setBookingResult(null);
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = generateAIRecommendation(selectedPatient.id, selectedExamItems);
    setRecommendations(results);
    setIsLoading(false);
  };

  // 确认预约
  const handleConfirmBooking = async () => {
    if (!confirmingSlot) return;
    
    setIsLoading(true);
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = createBooking(
      selectedPatient!.id,
      confirmingSlot.examItemId,
      confirmingSlot.slot.deviceId,
      confirmingSlot.slot.date,
      confirmingSlot.slot.time
    );
    
    setBookingResult(result);
    setIsLoading(false);
    setConfirmingSlot(null);
  };

  // 重置
  const handleReset = () => {
    setSearchText('');
    setSelectedPatient(null);
    setSelectedModalities([]);
    setSelectedExamItems([]);
    setRecommendations([]);
    setShowRecommendations(false);
    setBookingResult(null);
    setConfirmingSlot(null);
  };

  // 切换展开
  const toggleExpand = (key: string) => {
    setExpandedReasons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 获取模态icon颜色
  const getModalityColor = (modality: string) => {
    const colors: Record<string, string> = {
      'CT': '#ef4444',
      'MRI': '#8b5cf6',
      '超声': '#10b981',
      '内镜': '#f59e0b',
      '心电': '#ec4899',
      'X光': '#6366f1',
    };
    return colors[modality] || '#6b7280';
  };

  return (
    <div style={{ padding: 24, background: '#f0f4f8', minHeight: '100vh', fontFamily: '"Segoe UI", sans-serif' }}>
      {/* 页面标题 */}
      <div style={{
        background: CARD_BG,
        borderRadius: 8,
        padding: '20px 24px',
        marginBottom: 16,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: `linear-gradient(135deg, ${PRIMARY}, #3b82f6)`,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: PRIMARY, margin: 0 }}>
              AI智能一键预约
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>
              基于规则引擎智能推荐最佳预约时段，支持批量预约住院患者检查
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 左侧：患者选择和检查项目 */}
        <div style={{
          background: CARD_BG,
          borderRadius: 8,
          padding: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} color={PRIMARY} />
            选择住院患者
          </h3>
          
          {/* 患者搜索 */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="搜索患者ID、姓名或电话..."
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                border: `1px solid ${selectedPatient ? '#10b981' : BORDER_COLOR}`,
                borderRadius: 6,
                fontSize: 13,
                outline: 'none',
                boxShadow: selectedPatient ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
              }}
            />
            
            {/* 下拉选择 */}
            {showDropdown && !selectedPatient && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: CARD_BG,
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: 6,
                marginTop: 4,
                maxHeight: 280,
                overflow: 'auto',
                zIndex: 100,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {filteredPatients.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    未找到患者
                  </div>
                ) : (
                  filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchText('');
                        setShowDropdown(false);
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{
                        width: 32, height: 32,
                        background: '#e0e7ff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        color: PRIMARY,
                      }}>
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{patient.name}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {patient.id} · {patient.age}岁/{patient.gender} · {patient.patientType}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 已选患者 */}
          {selectedPatient && (
            <div style={{
              padding: 12,
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 6,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={18} color="#10b981" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{selectedPatient.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    {selectedPatient.id} · {selectedPatient.age}岁/{selectedPatient.gender} · 住院
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={16} color="#6b7280" />
              </button>
            </div>
          )}

          {/* 模态选择 */}
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={18} color={PRIMARY} />
            选择检查类型
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            {AVAILABLE_MODALITIES.map(modality => (
              <button
                key={modality}
                onClick={() => handleModalityToggle(modality)}
                style={{
                  padding: '10px 8px',
                  border: `2px solid ${selectedModalities.includes(modality) ? getModalityColor(modality) : BORDER_COLOR}`,
                  borderRadius: 6,
                  background: selectedModalities.includes(modality) ? `${getModalityColor(modality)}10` : CARD_BG,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  color: selectedModalities.includes(modality) ? getModalityColor(modality) : '#6b7280',
                  transition: 'all 0.2s',
                }}
              >
                {modality}
              </button>
            ))}
          </div>

          {/* 检查项目多选 */}
          {selectedModalities.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', margin: '0 0 10px 0' }}>
                选择检查项目（可多选）
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedModalities.flatMap(modality =>
                  MODALITY_EXAM_ITEMS[modality]?.map(item => (
                    <label
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        background: selectedExamItems.includes(item.id) ? '#e0e7ff' : '#f9fafb',
                        border: `1px solid ${selectedExamItems.includes(item.id) ? '#818cf8' : BORDER_COLOR}`,
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                        color: selectedExamItems.includes(item.id) ? '#4338ca' : '#374151',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedExamItems.includes(item.id)}
                        onChange={() => handleExamItemToggle(item.id)}
                        style={{ accentColor: PRIMARY }}
                      />
                      {item.name}
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#9ca3af' }}>
                        {item.modality}
                      </span>
                    </label>
                  )) || []
                )}
              </div>
            </div>
          )}

          {/* AI推荐按钮 */}
          <button
            onClick={handleAIRecommend}
            disabled={!selectedPatient || selectedExamItems.length === 0 || isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: (!selectedPatient || selectedExamItems.length === 0) ? '#d1d5db' : PRIMARY,
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: (!selectedPatient || selectedExamItems.length === 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                AI智能分析中...
              </>
            ) : (
              <>
                <Zap size={18} />
                一键AI推荐
              </>
            )}
          </button>

          {/* 批量预约说明 */}
          {selectedPatient && selectedExamItems.length > 1 && (
            <div style={{
              marginTop: 12,
              padding: '10px 12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 4,
              fontSize: 12,
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Info size={14} />
              已选择 {selectedExamItems.length} 个检查项目，将为住院患者批量预约
            </div>
          )}
        </div>

        {/* 右侧：AI推荐结果 */}
        <div style={{
          background: CARD_BG,
          borderRadius: 8,
          padding: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color={PRIMARY} />
            AI推荐结果
            {recommendations.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                padding: '2px 8px',
                background: '#dbeafe',
                color: PRIMARY,
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 500,
              }}>
                {recommendations.length} 项检查
              </span>
            )}
          </h3>

          {!showRecommendations && !isLoading && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#9ca3af',
              background: '#f9fafb',
              borderRadius: 8,
            }}>
              <Sparkles size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 13, margin: 0 }}>
                选择患者和检查项目后<br />
                点击"一键AI推荐"获取最佳预约方案
              </p>
            </div>
          )}

          {isLoading && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: PRIMARY,
            }}>
              <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, margin: 0 }}>AI正在分析最佳预约方案...</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '8px 0 0 0' }}>
                综合考虑设备负载、等候时间、患者历史等因素
              </p>
            </div>
          )}

          {/* 推荐列表 */}
          {showRecommendations && !isLoading && recommendations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recommendations.map((rec, index) => (
                <div
                  key={`${rec.examItemId}-${index}`}
                  style={{
                    border: `1px solid ${BORDER_COLOR}`,
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  {/* 检查项目头部 */}
                  <div style={{
                    padding: '12px 14px',
                    background: `${getModalityColor(rec.modality)}10`,
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <div style={{
                      width: 8, height: 8,
                      borderRadius: '50%',
                      background: getModalityColor(rec.modality),
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                      {rec.examItemName}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      padding: '2px 6px',
                      background: getModalityColor(rec.modality),
                      color: '#fff',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 500,
                    }}>
                      {rec.modality}
                    </span>
                  </div>

                  {/* 推荐时段 */}
                  <div style={{ padding: 14 }}>
                    <div style={{
                      padding: 12,
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: 6,
                      marginBottom: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Award size={16} color="#10b981" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>最佳推荐</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>预约日期</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{rec.recommendedSlot.date}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>预约时段</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{rec.recommendedSlot.time}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>检查设备</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{rec.recommendedSlot.deviceName}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>接诊医生</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>{rec.recommendedSlot.doctorName}</div>
                        </div>
                      </div>
                      <div style={{
                        marginTop: 10,
                        padding: '8px 10px',
                        background: '#ffffff',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                        <Clock size={12} color="#6b7280" />
                        <span style={{ fontSize: 11, color: '#6b7280' }}>
                          预计等候：约{rec.recommendedSlot.estimatedWaitMinutes}分钟（前位约{rec.recommendedSlot.queueAhead}人）
                        </span>
                      </div>
                    </div>

                    {/* 推荐理由 */}
                    <div style={{ marginBottom: 12 }}>
                      <button
                        onClick={() => toggleExpand(`reasons-${index}`)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 0',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#374151',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Info size={14} color={PRIMARY} />
                          推荐理由
                        </span>
                        {expandedReasons[`reasons-${index}`] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      
                      {expandedReasons[`reasons-${index}`] && (
                        <div style={{
                          padding: '8px 10px',
                          background: '#f9fafb',
                          borderRadius: 4,
                          marginTop: 6,
                        }}>
                          {rec.reasons.map((reason, rIndex) => (
                            <div key={rIndex} style={{
                              padding: '6px 0',
                              borderBottom: rIndex < rec.reasons.length - 1 ? '1px solid #e5e7eb' : 'none',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                {reason.type === 'load_balancing' && <TrendingDown size={12} color="#10b981" />}
                                {reason.type === 'wait_time' && <Clock size={12} color="#3b82f6" />}
                                {reason.type === 'patient_history' && <History size={12} color="#f59e0b" />}
                                {reason.type === 'time_constraint' && <Calendar size={12} color="#8b5cf6" />}
                                {reason.type === 'priority' && <Award size={12} color="#ec4899" />}
                                <span style={{ fontSize: 11, fontWeight: 500, color: '#111827' }}>{reason.title}</span>
                                <span style={{
                                  marginLeft: 'auto',
                                  padding: '1px 4px',
                                  background: reason.score >= 7 ? '#dbeafe' : '#fef3c7',
                                  color: reason.score >= 7 ? PRIMARY : '#d97706',
                                  borderRadius: 3,
                                  fontSize: 10,
                                }}>
                                  {reason.score}分
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: '#6b7280' }}>{reason.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 备选时段 */}
                    {rec.alternativeSlots.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>
                          其他可选时段
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {rec.alternativeSlots.map((slot, sIndex) => (
                            <div key={sIndex} style={{
                              padding: '4px 8px',
                              background: '#f3f4f6',
                              borderRadius: 4,
                              fontSize: 11,
                              color: '#374151',
                            }}>
                              {slot.time} · {slot.deviceName.split(' ')[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 警告信息 */}
                    {rec.warnings.length > 0 && (
                      <div style={{
                        padding: '8px 10px',
                        background: '#fef3c7',
                        border: '1px solid #fcd34d',
                        borderRadius: 4,
                        marginBottom: 12,
                      }}>
                        {rec.warnings.map((warning, wIndex) => (
                          <div key={wIndex} style={{ fontSize: 11, color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                            {warning}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 确认预约按钮 */}
                    <button
                      onClick={() => setConfirmingSlot({ examItemId: rec.examItemId, slot: rec.recommendedSlot })}
                      disabled={rec.recommendedSlot.deviceId === ''}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: rec.recommendedSlot.deviceId ? PRIMARY : '#d1d5db',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: rec.recommendedSlot.deviceId ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <CheckCircle size={14} />
                      确认预约此时段
                    </button>
                  </div>
                </div>
              ))}

              {/* 设备负载概览 */}
              <div style={{
                padding: 14,
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                  设备负载概览
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {deviceLoads.slice(0, 6).map(device => (
                    <div key={device.deviceId} style={{
                      padding: '8px 10px',
                      background: CARD_BG,
                      borderRadius: 4,
                      border: '1px solid #e5e7eb',
                    }}>
                      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{device.modality}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          flex: 1,
                          height: 4,
                          background: '#e5e7eb',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${device.utilizationRate}%`,
                            height: '100%',
                            background: device.utilizationRate > 85 ? '#ef4444' : device.utilizationRate > 70 ? '#f59e0b' : '#10b981',
                          }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 500, color: '#374151' }}>{device.utilizationRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 预约结果 */}
          {bookingResult && (
            <div style={{
              padding: 20,
              background: bookingResult.success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${bookingResult.success ? '#86efac' : '#fca5a5'}`,
              borderRadius: 8,
              marginTop: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {bookingResult.success ? (
                  <CheckCircle size={20} color="#10b981" />
                ) : (
                  <AlertCircle size={20} color="#ef4444" />
                )}
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: bookingResult.success ? '#10b981' : '#ef4444',
                }}>
                  {bookingResult.success ? '预约成功' : '预约失败'}
                </span>
              </div>
              <div style={{
                fontSize: 12,
                color: bookingResult.success ? '#374151' : '#991b1b',
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
              }}>
                {bookingResult.message}
              </div>
              <button
                onClick={() => {
                  setBookingResult(null);
                  handleReset();
                }}
                style={{
                  marginTop: 12,
                  padding: '8px 16px',
                  background: PRIMARY,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                继续预约
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 确认预约弹窗 */}
      {confirmingSlot && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: CARD_BG,
            borderRadius: 8,
            padding: 24,
            width: '90%',
            maxWidth: 440,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
                确认预约信息
              </h3>
              <button
                onClick={() => setConfirmingSlot(null)}
                style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{
                padding: 12,
                background: '#f9fafb',
                borderRadius: 6,
                marginBottom: 12,
              }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>患者信息</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                  {selectedPatient?.name} · {selectedPatient?.age}岁/{selectedPatient?.gender} · 住院
                </div>
              </div>

              <div style={{
                padding: 12,
                background: '#f9fafb',
                borderRadius: 6,
              }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>预约信息</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                  {recommendations.find(r => r.examItemId === confirmingSlot.examItemId)?.examItemName}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {confirmingSlot.slot.date} {confirmingSlot.slot.time}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {confirmingSlot.slot.deviceName} · {confirmingSlot.slot.doctorName}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setConfirmingSlot(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: CARD_BG,
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: PRIMARY,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    确认预约
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 点击空白关闭下拉 */}
      {showDropdown && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
