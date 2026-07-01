import axios from 'axios';

function buildFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
}

async function get(url: string, params?: Record<string, unknown>) {
  const response = await axios.get(`/api/${url}`, { params });
  return response.data;
}

async function post(url: string, data?: Record<string, unknown>, multipart = false) {
  const payload = multipart ? buildFormData(data ?? {}) : data;
  const headers = multipart ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await axios.post(`/api/${url}`, payload, { headers });
  return response.data;
}

async function put(url: string, data?: Record<string, unknown>) {
  const response = await axios.put(`/api/${url}`, data);
  return response.data;
}

async function patch(url: string, data?: Record<string, unknown>, multipart = false) {
  const payload = multipart ? buildFormData(data ?? {}) : data;
  const headers = multipart ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await axios.patch(`/api/${url}`, payload, { headers });
  return response.data;
}

async function del(url: string, data?: Record<string, unknown>) {
  const response = await axios.delete(`/api/${url}`, { data });
  return response.data;
}

const req = { get, post, put, patch, del, delete: del };

export default req;
