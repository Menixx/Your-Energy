// import { Notyf } from 'notyf';

// class ExercisesCard {
//   constructor({ name, filter, imgURL }) {
//     this.name = name;
//     this.filter = filter;
//     this.imgURL = imgURL;
//   }

//   getHTML() {
//     return `
//       <li class="exercises__card"
//         style="background:
//                 linear-gradient(rgba(17, 17, 17, 0.5), rgba(17, 17, 17, 0.5)),
//                 url(${this.imgURL});
//               background-size: cover;
//               background-repeat: no-repeat;
//               background-position: center;
//         ">
//         <h3 class="exercises__card-name">${
//           this.name[0].toUpperCase() + this.name.substring(1)
//         }</h3>
//         <p class="exercises__card-filter">${this.filter}</p>
//       </li>
//     `;
//   }
// }

function handleFetchResponse(response) {
  if (!response.ok) {
    throw new Error('Халепа');
  }
  return response.json();
}

function getToday() {
  const date = new Date();
  return date.toISOString().slice(0, 10);
}

async function setQuote() {
  const quoteText = document.querySelector('.aside__quote-text');
  const quoteAuthor = document.querySelector('.aside__quote-author');
  const today = getToday();

  let quoteObj = null;
  try {
    const raw = localStorage.getItem('quote');
    quoteObj = raw ? JSON.parse(raw) : null;
  } catch (err) {
    quoteObj = null;
  }

  if (quoteObj && quoteObj.date === today) {
    quoteText.textContent = quoteObj.text;
    quoteAuthor.textContent = quoteObj.author;
    return;
  }

  try {
    const response = await fetch('https://your-energy.b.goit.study/api/quote');
    const data = await handleFetchResponse(response);

    if (data) {
      quoteText.textContent = data.quote;
      quoteAuthor.textContent = data.author;

      const newQuote = { text: data.quote, author: data.author, date: today };
      try {
        localStorage.setItem('quote', JSON.stringify(newQuote));
      } catch (err) {
        // Ignore storage errors (e.g. quota)
      }
      return;
    }

    // If API returns unexpected data, fall back to stored quote if present
    if (quoteObj) {
      quoteText.textContent = quoteObj.text;
      quoteAuthor.textContent = quoteObj.author;
    }
  } catch (err) {
    if (quoteObj) {
      quoteText.textContent = quoteObj.text;
      quoteAuthor.textContent = quoteObj.author;
    }
  }
}

