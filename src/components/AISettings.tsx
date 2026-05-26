import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Brain, Key, HelpCircle, ChevronDown, ChevronUp, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export const AISettings: React.FC = () => {
  const { geminiApiKey, setGeminiApiKey } = useTasks();
  const [keyInput, setKeyInput] = useState(geminiApiKey);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(keyInput.trim());
    setTestStatus('idle');
  };

  const handleTestConnection = async () => {
    const keyToTest = keyInput.trim();
    if (!keyToTest) {
      setTestStatus('error');
      setErrorMessage('Please enter an API Key first.');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToTest}`;
      const body = {
        contents: [{ parts: [{ text: 'Verify connection. Reply with the single word: "Success"' }] }]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || response.statusText);
      }

      setTestStatus('success');
      // Auto-save the key if connection is successful and it's different from the saved one
      if (keyToTest !== geminiApiKey) {
        setGeminiApiKey(keyToTest);
      }
    } catch (err) {
      console.error(err);
      setTestStatus('error');
      const errorObj = err as Error;
      setErrorMessage(errorObj.message || 'Connection failed.');
    }
  };

  const handleClearKey = () => {
    setGeminiApiKey('');
    setKeyInput('');
    setTestStatus('idle');
  };

  const getStatusBadge = () => {
    if (geminiApiKey && testStatus === 'idle') {
      return (
        <span className="sync-badge success">
          <Brain size={12} />
          Active
        </span>
      );
    }

    switch (testStatus) {
      case 'testing':
        return (
          <span className="sync-badge syncing">
            <RefreshCw size={12} className="spin-icon" />
            Testing...
          </span>
        );
      case 'success':
        return (
          <span className="sync-badge success">
            <CheckCircle2 size={12} />
            Connected
          </span>
        );
      case 'error':
        return (
          <span className="sync-badge error">
            <XCircle size={12} />
            Failed
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="sync-badge error" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            Setup Required
          </span>
        );
    }
  };

  return (
    <div id="ai-settings-panel" className="glass-panel sync-panel animate-fade-in" style={{ marginTop: '0' }}>
      <div className="sync-panel-header">
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Brain size={18} style={{ color: 'var(--primary-accent)' }} />
          Gemini AI Assistant
        </h4>
        {getStatusBadge()}
      </div>

      <form onSubmit={handleSave} className="sync-disconnected-form">
        {geminiApiKey ? (
          <div className="sync-connected-content" style={{ gap: '0.4rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600 }}>API Key:</span>
              <div className="client-id-preview" title={geminiApiKey}>
                {geminiApiKey.substring(0, 10)}...{geminiApiKey.slice(-10)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              >
                Test Key
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleClearKey}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="sync-disconnected-form">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Enter your Gemini API key to draft descriptions, suggest tags, and auto-breakdown subtasks.
            </p>

            <div className="form-group" style={{ margin: '0.4rem 0' }}>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter Gemini API Key..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                  required
                />
                <Key size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                Save Key
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              >
                {testStatus === 'testing' ? <RefreshCw size={12} className="spin-icon" /> : 'Test'}
              </button>
            </div>
          </div>
        )}
      </form>

      {errorMessage && (
        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.5rem', wordBreak: 'break-word', lineHeight: '1.3' }}>
          {errorMessage}
        </div>
      )}

      {/* Guide Dropdown */}
      <div className="sync-guide-wrapper" style={{ marginTop: '0.5rem' }}>
        <button
          className="sync-guide-toggle"
          onClick={() => setShowGuide(!showGuide)}
        >
          <HelpCircle size={14} />
          <span>How to get a free API Key?</span>
          {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showGuide && (
          <div className="sync-guide-content animate-scale-up" style={{ padding: '0.5rem' }}>
            <ol>
              <li>Go to the **[Google AI Studio](https://aistudio.google.com/)** console.</li>
              <li>Sign in with your Google account.</li>
              <li>Click **Get API key** in the top-left sidebar.</li>
              <li>Click **Create API key** &rarr; select a Google Cloud project (or create a new one).</li>
              <li>Copy the generated API Key.</li>
              <li>Paste the key into the input box above and click **Save Key**!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
