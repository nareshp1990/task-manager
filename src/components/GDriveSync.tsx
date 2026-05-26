import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Cloud, CloudLightning, CloudOff, RefreshCw, Key, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const GDriveSync: React.FC = () => {
  const {
    googleClientId,
    googleSyncStatus,
    lastSyncedTime,
    connectGoogleDrive,
    syncWithGoogleDrive,
    disconnectGoogleDrive,
  } = useTasks();

  const [clientIdInput, setClientIdInput] = useState(googleClientId);
  const [showGuide, setShowGuide] = useState(false);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientIdInput.trim()) {
      connectGoogleDrive(clientIdInput.trim());
    }
  };

  const getStatusBadge = () => {
    switch (googleSyncStatus) {
      case 'syncing':
        return (
          <span className="sync-badge syncing">
            <RefreshCw size={12} className="spin-icon" />
            Syncing...
          </span>
        );
      case 'success':
        return (
          <span className="sync-badge success">
            <CloudLightning size={12} />
            Synced
          </span>
        );
      case 'error':
        return (
          <span className="sync-badge error">
            <CloudOff size={12} />
            Sync Failed
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="sync-badge connected">
            <Cloud size={12} />
            Connected
          </span>
        );
    }
  };

  return (
    <div id="sync-panel" className="glass-panel sync-panel animate-fade-in">
      <div className="sync-panel-header">
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Cloud size={18} style={{ color: 'var(--primary-accent)' }} />
          Cloud Sync
        </h4>
        {googleClientId && getStatusBadge()}
      </div>

      {googleClientId ? (
        // Connected View
        <div className="sync-connected-content">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600 }}>Client ID:</span>
            <div className="client-id-preview" title={googleClientId}>
              {googleClientId.substring(0, 12)}...{googleClientId.slice(-12)}
            </div>
          </div>

          {lastSyncedTime && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <span>Last synced: {lastSyncedTime}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => syncWithGoogleDrive()}
              disabled={googleSyncStatus === 'syncing'}
              style={{ flex: 2, padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} className={googleSyncStatus === 'syncing' ? 'spin-icon' : ''} />
              Sync Now
            </button>
            <button
              className="btn btn-danger"
              onClick={disconnectGoogleDrive}
              style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        // Disconnected View
        <form onSubmit={handleConnect} className="sync-disconnected-form">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Sync tasks automatically with Google Drive to run across browsers and devices.
          </p>

          <div className="form-group" style={{ margin: '0.5rem 0' }}>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Paste Google Client ID..."
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                required
              />
              <Key size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}>
            Connect Google Drive
          </button>
        </form>
      )}

      {/* Guide Dropdown */}
      <div className="sync-guide-wrapper">
        <button
          className="sync-guide-toggle"
          onClick={() => setShowGuide(!showGuide)}
        >
          <HelpCircle size={14} />
          <span>How to get a Client ID?</span>
          {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showGuide && (
          <div className="sync-guide-content animate-scale-up">
            <ol>
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>.</li>
              <li>Create a project, search **"Google Drive API"**, and click **Enable**.</li>
              <li>Under **OAuth Consent Screen**:
                <ul>
                  <li>Select **External** and complete the form.</li>
                  <li>Add scope: `.../auth/drive.appdata` (AppData private files).</li>
                  <li>Add your Gmail address under **Test Users**.</li>
                </ul>
              </li>
              <li>Under **Credentials**:
                <ul>
                  <li>Click **Create Credentials** &rarr; **OAuth client ID**.</li>
                  <li>Set application type to **Web application**.</li>
                  <li>Add **Authorized JavaScript Origins**:
                    <ul>
                      <li>Local: `http://localhost:5173`</li>
                      <li>Hosting: `https://&lt;your-username&gt;.github.io`</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>Create, copy your Client ID, and paste it above!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
