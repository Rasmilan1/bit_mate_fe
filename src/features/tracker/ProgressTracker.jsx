import React from 'react';
import { BookOpen, CheckCircle2, Clock, FileCheck, Award, Flame } from 'lucide-react';

export default function ProgressTracker({ stats }) {
  if (!stats) return null;

  const {
    totalPDFs = 0,
    completed = 0,
    inProgress = 0,
    unread = 0,
    totalPagesRead = 0,
    totalPagesOverall = 0,
    overallPercentage = 0,
    subjectStats = []
  } = stats;

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Top Overview Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total PDFs */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalPDFs}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Study Materials</div>
          </div>
        </div>

        {/* Pages Read */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalPagesRead} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>/ {totalPagesOverall}</span></div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Pages Read</div>
          </div>
        </div>

        {/* Completed Materials */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{completed}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Mastered PDFs</div>
          </div>
        </div>

        {/* Reading Completion Rate */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{overallPercentage}%</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Overall Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
}
