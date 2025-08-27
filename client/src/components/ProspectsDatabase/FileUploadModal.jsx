import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const FileUploadModal = ({ isOpen, onClose, onImportProspects }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Mapping
  const [fieldMapping, setFieldMapping] = useState({});
  const [availableFields, setAvailableFields] = useState([]);
  const fileInputRef = useRef(null);

  const requiredFields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'status', label: 'Status', required: false },
    { key: 'source', label: 'Source', required: false },
    { key: 'budgetMin', label: 'Budget Min', required: false },
    { key: 'budgetMax', label: 'Budget Max', required: false },
    { key: 'bedrooms', label: 'Bedrooms', required: false },
    { key: 'bathrooms', label: 'Bathrooms', required: false },
    { key: 'areaMin', label: 'Area Min', required: false },
    { key: 'areaMax', label: 'Area Max', required: false },
    { key: 'propertyTypes', label: 'Property Types', required: false },
    { key: 'locations', label: 'Locations', required: false },
    { key: 'features', label: 'Features', required: false },
    { key: 'notes', label: 'Notes', required: false }
  ];

  const resetModal = () => {
    setFile(null);
    setParsedData([]);
    setPreviewData([]);
    setErrors([]);
    setStep(1);
    setFieldMapping({});
    setAvailableFields([]);
    setDragActive(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const [processingMessage, setProcessingMessage] = useState('');

  const handleFile = async (selectedFile) => {
    setIsProcessing(true);
    setErrors([]);
    setProcessingMessage('Uploading file...');
    
    try {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        throw new Error('Please upload a CSV or Excel file');
      }

      setFile(selectedFile);
      setProcessingMessage('Reading file content...');
      
      // Petit délai pour montrer le message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (fileExtension === 'csv') {
        setProcessingMessage('Parsing CSV data...');
        await parseCSV(selectedFile);
      } else {
        setProcessingMessage('Parsing Excel data...');
        await parseExcel(selectedFile);
      }
      
      setProcessingMessage('Data processed successfully!');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStep(2);
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
            return;
          }
          
          const fields = results.meta.fields || [];
          setAvailableFields(fields);
          setParsedData(results.data);
          setPreviewData(results.data.slice(0, 5));
          resolve();
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  };

  const parseExcel = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    });
    
    if (jsonData.length === 0) {
      throw new Error('The Excel file appears to be empty');
    }
    
    const headers = jsonData[0].map(h => String(h).trim());
    const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== ''));
    
    const processedData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    setAvailableFields(headers);
    setParsedData(processedData);
    setPreviewData(processedData.slice(0, 5));
  };

  const proceedToMapping = () => {
    // Auto-map fields based on exact matches and common names
    const autoMapping = {};
    
    availableFields.forEach(field => {
      const lowerField = field.toLowerCase();
      const exactField = field.trim();
      
      // Exact matches first (case insensitive)
      if (exactField.toLowerCase() === 'name') {
        autoMapping.name = field;
      } else if (exactField.toLowerCase() === 'email') {
        autoMapping.email = field;
      } else if (exactField.toLowerCase() === 'phone') {
        autoMapping.phone = field;
      } else if (exactField.toLowerCase() === 'status') {
        autoMapping.status = field;
      } else if (exactField.toLowerCase() === 'source') {
        autoMapping.source = field;
      } else if (exactField.toLowerCase() === 'budget min') {
        autoMapping.budgetMin = field;
      } else if (exactField.toLowerCase() === 'budget max') {
        autoMapping.budgetMax = field;
      } else if (exactField.toLowerCase() === 'bedrooms') {
        autoMapping.bedrooms = field;
      } else if (exactField.toLowerCase() === 'bathrooms') {
        autoMapping.bathrooms = field;
      } else if (exactField.toLowerCase() === 'area min') {
        autoMapping.areaMin = field;
      } else if (exactField.toLowerCase() === 'area max') {
        autoMapping.areaMax = field;
      } else if (exactField.toLowerCase() === 'property types') {
        autoMapping.propertyTypes = field;
      } else if (exactField.toLowerCase() === 'locations') {
        autoMapping.locations = field;
      } else if (exactField.toLowerCase() === 'features') {
        autoMapping.features = field;
      } else if (exactField.toLowerCase() === 'notes') {
        autoMapping.notes = field;
      }
      // Fallback to partial matches if no exact match found
      else if (!autoMapping.name && (lowerField.includes('name') || lowerField === 'nom')) {
        autoMapping.name = field;
      } else if (!autoMapping.email && (lowerField.includes('email') || lowerField.includes('mail'))) {
        autoMapping.email = field;
      } else if (!autoMapping.phone && (lowerField.includes('phone') || lowerField.includes('telephone') || lowerField.includes('tel'))) {
        autoMapping.phone = field;
      } else if (!autoMapping.status && (lowerField.includes('status') || lowerField.includes('statut'))) {
        autoMapping.status = field;
      } else if (!autoMapping.source && lowerField.includes('source')) {
        autoMapping.source = field;
      } else if (!autoMapping.budgetMin && lowerField.includes('budget') && lowerField.includes('min')) {
        autoMapping.budgetMin = field;
      } else if (!autoMapping.budgetMax && lowerField.includes('budget') && lowerField.includes('max')) {
        autoMapping.budgetMax = field;
      } else if (!autoMapping.bedrooms && (lowerField.includes('bedroom') || lowerField.includes('chambre'))) {
        autoMapping.bedrooms = field;
      } else if (!autoMapping.bathrooms && (lowerField.includes('bathroom') || lowerField.includes('salle'))) {
        autoMapping.bathrooms = field;
      } else if (!autoMapping.areaMin && lowerField.includes('area') && lowerField.includes('min')) {
        autoMapping.areaMin = field;
      } else if (!autoMapping.areaMax && lowerField.includes('area') && lowerField.includes('max')) {
        autoMapping.areaMax = field;
      } else if (!autoMapping.propertyTypes && (lowerField.includes('property') && lowerField.includes('type'))) {
        autoMapping.propertyTypes = field;
      } else if (!autoMapping.locations && (lowerField.includes('location') || lowerField.includes('lieu'))) {
        autoMapping.locations = field;
      } else if (!autoMapping.features && (lowerField.includes('feature') || lowerField.includes('caractéristique'))) {
        autoMapping.features = field;
      } else if (!autoMapping.notes && lowerField.includes('note')) {
        autoMapping.notes = field;
      }
    });
    
    setFieldMapping(autoMapping);
    setStep(3);
  };

  const validateAndTransformData = () => {
    const transformedData = [];
    const validationErrors = [];

    parsedData.forEach((row, index) => {
      const prospect = {
        name: row[fieldMapping.name] || '',
        email: row[fieldMapping.email] || '',
        phone: row[fieldMapping.phone] || '',
        status: row[fieldMapping.status] || 'active',
        source: row[fieldMapping.source] || 'import',
        preferences: {
          budget: {
            min: parseInt(row[fieldMapping.budgetMin]) || 0,
            max: parseInt(row[fieldMapping.budgetMax]) || 0
          },
          propertyTypes: row[fieldMapping.propertyTypes] ? 
            row[fieldMapping.propertyTypes].split(',').map(t => t.trim().toLowerCase()) : [],
          locations: row[fieldMapping.locations] ? 
            row[fieldMapping.locations].split(',').map(l => l.trim()) : [],
          bedrooms: parseInt(row[fieldMapping.bedrooms]) || 0,
          bathrooms: parseInt(row[fieldMapping.bathrooms]) || 0,
          area: {
            min: parseInt(row[fieldMapping.areaMin]) || 0,
            max: parseInt(row[fieldMapping.areaMax]) || 0
          },
          features: row[fieldMapping.features] ? 
            row[fieldMapping.features].split(',').map(f => f.trim()) : []
        },
        notes: row[fieldMapping.notes] || ''
      };

      // Validation
      if (!prospect.name.trim()) {
        validationErrors.push(`Row ${index + 1}: Name is required`);
      }
      if (!prospect.email.trim()) {
        validationErrors.push(`Row ${index + 1}: Email is required`);
      }
      if (!prospect.phone.trim()) {
        validationErrors.push(`Row ${index + 1}: Phone is required`);
      }

      if (validationErrors.length === 0 || validationErrors.length < 3) {
        transformedData.push(prospect);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors.slice(0, 10)); // Show first 10 errors
      return null;
    }

    return transformedData;
  };

  const handleImport = () => {
    const transformedData = validateAndTransformData();
    if (transformedData) {
      onImportProspects(transformedData);
      handleClose();
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Name': 'John Doe',
        'Email': 'john@example.com',
        'Phone': '+212612345678',
        'Status': 'active',
        'Source': 'website',
        'Budget Min': '500000',
        'Budget Max': '800000',
        'Bedrooms': '3',
        'Bathrooms': '2',
        'Area Min': '100',
        'Area Max': '150',
        'Property Types': 'apartment,villa',
        'Locations': 'Casablanca,Rabat',
        'Features': 'Swimming Pool,Garage',
        'Notes': 'Looking for modern property'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'prospects_template.xlsx');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import Prospects</h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload CSV or Excel file to import multiple prospects
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Upload File</span>
            </div>
            <div className={`w-16 h-px mx-4 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Preview Data</span>
            </div>
            <div className={`w-16 h-px mx-4 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Map Fields</span>
            </div>
          </div>

          {/* Step 1: File Upload */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Download Template</h4>
                    <p className="text-sm text-blue-700">Get a sample Excel file with the correct format</p>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Template</span>
                  </button>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your file here or click to browse
                </h3>
                <p className="text-gray-600 mb-4">
                  Supports CSV, XLSX, and XLS files up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Choose File
                </button>
              </div>

              {/* Processing */}
              {isProcessing && (
                <div className="text-center py-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                  <p className="text-green-800 font-medium">{processingMessage}</p>
                  {processingMessage === 'Uploading file...' && (
                    <div className="mt-2">
                      <div className="w-32 bg-green-200 rounded-full h-2 mx-auto">
                        <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <h4 className="font-medium text-red-900">Upload Errors</h4>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview Data */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-800 font-medium">
                    Successfully parsed {parsedData.length} rows from {file?.name}
                  </span>
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Data Preview (First 5 rows)</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {availableFields.map(field => (
                          <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr key={index}>
                          {availableFields.map(field => (
                            <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {String(row[field] || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={proceedToMapping}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continue to Mapping
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Field Mapping */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Map Your File Columns to Prospect Fields</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Required fields are marked with *. Optional fields can be left unmapped.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={fieldMapping[field.key] || ''}
                      onChange={(e) => setFieldMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select column...</option>
                      {availableFields.map(availField => (
                        <option key={availField} value={availField}>{availField}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Validation Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <h4 className="font-medium text-red-900">Validation Errors</h4>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1 max-h-40 overflow-y-auto">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={!fieldMapping.name || !fieldMapping.email || !fieldMapping.phone}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import {parsedData.length} Prospects</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;