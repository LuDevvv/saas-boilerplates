import { FC, useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Trash2
} from "lucide-react";
import { appToast } from "@/components/alerts/Toasts";
import { Button } from "@/components/ui/form/Button";
import { ModalLayout } from "@/layouts/ModalLayout";
import { Input } from "@/components/ui/form/Input";
import { Select } from "@/components/ui/form/Select";

const ReportsPage: FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "PDF" });

  useEffect(() => {
    const stored = localStorage.getItem('dash_reports');
    if (stored) {
      setReports(JSON.parse(stored));
    } else {
      const initialReports = [
        { id: "1", name: "Monthly Financial Summary", type: "PDF", date: "2024-03-01", size: "2.4 MB", status: "Ready" },
        { id: "2", name: "User Growth Q1", type: "CSV", date: "2024-03-05", size: "1.1 MB", status: "Ready" },
        { id: "3", name: "Security Audit Log", type: "JSON", date: "2024-03-10", size: "0.5 MB", status: "Ready" },
        { id: "4", name: "Inventory Forecast", type: "PDF", date: "2024-03-15", size: "3.2 MB", status: "Processing" }
      ];
      setReports(initialReports);
      localStorage.setItem('dash_reports', JSON.stringify(initialReports));
    }
  }, []);

  const saveReports = (newReports: any[]) => {
    setReports(newReports);
    localStorage.setItem('dash_reports', JSON.stringify(newReports));
  };

  const openCreateModal = () => {
    setFormData({ name: "", type: "PDF" });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      appToast.error({ title: "Validation Error", description: "Report name is required" });
      return;
    }

    const toastId = appToast.loading({ title: "Processing", description: "Generating your report..." });

    setTimeout(() => {
      const newReport = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        type: formData.type,
        date: new Date().toISOString().split('T')[0],
        size: (Math.random() * 5).toFixed(1) + " MB",
        status: "Ready"
      };
      
      saveReports([newReport, ...reports]);
      appToast.success({ title: "Success", description: "Report generated successfully" }, { id: toastId });
      setIsModalOpen(false);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    saveReports(reports.filter(r => r.id !== id));
    appToast.success({ title: "Deleted", description: "Report was removed." });
  };

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            System Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Generate and manage your business intelligence exports.
          </p>
        </div>
        <Button 
          onClick={openCreateModal}
          icon={FileText}
          className="rounded-xl h-11 px-6 font-bold tracking-wide active:scale-95 transition-all text-[11px] uppercase shadow-lg shadow-primary-500/10"
        >
          Generate New Report
        </Button>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
          />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Calendar size={18} />
            Date Range
          </button>
          <button className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Report Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Created At</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Size</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {filteredReports.map((report) => (
                <tr key={report.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                        <FileText size={20} />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-black tracking-widest text-gray-600 dark:text-gray-400">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500">{report.date}</td>
                  <td className="px-6 py-5 text-sm text-gray-500">{report.size}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      report.status === 'Ready' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${report.status === 'Ready' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => appToast.success({ title: "Downloading...", description: `${report.name} is being prepared.` })}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all" 
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(report.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                        title="Delete Report"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalLayout
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Report"
        subtitle="Configure your data export parameters."
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleSave}>
              Generate Report
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 py-2">
          <Input 
            label="Filename"
            placeholder="e.g. Q1_Summary"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select 
            label="Format"
            value={formData.type}
            onChange={(val) => setFormData({ ...formData, type: val as string })}
            options={[
              { label: "PDF Document", value: "PDF" },
              { label: "CSV Spreadsheet", value: "CSV" },
              { label: "JSON Data", value: "JSON" }
            ]}
          />
        </div>
      </ModalLayout>
    </div>
  );
};

export default ReportsPage;
