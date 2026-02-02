/**
 * Job Type Configuration & Helper Functions
 * Single source of truth untuk semua tipe job
 * 
 * Usage:
 * - getJobTypeConfig('instalasi') → returns config object
 * - shouldShowField('instalasi', 'panjang_kabel') → returns boolean
 * - getRequiredFields('troubleshooting_wireless') → returns array
 */

export const JOB_TYPES = {
  INSTALASI: 'instalasi',
  TROUBLESHOOTING_FO: 'troubleshooting_fo',
  TROUBLESHOOTING_WIRELESS: 'troubleshooting_wireless'
};

export const JOB_TYPE_LABELS = {
  instalasi: '📦 Instalasi',
  troubleshooting_fo: '🔌 Troubleshooting FO',
  troubleshooting_wireless: '📡 Troubleshooting Wireless'
};

export const JOB_TYPE_ICONS = {
  instalasi: 'construction',
  troubleshooting_fo: 'router',
  troubleshooting_wireless: 'wifi'
};

/**
 * MASTER CONFIGURATION - Defines all fields for each job type
 */
export const JOB_TYPE_CONFIG = {
  instalasi: {
    label: '📦 Instalasi',
    icon: 'construction',
    jobNumberPrefix: 'INST',
    
    fields: {
      // ─────── COMMON/REQUIRED ───────
      nama_client: { 
        type: 'text', 
        required: true, 
        label: 'Nama Client',
        placeholder: 'Contoh: PT Telkom Surabaya'
      },
      tikor_odp_jb: { 
        type: 'text', 
        required: true, 
        label: 'Tikor ODP/JB',
        placeholder: 'Contoh: ODP-GDL-001'
      },
      port_odp: { 
        type: 'text', 
        required: true, 
        label: 'Port ODP',
        placeholder: 'Contoh: 24'
      },
      tanggal_pekerjaan: { 
        type: 'date', 
        required: true, 
        label: 'Tanggal Pekerjaan'
      },
      
      // ─────── OPTIONAL COMMON ───────
      redaman: { 
        type: 'number', 
        required: false, 
        label: 'Redaman (dB)',
        step: '0.01'
      },
      field_engineer_1: { 
        type: 'text', 
        required: false, 
        label: 'Teknisi',
        placeholder: 'Nama teknisi'
      },
      
      // ─────── TYPE-SPECIFIC ───────
      panjang_kabel: { 
        type: 'number', 
        required: true, 
        label: 'Panjang Kabel (meter)',
        step: '0.01',
        placeholder: '150.50'
      },
      
      // ─────── MEDIA ───────
      foto_rumah: { 
        type: 'file', 
        required: false, 
        label: 'Foto Rumah',
        accept: 'image/*'
      },
      foto_pemasangan: { 
        type: 'file', 
        required: false, 
        label: 'Foto Pemasangan',
        accept: 'image/*'
      },
      
      // ─────── NOTES ───────
      keterangan: { 
        type: 'textarea', 
        required: false, 
        label: 'Keterangan Tambahan',
        rows: 4
      }
    },
    
    // Order of sections to display
    sections: ['common_info', 'instalasi_data', 'documentation', 'notes'],
    
    // Dynamic photo labels
    photoLabels: {
      rumah: 'Foto Rumah',
      pemasangan: 'Foto Pemasangan'
    },
    
    // Fields that should be NULL/hidden for other types
    exclusiveFields: ['panjang_kabel']
  },

  troubleshooting_fo: {
    label: '🔌 Troubleshooting FO',
    icon: 'router',
    jobNumberPrefix: 'FO',
    
    fields: {
      // ─────── COMMON/REQUIRED ───────
      nama_client: { 
        type: 'text', 
        required: true, 
        label: 'Nama Client',
        placeholder: 'Contoh: PT Indosat Bandung'
      },
      tikor_odp_jb: { 
        type: 'text', 
        required: true, 
        label: 'Tikor ODP/JB',
        placeholder: 'Contoh: ODP-BDG-002'
      },
      port_odp: { 
        type: 'text', 
        required: true, 
        label: 'Port ODP',
        placeholder: 'Contoh: 08'
      },
      tanggal_pekerjaan: { 
        type: 'date', 
        required: true, 
        label: 'Tanggal Pekerjaan'
      },
      detail_action: { 
        type: 'textarea', 
        required: true, 
        label: 'Detail Action',
        rows: 5,
        placeholder: 'Deskripsikan tindakan yang dilakukan...'
      },
      
      // ─────── OPTIONAL COMMON ───────
      redaman: { 
        type: 'number', 
        required: false, 
        label: 'Redaman (dB)',
        step: '0.01'
      },
      field_engineer_1: { 
        type: 'text', 
        required: false, 
        label: 'Teknisi',
        placeholder: 'Nama teknisi'
      },
      
      // ─────── TYPE-SPECIFIC ───────
      tipe_cut: { 
        type: 'text', 
        required: false, 
        label: 'Tipe Cut',
        placeholder: 'Contoh: Cold Fusion, Mechanical Splice'
      },
      tikor_cut: { 
        type: 'text', 
        required: false, 
        label: 'Tikor Cut',
        placeholder: 'Contoh: JB-001 Meter 120'
      },
      tipe_kabel: { 
        type: 'text', 
        required: false, 
        label: 'Tipe Kabel',
        placeholder: 'Contoh: Single Mode G652D'
      },
      
      // ─────── MEDIA ───────
      foto_rumah: { 
        type: 'file', 
        required: false, 
        label: 'Foto Rumah',
        accept: 'image/*'
      },
      foto_pemasangan: { 
        type: 'file', 
        required: false, 
        label: 'Foto Pemasangan',
        accept: 'image/*'
      },
      
      // ─────── NOTES ───────
      keterangan: { 
        type: 'textarea', 
        required: false, 
        label: 'Keterangan Tambahan',
        rows: 4
      }
    },
    
    sections: ['common_info', 'troubleshooting_fo_data', 'documentation', 'notes'],
    
    photoLabels: {
      rumah: 'Foto Rumah',
      pemasangan: 'Foto Pemasangan'
    },
    
    exclusiveFields: ['detail_action', 'tipe_cut', 'tikor_cut', 'tipe_kabel']
  },

  troubleshooting_wireless: {
    label: '📡 Troubleshooting Wireless',
    icon: 'wifi',
    jobNumberPrefix: 'WLS',
    
    fields: {
      // ─────── COMMON/REQUIRED ───────
      nama_client: { 
        type: 'text', 
        required: true, 
        label: 'Nama Client',
        placeholder: 'Contoh: PT Axis Makassar'
      },
      tanggal_pekerjaan: { 
        type: 'date', 
        required: true, 
        label: 'Tanggal Pekerjaan'
      },
      
      // ─────── OPTIONAL COMMON ───────
      pop: { 
        type: 'text', 
        required: false, 
        label: 'POP (Point of Presence)',
        placeholder: 'Contoh: POP-MAKASSAR-01'
      },
      signal: { 
        type: 'text', 
        required: false, 
        label: 'Signal',
        placeholder: 'Contoh: -65 dBm, Signal Lemah'
      },
      field_engineer_1: { 
        type: 'text', 
        required: false, 
        label: 'Teknisi',
        placeholder: 'Nama teknisi'
      },
      
      // ─────── EQUIPMENT/DAMAGE CHECKBOXES ───────
      peralatan_radio: { 
        type: 'checkbox', 
        required: false, 
        label: 'Radio'
      },
      peralatan_kabel: { 
        type: 'checkbox', 
        required: false, 
        label: 'Kabel'
      },
      peralatan_adaptor: { 
        type: 'checkbox', 
        required: false, 
        label: 'Adaptor'
      },
      peralatan_poe: { 
        type: 'checkbox', 
        required: false, 
        label: 'PoE (Power over Ethernet)'
      },
      peralatan_rj45: { 
        type: 'checkbox', 
        required: false, 
        label: 'RJ45'
      },
      peralatan_router_switch: { 
        type: 'checkbox', 
        required: false, 
        label: 'Router / Switch'
      },
      peralatan_ap: { 
        type: 'checkbox', 
        required: false, 
        label: 'Access Point (AP)'
      },
      peralatan_lainnya: { 
        type: 'checkbox', 
        required: false, 
        label: 'Lainnya'
      },
      peralatan_lainnya_keterangan: { 
        type: 'text', 
        required: false, 
        label: 'Keterangan Lainnya',
        placeholder: 'Sebutkan peralatan lainnya...',
        dependency: 'peralatan_lainnya'
      },
      
      // ─────── NOTES ───────
      catatan_teknisi: { 
        type: 'textarea', 
        required: false, 
        label: 'Catatan Teknisi',
        rows: 5,
        placeholder: 'Catatan pekerjaan dan tindakan yang dilakukan...'
      },
      
      // ─────── MEDIA ───────
      foto_rumah: { 
        type: 'file', 
        required: false, 
        label: 'Foto Before Pengerjaan',
        accept: 'image/*'
      },
      foto_pemasangan: { 
        type: 'file', 
        required: false, 
        label: 'Foto After Pengerjaan',
        accept: 'image/*'
      },
      
      // ─────── ADDITIONAL NOTES ───────
      keterangan: { 
        type: 'textarea', 
        required: false, 
        label: 'Keterangan Tambahan',
        rows: 4
      }
    },
    
    sections: ['common_info', 'equipment_damage', 'catatan_section', 'documentation', 'notes'],
    
    photoLabels: {
      rumah: 'Foto Before Pengerjaan',
      pemasangan: 'Foto After Pengerjaan'
    },
    
    exclusiveFields: ['peralatan_radio', 'peralatan_kabel', 'peralatan_adaptor', 
                      'peralatan_poe', 'peralatan_rj45', 'peralatan_router_switch', 
                      'peralatan_ap', 'peralatan_lainnya', 'peralatan_lainnya_keterangan', 
                      'catatan_teknisi']
  }
};

