import { Report } from 'notiflix/build/notiflix-report-aio';
import { PixabayAPI } from './pixabay-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreEl: document.querySelector('.load-more'),
};

refs.formEl.addEventListener('submit', onFormElSubmit);
refs.loadMoreEl.addEventListener('click', onLoadMoreEl);

const pixabayAPI = new PixabayAPI();

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

function imgTemplate(imgData) {
  const {
    largeImageURL,
    webformatURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = imgData;
  return `<div class="photo-card"><a href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b><br>${likes}
    </p>
    <p class="info-item">
      <b>Views</b><br>${views}
    </p>
    <p class="info-item">
      <b>Comments</b><br>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b><br>${downloads}
    </p>
  </div>
</div>`;
}

function renderImages(imgArr) {
  return imgArr.map(imgTemplate).join('');
}

async function onFormElSubmit(e) {
  e.preventDefault();
  refs.loadMoreEl.classList.add('is-hidden');

  pixabayAPI.query = e.target.elements.searchQuery.value;
  pixabayAPI.page = 1;

  try {
    const { data } = await pixabayAPI.getImagesByQuery();

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

    if (data.totalHits <= pixabayAPI.per_page) {
      Report.success(`Hooray! We found ${data.totalHits} images.`);
      refs.galleryEl.innerHTML = renderImages(data.hits);
      lightbox.refresh();
      refs.loadMoreEl.classList.add('is-hidden');
      Report.warning(
        "We're sorry,",
        "but you've reached the end of search results."
      );
      return;
    }

    Report.success(`Hooray! We found ${data.totalHits} images.`);
    refs.galleryEl.innerHTML = renderImages(data.hits);
    lightbox.refresh();

    refs.loadMoreEl.classList.remove('is-hidden');
  } catch (err) {
    Report.failure('err');
  }
}

async function onLoadMoreEl(e) {
  pixabayAPI.page += 1;
  try {
    const { data } = await pixabayAPI.getImagesByQuery();

    refs.galleryEl.insertAdjacentHTML('beforeend', renderImages(data.hits));

    lightbox.refresh();

    if (data.totalHits / pixabayAPI.per_page <= pixabayAPI.page) {
      refs.loadMoreEl.classList.add('is-hidden');
    }
    const { height: cardHeight } =
      refs.galleryEl.firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (err) {
    Report.failure('err');
  }
}
