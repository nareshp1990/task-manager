import React, { useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { Download, Upload } from 'lucide-react';

export const ImportExport: React.FC = () => {
  const { tasks, categories, importData, addToast } = useTasks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export tasks and categories as JSON file
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify({ tasks, categories }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `zentask_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      addToast('Backup exported successfully');
    } catch {
      addToast('Failed to export backup');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Validate imported JSON data format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateImportData = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.tasks) || !Array.isArray(data.categories)) return false;
    
    // Check key fields on each task
    for (const t of data.tasks) {
      if (
        typeof t.id !== 'string' ||
        typeof t.title !== 'string' ||
        typeof t.completed !== 'boolean' ||
        typeof t.priority !== 'string' ||
        typeof t.category !== 'string'
      ) {
        return false;
      }
      
      // Check subtasks if present
      if (t.subtasks && Array.isArray(t.subtasks)) {
        for (const st of t.subtasks) {
          if (typeof st.id !== 'string' || typeof st.title !== 'string' || typeof st.completed !== 'boolean') {
            return false;
          }
        }
      }
    }
    
    // Check categories are strings
    for (const c of data.categories) {
      if (typeof c !== 'string') return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    fileReader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        const parsedData = JSON.parse(fileContent);
        
        if (validateImportData(parsedData)) {
          importData(parsedData.tasks, parsedData.categories);
        } else {
          addToast('Invalid file format. Import failed.');
        }
      } catch {
        addToast('Error reading file. Make sure it is valid JSON.');
      }
      
      // Reset input value to allow uploading same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    
    fileReader.readAsText(files[0]);
  };

  return (
    <div className="import-export-wrapper">
      <button className="btn btn-secondary" onClick={handleExport} style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
        <Download size={14} />
        Export Backup
      </button>
      <button className="btn btn-secondary" onClick={handleImportClick} style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
        <Upload size={14} />
        Import Backup
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden-file-input"
        accept=".json"
      />
    </div>
  );
};
