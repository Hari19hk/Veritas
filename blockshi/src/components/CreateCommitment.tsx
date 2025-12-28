import { useState, useEffect } from 'react';
import {
  MapPin,
  Rocket,
  AlertTriangle,
  Target,
  Layers,
  Calendar,
  Clock
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
  const [taskName, setTaskName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -118.2437]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommit = async () => {
    if (!taskName || !startTime || !endTime) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      taskName,
      location: {
        lat: mapCenter[0],
        lng: mapCenter[1]
      },
      timeWindow: {
        start: new Date(startTime).toISOString(),
        end: new Date(endTime).toISOString()
      }
    };

    try {
      const response = await fetch('http://localhost:8080/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Commitment Created! ID: ${data.commitmentId}`);
        // Reset form
        setTaskName('');
        setStartTime('');
        setEndTime('');
      } else {
        alert(`Error: ${data.error || 'Failed to create commitment'}`);
      }
    } catch (error) {
      console.error('Error creating commitment:', error);
      alert('Network error. Is the backend running?');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="coordinates">
              <span>LAT: {mapCenter[0].toFixed(4)} N</span>
              <span className="coord-separator">/</span>
              <span>LON: {Math.abs(mapCenter[1]).toFixed(4)} W</span>
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
              {/* Task Name */}
              <div className="form-group">
                <label className="form-label">TASK NAME</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Medicine Delivery"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
              </div>

              {/* Time Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">START TIME</label>
                  <div className="time-input-wrapper">
                    <Calendar size={16} className="time-icon" />
                    <input
                      type="datetime-local"
                      className="form-input time-input"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">END TIME</label>
                  <div className="time-input-wrapper">
                    <Clock size={16} className="time-icon" />
                    <input
                      type="datetime-local"
                      className="form-input time-input"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
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
              <button className="commit-btn" onClick={handleCommit} disabled={isSubmitting}>
                <Rocket size={18} />
                {isSubmitting ? 'COMMITTING...' : 'COMMIT TASK'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCommitment;

