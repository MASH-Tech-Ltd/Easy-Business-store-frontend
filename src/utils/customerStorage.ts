export interface CustomerSavedInfo {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  division?: string;
  district?: string;
  upazila?: string;
  deliveryNote?: string;
}

const STORAGE_KEY = 'customer_checkout_info';
// Also fallback / sync with 'customerInfo' if legacy exists
const LEGACY_STORAGE_KEY = 'customerInfo';

export const getSavedCustomerInfo = (): CustomerSavedInfo => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    // Auto compute fullName if missing but firstName/lastName present
    let fullName = parsed.fullName || '';
    if (!fullName && (parsed.firstName || parsed.lastName)) {
      fullName = `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim();
    }

    // Auto compute firstName/lastName if missing but fullName present
    let firstName = parsed.firstName || '';
    let lastName = parsed.lastName || '';
    if (!firstName && !lastName && fullName) {
      const parts = fullName.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    return {
      fullName,
      firstName,
      lastName,
      phone: parsed.phone || '',
      email: parsed.email || '',
      address: parsed.address || '',
      division: parsed.division || '',
      district: parsed.district || '',
      upazila: parsed.upazila || '',
      deliveryNote: parsed.deliveryNote || '',
    };
  } catch (e) {
    console.error('Failed to parse saved customer info from localStorage:', e);
    return {};
  }
};

export const saveCustomerInfo = (info: Partial<CustomerSavedInfo>) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedCustomerInfo();
    
    let fullName = info.fullName !== undefined ? info.fullName : existing.fullName;
    let firstName = info.firstName !== undefined ? info.firstName : existing.firstName;
    let lastName = info.lastName !== undefined ? info.lastName : existing.lastName;

    if (info.fullName !== undefined && (!info.firstName && !info.lastName)) {
      const parts = (info.fullName || '').trim().split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    } else if ((info.firstName !== undefined || info.lastName !== undefined) && !info.fullName) {
      fullName = `${firstName || ''} ${lastName || ''}`.trim();
    }

    const updated: CustomerSavedInfo = {
      fullName: fullName || '',
      firstName: firstName || '',
      lastName: lastName || '',
      phone: info.phone !== undefined ? info.phone : existing.phone || '',
      email: info.email !== undefined ? info.email : existing.email || '',
      address: info.address !== undefined ? info.address : existing.address || '',
      division: info.division !== undefined ? info.division : existing.division || '',
      district: info.district !== undefined ? info.district : existing.district || '',
      upazila: info.upazila !== undefined ? info.upazila : existing.upazila || '',
      deliveryNote: info.deliveryNote !== undefined ? info.deliveryNote : existing.deliveryNote || '',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save customer info to localStorage:', e);
  }
};
