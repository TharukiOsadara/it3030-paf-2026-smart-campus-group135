import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Resource } from '../types/Resource';
import { resourceApi } from '../api/resourceApi';
import { Search, Filter, MapPin, Users, Activity, SunMedium, Settings, LayoutGrid, ShieldAlert } from 'lucide-react';

type ResourceWithImage = Resource & {
  image?: string;
};

const LOCAL_IMAGE_KEY = 'resource_uploaded_images';

export const Catalogue: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const capacityOptions = Array.from(
    new Set(
      resources
        .map((resource) => Number(resource.capacity))
        .filter((value) => Number.isFinite(value) && value > 0)
    )
  ).sort((a, b) => a - b);
  const isCatalogueTab = location.pathname === '/dashboard/facilities';
  const isAdminTab = location.pathname === '/dashboard/facilities/admin';

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
    <div className="mx-auto max-w-[1380px] space-y-7">
      <div className="px-1 py-1">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#1742a6] text-xs font-bold text-white shadow-[0_5px_14px_rgba(22,66,166,0.45)]">
              S
            </span>
            <span className="text-base font-semibold tracking-tight text-[#8fb0ff]">Smart Campus</span>
          </div>
          <div className="ml-auto inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard/facilities')}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isCatalogueTab
                  ? 'border-[#86a8ff63] bg-[linear-gradient(145deg,rgba(47,73,128,0.62),rgba(25,43,84,0.72))] text-primary shadow-[0_10px_24px_rgba(21,50,112,0.45)]'
                  : 'border-transparent text-[#9ab1e4] hover:border-[#86a8ff3a] hover:bg-[rgba(39,61,109,0.45)] hover:text-primary'
              }`}
            >
              <LayoutGrid className={`h-4 w-4 ${isCatalogueTab ? 'text-[#b8cbff]' : 'text-[#8ea6d7]'}`} />
              Catalogue
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/facilities/admin')}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                isAdminTab
                  ? 'border-[#86a8ff63] bg-[linear-gradient(145deg,rgba(47,73,128,0.62),rgba(25,43,84,0.72))] text-primary shadow-[0_10px_24px_rgba(21,50,112,0.45)]'
                  : 'border-transparent text-[#9ab1e4] hover:border-[#86a8ff3a] hover:bg-[rgba(39,61,109,0.45)] hover:text-primary'
              }`}
            >
              <ShieldAlert className={`h-4 w-4 ${isAdminTab ? 'text-[#b8cbff]' : 'text-[#8ea6d7]'}`} />
              Admin
            </button>
            <button
              type="button"
              aria-label="System settings"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[#94acdc] transition-all duration-200 hover:border-[#86a8ff3a] hover:bg-[rgba(39,61,109,0.45)] hover:text-[#c1d2ff]"
            >
              <SunMedium className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-col gap-4 rounded-2xl border border-[#314a76]/75 bg-[rgba(7,18,40,0.58)] p-4 shadow-[0_14px_30px_rgba(3,10,28,0.45)] backdrop-blur-md transition-colors duration-300 md:flex-row md:flex-nowrap md:items-center md:justify-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f9ad0]" />
          <input
            type="text"
            placeholder="        Search by name or location..."
            className="w-full rounded-xl border border-[#365180]/90 bg-[rgba(12,26,52,0.52)] py-3 pl-10 pr-4 text-primary transition-colors placeholder:text-[#7f9ad0] focus:border-[#6f94ef] focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full gap-3 md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f9ad0]" />
            <select
              className="w-full appearance-none rounded-xl border border-[#365180]/90 bg-[rgba(12,26,52,0.52)] py-3 pl-11 pr-4 text-primary transition-colors focus:border-[#6f94ef] focus:outline-none"
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

          <div className="relative flex-1 md:w-56">
            <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f9ad0]" />
             <select
              className="w-full appearance-none rounded-xl border border-[#365180]/90 bg-[rgba(12,26,52,0.52)] py-3 pl-11 pr-4 text-primary transition-colors focus:border-[#6f94ef] focus:outline-none"
              value={minCapacity}
              onChange={(e) =>
                setMinCapacity(e.target.value ? Number(e.target.value) : '')
              }
            >
              <option value="">Min Capacity</option>
              {capacityOptions.map((capacity) => (
                <option key={capacity} value={capacity}>
                  {capacity}+
                </option>
              ))}
            </select>
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