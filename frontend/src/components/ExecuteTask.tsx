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
  Rocket,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import './ExecuteTask.css';
import { executeTask, hashFiles, getAllCommitments } from '../utils/api';

interface Commitment {
  commitmentId: string;
  proofHash?: string;
  timestamp: string;
  taskIdentifier?: string;
  missionBrief?: string;
  taskName?: string; // Backend uses taskName instead of taskIdentifier + missionBrief
  startTime?: string;
  endTime?: string;
  timeWindow?: {
    start: string;
    end: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

// Helper to convert date to local ISO string for datetime-local input
const toLocalISOString = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date.getTime() - tzOffset);
  return localTime.toISOString().slice(0, 16);
};

const ExecuteTask = () => {
  const [locationInput, setLocationInput] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [latitudeInput, setLatitudeInput] = useState('');
  const [longitudeInput, setLongitudeInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [coordinateErrors, setCoordinateErrors] = useState<{ latitude?: string; longitude?: string }>({});
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; name: string; size: string; time: string }>>([]);
  const [operatorNotes, setOperatorNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    poeHash: string;
    timestamp: string;
  } | null>(null);

  // Load commitments from backend API
  useEffect(() => {
    const loadCommitments = async () => {
      try {
        console.log('[ExecuteTask] Fetching commitments from backend...');
        const backendCommitments = await getAllCommitments();
        console.log('[ExecuteTask] Received commitments from backend:', backendCommitments);

        // Transform backend format to match frontend format
        const transformedCommitments = backendCommitments.map(commitment => ({
          commitmentId: commitment.commitmentId,
          timestamp: commitment.createdAt,
          taskName: commitment.taskName,
          location: commitment.location,
          timeWindow: commitment.timeWindow,
          // For display purposes, split taskName if needed
          taskIdentifier: commitment.taskName.split(' - ')[0] || commitment.taskName,
          missionBrief: commitment.taskName.split(' - ').slice(1).join(' - ') || '',
          startTime: new Date(commitment.timeWindow.start).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace(',', ''),
          endTime: new Date(commitment.timeWindow.end).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace(',', ''),
        }));

        setCommitments(transformedCommitments);

        // Set first commitment as default if available and none selected
        if (transformedCommitments.length > 0) {
          const firstCommitment = transformedCommitments[0];
          setSelectedCommitmentId(prev => {
            if (!prev) {
              // Set default execution time to current time if within window, otherwise start time
              const now = new Date();
              const start = new Date(firstCommitment.timeWindow.start);
              const end = new Date(firstCommitment.timeWindow.end);
              if (now >= start && now <= end) {
                setExecutionTime(toLocalISOString(now));
              } else {
                setExecutionTime(toLocalISOString(start));
              }
              return firstCommitment.commitmentId;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('[ExecuteTask] Failed to fetch commitments from backend:', error);
        // Fallback to localStorage if backend fails
        const storedCommitments = localStorage.getItem('commitments');
        if (storedCommitments) {
          try {
            const parsed = JSON.parse(storedCommitments);
            setCommitments(parsed);
            if (parsed.length > 0) {
              setSelectedCommitmentId(prev => prev || parsed[0].commitmentId);
            }
          } catch (e) {
            console.error('[ExecuteTask] Failed to parse localStorage commitments', e);
          }
        }
      }
    };

    loadCommitments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update execution time when selected commitment changes
  useEffect(() => {
    if (selectedCommitmentId && commitments.length > 0) {
      const selectedCommitment = commitments.find(c => c.commitmentId === selectedCommitmentId);
      if (selectedCommitment && selectedCommitment.timeWindow && !executionTime) {
        const now = new Date();
        const start = new Date(selectedCommitment.timeWindow.start);
        const end = new Date(selectedCommitment.timeWindow.end);
        if (now >= start && now <= end) {
          setExecutionTime(toLocalISOString(now));
        } else {
          setExecutionTime(toLocalISOString(start));
        }
      }
    }
  }, [selectedCommitmentId, commitments]);

  const handleFileUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(file => ({
        file,
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

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      setApiError('Geolocation is not supported by your browser');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setLatitudeInput(latitude.toFixed(6));
        setLongitudeInput(longitude.toFixed(6));
        setIsSearching(false);
        // Clear manual location input if geo was successful
        setLocationInput(''); 
      },
      (error) => {
        console.error('Error getting location:', error);
        setApiError('Failed to get location: ' + error.message);
        setIsSearching(false);
      },
      { enableHighAccuracy: true }
    );
  };

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
          // Update manual coordinate inputs
          setLatitudeInput(lat.toFixed(4));
          setLongitudeInput(lon.toFixed(4));
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

  // Handle manual coordinate input changes
  const handleLatitudeChange = (value: string) => {
    setLatitudeInput(value);
    const lat = parseFloat(value);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      setCoordinates({ lat, lng: coordinates?.lng || 0 });
      if (coordinateErrors.latitude) {
        setCoordinateErrors({ ...coordinateErrors, latitude: undefined });
      }
    } else if (value.trim() !== '') {
      setCoordinateErrors({ ...coordinateErrors, latitude: 'Latitude must be between -90 and 90' });
    }
  };

  const handleLongitudeChange = (value: string) => {
    setLongitudeInput(value);
    const lng = parseFloat(value);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      setCoordinates({ lat: coordinates?.lat || 0, lng });
      if (coordinateErrors.longitude) {
        setCoordinateErrors({ ...coordinateErrors, longitude: undefined });
      }
    } else if (value.trim() !== '') {
      setCoordinateErrors({ ...coordinateErrors, longitude: 'Longitude must be between -180 and 180' });
    }
  };

  const handleLatitudeBlur = () => {
    const lat = parseFloat(latitudeInput);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      setLatitudeInput(lat.toFixed(4));
      setCoordinates({ lat, lng: coordinates?.lng || 0 });
    } else if (latitudeInput.trim() === '') {
      if (coordinates) {
        setLatitudeInput(coordinates.lat.toFixed(4));
      }
    }
  };

  const handleLongitudeBlur = () => {
    const lng = parseFloat(longitudeInput);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      setLongitudeInput(lng.toFixed(4));
      setCoordinates({ lat: coordinates?.lat || 0, lng });
    } else if (longitudeInput.trim() === '') {
      if (coordinates) {
        setLongitudeInput(coordinates.lng.toFixed(4));
      }
    }
  };

  // Update manual inputs when coordinates change from geocoding
  useEffect(() => {
    if (coordinates) {
      setLatitudeInput(coordinates.lat.toFixed(4));
      setLongitudeInput(coordinates.lng.toFixed(4));
    }
  }, [coordinates]);

  const handleSubmit = async () => {
    // Validation
    if (!selectedCommitmentId) {
      setApiError('Please select a commitment');
      return;
    }


    if (!executionTime) {
      setApiError('Please enter an execution time');
      return;
    }

    // Validate execution time is within time window
    const selectedCommitment = commitments.find(c => c.commitmentId === selectedCommitmentId);
    if (selectedCommitment && selectedCommitment.timeWindow) {
      const execTime = new Date(executionTime);
      const startTime = new Date(selectedCommitment.timeWindow.start);
      const endTime = new Date(selectedCommitment.timeWindow.end);

      if (execTime < startTime || execTime > endTime) {
        setApiError(`Execution time must be between ${startTime.toLocaleString()} and ${endTime.toLocaleString()}`);
        return;
      }
    }

    // Determine final coordinates (from geocoding or manual entry)
    let finalCoordinates = coordinates;

    // If no coordinates but manual inputs exist, try to use them
    if (!finalCoordinates && latitudeInput && longitudeInput) {
      const lat = parseFloat(latitudeInput);
      const lng = parseFloat(longitudeInput);
      if (!isNaN(lat) && lat >= -90 && lat <= 90 && !isNaN(lng) && lng >= -180 && lng <= 180) {
        finalCoordinates = { lat, lng };
      }
    }

    if (!finalCoordinates) {
      setApiError('Please enter a valid location (either search by name or enter coordinates manually)');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setExecutionResult(null);

    try {
      console.log('[ExecuteTask] Starting execution submission');
      console.log('[ExecuteTask] Selected commitment:', selectedCommitmentId);
      console.log('[ExecuteTask] Coordinates:', finalCoordinates);
      console.log('[ExecuteTask] Execution time:', executionTime);
      console.log('[ExecuteTask] Uploaded files:', uploadedFiles.length);

      // Hash files if any are uploaded
      let evidenceFileHash: string | undefined;
      if (uploadedFiles.length > 0) {
        const files = uploadedFiles.map(f => f.file);
        evidenceFileHash = await hashFiles(files);
        console.log('[ExecuteTask] Evidence file hash:', evidenceFileHash);
      }

      // Convert datetime-local to ISO string
      const executionTimeISO = new Date(executionTime).toISOString();

      // Use finalCoordinates (from geocoding or manual entry)
      const finalLat = finalCoordinates.lat;
      const finalLng = finalCoordinates.lng;

      // Prepare request data
      const requestData = {
        commitmentId: selectedCommitmentId,
        executionLocation: {
          lat: finalLat,
          lng: finalLng,
        },
        executionTime: executionTimeISO,
        evidenceFile: uploadedFiles.length > 0 ? uploadedFiles[0].file : undefined,
      };

      console.log('[ExecuteTask] Making API call with data:', requestData);

      // Call backend API
      const response = await executeTask(requestData);

      console.log('[ExecuteTask] API call successful, response:', response);

      // Set success result
      setExecutionResult({
        poeHash: response.poeHash,
        timestamp: response.data.createdAt,
      });

      // Clear form
      setLocationInput('');
      setCoordinates(null);
      setLatitudeInput('');
      setLongitudeInput('');
      setUploadedFiles([]);
      setOperatorNotes('');
      setExecutionTime('');
      setCoordinateErrors({});
    } catch (error) {
      console.error('[ExecuteTask] Error executing task:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to execute task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              onChange={(e) => {
                const newCommitmentId = e.target.value;
                setSelectedCommitmentId(newCommitmentId);
                // Update execution time when commitment changes
                if (newCommitmentId) {
                  const selectedCommitment = commitments.find(c => c.commitmentId === newCommitmentId);
                  if (selectedCommitment && selectedCommitment.timeWindow) {
                    const now = new Date();
                    const start = new Date(selectedCommitment.timeWindow.start);
                    const end = new Date(selectedCommitment.timeWindow.end);
                    if (now >= start && now <= end) {
                      setExecutionTime(toLocalISOString(now));
                    } else {
                      setExecutionTime(toLocalISOString(start));
                    }
                  }
                }
              }}
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

            {/* Manual Coordinate Entry */}
            <div className="info-card">
              <div className="card-header">
                <h3 className="card-title">COORDINATE ENTRY</h3>
                <button 
                  onClick={getGeolocation}
                  className="gps-btn"
                  title="Use Current GPS Location"
                  style={{
                    background: 'none',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Target size={12} />
                  GPS
                </button>
              </div>
              <div className="card-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>LATITUDE</label>
                    <div className="input-wrapper">
                      <Target size={16} className="input-icon" />
                      <input
                        type="text"
                        className={`location-input ${coordinateErrors.latitude ? 'error' : ''}`}
                        placeholder="e.g., 34.0522"
                        value={latitudeInput}
                        onChange={(e) => handleLatitudeChange(e.target.value)}
                        onBlur={handleLatitudeBlur}
                      />
                      {coordinates && (
                        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '4px' }}>
                          {coordinates.lat >= 0 ? 'N' : 'S'}
                        </span>
                      )}
                    </div>
                    {coordinateErrors.latitude && (
                      <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        {coordinateErrors.latitude}
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#6b7280', marginTop: '20px' }}>/</span>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', display: 'block' }}>LONGITUDE</label>
                    <div className="input-wrapper">
                      <Target size={16} className="input-icon" />
                      <input
                        type="text"
                        className={`location-input ${coordinateErrors.longitude ? 'error' : ''}`}
                        placeholder="e.g., -118.2437"
                        value={longitudeInput}
                        onChange={(e) => handleLongitudeChange(e.target.value)}
                        onBlur={handleLongitudeBlur}
                      />
                      {coordinates && (
                        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '4px' }}>
                          {coordinates.lng >= 0 ? 'E' : 'W'}
                        </span>
                      )}
                    </div>
                    {coordinateErrors.longitude && (
                      <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        {coordinateErrors.longitude}
                      </span>
                    )}
                  </div>
                </div>
                <div className="info-text">
                  <Info size={14} className="info-icon" />
                  <span>Enter coordinates manually or use location search above.</span>
                </div>
              </div>
            </div>

            {/* Current Coordinate */}
            <div className="info-card">
              <div className="card-header">
                <h3 className="card-title">CURRENT COORDINATE</h3>
              </div>
              <div className="card-content">
                  {selectedCommitmentId ? (() => {
                      const selected = commitments.find(c => c.commitmentId === selectedCommitmentId);
                      const radius = (selected?.location as any)?.radius || 200;
                      return `Target Radius: ${radius}m`;
                    })() : 'Select Commitment'}
                  
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
                {selectedCommitmentId && (() => {
                  const selectedCommitment = commitments.find(c => c.commitmentId === selectedCommitmentId);
                  if (selectedCommitment && selectedCommitment.timeWindow) {
                    const start = new Date(selectedCommitment.timeWindow.start);
                    const end = new Date(selectedCommitment.timeWindow.end);
                    const now = new Date();
                    const isActive = now >= start && now <= end;
                    const timeLeft = end.getTime() - now.getTime();
                    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                    return (
                      <div className="status-display">
                        <Clock size={16} className="status-icon" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`status-text ${isActive ? 'active' : 'pending'}`}>
                            {isActive ? `ACTIVE ${hoursLeft}:${minutesLeft.toString().padStart(2, '0')} left` : 'INACTIVE'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {start.toLocaleString()} - {end.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="status-display">
                      <Clock size={16} className="status-icon" />
                      <span className="status-text pending">SELECT COMMITMENT</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Execution Time */}
            <div className="info-card">
              <div className="card-header">
                <h3 className="card-title">EXECUTION TIME</h3>
              </div>
              <div className="card-content">
                <div className="input-wrapper">
                  <Clock size={16} className="input-icon" />
                  <input
                    type="datetime-local"
                    className="location-input"
                    value={executionTime}
                    onChange={(e) => setExecutionTime(e.target.value)}
                  />
                </div>
                <div className="info-text">
                  <Info size={14} className="info-icon" />
                  <span>Execution time must be within the committed time window.</span>
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

            {/* API Error Display */}
            {apiError && (
              <div className="warning-box" style={{ backgroundColor: '#7f1d1d', borderColor: '#991b1b', marginBottom: '16px' }}>
                <AlertTriangle size={18} className="warning-icon" />
                <p className="warning-text" style={{ color: '#fca5a5' }}>
                  {apiError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Rocket size={18} />
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT EXECUTION'}
            </button>

            {/* Cancel Link */}
            <a href="#" className="cancel-link">
              Report Issue / Cancel
            </a>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {
        executionResult && (
          <div className="success-modal-overlay" onClick={() => setExecutionResult(null)}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setExecutionResult(null)}
              >
                <X size={20} />
              </button>
              <div className="success-content">
                <CheckCircle2 size={64} className="success-icon" />
                <h2 className="success-title">EXECUTION SUBMITTED</h2>
                <p className="success-message">
                  Your task execution has been verified and proof has been generated.
                </p>
                <div className="commitment-details">
                  <div className="detail-row">
                    <span className="detail-label">Proof Hash:</span>
                    <span className="detail-value hash">{executionResult.poeHash.substring(0, 20)}...</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Timestamp:</span>
                    <span className="detail-value">
                      {new Date(executionResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default ExecuteTask;
