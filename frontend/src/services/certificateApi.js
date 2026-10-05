import api from './api.js';

export const fetchMyCertificates = () =>
  api.get('/certificates/me').then((r) => r.data.items || []);

export const verifyCertificate = (serialNumber) =>
  api.get(`/certificates/verify/${serialNumber}`).then((r) => r.data);