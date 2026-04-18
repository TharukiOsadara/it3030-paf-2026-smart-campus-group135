
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Resource } from '../types/Resource';
import { resourceApi } from '../api/resourceApi';
import { ResourceForm } from './ResourceForm';
import { Plus, Edit2, Trash2, Download, LayoutGrid, ShieldAlert, SunMedium } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCatalogueTab = location.pathname === '/dashboard/facilities';
  const isAdminTab = location.pathname === '/dashboard/facilities/admin';
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
    <div className="mx-auto max-w-[1380px] space-y-6">
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

      <section className="rounded-2xl border border-[#314a76]/65 bg-[linear-gradient(145deg,rgba(16,35,70,0.52),rgba(7,18,40,0.75))] p-6 shadow-[0_16px_36px_rgba(2,8,24,0.36)] backdrop-blur-sm">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-[#c4d4f8]">Manage resources, update details, and monitor availability.</p>
        </div>

        <div className="rounded-2xl border border-[#3b5688]/70 bg-[linear-gradient(140deg,rgba(26,45,82,0.65),rgba(14,28,56,0.78))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-4 font-semibold text-[#13a2ff]">Resource Management</h2>
              <p className="mt-1 text-sm text-[#d7e4ff]">Add, update, or remove resources</p>
            </div>

            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-xl border border-[#4f7fe3] px-5 py-2.5 font-semibold text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #0b63e5 0%, #1b74ee 100%)',
                boxShadow: '0 8px 22px rgba(11,99,229,0.35)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(11,99,229,0.46)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 22px rgba(11,99,229,0.35)';
              }}
            >
              <Plus className="h-5 w-5" />
              Add Resource
            </button>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-[#3a517f]/75 bg-[linear-gradient(160deg,rgba(15,31,59,0.82),rgba(8,19,42,0.9))] shadow-[0_18px_40px_rgba(1,7,23,0.45)]">
        {loading ? (
          <div className="flex justify-center py-12">
            <div
              className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-transparent"
              style={{ borderTopColor: '#7C3AED', borderBottomColor: '#3B82F6' }}
            ></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-[#355081] bg-[rgba(13,27,51,0.86)] text-xs uppercase tracking-[0.08em] text-[#d3e0ff]">
                  <th className="w-[30%] px-6 py-4 font-semibold">Name</th>
                  <th className="w-[18%] px-6 py-4 font-semibold">Type</th>
                  <th className="w-[23%] px-6 py-4 font-semibold">Location</th>
                  <th className="w-[17%] px-6 py-4 font-semibold">Status</th>
                  <th className="w-[12%] px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2f476f]">
                {resources.map(resource => (
                  <tr key={resource.id} className="transition-colors duration-200 hover:bg-[rgba(37,58,99,0.42)]">
                    <td className="px-6 py-5 text-base font-semibold text-[#33b8ff]">
                      <span className="block truncate" title={resource.name}>{resource.name}</span>
                    </td>
                    <td className="px-6 py-5 text-base text-[#d4dcf1]">
                      <span className="block truncate uppercase tracking-wide" title={resource.type}>{resource.type}</span>
                    </td>
                    <td className="px-6 py-5 text-base text-[#c7d5f1]">
                      <span className="block truncate" title={resource.location}>{resource.location}</span>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
                          resource.status === 'ACTIVE'
                            ? 'bg-emerald-400/15 text-emerald-300 shadow-[0_0_14px_rgba(74,222,128,0.25)]'
                            : 'bg-red-500/15 text-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.25)]'
                        }`}
                      >
                        {resource.status ? resource.status.replace('_', ' ') : 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(resource.id)}
                          className="rounded-lg border border-[#40609a] bg-[rgba(17,34,66,0.8)] p-2 text-[#ced9f2] transition-colors hover:border-[#5d84d2] hover:text-white"
                          aria-label={`Edit ${resource.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(resource.id)}
                          className="rounded-lg border border-[#40609a] bg-[rgba(17,34,66,0.8)] p-2 text-[#ced9f2] transition-colors hover:border-red-400/60 hover:text-red-300"
                          aria-label={`Delete ${resource.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {resources.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#afc2e8]">
                      No resources found. Click "Add Resource" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end border-t border-[#2f476f] bg-[rgba(9,20,44,0.82)] px-6 py-5">
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