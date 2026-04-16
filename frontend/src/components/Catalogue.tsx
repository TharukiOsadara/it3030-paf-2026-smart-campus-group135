import React, { useState, useEffect } from 'react';
import { Resource } from '../types/Resource';
import { resourceApi } from '../api/resourceApi';
import { Search, Filter, MapPin, Users, Activity, Settings } from 'lucide-react';

type ResourceWithImage = Resource & {
  image?: string;
};

const LOCAL_IMAGE_KEY = 'resource_uploaded_images';

export const Catalogue: React.FC = () => {
  const [resources, setResources] = useState<ResourceWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minCapacity, setMinCapacity] = useState<number | ''>('');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);

      const data = await resourceApi.getAll();

      const savedImages: Record<string, string> = JSON.parse(
        localStorage.getItem(LOCAL_IMAGE_KEY) || '{}'
      );

      const mergedData: ResourceWithImage[] = data.map((resource: Resource) => ({
        ...resource,
        image: savedImages[resource.id] || undefined,
      }));

      setResources(mergedData);
    } catch (error) {
      console.error('Failed to load resources', error);
    } finally {
      setLoading(false);
    }
  };

  const saveImageToLocalStorage = (resourceId: string, imageBase64: string) => {
    const existingImages: Record<string, string> = JSON.parse(
      localStorage.getItem(LOCAL_IMAGE_KEY) || '{}'
    );

    existingImages[resourceId] = imageBase64;
    localStorage.setItem(LOCAL_IMAGE_KEY, JSON.stringify(existingImages));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    resourceId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Image = reader.result as string;

      setResources((prevResources) =>
        prevResources.map((resource) =>
          resource.id === resourceId
            ? { ...resource, image: base64Image }
            : resource
        )
      );

      saveImageToLocalStorage(resourceId, base64Image);
    };

    reader.readAsDataURL(file);
  };

  const removeUploadedImage = (resourceId: string) => {
    setResources((prevResources) =>
      prevResources.map((resource) =>
        resource.id === resourceId
          ? { ...resource, image: undefined }
          : resource
      )
    );

    const existingImages: Record<string, string> = JSON.parse(
      localStorage.getItem(LOCAL_IMAGE_KEY) || '{}'
    );

    delete existingImages[resourceId];
    localStorage.setItem(LOCAL_IMAGE_KEY, JSON.stringify(existingImages));
  };

  const getImageForType = (type: string): string => {
    const typeImages: Record<string, string> = {
      ROOM: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop',
      VEHICLE: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
      EQUIPMENT: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=200&fit=crop',
      LAB: 'https://images.unsplash.com/photo-1532094349884-543559059dee?w=400&h=200&fit=crop',
      AUDITORIUM: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop',
      OFFICE: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=200&fit=crop',
    };

    return (
      typeImages[type?.toUpperCase()] ||
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=200&fit=crop'
    );
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter ? resource.type === typeFilter : true;
    const matchesCapacity =
      minCapacity !== '' ? resource.capacity >= minCapacity : true;

    return matchesSearch && matchesType && matchesCapacity;
  });

  const uniqueTypes = Array.from(new Set(resources.map((r) => r.type)));

  const getFilteredMetadataEntries = (resource: ResourceWithImage) => {
    const hiddenKeys = new Set([
      'name',
      'type',
      'location',
      'capacity',
      'status',
      'availabilityWindows',
      'image',
      'id'
    ]);

    return Object.entries(resource.metadata || {}).filter(
      ([key]) => !hiddenKeys.has(key)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-surface p-6 rounded-xl border border-border transition-colors duration-300">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or location..."
            className="w-full bg-input border border-border text-primary rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
            <select
              className="w-full bg-input border border-border text-primary rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-purple-500 appearance-none transition-colors"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 md:w-48">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-4 h-4" />
            <input
              type="number"
              placeholder="Min Capacity"
              className="w-full bg-input border border-border text-primary rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
              value={minCapacity}
              onChange={(e) =>
                setMinCapacity(e.target.value ? Number(e.target.value) : '')
              }
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-transparent"
            style={{ borderTopColor: '#7C3AED', borderBottomColor: '#3B82F6' }}
          ></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => {
              const metadataEntries = getFilteredMetadataEntries(resource);

              return (
                <div
                  key={resource.id}
                  className="bg-surface rounded-xl overflow-hidden border border-border hover:border-purple-500 transition-colors duration-300 group"
                >
                  <div className="relative w-full h-40 overflow-hidden">
                    <img
                      src={resource.image || getImageForType(resource.type)}
                      alt={resource.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=200&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  <div className="px-6 pt-4 flex gap-2 flex-wrap">
                    <label className="inline-block bg-input border border-border px-3 py-2 rounded-lg text-sm cursor-pointer hover:border-purple-500 transition-colors">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, resource.id)}
                      />
                    </label>

                    {resource.image && (
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(resource.id)}
                        className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-2 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className="text-xs font-mono uppercase tracking-wider"
                          style={{
                            background: 'linear-gradient(to right, #7C3AED, #3B82F6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {resource.type}
                        </span>
                        <h3 className="text-xl font-semibold text-primary mt-1">
                          {resource.name}
                        </h3>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          resource.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {resource.status
                          ? resource.status.replace('_', ' ')
                          : 'UNKNOWN'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-secondary">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{resource.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Capacity: {resource.capacity}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>
                          Windows:{' '}
                          {(resource.availabilityWindows || []).join(', ') || 'None'}
                        </span>
                      </div>
                    </div>

                    {metadataEntries.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-2 mb-2 text-xs text-secondary uppercase tracking-wider">
                          <Settings className="w-3 h-3" />
                          <span>Metadata</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {metadataEntries.map(([key, value]) => (
                            <span
                              key={key}
                              className="bg-input px-2 py-1 rounded text-xs text-muted border border-border"
                            >
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-secondary">
              No resources found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};