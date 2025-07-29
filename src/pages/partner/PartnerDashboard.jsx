import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPartnerScooters, updateScooter, deleteScooter } from '../../api/gatewayClient';
import CreateScooterForm from './CreateScooterForm';
import Sidebar from '../../components/Sidebar'; // Adjust path if needed
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { decodeJwt } from '../../api/gatewayClient';

export default function PartnerDashboardPage() {
  const [scooters, setScooters] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: '', latitude: '', longitude: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const token = localStorage.getItem('authToken');
  const companyId = decodeJwt(token).sub;
  console.log(companyId,"companyId")

  const loadScooters = async () => {
    try {
      const data = await fetchPartnerScooters(companyId);
      // Map scooterId to id for React rendering
      const normalized = Array.isArray(data)
        ? data.map(s => ({ ...s, id: s.id || s.scooterId }))
        : [];
      setScooters(normalized);
      console.log('Loaded scooters:', normalized); // Optional: See shape in console
    } catch (err) {
      console.error(err);
    }
  };
  

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
      await updateScooter({ scooterId: id, ...formData });
      setEditing(null);
      loadScooters();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this scooter?')) {
      try {
        await deleteScooter(id);
        loadScooters();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold">Partner Dashboard</h1>
        {/* Toggle button for CreateScooterForm */}
        <div>
          <button
            onClick={() => setShowCreateForm((show) => !show)}
            className="mb-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2 transition"
          >
            <PlusCircle size={20} />
            {showCreateForm ? "Close" : "Create Scooter"}
          </button>
          {showCreateForm && (
            <CreateScooterForm
              onCreate={loadScooters}
              onSuccess={() => setShowCreateForm(false)}
            />
          )}
        </div>

        {/* Map */}
        <MapContainer center={[44.63873 , -63.590765]} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {scooters.map(s => (
            <Marker key={s.id} position={[s.latitude, s.longitude]}>
              <Popup>
                {s.name}<br />Status: {s.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Scooter List with Edit/Delete */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Latitude</th>
                <th className="px-4 py-2">Longitude</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scooters.map(s => (
                <tr key={s.id} className="text-center">
                  <td className="border px-4 py-2">
                    {editing === s.id ? (
                      <input
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full border rounded px-2"
                      />
                    ) : s.name}
                  </td>
                  <td className="border px-4 py-2">
                    {editing === s.id ? (
                      <select
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full border rounded px-2"
                      >
                        <option value="available">Available</option>
                        <option value="in_use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    ) : s.status}
                  </td>
                  <td className="border px-4 py-2">
                    {editing === s.id ? (
                      <input
                        type="number"
                        value={formData.latitude}
                        onChange={e => setFormData({...formData, latitude: e.target.value})}
                        className="w-full border rounded px-2"
                      />
                    ) : s.latitude}
                  </td>
                  <td className="border px-4 py-2">
                    {editing === s.id ? (
                      <input
                        type="number"
                        value={formData.longitude}
                        onChange={e => setFormData({...formData, longitude: e.target.value})}
                        className="w-full border rounded px-2"
                      />
                    ) : s.longitude}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    {editing === s.id ? (
                      <>
                        <button
                          onClick={() => handleSave(s.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded"
                        >Save</button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1 bg-gray-300 rounded"
                        >Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(s)}
                          className="text-blue-600 hover:text-blue-800"
                        ><Edit size={16} /></button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 hover:text-red-800"
                        ><Trash2 size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