async function setExercisesCardsAndGetResponse(
  limit = 12,
  filter = 'Muscles',
  page = 1
) {
  try {
    const response = await fetch(
      `https://your-energy.b.goit.study/api/filters?limit=${limit}&filter=${filter}&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Server error');
    }

    const data = await response.json();

    const cards = document.querySelector('.exercises__cards');
    cards.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let item of data.results) {
      const card = document.createElement('li');
      card.classList.add('exercises__card');
      card.style.setProperty('--bg-img', `url(${item.imgURL})`);
      card.dataset.name = item.name;
      card.dataset.filter = item.filter;

      const h3 = document.createElement('h3');
      h3.classList.add('exercises__card-name');
      h3.textContent = item.name[0].toUpperCase() + item.name.substring(1);
      card.appendChild(h3);

      const p = document.createElement('p');
      p.classList.add('exercises__card-filter');
      p.textContent = item.filter;
      card.appendChild(p);

      fragment.appendChild(card);
    }
    cards.appendChild(fragment);

    paginationState.page = data.page;
    paginationState.perPage = data.perPage;
    paginationState.totalPages = data.totalPages;

    setPagination(paginationState);

    return data;
  } catch (err) {
    console.log('Халепа');
  }
}

function openMobMenu(mobMenuBtn) {
  mobMenuBtn.removeEventListener('click', mobMenuOpenHandler);

  closeMenuBtn.addEventListener('click', closeMobMenu);

  const menu = document.querySelector('.mobile-menu-wrapper');
  menu.hidden = !menu.hidden;
}

function closeMobMenu() {
  console.log(close);
  closeMenuBtn.removeEventListener('click', mobMenuCloseHandler);

  mobMenuBtn.addEventListener('click', closeMobMenu);

  const menu = document.querySelector('.mobile-menu-wrapper');
  menu.hidden = !menu.hidden;
}

function mobMenuOpenHandler() {
  openMobMenu(mobMenuBtn);
}

function mobMenuCloseHandler() {
  closeMobMenu(closeMenuBtn);
}

function handleFilterClick(event) {
  const target = event.target;

  if (target.dataset.filter !== currentFilter) {
    currentFilter = target.dataset.filter;

    document
      .querySelector('.exercises__filter--active')
      .classList.toggle('exercises__filter--active');
    target.classList.toggle('exercises__filter--active');
  }

  if (currentExercisesPageState === 'workout') {
    toggleExercisesSection();
  }

  setExercisesCardsAndGetResponse(cardsLimit, currentFilter, 1);
}

async function subscribe(validAddress) {
  try {
    const response = await fetch(
      'https://your-energy.b.goit.study/api/subscription',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: validAddress }),
      }
    );

    if (response.status === 409) {
      console.log('Ви вже підписані!');
      return;
    }

    if (!response.ok) {
      throw new Error('Server error');
    }

    const data = await response.json();
    console.log(data.message);
  } catch (err) {
    console.log('Помилка зʼєднання з сервером');
  }
}

function setPagination({ totalPages, page }) {
  let btns = document.querySelector('.exercises__pagination-btns');

  const container = document.createDocumentFragment();

  btns.innerHTML = '';

  if (totalPages < 2) return;

  page = Number(page);

  let startPage, endPage;

  // Визначаємо вікно з 3 кнопок
  if (totalPages <= 3) {
    // Якщо сторінок <=3, показуємо всі
    startPage = 1;
    endPage = totalPages;
  } else {
    if (page <= 2) {
      // Ближче до початку
      startPage = 1;
      endPage = 3;
    } else if (page >= totalPages - 1) {
      // Ближче до кінця
      startPage = totalPages - 2;
      endPage = totalPages;
    } else {
      // Поточна сторінка посередині
      startPage = page - 1;
      endPage = page + 1;
    }
  }

  // Ліві стрілки
  if (totalPages > 3) {
    const leftDoubleArrow = document.createElement('button');
    const leftMonoArrow = document.createElement('button');

    leftDoubleArrow.textContent = '«';
    leftDoubleArrow.type = 'button';
    leftDoubleArrow.dataset.pagValue = 'dlt';
    leftDoubleArrow.classList.add('exercises__pagination-btn');
    leftDoubleArrow.classList.add('exercises__pagination-arrow-btn');

    leftMonoArrow.textContent = '‹';
    leftMonoArrow.type = 'button';
    leftMonoArrow.dataset.pagValue = 'lt';
    leftMonoArrow.classList.add('exercises__pagination-btn');
    leftMonoArrow.classList.add('exercises__pagination-arrow-btn');

    container.appendChild(leftDoubleArrow);
    container.appendChild(leftMonoArrow);
  }

  // Ліві три крапки
  if (startPage > 1) {
    const leftDots = document.createElement('div');
    leftDots.textContent = '...';
    leftDots.classList.add('exercises__pagination-btn');
    container.append(leftDots);
  }

  // Кнопки сторінок
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');

    btn.textContent = i;
    btn.type = 'button';
    btn.dataset.pagValue = i;
    btn.classList.add('exercises__pagination-btn');

    if (i === page) {
      btn.classList.add('exercises__pagination-btn--active');
    }

    container.append(btn);
  }

  // Праві три крапки
  if (endPage < totalPages) {
    const rightDots = document.createElement('div');
    rightDots.textContent = '...';
    rightDots.classList.add('exercises__pagination-btn');
    container.append(rightDots);
  }

  // Праві стрілки
  if (totalPages > 3) {
    const rightMonoArrow = document.createElement('button');
    const rightDoubleArrow = document.createElement('button');

    rightDoubleArrow.textContent = '»';
    rightDoubleArrow.type = 'button';
    rightDoubleArrow.dataset.pagValue = 'drt';
    rightDoubleArrow.classList.add('exercises__pagination-btn');
    rightDoubleArrow.classList.add('exercises__pagination-arrow-btn');

    rightMonoArrow.textContent = '›';
    rightMonoArrow.type = 'button';
    rightMonoArrow.dataset.pagValue = 'rt';
    rightMonoArrow.classList.add('exercises__pagination-btn');
    rightMonoArrow.classList.add('exercises__pagination-arrow-btn');

    container.appendChild(rightMonoArrow);
    container.appendChild(rightDoubleArrow);
  }

  btns.appendChild(container);
}

function onPaginationClick(event) {
  handlePagination(event.target.dataset.pagValue);
}

// Керує кнопками пагінації
function handlePagination(pagValue) {
  // Якщо натиснуто кнопку з номером сторінки
  if (Number(pagValue)) {
    paginationState.page = Number(pagValue);
  } else {
    if (pagValue === 'dlt') {
      paginationState.page = 1;
    } else if (pagValue === 'lt' && paginationState.page - 1 >= 1) {
      paginationState.page -= 1;
    } else if (
      pagValue === 'rt' &&
      paginationState.page + 1 <= paginationState.totalPages
    ) {
      paginationState.page += 1;
    } else if (pagValue === 'drt') {
      paginationState.page = paginationState.totalPages;
    }
  }

  if (currentExercisesPageState === 'filters') {
    setExercisesCardsAndGetResponse(
      paginationState.perPage,
      currentFilter,
      paginationState.page
    );
  } else if (currentExercisesPageState === 'workout') {
    setWorkoutCardsAndGetResponse(
      currentCard,
      paginationState.perPage,
      paginationState.page
    );
  }

  setPagination(paginationState);
}

async function setWorkoutCardsAndGetResponse(name, limit = 12, page = 1) {
  const keyword = document
    .querySelector('.exercises__search-input')
    .value.trim()
    .toLowerCase();

  const url = new URL('https://your-energy.b.goit.study/api/exercises');

  const params = {
    page,
    limit,
    ...(currentFilter === 'Muscles' && { muscles: name }),
    ...(currentFilter === 'Equipment' && { equipment: name }),
    ...(currentFilter === 'Body%20parts' && { bodypart: name }),
    keyword,
  };

  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    setWorkoutCards(data.results);

    paginationState.page = data.page;
    paginationState.perPage = data.perPage;
    paginationState.totalPages = data.totalPages;
    setPagination(paginationState);

    return data;
  } catch (err) {
    throw err;
  }
}

function setWorkoutCards(set) {
  const cards = document.querySelector('.exercises-workout__cards');
  cards.innerHTML = '';
  const fragment = document.createDocumentFragment();

  for (let item of set) {
    const card = document.createElement('li');
    card.classList.add('exercises__workout-card');
    card.dataset.data = JSON.stringify(item);

    const badge = document.createElement('p');
    badge.className = 'exercises__workout-badge';
    badge.textContent = 'WORKOUT';

    const grade = document.createElement('div');
    grade.className = 'exercises__workout-grade';
    const gradeValue = document.createElement('p');
    gradeValue.className = 'exercises__workout-grade-value';
    gradeValue.textContent = item.rating;
    const gradeStar = document.createElement('img');
    gradeStar.className = 'exercises__workout-grade-star';
    gradeStar.src = 'img/star.svg';
    gradeStar.alt = 'Star icon';
    grade.appendChild(gradeValue);
    grade.appendChild(gradeStar);

    const start = document.createElement('div');
    start.className = 'exercises__workout-start';
    const startText = document.createElement('p');
    startText.className = 'exercises__workout-start-text';
    startText.textContent = 'Start';
    const startArrow = document.createElement('img');
    startArrow.className = 'exercises__workout-start-arrow';
    startArrow.src = 'img/start-arrow.svg';
    startArrow.alt = 'Arrow icon';
    start.appendChild(startText);
    start.appendChild(startArrow);

    const header = document.createElement('div');
    header.className = 'exercises__workout-header';
    const headerImg = document.createElement('img');
    headerImg.className = 'exercises__workout-header-img';
    headerImg.src = 'img/run-dark.png';
    headerImg.alt = 'Run icon';
    const headerName = document.createElement('h3');
    headerName.className = 'exercises__workout-header-name';
    headerName.textContent =
      item.name[0].toUpperCase() + (item.name.slice ? item.name.slice(1) : '');
    header.appendChild(headerImg);
    header.appendChild(headerName);

    const info = document.createElement('div');
    info.className = 'exercises__workout-info';
    const calories = document.createElement('p');
    calories.className = 'exercises__workout-info-calories';
    calories.textContent = `Burned calories: ${item.burnedCalories}/${item.time}`;
    const bodyPart = document.createElement('p');
    bodyPart.className = 'exercises__workout-info-body-part';
    bodyPart.textContent =
      'Body part: ' +
      (item.bodyPart
        ? item.bodyPart[0].toUpperCase() + item.bodyPart.slice(1)
        : '');
    const target = document.createElement('p');
    target.className = 'exercises__workout-info-target';
    target.textContent =
      'Target: ' +
      (item.target ? item.target[0].toUpperCase() + item.target.slice(1) : '');
    info.appendChild(calories);
    info.appendChild(bodyPart);
    info.appendChild(target);

    card.appendChild(badge);
    card.appendChild(grade);
    card.appendChild(start);
    card.appendChild(header);
    card.appendChild(info);

    fragment.appendChild(card);
  }

  cards.appendChild(fragment);
}

// getWorkoutCardHTML removed — card elements are created via DOM APIs in setWorkoutCards

function onExercisesCardClick(event) {
  const card = event.target.closest('.exercises__card');
  if (event.target.closest('.exercises__card')) {
    const search = document.querySelector('.exercises__search-input');
    search.value = '';

    setWorkoutCardsAndGetResponse(card.dataset.name);
    currentCard = card.dataset.name;
    toggleExercisesSection();
  }
}

function toggleExercisesSection() {
  const exercises = document.querySelector('.exercises__cards');
  const workout = document.querySelector('.exercises-workout__cards');

  exercises.hidden = !exercises.hidden;
  workout.hidden = !workout.hidden;

  currentExercisesPageState = !exercises.hidden ? 'filters' : 'workout';

  const search = document.querySelector('.exercises__search');
  search.hidden = !search.hidden;

  if (currentExercisesPageState === 'workout') {
    document
      .querySelector('.exercises__header')
      .style.setProperty('--after-content', `" / ${currentCard}"`);

    document
      .querySelector('.exercises__cards')
      .removeEventListener('click', onExercisesCardClick);

    document
      .querySelector('.exercises-workout__cards')
      .addEventListener('click', onWorkoutCardClick);
  } else if (currentExercisesPageState === 'filters') {
    document
      .querySelector('.exercises__header')
      .style.setProperty('--after-content', `""`);

    document
      .querySelector('.exercises__cards')
      .addEventListener('click', onExercisesCardClick);

    document
      .querySelector('.exercises-workout__cards')
      .removeEventListener('click', onWorkoutCardClick);
  } else {
    throw new Error('Зламався currentExercisesPageState');
  }
}

function onClosePopUpClick() {
  const popUpWrapper = document.querySelector('.pop-up-wrapper');
  popUpWrapper.hidden = true;

  const popUp = document.querySelector('.pop-up');
  popUp.dataset.currentExerciseData = '#';

  if (window.innerWidth > 367) {
    popUp.style.width = '191.77cqw';
  }
  if (window.innerWidth > 768) {
    popUp.style.width = '49.17cqw';
  }

  const img = document.querySelector('.pop-up__img');
  const h2 = document.querySelector('.pop-up__h2');
  const grade = document.querySelector('.pop-up__grade-value');
  // const stars = document.querySelectorAll('.pop-up__grade-star');
  // const metrics = document.querySelectorAll('.pop-up__metrics-p');
  const summary = document.querySelector('.pop-up__summary');

  img.src = '';
  h2.textContent = '';
  grade.textContent = '';
  summary.textContent = '';

  popUp.removeEventListener('click', onPopUpClick);

  const valueP = document.querySelector('.pop-up__grade-value');
  valueP.textContent = '0.0';
  valueP.dataset.value = 0;

  const ratingStars = document.querySelectorAll('.pop-up__grade-star-rating');
  ratingStars.forEach(star => {
    star.src = 'img/Star-dark.png';
  });
}

function onWorkoutCardClick(event) {
  const main = document.querySelector('.pop-up__main-content-wrapper');
  const rating = document.querySelector('.pop-up__rating');

  main.hidden = false;
  rating.hidden = true;

  const target = event.target.closest('.exercises__workout-card');

  if (!target) return;

  renderPopUp(JSON.parse(target.dataset.data)._id);

  const popUpWrapper = document.querySelector('.pop-up-wrapper');
  popUpWrapper.hidden = false;
  const popUp = document.querySelector('.pop-up');
  popUp.dataset.currentExerciseData = target.dataset.data;

  popUp.addEventListener('click', onPopUpClick);
}

async function renderPopUp(id) {
  const url = 'https://your-energy.b.goit.study/api/exercises/' + id;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Помилка');
  }

  const data = await response.json();

  const img = document.querySelector('.pop-up__img');
  const h2 = document.querySelector('.pop-up__h2');
  const grade = document.querySelector('.pop-up__grade-value');
  const stars = document.querySelectorAll('.pop-up__grade-star');
  const metrics = document.querySelectorAll('.pop-up__metrics-p');
  const summary = document.querySelector('.pop-up__summary');

  img.src = data.gifUrl;
  h2.textContent = data.name[0].toUpperCase() + data.name.substring(1);
  grade.textContent = data.rating;
  summary.textContent = data.description;

  stars.forEach((star, index) => {
    if (index + 1 > Math.ceil(data.rating)) {
      star.src = 'img/Star-dark.png';
    }
  });

  metrics.forEach(item => {
    const text = String(data[item.dataset.key]);

    if (item.dataset.key === 'burnedCalories') {
      item.textContent = `${data.burnedCalories}/${data.time} min`;
      return;
    }

    item.textContent = text[0].toUpperCase() + text.substring(1);
  });
}

function onPopUpClick(event) {
  if (event.target.closest('.pop-up__close-btn')) {
    onClosePopUpClick();
  } else if (event.target.closest('.pop-up__btn-rating')) {
    openRatingForm();

    const email = document.querySelector('.pop-up__rating-email');
    const text = document.querySelector('.pop-up__rating-text');

    text.style.borderColor = 'var(--main-color-leight)';
    email.style.borderColor = 'var(--main-color-leight)';
  } else if (event.target.closest('.pop-up__grade-star-rating')) {
    setRatingValue(event.target.dataset.starKey);
  } else if (event.target.closest('.pop-up__rating-btn')) {
    event.preventDefault();
    sendRatingForm();
  }
}

async function sendRatingForm() {
  const popUp = document.querySelector('.pop-up');
  const email = document.querySelector('.pop-up__rating-email');
  const text = document.querySelector('.pop-up__rating-text');
  const gradeVal = document.querySelector('.pop-up__rating-grade-value');

  if (!email.checkValidity() || !text.value) {
    text.style.borderColor = 'red';
    email.style.borderColor = 'red';
    return;
  }

  const body = {
    rate: Number(gradeVal.dataset.value),
    email: email.value.trim(),
    review: text.value.trim(),
  };

  try {
    const response = await fetch(
      `https://your-energy.b.goit.study/api/exercises/${JSON.parse(popUp.dataset.currentExerciseData)._id}/rating`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) throw new Error('Халепа');

    const data = await response.json();
  } catch (err) {
    throw err;
  }
}

function openRatingForm() {
  const main = document.querySelector('.pop-up__main-content-wrapper');
  const rating = document.querySelector('.pop-up__rating');

  main.hidden = true;
  rating.hidden = false;

  const valueP = document.querySelector('.pop-up__rating-grade-value');
  valueP.textContent = '0.0';
  valueP.dataset.value = 0;

  const popUp = document.querySelector('.pop-up');
  if (window.innerWidth > 367) {
    popUp.style.width = '55.99cqw';
  }
  if (window.innerWidth > 768) {
    popUp.style.width = '29.86cqw';
  }
}

function setRatingValue(starKey) {
  const valueP = document.querySelector('.pop-up__rating-grade-value');
  valueP.textContent = starKey + `.0`;
  valueP.dataset.value = Number(starKey);

  const stars = document.querySelectorAll('.pop-up__grade-star-rating');
  stars.forEach((star, index) => {
    if (index < Number(starKey)) {
      star.src = 'img/star.svg';
    } else {
      star.src = 'img/Star-dark.png';
    }
  });
}

function onSearch() {
  setWorkoutCardsAndGetResponse(currentCard);
}

// GLOBALS

// зберігає кількість карток для exercises
let cardsLimit = 12;

// Зберігає поточний стан пагінації
const paginationState = {
  totalPages: 1,
  page: 1,
  perPage: cardsLimit,
};

// показує, яка секція зараз показується в exercises
// значення: filters, workout
let currentExercisesPageState = 'filters';

// Зберігає поточний стан глобального фільтру
// значення: Muscles, Equipment, Body%20parts
let currentFilter = document.querySelector('.exercises__filter--active').dataset
  .filter;

// зберігає значення name вибраної картки
let currentCard = null;

// EXECUTION

const mobMenuBtn = document.querySelector('.header__menu-btn');
const closeMenuBtn = document.querySelector('.mobile-menu__close-btn');

if (window.innerWidth <= 367) {
  mobMenuBtn.addEventListener('click', mobMenuOpenHandler);

  cardsLimit = 9;
}

setQuote();
setExercisesCardsAndGetResponse(cardsLimit);

document.querySelectorAll('.exercises__filters').forEach(element => {
  element.addEventListener('click', handleFilterClick);
});

document
  .querySelector('.exercises__cards')
  .addEventListener('click', onExercisesCardClick);

document
  .querySelector('.footer__subscribe')
  .addEventListener('submit', event => {
    event.preventDefault();

    const emailInput = document.querySelector('.footer__subscribe-email');
    if (emailInput.value) {
      subscribe(emailInput.value);
    }
    emailInput.value = '';
  });

document
  .querySelector('.exercises__pagination-btns')
  .addEventListener('click', onPaginationClick);

document
  .querySelector('.exercises__search-input')
  .addEventListener('search', onSearch);

document
  .querySelector('.exercises__search-input')
  .addEventListener('search', onSearch);
