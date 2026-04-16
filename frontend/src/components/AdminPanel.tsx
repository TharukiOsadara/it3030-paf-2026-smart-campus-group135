
import React, { useState, useEffect } from 'react';
import { Resource } from '../types/Resource';
import { resourceApi } from '../api/resourceApi';
import { ResourceForm } from './ResourceForm';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AdminPanel: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceApi.getAll();
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleAdd = () => {
    setEditingId(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setResourceToDelete(id);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;
    try {
      await resourceApi.delete(resourceToDelete);
      loadResources();
    } catch (error) {
      console.error('Failed to delete resource', error);
    } finally {
      setResourceToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    loadResources();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const generatedAt = new Date().toLocaleString();

    const totalResources = resources.length;
    const activeCount = resources.filter(r => r.status === 'ACTIVE').length;
    const inactiveCount = totalResources - activeCount;

    const typeCounts = resources.reduce<Record<string, number>>((acc, resource) => {
      const key = resource.type || 'UNKNOWN';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const locationCounts = resources.reduce<Record<string, number>>((acc, resource) => {
      const key = resource.location || 'UNKNOWN';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const totalCapacity = resources.reduce((sum, resource) => sum + (Number(resource.capacity) || 0), 0);
    const averageCapacity =
      totalResources > 0 ? (totalCapacity / totalResources).toFixed(2) : '0.00';

    doc.setFillColor(11, 61, 145);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('Smart Campus Resource Report', 14, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, pageWidth - 14, 17, { align: 'right' });

    doc.setTextColor(25, 25, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Report Overview', 14, 40);

    autoTable(doc, {
      startY: 46,
      head: [['Metric', 'Value']],
      body: [
        ['Total Resources', String(totalResources)],
        ['Active Resources', String(activeCount)],
        ['Inactive / Out of Service Resources', String(inactiveCount)],
        ['Total Capacity', String(totalCapacity)],
        ['Average Capacity', String(averageCapacity)]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [10, 132, 255],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    const resourceRows = resources.map((resource, index) => [
      String(index + 1),
      resource.name || '-',
      resource.type || '-',
      resource.location || '-',
      String(resource.capacity ?? '-'),
      resource.status ? resource.status.replace('_', ' ') : 'UNKNOWN'
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['#', 'Name', 'Type', 'Location', 'Capacity', 'Status']],
      body: resourceRows.length > 0 ? resourceRows : [['-', 'No resources found', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: {
        fillColor: [11, 61, 145],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });

    const statusRows = [
      ['ACTIVE', String(activeCount)],
      ['OUT OF SERVICE / OTHER', String(inactiveCount)]
    ];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Status Summary', 'Count']],
      body: statusRows,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 139, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    const typeRows = Object.entries(typeCounts).map(([type, count]) => [type, String(count)]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Type Summary', 'Count']],
      body: typeRows.length > 0 ? typeRows : [['No data', '0']],
      theme: 'grid',
      headStyles: {
        fillColor: [91, 91, 214],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    const locationRows = Object.entries(locationCounts).map(([location, count]) => [location, String(count)]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Location Summary', 'Count']],
      body: locationRows.length > 0 ? locationRows : [['No data', '0']],
      theme: 'grid',
      headStyles: {
        fillColor: [122, 31, 43],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Capacity Summary', 'Value']],
      body: [
        ['Total Capacity', String(totalCapacity)],
        ['Average Capacity', String(averageCapacity)]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [255, 159, 10],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    doc.save('smart_campus_resource_report.pdf');
  };

  if (isFormOpen) {
    return (
      <ResourceForm
        resourceId={editingId}
        onSuccess={handleFormSuccess}
        onCancel={() => setIsFormOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface p-6 rounded-xl border border-border transition-colors duration-300">
        <div>
          <h2 className="text-xl font-semibold text-primary">Resource Management</h2>
          <p className="text-sm text-secondary mt-1">Add, update, or remove resources</p>
        </div>

        <button
          onClick={handleAdd}
          className="text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          style={{
            background: '#0B3D91',
            boxShadow: '0 4px 15px rgba(11,61,145,0.30)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#124AAE';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(11,61,145,0.42)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0B3D91';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(11,61,145,0.30)';
          }}
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="flex justify-center py-12">
            <div
              className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-transparent"
              style={{ borderTopColor: '#7C3AED', borderBottomColor: '#3B82F6' }}
            ></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-input text-xs uppercase tracking-wider text-secondary border-b border-border transition-colors duration-300">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resources.map(resource => (
                  <tr key={resource.id} className="hover:bg-input/50 transition-colors">
                    <td className="px-6 py-4 text-primary font-medium">{resource.name}</td>
                    <td className="px-6 py-4 text-muted">{resource.type}</td>
                    <td className="px-6 py-4 text-muted">{resource.location}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          resource.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {resource.status ? resource.status.replace('_', ' ') : 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(resource.id)}
                          className="p-2 text-secondary hover:text-primary bg-input rounded-lg border border-border transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(resource.id)}
                          className="p-2 text-secondary hover:text-red-500 bg-input rounded-lg border border-border transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {resources.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                      No resources found. Click "Add Resource" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end px-6 py-5 border-t border-border bg-surface">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="text-white font-semibold transition-all duration-200 flex items-center gap-3 rounded-xl px-5 py-3"
                style={{
                  background: 'linear-gradient(135deg, #0B3D91 0%, #124AAE 100%)',
                  boxShadow: '0 10px 30px rgba(11,61,145,0.28)',
                  border: '1px solid rgba(255,255,255,0.10)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 14px 36px rgba(11,61,145,0.40)';
                  e.currentTarget.style.filter = 'brightness(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(11,61,145,0.28)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                >
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm">Download PDF</span>
                  <span className="text-xs text-white/75">Smart Campus Resource Report</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {resourceToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl transition-colors duration-300">
            <h3 className="text-xl font-semibold text-primary mb-2">Confirm Deletion</h3>
            <p className="text-secondary mb-6">
              Are you sure you want to delete this resource? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResourceToDelete(null)}
                className="px-4 py-2 rounded-lg border border-border text-muted hover:bg-input transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};