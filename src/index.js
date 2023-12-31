import { Report } from 'notiflix/build/notiflix-report-aio';
import { PixabayAPI } from './pixabay-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
  targetScrollObserverEl: document.querySelector('.js-target-scroll'),
};

refs.formEl.addEventListener('submit', onFormElSubmit);

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

const scrollObserver = new IntersectionObserver(loadMoreScroll, {
  root: null,
  rootMargin: '0px 0px 400px 0px',
  threshold: 1,
});

const pixabayAPI = new PixabayAPI();

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

  pixabayAPI.query = e.target.elements.searchQuery.value;
  pixabayAPI.page = 1;

  try {
    const { data } = await pixabayAPI.getImagesByQuery();

    if (data.total === 0) {
      refs.galleryEl.innerHTML = '';

      scrollObserver.unobserve(refs.targetScrollObserverEl);
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

      scrollObserver.unobserve(refs.targetScrollObserverEl);
      return;
    }

    Report.success(`Hooray! We found ${data.totalHits} images.`);
    refs.galleryEl.innerHTML = renderImages(data.hits);

    lightbox.refresh();

    setTimeout(() => {
      scrollObserver.observe(refs.targetScrollObserverEl);
    }, 500);
  } catch (err) {
    Report.failure('err');
  }
}

async function loadMoreScroll(entries, observer) {
  if (!entries[0].isIntersecting) {
    return;
  }

  pixabayAPI.page += 1;
  try {
    const { data } = await pixabayAPI.getImagesByQuery();

    refs.galleryEl.insertAdjacentHTML('beforeend', renderImages(data.hits));

    lightbox.refresh();

    if (data.totalHits / pixabayAPI.per_page <= pixabayAPI.page) {
      observer.unobserve(refs.targetScrollObserverEl);
      Report.warning(
        "We're sorry,",
        "but you've reached the end of search results."
      );
    }
  } catch (err) {
    Report.failure('err');
  }
}
