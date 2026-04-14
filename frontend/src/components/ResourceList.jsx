import React, { useCallback, useEffect, useState } from 'react';
import { getResources } from '../services/resourceService';
import webSocketService from '../services/webSocketService';
import ResourceSearch from './ResourceSearch.jsx';

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getResources();
      setResources(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load resources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResourceEvent = useCallback(
    (event) => {
      if (event.action === 'DELETE') {
        setResources((prev) => prev.filter((r) => r.id !== event.resourceId));
        return;
      }
      if (event.action === 'CREATE' || event.action === 'UPDATE') {
        loadResources();
      }
    },
    [loadResources]
  );

  const connectWebSocket = useCallback(async () => {
    try {
      await webSocketService.connect();
      webSocketService.subscribe(handleResourceEvent);
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
    }
  }, [handleResourceEvent]);

  useEffect(() => {
    loadResources();
    connectWebSocket();
    return () => {
      webSocketService.disconnect();
    };
  }, [loadResources, connectWebSocket]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        Loading resources...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <ResourceSearch onSearch={setSearchTerm} />
      {/* Render resources here, filtered by searchTerm if needed */}
      <ul>
        {resources
          .filter((r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((resource) => (
            <li key={resource.id}>{resource.name}</li>
          ))}
      </ul>
    </div>
  );
};

export default ResourceList;
