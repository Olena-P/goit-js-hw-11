import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { refs } from './refs';
import { fetchBySearch } from './api';
import { createMarkup } from './markup';
import { perPage } from './api';

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadMore.addEventListener('click', onLoadMore);
refs.loadMore.style.display = 'none';

const simplelightbox = new SimpleLightbox('.gallery a');

let page = 1;
let searchQuery = '';
let scrollDistance = 0;

async function onFormSubmit(event) {
  event.preventDefault();
  refs.galleryContainer.innerHTML = '';

  try {
    const formElement = event.currentTarget.elements;
    searchQuery = formElement.searchQuery.value.trim();

    if (!searchQuery.length) {
      refs.loadMore.classList.add('visually-hidden');
      refs.loadMore.style.display = 'none';
      Notify.warning('Please fill out the search field!');
      return;
    }

    page = 1;
    const { hits, totalHits } = await fetchBySearch(searchQuery, page);

    if (hits.length === 0) {
      refs.galleryContainer.innerHTML = '';
      refs.loadMore.classList.add('visually-hidden');
      refs.loadMore.style.display = 'none';
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        error
      );
      return;
    }

    createMarkup(hits);
    Notify.success(`Hooray! We found ${totalHits} images`);

    simplelightbox.refresh();

    if (totalHits <= perPage) {
      refs.loadMore.classList.add('visually-hidden');
      refs.loadMore.style.display = 'none';
      Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      refs.loadMore.classList.remove('visually-hidden');
      refs.loadMore.style.display = 'block';
    }
  } catch (error) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
      error
    );
  } finally {
    refs.searchForm.reset();
  }
}

async function onLoadMore() {
  page += 1;

  try {
    const { hits, totalHits } = await fetchBySearch(searchQuery, page);
    createMarkup(hits);
    simplelightbox.refresh();

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    scrollDistance = cardHeight * 2.5;

    window.scrollBy({
      top: scrollDistance,
      behavior: 'smooth',
    });

    if (totalHits - (page - 1) * perPage <= perPage) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      refs.loadMore.classList.add('visually-hidden');
      refs.loadMore.style.display = 'none';
    } else {
      refs.loadMore.classList.remove('visually-hidden');
      refs.loadMore.style.display = 'block';
    }
  } catch (error) {
    Notify.failure(
      'Oops! Something went wrong. Please try again later.',
      error
    );
  }
}