/**
 * ═══════════════════════════════════════════════════════════════
 * HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Get configuration for a specific job type
 * @param {string} jobType - 'instalasi', 'troubleshooting_fo', or 'troubleshooting_wireless'
 * @returns {object|null} Configuration object or null if invalid
 */
export function getJobTypeConfig(jobType) {
  return JOB_TYPE_CONFIG[jobType] || null;
}

/**
 * Check if a field should be shown for a specific job type
 * @param {string} jobType
 * @param {string} fieldName
 * @returns {boolean}
 */
export function shouldShowField(jobType, fieldName) {
  const config = getJobTypeConfig(jobType);
  if (!config) return false;
  return fieldName in config.fields;
}

/**
 * Check if a field is required for a specific job type
 * @param {string} jobType
 * @param {string} fieldName
 * @returns {boolean}
 */
export function isFieldRequired(jobType, fieldName) {
  const config = getJobTypeConfig(jobType);
  if (!config) return false;
  const field = config.fields[fieldName];
  return field ? field.required : false;
}

/**
 * Get field configuration object
 * @param {string} jobType
 * @param {string} fieldName
 * @returns {object|null}
 */
export function getFieldConfig(jobType, fieldName) {
  const config = getJobTypeConfig(jobType);
  if (!config) return null;
  return config.fields[fieldName] || null;
}

