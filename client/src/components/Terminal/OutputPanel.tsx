import { Terminal, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ExecutionResult {
  output: string;
  error: string;
  exitCode: number;
  executionTimeMs: number;
  timedOut: boolean;
}

import { useState } from 'react';

interface Props {
  result: ExecutionResult | null;
  executing: boolean;
  language: string;
  stdin?: string;
  onStdinChange?: (value: string) => void;
}

export default function OutputPanel({ result, executing, language, stdin = '', onStdinChange }: Props) {
  const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');

  return (
    <div className="output-panel">
      <div className="output-header">
        <div className="output-header-left" style={{ display: 'flex', gap: 8 }}>
          <button 
            className={`btn btn-ghost file-tab ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
            style={{ padding: '4px 12px', background: activeTab === 'output' ? '#264f7830' : 'transparent' }}
          >
            <Terminal size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="output-title" style={{ marginLeft: 6 }}>Output</span>
          </button>
          <button 
            className={`btn btn-ghost file-tab ${activeTab === 'input' ? 'active' : ''}`}
            onClick={() => setActiveTab('input')}
            style={{ padding: '4px 12px', background: activeTab === 'input' ? '#264f7830' : 'transparent' }}
          >
            <span className="output-title">Input</span>
          </button>
        </div>
      </div>

      <div className="output-body" style={{ display: 'flex', flexDirection: 'column', padding: activeTab === 'input' ? 0 : undefined }}>
        {activeTab === 'input' ? (
          <textarea
            placeholder="Provide standard input (stdin) here..."
            value={stdin}
            onChange={(e) => onStdinChange?.(e.target.value)}
            style={{ 
              flex: 1, 
              background: '#0d1117', 
              color: '#e6edf3', 
              border: 'none', 
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '13px',
              resize: 'none',
              outline: 'none'
            }}
          />
        ) : (
          <>
            {executing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="spinner" />
                <span className="output-info">Running {language}...</span>
              </div>
            )}

            {!executing && !result && (
              <span className="output-info">Click "Run" to execute your code.</span>
            )}

            {!executing && result && (
              <>
                {result.output && <div className="output-stdout">{result.output}</div>}
                {result.error && <div className="output-stderr">{result.error}</div>}
                {!result.output && !result.error && (
                  <span className="output-info">Program finished with no output.</span>
                )}
              </>
            )}
          </>
        )}
      </div>

      {!executing && result && (
        <div className="output-meta">
          {result.timedOut ? (
            <span className="output-meta-badge timeout">
              <AlertTriangle size={12} /> Timed Out
            </span>
          ) : result.exitCode === 0 ? (
            <span className="output-meta-badge success">
              <CheckCircle size={12} /> Exit 0
            </span>
          ) : (
            <span className="output-meta-badge error">
              <XCircle size={12} /> Exit {result.exitCode}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {result.executionTimeMs}ms
          </span>
        </div>
      )}
    </div>
  );
}
