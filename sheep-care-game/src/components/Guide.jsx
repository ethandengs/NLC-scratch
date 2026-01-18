
import React from 'react';

export const Guide = ({ onClose }) => {
    return (
        <div className="debug-editor-overlay">
            <div className="simple-editor" style={{ width: '400px', textAlign: 'left' }}>
                <div className="editor-header">
                    <h3>📖 牧羊人手冊</h3>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                <div style={{ maxHeight: '60vh', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.5', color: '#000' }}>
                    <h4>1. 每日照顧與進化</h4>
                    <p>為了讓小羊循序漸進地成長，上帝限制了每日的影響力：</p>
                    <ul>
                        <li><strong>禱告次數:</strong> 每隻小羊每天最多接受 <strong>3 次</strong> 禱告。</li>
                        <li><strong>健康恢復:</strong> 每次禱告僅恢復少量健康，一天最多增加約 <strong>20%</strong>。</li>
                        <li><strong>生命進化:</strong> 持續照顧累積「關愛值」，小羊將會成長：
                            <div style={{ background: '#f5f5f5', padding: '5px 10px', borderRadius: '4px', margin: '5px 0', fontSize: '0.85rem' }}>
                                💡 <strong>關愛值來源：</strong> 每次「禱告」可獲得 <strong>+10</strong> 關愛值。
                            </div>
                            <ul style={{ marginTop: '5px', fontSize: '0.85rem', color: '#555' }}>
                                <li>🥚 <strong>小羊 (初始):</strong> 需要細心呵護的階段。</li>
                                <li>🐏 <strong>強壯的羊 (關愛 &gt; 100):</strong> 體型變大，長出羊角，更加堅強。</li>
                                <li>🧍 <strong>基督的門徒 (關愛 &gt; 300):</strong> 最終進化為人形，擁有基督榮耀的光環！能夠開始關心其他小羊。</li>
                            </ul>
                        </li>
                    </ul>

                    <h4>2. 生命值變化</h4>
                    <p>小羊的生命是很脆弱的，請務必每天關心牠們。</p>
                    <ul>
                        <li><strong>自然下降:</strong> 生命值會隨時間自然流逝，一天最多減少 <strong>20%</strong>。</li>
                        <li><strong>生病狀態:</strong> 生病或受傷時，健康狀況會稍有不同，但不會超過每日上限。</li>
                    </ul>

                    <h4>3. 死亡與迫切認領 (重要!)</h4>
                    <p>如果小羊不幸離世，牠會化作墓碑。唯有持續的信心能喚回生命：</p>
                    <ul>
                        <li><strong>復活條件:</strong> 需要 <strong>連續 5 天</strong> 進行「迫切認領禱告」。</li>
                        <li><strong>進度計算:</strong> 針對認領儀式，一天只能累積 <strong>1 次</strong> 進度。</li>
                        <li><strong>中斷歸零:</strong> 如果有一天忘記禱告（中斷），所有認領進度將 <strong>歸零</strong> 重來！</li>
                    </ul>

                    <h4>4. 觀察與紀錄</h4>
                    <p>善用備註功能 (✏️) 記錄小羊的特殊狀況，成為一個細心的好管家。</p>

                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        <em>"信心若沒有行為就是死的。"</em>
                    </p>
                </div>

                <div className="editor-actions">
                    <button className="save-btn" onClick={onClose}>我瞭解了</button>
                </div>
            </div>
        </div>
    );
};