/**
 * Check if a section should be shown for a specific job type
 * @param {string} jobType
 * @param {string} sectionName
 * @returns {boolean}
 */
export function shouldShowSection(jobType, sectionName) {
  const config = getJobTypeConfig(jobType);
  if (!config) return false;
  return config.sections.includes(sectionName);
}

/**
 * Get array of required field names for a job type
 * @param {string} jobType
 * @returns {array}
 */
export function getRequiredFields(jobType) {
  const config = getJobTypeConfig(jobType);
  if (!config) return [];
  return Object.entries(config.fields)
    .filter(([_, field]) => field.required)
    .map(([key, _]) => key);
}

/**
 * Get array of optional field names for a job type
 * @param {string} jobType
 * @returns {array}
 */
export function getOptionalFields(jobType) {
  const config = getJobTypeConfig(jobType);
  if (!config) return [];
  return Object.entries(config.fields)
    .filter(([_, field]) => !field.required)
    .map(([key, _]) => key);
}

/**
 * Get all field names for a job type
 * @param {string} jobType
 * @returns {array}
 */
export function getAllFields(jobType) {
  const config = getJobTypeConfig(jobType);
  if (!config) return [];
  return Object.keys(config.fields);
}

/**
 * Get photo label for a job type
 * @param {string} jobType
 * @param {string} photoType - 'rumah' or 'pemasangan'
 * @returns {string}
 */
export function getPhotoLabel(jobType, photoType) {
  const config = getJobTypeConfig(jobType);
  if (!config) return '';
  return config.photoLabels[photoType] || '';
}

/**
 * Check if field has a dependency (e.g., shows only if another field is checked)
 * @param {string} jobType
 * @param {string} fieldName
 * @returns {string|null} Name of dependency field or null
 */
export function getFieldDependency(jobType, fieldName) {
  const field = getFieldConfig(jobType, fieldName);
  return field?.dependency || null;
}

/**
 * Get visible fields for form rendering (respects dependencies)
 * @param {string} jobType
 * @param {object} currentFormData - current form values to check dependencies
 * @returns {array} Array of field names to show
 */
export function getVisibleFields(jobType, currentFormData = {}) {
  const config = getJobTypeConfig(jobType);
  if (!config) return [];
  
  return Object.entries(config.fields)
    .filter(([fieldName, fieldConfig]) => {
      // If has dependency, check if dependency is true
      if (fieldConfig.dependency) {
        return currentFormData[fieldConfig.dependency] === true;
      }
      return true;
    })
    .map(([key, _]) => key);
}

/**
 * Validate form data against job type rules (client-side)
 * @param {string} jobType
 * @param {object} formData
 * @returns {object} Object with field names as keys and error messages as values
 */
