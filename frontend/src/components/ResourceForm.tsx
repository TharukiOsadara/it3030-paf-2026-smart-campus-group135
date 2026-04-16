import React, { useState, useEffect } from 'react';
import { Resource } from '../types/Resource';
import { resourceApi } from '../api/resourceApi';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface ResourceFormProps {
  resourceId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({ resourceId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Omit<Resource, 'id'>>({
    name: '',
    type: '',
    capacity: 1,
    location: '',
    availabilityWindows: [''],
    status: 'ACTIVE',
    metadata: {}
  });

  const [metadataEntries, setMetadataEntries] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' }
  ]);

  useEffect(() => {
    if (resourceId) {
      loadResource(resourceId);
    }
  }, [resourceId]);

  const loadResource = async (id: string) => {
    try {
      setLoading(true);
      const data = await resourceApi.getById(id);
      setFormData({
        name: data.name,
        type: data.type,
        capacity: data.capacity,
        location: data.location,
        availabilityWindows: data.availabilityWindows.length ? data.availabilityWindows : [''],
        status: data.status,
        metadata: data.metadata
      });

      const entries = Object.entries(data.metadata || {}).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      setMetadataEntries(entries.length > 0 ? entries : [{ key: '', value: '' }]);
    } catch (err) {
      setError('Failed to load resource details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleWindowChange = (index: number, value: string) => {
    const newWindows = [...formData.availabilityWindows];
    newWindows[index] = value;
    setFormData(prev => ({ ...prev, availabilityWindows: newWindows }));
  };

  const addWindow = () => {
    setFormData(prev => ({
      ...prev,
      availabilityWindows: [...prev.availabilityWindows, '']
    }));
  };

  const removeWindow = (index: number) => {
    const newWindows = formData.availabilityWindows.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      availabilityWindows: newWindows.length ? newWindows : ['']
    }));
  };

  const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
    const newEntries = [...metadataEntries];
    newEntries[index][field] = value;
    setMetadataEntries(newEntries);
  };

  const addMetadataEntry = () => {
    setMetadataEntries(prev => [...prev, { key: '', value: '' }]);
  };

  const removeMetadataEntry = (index: number) => {
    setMetadataEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.type || !formData.location || formData.capacity < 1) {
      setError('Please fill in all required fields correctly.');
      return;
    }

    const metadata: Record<string, string> = {};
    metadataEntries.forEach(entry => {
      if (entry.key.trim() && entry.value.trim()) {
        metadata[entry.key.trim()] = entry.value.trim();
      }
    });

    const finalData = {
      ...formData,
      availabilityWindows: formData.availabilityWindows.filter(w => w.trim() !== ''),
      metadata
    };

    try {
      setLoading(true);
      if (resourceId) {
        await resourceApi.update(resourceId, finalData);
      } else {
        await resourceApi.create(finalData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    'w-full rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none';

  const inputStyle: React.CSSProperties = {
    background: 'rgba(11, 18, 32, 0.86)',
    border: '1.5px solid rgba(95, 141, 240, 0.28)',
    color: 'var(--text-primary)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
  };

  const iconButtonStyle: React.CSSProperties = {
    background: 'rgba(11, 18, 32, 0.86)',
    border: '1.5px solid rgba(95, 141, 240, 0.24)',
    color: 'var(--text-secondary)'
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className="relative rounded-2xl overflow-hidden p-6 md:p-8 shadow-2xl transition-colors duration-300"
        style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-default)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: 0.14 }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                145deg,
                rgba(10, 132, 255, 0.14) 0%,
                rgba(95, 141, 240, 0.10) 38%,
                rgba(139, 116, 234, 0.08) 68%,
                rgba(10, 14, 23, 0.78) 100%
              )
            `
          }}
        />

        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(10, 132, 255, 0.10)' }}
        />
        <div
          className="absolute -bottom-24 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(139, 116, 234, 0.08)' }}
        />

        <div className="relative z-10">
          <div
            className="flex justify-between items-center mb-6 pb-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <h2 className="text-2xl font-semibold text-primary">
              {resourceId ? 'Edit Resource' : 'Add New Resource'}
            </h2>

            <button
              onClick={onCancel}
              className="transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-lg mb-6"
              style={{
                background: 'rgba(255, 59, 48, 0.10)',
                border: '1px solid rgba(255, 59, 48, 0.35)',
                color: '#ff8b84'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.85)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10,132,255,0.16), inset 0 1px 0 rgba(255,255,255,0.03)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.28)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.02)';
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">Type *</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.85)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10,132,255,0.16), inset 0 1px 0 rgba(255,255,255,0.03)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.28)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.02)';
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.85)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10,132,255,0.16), inset 0 1px 0 rgba(255,255,255,0.03)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.28)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.02)';
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.85)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10,132,255,0.16), inset 0 1px 0 rgba(255,255,255,0.03)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.28)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.02)';
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClassName}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.85)';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10,132,255,0.16), inset 0 1px 0 rgba(255,255,255,0.03)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.28)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.02)';
                  }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-muted">Availability Windows</label>
                <button
                  type="button"
                  onClick={addWindow}
                  className="text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
                >
                  <span className="text-gradient flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    Add Window
                  </span>
                </button>
              </div>

              {formData.availabilityWindows.map((window, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={window}
                    onChange={(e) => handleWindowChange(index, e.target.value)}
                    placeholder="e.g. 09:00-17:00"
                    className="flex-1 rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.85)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10,132,255,0.16), inset 0 1px 0 rgba(255,255,255,0.03)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.28)';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.02)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeWindow(index)}
                    className="p-2 rounded-lg transition-colors"
                    style={iconButtonStyle}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-muted">Metadata (Key-Value Pairs)</label>
                <button
                  type="button"
                  onClick={addMetadataEntry}
                  className="text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
                >
                  <span className="text-gradient flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    Add Metadata
                  </span>
                </button>
              </div>

              {metadataEntries.map((entry, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={entry.key}
                    onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                    placeholder="Key"
                    className="w-1/3 rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.85)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10,132,255,0.16), inset 0 1px 0 rgba(255,255,255,0.03)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.28)';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.02)';
                    }}
                  />
                  <input
                    type="text"
                    value={entry.value}
                    onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 rounded-lg px-4 py-2.5 transition-all duration-200 focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.85)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10,132,255,0.16), inset 0 1px 0 rgba(255,255,255,0.03)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1.5px solid rgba(95, 141, 240, 0.28)';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.02)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeMetadataEntry(index)}
                    className="p-2 rounded-lg transition-colors"
                    style={iconButtonStyle}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-end gap-4">
              <div className="pt-6 flex justify-end gap-4">
  <button
    type="button"
    onClick={onCancel}
    className="px-6 py-2.5 rounded-lg text-white font-semibold transition-all duration-200"
    style={{
      background: '#7A1F2B',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 10px 24px rgba(122,31,43,0.28)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#922737';
      e.currentTarget.style.boxShadow = '0 14px 32px rgba(122,31,43,0.38)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#7A1F2B';
      e.currentTarget.style.boxShadow = '0 10px 24px rgba(122,31,43,0.28)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    Cancel
  </button>

  <button
    type="submit"
    disabled={loading}
    className="px-6 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
    style={{
      background: '#0A84FF',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 10px 28px rgba(10,132,255,0.32)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#2894FF';
      e.currentTarget.style.boxShadow = '0 14px 34px rgba(10,132,255,0.42)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#0A84FF';
      e.currentTarget.style.boxShadow = '0 10px 28px rgba(10,132,255,0.32)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    {loading ? (
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <Save className="w-5 h-5" />
    )}
    {resourceId ? 'Update Resource' : 'Save Resource'}
  </button>
</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};