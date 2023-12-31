import axios from 'axios';

export class PixabayAPI {
  constructor() {
    this.page = 1;
    this.query = null;
    this.per_page = 40;

    axios.defaults.baseURL = 'https://pixabay.com';
  }

  getImagesByQuery() {
    const axiosOptions = {
      params: {
        page: this.page,
        per_page: this.per_page,
        key: '40691933-b7715a41418a5dba6dc83beb8',
        q: this.query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
    };

    return axios.get('/api/', axiosOptions);
  }
}