export function validateFormData(jobType, formData) {
  const errors = {};
  const config = getJobTypeConfig(jobType);
  
  if (!config) {
    errors.job_type = 'Tipe job tidak valid';
    return errors;
  }
  
  // Check required fields
  getRequiredFields(jobType).forEach(fieldName => {
    const value = formData[fieldName];
    
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      const field = config.fields[fieldName];
      errors[fieldName] = `${field.label} harus diisi`;
    }
  });
  
  // Validate specific types
  if (formData.panjang_kabel !== undefined && formData.panjang_kabel !== '') {
    if (isNaN(formData.panjang_kabel) || Number(formData.panjang_kabel) <= 0) {
      errors.panjang_kabel = 'Panjang kabel harus berupa angka positif';
    }
  }
  
  if (formData.redaman !== undefined && formData.redaman !== '') {
    if (isNaN(formData.redaman)) {
      errors.redaman = 'Redaman harus berupa angka';
    }
  }
  
  return errors;
}

/**
 * Get sections in order for a job type
 * @param {string} jobType
 * @returns {array} Array of section names
 */
export function getSectionOrder(jobType) {
  const config = getJobTypeConfig(jobType);
  if (!config) return [];
  return config.sections;
}

/**
 * Get field names for a specific section
 * @param {string} jobType
 * @param {string} sectionName
 * @returns {array} Array of field names in that section
 */
export function getFieldsInSection(jobType, sectionName) {
  const config = getJobTypeConfig(jobType);
  if (!config) return [];
  
  const sectionFieldMap = {
    common_info: ['nama_client', 'tikor_odp_jb', 'port_odp', 'pop', 'signal', 'redaman', 'field_engineer_1', 'tanggal_pekerjaan'],
    instalasi_data: ['panjang_kabel'],
    troubleshooting_fo_data: ['detail_action', 'tipe_cut', 'tikor_cut', 'tipe_kabel'],
    equipment_damage: ['peralatan_radio', 'peralatan_kabel', 'peralatan_adaptor', 'peralatan_poe', 'peralatan_rj45', 'peralatan_router_switch', 'peralatan_ap', 'peralatan_lainnya', 'peralatan_lainnya_keterangan'],
    catatan_section: ['catatan_teknisi'],
    documentation: ['foto_rumah', 'foto_pemasangan'],
    notes: ['keterangan']
  };
  
  const fields = sectionFieldMap[sectionName] || [];
  return fields.filter(field => shouldShowField(jobType, field));
}

/**
 * Get section title/label
 * @param {string} sectionName
 * @returns {string}
 */
export function getSectionLabel(sectionName) {
  const labels = {
    common_info: 'Informasi Umum',
    instalasi_data: 'Data Instalasi',
    troubleshooting_fo_data: 'Data Troubleshooting FO',
    equipment_damage: 'Data Kerusakan',
    catatan_section: 'Catatan Teknisi',
    documentation: 'Dokumentasi Foto',
    notes: 'Keterangan Tambahan'
  };
  return labels[sectionName] || sectionName;
}

/**
 * Get section icon
 * @param {string} sectionName
 * @returns {string}
 */
export function getSectionIcon(sectionName) {
  const icons = {
    common_info: 'info',
    instalasi_data: 'construction',
    troubleshooting_fo_data: 'router',
    equipment_damage: 'build',
    catatan_section: 'description',
    documentation: 'image',
    notes: 'note'
  };
  return icons[sectionName] || 'folder';
}

/**
 * Create initial form state for a job type
 * @param {string} jobType
 * @returns {object}
 */
export function createInitialFormState(jobType) {
  const config = getJobTypeConfig(jobType);
  if (!config) return {};
  
  const state = { job_type: jobType };
  
  Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
    if (fieldConfig.type === 'checkbox') {
      state[fieldName] = false;
    } else if (fieldConfig.type === 'file') {
      state[fieldName] = null;
    } else if (fieldConfig.type === 'number') {
      state[fieldName] = '';
    } else {
      state[fieldName] = '';
    }
  });
  
  return state;
}

/**
 * Sanitize form data before submission (remove empty/unnecessary fields)
 * @param {string} jobType
 * @param {object} formData
 * @returns {object} Cleaned form data
 */
export function sanitizeFormData(jobType, formData) {
  const config = getJobTypeConfig(jobType);
  if (!config) return formData;
  
  const cleaned = { job_type: jobType };
  
  Object.entries(formData).forEach(([key, value]) => {
    // Only include fields that exist in config
    if (config.fields[key]) {
      // For file fields, only include if it's a File object (not string path)
      if (config.fields[key].type === 'file') {
        if (value instanceof File) {
          cleaned[key] = value;
        }
      } else if (value !== '' && value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    }
  });
  
  return cleaned;
}
