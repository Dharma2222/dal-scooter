import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPartnerScooters, updateScooter, deleteScooter } from '../../api/gatewayClient';
import CreateScooterForm from './CreateScooterForm';
import Sidebar from '../../components/Sidebar'; // Adjust path if needed
import { 
  Edit, 
  Trash2, 
  PlusCircle, 
  MapPin, 
  Activity, 
  Zap, 
  Save, 
  X, 
  MoreVertical,
  Eye,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { decodeJwt } from '../../api/gatewayClient';

export default function PartnerDashboardPage() {
  const [scooters, setScooters] = useState([]);
  const [filteredScooters, setFilteredScooters] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: '', latitude: '', longitude: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const token = localStorage.getItem('authToken');
  const companyId = decodeJwt(token).sub;

  const loadScooters = async () => {
    try {
      setLoading(true);
      const data = await fetchPartnerScooters(companyId);
      // Map scooterId to id for React rendering
      const normalized = Array.isArray(data)
        ? data.map(s => ({ ...s, id: s.id || s.scooterId }))
        : [];
      setScooters(normalized);
      setFilteredScooters(normalized);
      console.log('Loaded scooters:', normalized); // Optional: See shape in console
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter scooters based on search and status
  useEffect(() => {
    let filtered = scooters;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(scooter =>
        scooter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scooter.id?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(scooter => scooter.status === statusFilter);
    }

    setFilteredScooters(filtered);
  }, [scooters, searchTerm, statusFilter]);

  useEffect(() => { loadScooters(); }, []);

  const handleEdit = (scooter) => {
    setEditing(scooter.id);
    setFormData({
      name: scooter.name,
      status: scooter.status,
      latitude: scooter.latitude,
      longitude: scooter.longitude
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({ name: '', status: '', latitude: '', longitude: '' });
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      await updateScooter({ scooterId: id, ...formData });
      setEditing(null);
      await loadScooters();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteScooter(id);
      setShowDeleteConfirm(null);
      await loadScooters();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      in_use: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      maintenance: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'available' ? 'bg-green-400' : status === 'in_use' ? 'bg-blue-400' : 'bg-amber-400'}`}></div>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const getStatusCounts = () => {
    return {
      total: scooters.length,
      available: scooters.filter(s => s.status === 'available').length,
      in_use: scooters.filter(s => s.status === 'in_use').length,
      maintenance: scooters.filter(s => s.status === 'maintenance').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your scooter fleet</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadScooters}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={20} />
                {showCreateForm ? "Close Form" : "Add Scooter"}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scooters</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.available}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Use</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.in_use}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-2xl font-bold text-amber-600">{statusCounts.maintenance}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Create Scooter Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Scooter</h2>
            <CreateScooterForm
              onCreate={loadScooters}
              onSuccess={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Map Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Scooter Locations
            </h2>
          </div>
          <div className="h-96">
            <MapContainer 
              center={[44.63873, -63.590765]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              className="rounded-b-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {filteredScooters.map(s => (
                <Marker key={s.id} position={[s.latitude, s.longitude]}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-sm text-gray-600">Status: {s.status}</p>
                      <p className="text-sm text-gray-600">ID: {s.id}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Scooter Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Scooter Management</h2>
              <p className="text-sm text-gray-600">{filteredScooters.length} scooters</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search scooters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scooter Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredScooters.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No scooters found</p>
                      <p className="text-gray-400">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredScooters.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editing === s.id ? (
                          <input
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Scooter name"
                          />
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{s.name}</div>
                            <div className="text-sm text-gray-500">ID: {s.id}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editing === s.id ? (
                          <select
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="available">Available</option>
                            <option value="in_use">In Use</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        ) : (
                          getStatusBadge(s.status)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editing === s.id ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              step="any"
                              value={formData.latitude}
                              onChange={e => setFormData({...formData, latitude: e.target.value})}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Latitude"
                            />
                            <input
                              type="number"
                              step="any"
                              value={formData.longitude}
                              onChange={e => setFormData({...formData, longitude: e.target.value})}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Longitude"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">
                            <div>Lat: {parseFloat(s.latitude).toFixed(4)}</div>
                            <div>Lng: {parseFloat(s.longitude).toFixed(4)}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editing === s.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSave(s.id)}
                              disabled={loading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              <Save size={14} />
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(s)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit scooter"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(s.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete scooter"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Scooter</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}