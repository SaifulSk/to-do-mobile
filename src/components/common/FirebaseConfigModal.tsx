import React, { useState } from 'react';
import { IonModal } from '@ionic/react';
import { Database, X, Check, RotateCcw } from 'lucide-react';
import { 
  getActiveFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  DEFAULT_FIREBASE_CONFIG 
} from '../../services/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState(() => getActiveFirebaseConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload();
    }, 800);
  };

  const handleReset = () => {
    clearFirebaseConfig();
    setConfig(DEFAULT_FIREBASE_CONFIG);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload();
    }, 800);
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      breakpoints={[0, 0.85, 1]}
      initialBreakpoint={0.85}
      className="modal-bottom-sheet"
    >
      <div className="sheet-handle" />
      <div className="modal-sheet-content">
        <div className="modal-sheet-header">
          <h2 className="modal-sheet-title">
            <Database size={20} color="var(--primary)" />
            Firebase Configuration
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 0 }}>
          Connected to the same Firebase credentials as your Zenith desktop app.
        </p>

        {savedSuccess && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 8, padding: 10, marginBottom: 14, color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600 }}>
            Configuration saved! Reloading application...
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Project ID</label>
            <input
              type="text"
              className="form-input"
              value={config.projectId}
              onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">API Key</label>
            <input
              type="text"
              className="form-input"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Auth Domain</label>
            <input
              type="text"
              className="form-input"
              value={config.authDomain}
              onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Storage Bucket</label>
            <input
              type="text"
              className="form-input"
              value={config.storageBucket}
              onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">App ID</label>
            <input
              type="text"
              className="form-input"
              value={config.appId}
              onChange={(e) => setConfig({ ...config, appId: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="submit" className="submit-btn" style={{ flex: 1 }}>
              <Check size={16} />
              <span>Save & Reload</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="icon-btn"
              style={{ width: 'auto', padding: '0 14px', borderRadius: 'var(--radius-md)', height: 44 }}
              title="Reset to default credentials"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </form>
      </div>
    </IonModal>
  );
};
