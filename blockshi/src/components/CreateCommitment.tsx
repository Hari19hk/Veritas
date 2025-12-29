import { useState, useEffect } from 'react';
import {
  MapPin,
  Rocket,
  AlertTriangle,
  Target,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from './Layout';
import './CreateCommitment.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green marker icon
const greenIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMGI5ODEiLz4KPC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  return null;
}

const CreateCommitment = () => {
  const [taskIdentifier, setTaskIdentifier] = useState('');
  const [missionBrief, setMissionBrief] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -118.2437]);
  const [latitudeInput, setLatitudeInput] = useState('34.0522');
  const [longitudeInput, setLongitudeInput] = useState('-118.2437');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitmentData, setCommitmentData] = useState<{
    commitmentId: string;
    proofHash: string;
    timestamp: string;
  } | null>(null);

  // Generate a random commitment ID
  const generateCommitmentId = () => {
    const prefix = 'CID';
    const random1 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const random2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random1}-${random2}-V2`;
  };

  // Generate a proof hash (simulated)
  const generateProofHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  // Handle coordinate input changes and update map
  const handleLatitudeChange = (value: string) => {
    setLatitudeInput(value);
    const lat = parseFloat(value);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      setMapCenter([lat, mapCenter[1]]);
      if (errors.latitude) {
        setErrors({ ...errors, latitude: '' });
      }
    }
  };

  const handleLongitudeChange = (value: string) => {
    setLongitudeInput(value);
    const lng = parseFloat(value);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      setMapCenter([mapCenter[0], lng]);
      if (errors.longitude) {
        setErrors({ ...errors, longitude: '' });
      }
    }
  };

  // Handle blur events to update map with final values
  const handleLatitudeBlur = () => {
    const lat = parseFloat(latitudeInput);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      setMapCenter([lat, mapCenter[1]]);
      setLatitudeInput(lat.toFixed(4));
    } else if (latitudeInput.trim() === '') {
      setLatitudeInput(mapCenter[0].toFixed(4));
    }
  };

  const handleLongitudeBlur = () => {
    const lng = parseFloat(longitudeInput);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      setMapCenter([mapCenter[0], lng]);
      setLongitudeInput(lng.toFixed(4));
    } else if (longitudeInput.trim() === '') {
      setLongitudeInput(mapCenter[1].toFixed(4));
    }
  };

  // Update input fields when map is clicked
  useEffect(() => {
    setLatitudeInput(mapCenter[0].toFixed(4));
    setLongitudeInput(mapCenter[1].toFixed(4));
  }, [mapCenter]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!taskIdentifier.trim()) {
      newErrors.taskIdentifier = 'Task identifier is required';
    } else if (!taskIdentifier.startsWith('#')) {
      newErrors.taskIdentifier = 'Task identifier must start with #';
    }

    if (!missionBrief.trim()) {
      newErrors.missionBrief = 'Mission brief is required';
    } else if (missionBrief.trim().length < 20) {
      newErrors.missionBrief = 'Mission brief must be at least 20 characters';
    }

    if (!startTime.trim()) {
      newErrors.startTime = 'Start time is required';
    }

    if (!endTime.trim()) {
      newErrors.endTime = 'End time is required';
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/;
    if (startTime && !dateRegex.test(startTime)) {
      newErrors.startTime = 'Format: mm/dd/yyyy, HH:MM';
    }
    if (endTime && !dateRegex.test(endTime)) {
      newErrors.endTime = 'Format: mm/dd/yyyy, HH:MM';
    }

    // Check if end time is after start time
    if (startTime && endTime && dateRegex.test(startTime) && dateRegex.test(endTime)) {
      const start = new Date(startTime.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, '$3-$1-$2T$4:$5'));
      const end = new Date(endTime.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, '$3-$1-$2T$4:$5'));
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    // Validate coordinates
    const lat = parseFloat(latitudeInput);
    const lng = parseFloat(longitudeInput);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCommit = async () => {
    if (!validateForm()) {
      return;
    }

    // Ensure coordinates are updated from inputs
    const lat = parseFloat(latitudeInput);
    const lng = parseFloat(longitudeInput);
    if (!isNaN(lat) && !isNaN(lng)) {
      setMapCenter([lat, lng]);
    }

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate commitment data
    const commitmentId = generateCommitmentId();
    const proofHash = generateProofHash();
    const timestamp = new Date().toISOString();

    // Use validated coordinates
    const finalLat = parseFloat(latitudeInput);
    const finalLng = parseFloat(longitudeInput);

    const data = {
      commitmentId,
      proofHash,
      timestamp,
      taskIdentifier,
      missionBrief,
      startTime,
      endTime,
      location: {
        lat: finalLat,
        lng: finalLng
      }
    };

    setCommitmentData({ commitmentId, proofHash, timestamp });

    // Store in localStorage
    const storedCommitments = localStorage.getItem('commitments');
    const commitments = storedCommitments ? JSON.parse(storedCommitments) : [];
    commitments.unshift(data); // Add to beginning
    localStorage.setItem('commitments', JSON.stringify(commitments));

    setIsSubmitting(false);
  };

  return (
    <Layout breadcrumb="create commitment">
      <div className="create-commitment-page">
        {/* Page Header */}
        <div className="commitment-header">
          <div className="header-content">
            <h1 className="commitment-title">CREATE EXECUTION COMMITMENT</h1>
            <p className="commitment-description">
              Define immutable task parameters for autonomous execution units. Once committed,
              these instructions cannot be rescinded.
            </p>
          </div>
          <div className="system-status">
            <div className="status-indicator"></div>
            <span className="status-text">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="commitment-content">
          {/* Left Panel - Map */}
          <div className="map-panel">
            <div className="panel-header">
              <MapPin size={18} className="panel-icon" />
              <h2 className="panel-title">SELECT TARGET LOCATION</h2>
            </div>
            <div className="coordinates-input-wrapper">
              <div className="coordinate-input-group">
                <label className="coordinate-label">LAT:</label>
                <input
                  type="text"
                  className={`coordinate-input ${errors.latitude ? 'error' : ''}`}
                  value={latitudeInput}
                  onChange={(e) => handleLatitudeChange(e.target.value)}
                  onBlur={handleLatitudeBlur}
                  placeholder="34.0522"
                />
                <span className="coordinate-direction">{mapCenter[0] >= 0 ? 'N' : 'S'}</span>
              </div>
              <span className="coord-separator">/</span>
              <div className="coordinate-input-group">
                <label className="coordinate-label">LON:</label>
                <input
                  type="text"
                  className={`coordinate-input ${errors.longitude ? 'error' : ''}`}
                  value={longitudeInput}
                  onChange={(e) => handleLongitudeChange(e.target.value)}
                  onBlur={handleLongitudeBlur}
                  placeholder="-118.2437"
                />
                <span className="coordinate-direction">{mapCenter[1] >= 0 ? 'E' : 'W'}</span>
              </div>
              {errors.latitude && (
                <span className="error-message coordinate-error">{errors.latitude}</span>
              )}
              {errors.longitude && (
                <span className="error-message coordinate-error">{errors.longitude}</span>
              )}
            </div>
            <div className="map-container">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: '6px' }}
                className="leaflet-container-custom"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={mapCenter} icon={greenIcon}>
                  <Popup>Target Location</Popup>
                </Marker>
                <MapController center={mapCenter} />
                <MapClickHandler
                  onMapClick={(lat, lng) => setMapCenter([lat, lng])}
                />
              </MapContainer>
              <div className="map-controls">
                <button
                  className="map-control-btn"
                  title="Center"
                  onClick={() => setMapCenter([34.0522, -118.2437])}
                >
                  <Target size={16} />
                </button>
                <button className="map-control-btn" title="Layers">
                  <Layers size={16} />
                </button>
              </div>
            </div>
            <div className="map-footer">
              <span className="grid-info">GRID: A7-44</span>
              <span className="scan-status">SCANNING ACTIVE</span>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="form-panel">
            <div className="panel-header">
              <div className="panel-icon-menu">
                <div className="menu-line"></div>
                <div className="menu-line"></div>
                <div className="menu-line"></div>
              </div>
              <h2 className="panel-title">TASK PARAMETERS</h2>
            </div>

            <div className="form-content">
              {/* Task Identifier */}
              <div className="form-group">
                <label className="form-label">TASK IDENTIFIER</label>
                <input
                  type="text"
                  className={`form-input ${errors.taskIdentifier ? 'error' : ''}`}
                  placeholder="# e.g., SECTOR_4_PATROL_ALPHA"
                  value={taskIdentifier}
                  onChange={(e) => {
                    setTaskIdentifier(e.target.value);
                    if (errors.taskIdentifier) {
                      setErrors({ ...errors, taskIdentifier: '' });
                    }
                  }}
                />
                {errors.taskIdentifier && (
                  <span className="error-message">{errors.taskIdentifier}</span>
                )}
              </div>

              {/* Mission Brief */}
              <div className="form-group">
                <label className="form-label">MISSION BRIEF</label>
                <textarea
                  className={`form-textarea ${errors.missionBrief ? 'error' : ''}`}
                  placeholder="Describe the operational parameters and constraints for this execution unit..."
                  value={missionBrief}
                  onChange={(e) => {
                    setMissionBrief(e.target.value);
                    if (errors.missionBrief) {
                      setErrors({ ...errors, missionBrief: '' });
                    }
                  }}
                  rows={6}
                />
                {errors.missionBrief && (
                  <span className="error-message">{errors.missionBrief}</span>
                )}
              </div>

              {/* Time Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">START TIME</label>
                  <div className="time-input-wrapper">
                    <Calendar size={16} className="time-icon" />
                    <input
                      type="text"
                      className={`form-input time-input ${errors.startTime ? 'error' : ''}`}
                      placeholder="mm/dd/yyyy, HH:MM"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        if (errors.startTime) {
                          setErrors({ ...errors, startTime: '' });
                        }
                      }}
                    />
                  </div>
                  {errors.startTime && (
                    <span className="error-message">{errors.startTime}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">END TIME</label>
                  <div className="time-input-wrapper">
                    <Clock size={16} className="time-icon" />
                    <input
                      type="text"
                      className={`form-input time-input ${errors.endTime ? 'error' : ''}`}
                      placeholder="mm/dd/yyyy, HH:MM"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        if (errors.endTime) {
                          setErrors({ ...errors, endTime: '' });
                        }
                      }}
                    />
                  </div>
                  {errors.endTime && (
                    <span className="error-message">{errors.endTime}</span>
                  )}
                </div>
              </div>

              {/* Warning Box */}
              <div className="warning-box">
                <AlertTriangle size={18} className="warning-icon" />
                <p className="warning-text">
                  Immutable Action: This commitment will be cryptographically signed and stored on
                  the ledger. It cannot be modified or deleted once committed.
                </p>
              </div>

              {/* Commit Button */}
              <button
                className="commit-btn"
                onClick={handleCommit}
                disabled={isSubmitting}
              >
                <Rocket size={18} />
                {isSubmitting ? 'COMMITTING...' : 'COMMIT TASK'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {commitmentData && (
          <div className="success-modal-overlay" onClick={() => setCommitmentData(null)}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setCommitmentData(null)}
              >
                <X size={20} />
              </button>
              <div className="success-content">
                <CheckCircle2 size={64} className="success-icon" />
                <h2 className="success-title">COMMITMENT CREATED</h2>
                <p className="success-message">
                  Your execution commitment has been cryptographically signed and stored on the ledger.
                </p>
                <div className="commitment-details">
                  <div className="detail-row">
                    <span className="detail-label">Commitment ID:</span>
                    <span className="detail-value">{commitmentData.commitmentId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Proof Hash:</span>
                    <span className="detail-value hash">{commitmentData.proofHash.substring(0, 20)}...</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Timestamp:</span>
                    <span className="detail-value">
                      {new Date(commitmentData.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CreateCommitment;

