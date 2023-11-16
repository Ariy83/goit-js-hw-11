import { Report } from 'notiflix/build/notiflix-report-aio';
import { PixabayAPI } from './pixabay-api';

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreEl: document.querySelector('.load-more'),
};

refs.formEl.addEventListener('submit', onFormElSubmit);
refs.loadMoreEl.addEventListener('click', onLoadMoreEl);

const pixabayAPI = new PixabayAPI();

function imgTemplate(imgData) {
  const { webformatURL, tags, likes, views, comments, downloads } = imgData;
  return `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
</div>`;
}

function renderImages(imgArr) {
  return imgArr.map(imgTemplate).join('');
}

function onFormElSubmit(e) {
  e.preventDefault();
  refs.loadMoreEl.classList.add('is-hidden');

  pixabayAPI.query = e.target.elements.searchQuery.value;
  pixabayAPI.page = 1;

  pixabayAPI
    .getImagesByQuery()
    .then(({ data }) => {
      console.log(data);
      if (data.total === 0) {
        refs.galleryEl.innerHTML = '';
        refs.loadMoreEl.classList.add('is-hidden');
        refs.formEl.reset();
        Report.failure(
          'Sorry,',
          'there are no images matching your search query. Please try again.'
        );
        return;
      }

      if (data.totalHits === 1) {
        refs.galleryEl.innerHTML = renderImages(data.hits);
        refs.loadMoreEl.classList.add('is-hidden');
        Report.warning(
          "We're sorry,",
          "but you've reached the end of search results."
        );
        return;
      }
      Report.success(`Hooray! We found ${data.totalHits} images.`);
      refs.galleryEl.innerHTML = renderImages(data.hits);
      refs.loadMoreEl.classList.remove('is-hidden');
    })
    .catch(err => {
      Report.failure('err');
    });
}

function onLoadMoreEl(e) {
  pixabayAPI.page += 1;

  pixabayAPI
    .getImagesByQuery()
    .then(({ data }) => {
      refs.galleryEl.insertAdjacentHTML('beforeend', renderImages(data.hits));

      if (data.totalHits === pixabayAPI.page) {
        refs.loadMoreEl.classList.add('is-hidden');
      }
    })
    .catch(err => {
      Report.failure('err');
    });
}
