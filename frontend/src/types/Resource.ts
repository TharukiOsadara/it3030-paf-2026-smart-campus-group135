export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';

export interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  availabilityWindows: string[];
  status: ResourceStatus;
  metadata: Record<string, any>;
}
