import { useState } from 'react';
import {
  Target,
  MapPin,
  Info,
  Clock,
  Folder,
  Upload,
  FileText,
  X,
  Rocket,
  CheckCircle2
} from 'lucide-react';
import Layout from './Layout';
import './ExecuteTask.css';

const ExecuteTask = () => {
  const [locationInput, setLocationInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; time: string }>>([
    { name: 'site_photo_01.jpg', size: '2.4 MB', time: 'Just now' }
  ]);
  const [operatorNotes, setOperatorNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        time: 'Just now'
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log('Submitting execution:', {
      locationInput,
      uploadedFiles,
      operatorNotes
    });
  };

  return (
    <Layout breadcrumb="tasks / task #4092-ax">
      <div className="execute-task-page">
        {/* Page Header */}
        <div className="execute-header">
          <div className="header-content">
            <h1 className="execute-title">EXECUTE TASK</h1>
            <div className="task-info">
              <span className="task-id">ID: COMMIT-8821</span>
              <span className="info-separator">|</span>
              <span className="task-priority">PRIORITY: HIGH</span>
            </div>
          </div>
          <div className="session-info">
            <span className="session-text">Session ID: 0x8F92A1</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="execute-content">
          {/* Left Column - Geospatial Verification */}
          <div className="verification-panel">
            <div className="panel-header">
              <Target size={18} className="panel-icon" />
              <h2 className="panel-title">Geospatial Verification</h2>
            </div>

            <div className="verification-cards">
              {/* Manual Location Entry */}
              <div className="info-card">
                <div className="card-header">
                  <h3 className="card-title">MANUAL LOCATION ENTRY</h3>
                </div>
                <div className="card-content">
                  <div className="input-wrapper">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      className="location-input"
                      placeholder="Enter coordinates (Lat, Long) or Location ID"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                    />
                  </div>
                  <div className="info-text">
                    <Info size={14} className="info-icon" />
                    <span>Manual entry overrides GPS sensor data.</span>
                  </div>
                </div>
              </div>

              {/* Current Coordinate */}
              <div className="info-card">
                <div className="card-header">
                  <h3 className="card-title">CURRENT COORDINATE</h3>
                </div>
                <div className="card-content">
                  <div className="coordinate-display">
                    <Target size={16} className="coordinate-icon" />
                    <span className="coordinate-text">---.--° N, ---.--° W</span>
                  </div>
                </div>
              </div>

              {/* Target Geofence */}
              <div className="info-card">
                <div className="card-header">
                  <h3 className="card-title">TARGET GEOFENCE</h3>
                </div>
                <div className="card-content">
                  <div className="geofence-display">
                    <Target size={16} className="geofence-icon" />
                    <span className="geofence-text">Zone A-42 (Radius: 50m)</span>
                  </div>
                </div>
              </div>

              {/* Location Status */}
              <div className="status-card">
                <div className="card-header">
                  <h3 className="card-title">Location Status</h3>
                </div>
                <div className="card-content">
                  <div className="status-display">
                    <MapPin size={16} className="status-icon" />
                    <span className="status-text pending">PENDING INPUT</span>
                  </div>
                </div>
              </div>

              {/* Time Window */}
              <div className="status-card">
                <div className="card-header">
                  <h3 className="card-title">Time Window</h3>
                </div>
                <div className="card-content">
                  <div className="status-display">
                    <Clock size={16} className="status-icon" />
                    <span className="status-text active">ACTIVE 04:22 left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Evidence Upload */}
          <div className="evidence-panel">
            <div className="panel-header">
              <Folder size={18} className="panel-icon" />
              <h2 className="panel-title">Evidence Upload</h2>
            </div>

            <div className="evidence-content">
              {/* Upload Area */}
              <div
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload size={32} className="upload-icon" />
                <p className="upload-text">Click to upload or drag and drop</p>
                <p className="upload-formats">SVG, PNG, JPG or PDF (MAX. 10MB)</p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  className="file-input-hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept=".svg,.png,.jpg,.jpeg,.pdf"
                />
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <FileText size={16} className="file-icon" />
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-meta">{file.size} • {file.time}</span>
                      </div>
                      <button
                        className="file-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Operator Notes */}
              <div className="form-group">
                <label className="form-label">Operator Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add any additional context for verification..."
                  value={operatorNotes}
                  onChange={(e) => setOperatorNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button className="submit-btn" onClick={handleSubmit}>
                <Rocket size={18} />
                SUBMIT EXECUTION
              </button>

              {/* Cancel Link */}
              <a href="#" className="cancel-link">
                Report Issue / Cancel
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExecuteTask;
