import { Resource } from '../types/Resource';

const BASE_URL = 'http://localhost:8081/api/resources';

export const resourceApi = {
  getAll: async (): Promise<Resource[]> => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch resources');
    return response.json();
  },
  
  getById: async (id: string): Promise<Resource> => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Resource not found');
    return response.json();
  },
  
  create: async (resource: Omit<Resource, 'id'>): Promise<Resource> => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource),
    });
    if (!response.ok) throw new Error('Failed to create resource');
    return response.json();
  },
  
  update: async (id: string, resource: Omit<Resource, 'id'>): Promise<Resource> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource),
    });
    if (!response.ok) throw new Error('Failed to update resource');
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete resource');
  }
};
