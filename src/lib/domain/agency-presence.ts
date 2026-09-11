export function isConfirmedStreetAddress(address: string) {
  const trimmed = address.trim();
  if (trimmed.length < 8) return false;
  if (/^(oficina|sede|cobertura|domicilio)\s+en\s+/i.test(trimmed)) {
    return false;
  }
  return /\d/.test(trimmed);
}

export function publicStreetLine(agency: {
  address: string;
  city: string;
  postalCode: string;
}) {
  if (!isConfirmedStreetAddress(agency.address)) {
    return `Ubicación por confirmar · ${agency.city}`;
  }
  return `${agency.address}, ${agency.postalCode} ${agency.city}`;
}

export function formatLocationLine(location: {
  address: string;
  city: string;
  postalCode: string;
}) {
  const street = location.address.trim();
  const tail = [location.postalCode, location.city].filter(Boolean).join(" ");
  return tail ? `${street}, ${tail}` : street;
}
