import { Terminal, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ExecutionResult {
  output: string;
  error: string;
  exitCode: number;
  executionTimeMs: number;
  timedOut: boolean;
}

interface Props {
  result: ExecutionResult | null;
  executing: boolean;
  language: string;
}

export default function OutputPanel({ result, executing, language }: Props) {
  return (
    <div className="output-panel">
      <div className="output-header">
        <div className="output-header-left">
          <Terminal size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="output-title">Output</span>
        </div>
      </div>

      <div className="output-body">
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
