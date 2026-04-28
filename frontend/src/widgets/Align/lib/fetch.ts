import axios from 'axios';

export const BLANK_VALUE = '';

export async function fetchStandards(field?: string, value?: string, standardSelected?: string) {
  if (!field) {
    const response = await axios.get('/api/alignment/v1/standards/');
    return response;
  }
  const params: Record<string, string> = { field, value: value ?? '' };
  if (standardSelected) {
    params.standard = standardSelected;
  }
  const response = await axios.get('/api/alignment/v1/standards/', { params });
  return response;
}
