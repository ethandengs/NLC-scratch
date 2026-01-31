
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { AssetSheep } from './AssetSheep';
import { getStableSheepMessage } from '../utils/gameLogic';
import { AddSheepModal } from './AddSheepModal';
import '../styles/design-tokens.css';

// --- Card Component ---
const SheepCard = ({ s, isSelectionMode, isSelected, onSelect, onToggleSelect, isDead, isSick }) => {
    return (
        <div
            className={`sheep-card ${isSelectionMode && isSelected ? 'selected' : ''}`}
            onClick={() => {
                if (isSelectionMode) onToggleSelect(s.id);
                else onSelect(s);
            }}
            style={{
                position: 'relative',
                background: isDead ? '#F5F5F5' : '#FFFFFF',
                borderRadius: 'var(--radius-card)',
                padding: '12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                boxShadow: isSelectionMode && isSelected
                    ? '0 0 0 4px var(--color-action-blue)'
                    : 'var(--shadow-card)',
                cursor: 'pointer',
                transition: 'transform 0.1s, box-shadow 0.2s',
                aspectRatio: '0.8',
                border: '1px solid rgba(0,0,0,0.05)'
            }}
        >
            {/* Status Badge */}
            <div style={{
                position: 'absolute', top: '10px', left: '10px', zIndex: 2,
                background: isDead ? '#9E9E9E' : (isSick ? '#FF5252' : 'rgba(255, 255, 255, 0.8)'),
                color: isDead || isSick ? 'white' : 'var(--color-text-secondary)',
                padding: '4px 8px', borderRadius: 'var(--radius-tag)',
                fontSize: '0.7rem', fontWeight: 'bold'
            }}>
                {isDead ? '已離世' : (isSick ? '生病' : (s.type === 'LAMB' ? '小羊' : s.type))}
            </div>

            {/* Selection Checkbox Overlay */}
            {isSelectionMode && (
                <div style={{
                    position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: isSelected ? 'var(--color-action-blue)' : 'white',
                    border: '2px solid #ddd',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold'
                }}>
                    {isSelected && '✓'}
                </div>
            )}

            {/* Avatar Section */}
            <div style={{
                flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                marginBottom: '10px', overflow: 'hidden'
            }}>
                <AssetSheep
                    status={s.status}
                    visual={s.visual}
                    health={s.health}
                    type={s.type}
                    scale={0.8}
                    direction={1}
                    centered={true}
                />
            </div>

            {/* Info Section */}
            <div style={{ width: '100%', textAlign: 'center' }}>
                <div style={{
                    fontWeight: 'bold', fontSize: '1rem', color: 'var(--color-text-brown)',
                    marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                    {s.name}
                </div>

                {/* Health Bar (if alive) */}
                {!isDead && (
                    <div style={{
                        width: '80%', height: '6px', background: '#EEE',
                        borderRadius: '3px', margin: '0 auto 8px auto', overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${s.health || 100}%`, height: '100%',
                            background: s.health < 30 ? '#FF5252' : '#81C784'
                        }} />
                    </div>
                )}

                {/* Primary Action Button */}
                {!isSelectionMode && (
                    <button style={{
                        width: '100%', padding: '8px 0',
                        background: isDead ? 'var(--color-status-orange)' : 'var(--color-primary-pink)',
                        color: 'white', border: 'none',
                        borderRadius: 'var(--radius-btn)',
                        fontWeight: 'bold', fontSize: '0.85rem'
                    }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(s);
                        }}
                    >
                        {isDead ? '回憶' : '禱告'}
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Main List Component ---
export const SheepList = ({ onSelect, onClose }) => {
    const { sheep, deleteMultipleSheep, updateSheep } = useGame();
    const sortedSheep = [...(sheep || [])].sort((a, b) => a.id - b.id);

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [editingSheep, setEditingSheep] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Filter Logic
    const filteredSheep = useMemo(() => sortedSheep.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isDead = s.status === 'dead';
        const isSick = s.status === 'sick';

        if (!matchesSearch) return false;
        if (filterStatus === 'DEAD') return isDead;
        if (filterStatus === 'SICK') return isSick;
        if (filterStatus === 'HEALTHY') return !isDead && !isSick;
        return true;
    }), [sortedSheep, searchTerm, filterStatus]);

    // Counts Logic
    const counts = useMemo(() => sortedSheep.reduce((acc, s) => {
        const isDead = s.status === 'dead';
        const isSick = s.status === 'sick';
        if (isDead) acc.DEAD++;
        else if (isSick) acc.SICK++;
        else acc.HEALTHY++;
        return acc;
    }, { ALL: sortedSheep.length, HEALTHY: 0, SICK: 0, DEAD: 0 }), [sortedSheep]);

    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredSheep.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredSheep.map(s => s.id)));
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        if (window.confirm(`確定要刪除這 ${selectedIds.size} 隻小羊嗎？`)) {
            deleteMultipleSheep(Array.from(selectedIds));
            setIsSelectionMode(false);
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="sheep-list-container" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            animation: 'fadeIn 0.3s'
        }} onClick={onClose}>

            {/* Modal Content */}
            <div style={{
                width: '100%', maxWidth: '420px', height: '90%',
                background: 'var(--color-primary-cream)',
                borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden', boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
                animation: 'slideUp 0.3s'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '24px 20px 10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-text-brown)', fontSize: '1.5rem' }}>
                        小羊圖鑑
                    </h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
                            style={{ background: isSelectionMode ? 'var(--color-action-blue)' : '#FFF', border: '1px solid #DDD', borderRadius: '20px', padding: '6px 12px', fontSize: '0.8rem', color: isSelectionMode ? 'white' : '#666' }}>
                            {isSelectionMode ? '完成' : '編輯'}
                        </button>
                        <button onClick={onClose} style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.2rem', color: '#666' }}>
                            ✕
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ padding: '0 20px 10px 20px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {[
                        { id: 'ALL', label: '全部' },
                        { id: 'HEALTHY', label: '健康' },
                        { id: 'SICK', label: '生病' },
                        { id: 'DEAD', label: '離世' }
                    ].map(f => (
                        <button key={f.id} onClick={() => setFilterStatus(f.id)}
                            style={{
                                padding: '6px 16px', borderRadius: '20px', border: 'none',
                                background: filterStatus === f.id ? 'var(--color-text-brown)' : 'rgba(93, 64, 55, 0.1)',
                                color: filterStatus === f.id ? 'white' : 'var(--color-text-brown)',
                                fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}>
                            {f.label} {counts[f.id]}
                        </button>
                    ))}
                </div>

                {/* Grid Content */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '10px 20px 40px 20px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignContent: 'start'
                }}>
                    {filteredSheep.map(s => (
                        <SheepCard
                            key={s.id}
                            s={s}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedIds.has(s.id)}
                            onSelect={onSelect}
                            onToggleSelect={toggleSelection}
                            isDead={s.status === 'dead'}
                            isSick={s.status === 'sick'}
                        />
                    ))}

                    {filteredSheep.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#AAA' }}>
                            沒有找到小羊...
                        </div>
                    )}
                </div>

                {/* Selection Actions Footer */}
                {isSelectionMode && (
                    <div style={{
                        padding: '16px 20px', background: 'white', borderTop: '1px solid #EEE',
                        display: 'flex', gap: '10px', justifyContent: 'space-between',
                        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
                    }}>
                        <button onClick={handleSelectAll} style={{ padding: '10px', borderRadius: '12px', background: '#F5F5F5', border: 'none', color: '#666', flex: 1 }}>
                            全選
                        </button>
                        <button onClick={handleDeleteSelected}
                            disabled={selectedIds.size === 0}
                            style={{
                                padding: '10px', borderRadius: '12px', flex: 2,
                                background: selectedIds.size > 0 ? '#FF5252' : '#EEE',
                                color: selectedIds.size > 0 ? 'white' : '#AAA', border: 'none', fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}>
                            刪除 ({selectedIds.size})
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Modal Overlay */}
            {editingSheep && (
                <AddSheepModal
                    editingSheep={editingSheep}
                    onConfirm={(updatedData) => {
                        if (updateSheep) updateSheep(editingSheep.id, updatedData);
                        setEditingSheep(null);
                    }}
                    onCancel={() => setEditingSheep(null)}
                />
            )}
        </div>
    );
};
