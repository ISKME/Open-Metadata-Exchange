import axios from 'axios';

export const BLANK_VALUE = 0;

class Fetcher {
  private url;

  private field;

  private value;

  private standard;

  constructor(field: string | null = null, value: any = null, standard: string | null = null, baseURL: string = '/standards/align-widget-helper') {
    this.field = field;
    this.value = value;
    this.standard = standard;

    this.url = baseURL;

    if (this.field && this.value && Number(this.value) !== BLANK_VALUE) {
      this.url += `?field=${this.field}&${this.field}=${this.value}`;
      if (this.field !== 'standard' && this.standard) {
        this.url += `&standard=${this.standard}`;
      }
    }
  }

  public async fetchStandards() {
    return axios(this.url);
  }
}

export const fetchStandards = async (field = null, value = null, standard = null) => {
  const fetcher = new Fetcher(field, value, standard);
  return fetcher.fetchStandards();
};
