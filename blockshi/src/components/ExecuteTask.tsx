import { useState, useEffect, useRef } from 'react';
import {
  Target,
  MapPin,
  Info,
  Clock,
  Folder,
  Upload,
  FileText,
  X,
  Rocket
} from 'lucide-react';
import Layout from './Layout';
import './ExecuteTask.css';

interface Commitment {
  commitmentId: string;
  proofHash: string;
  timestamp: string;
  taskIdentifier: string;
  missionBrief: string;
  startTime: string;
  endTime: string;
  location: {
    lat: number;
    lng: number;
  };
}

const ExecuteTask = () => {
  const [locationInput, setLocationInput] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; time: string }>>([
    { name: 'site_photo_01.jpg', size: '2.4 MB', time: 'Just now' }
  ]);
  const [operatorNotes, setOperatorNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string>('');

  // Load commitments from localStorage
  useEffect(() => {
    const storedCommitments = localStorage.getItem('commitments');
    if (storedCommitments) {
      try {
        const parsed = JSON.parse(storedCommitments);
        setCommitments(parsed);
        // Set first commitment as default if available
        if (parsed.length > 0 && !selectedCommitmentId) {
          setSelectedCommitmentId(parsed[0].commitmentId);
        }
      } catch (e) {
        console.error('Failed to parse commitments', e);
      }
    }
  }, []);

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

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Geocoding function to convert location name to coordinates
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!locationInput.trim()) {
      setCoordinates(null);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Using OpenStreetMap Nominatim API for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoordinates({ lat, lng: lon });
        } else {
          setCoordinates(null);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setCoordinates(null);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [locationInput]);

  const handleSubmit = () => {
    console.log('Submitting execution:', {
      locationInput,
      coordinates,
      uploadedFiles,
      operatorNotes
    });
  };

  return (
    <Layout breadcrumb="execute task">
      <div className="execute-task-page">
        {/* Page Header */}
        <div className="execute-header">
          <div className="header-content">
            <h1 className="execute-title">EXECUTE TASK</h1>
            <div className="task-info">
              <label className="task-id-label">ID:</label>
              <select
                className="commitment-select"
                value={selectedCommitmentId}
                onChange={(e) => setSelectedCommitmentId(e.target.value)}
              >
                {commitments.length === 0 ? (
                  <option value="">No commitments available</option>
                ) : (
                  commitments.map((commitment) => (
                    <option key={commitment.commitmentId} value={commitment.commitmentId}>
                      {commitment.commitmentId}
                    </option>
                  ))
                )}
              </select>
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
                      placeholder="Enter location name (e.g., Los Angeles, CA)"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                    />
                    {isSearching && (
                      <span className="searching-indicator">Searching...</span>
                    )}
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
                    <span className="coordinate-text">
                      {coordinates
                        ? `${coordinates.lat >= 0 ? coordinates.lat.toFixed(4) + '° N' : Math.abs(coordinates.lat).toFixed(4) + '° S'}, ${coordinates.lng >= 0 ? coordinates.lng.toFixed(4) + '° E' : Math.abs(coordinates.lng).toFixed(4) + '° W'}`
                        : '---.--° N, ---.--° W'}
                    </span>
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
