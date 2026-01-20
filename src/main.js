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

  const modal = document.querySelector('.modal');
  modal.classList.toggle('modal--hidden');
}

function closeMobMenu() {
  console.log(close);
  closeMenuBtn.removeEventListener('click', mobMenuCloseHandler);

  mobMenuBtn.addEventListener('click', closeMobMenu);

  const modal = document.querySelector('.modal');
  modal.classList.toggle('modal--hidden');
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
  const url = new URL('https://your-energy.b.goit.study/api/exercises');

  const params = {
    page,
    limit,
    ...(currentFilter === 'Muscles' && { muscles: name }),
    ...(currentFilter === 'Equipment' && { equipment: name }),
    ...(currentFilter === 'Body%20parts' && { bodypart: name }),
  };

  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    const cards = document.querySelector('.exercises-workout__cards');
    cards.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let item of data.results) {
      const card = document.createElement('li');
      card.classList.add('exercises__workout-card');
      card.innerHTML = getWorkoutCardHTML(item);

      fragment.appendChild(card);
    }
    cards.appendChild(fragment);

    paginationState.page = data.page;
    paginationState.perPage = data.perPage;
    paginationState.totalPages = data.totalPages;
    setPagination(paginationState);

    return data;
  } catch (err) {
    throw err;
  }
}

function getWorkoutCardHTML(data) {
  return `
        <p class="exercises__workout-badge">WORKOUT</p>
        <div class="exercises__workout-grade">
          <p class="exercises__workout-grade-value">${data.rating}</p>
          <img
            class="exercises__workout-grade-star"
            src="../img/star.svg"
            alt="Star icon"
          />
        </div>
        <div class="exercises__workout-start">
          <p class="exercises__workout-start-text">Start</p>
          <img
            src="../img/start-arrow.svg"
            alt="Arrow icon"
            class="exercises__workout-start-arrow"
          />
        </div>
        <div class="exercises__workout-header">
          <img
            class="exercises__workout-header-img"
            src="../img/run-dark.png"
            alt="Run icon"
          />
          <h3 class="exercises__workout-header-name">${
            data.name[0].toUpperCase() + data.name.slice(1)
          }</h3>
        </div>
        <div class="exercises__workout-info">
          <p class="exercises__workout-info-calories">Burned calories: ${
            data.burnedCalories
          }/${data.time}</p>
          <p class="exercises__workout-info-body-part">Body part: ${
            data.bodyPart[0].toUpperCase() + data.bodyPart.slice(1)
          }</p>
          <p class="exercises__workout-info-target">Target: ${
            data.target[0].toUpperCase() + data.target.slice(1)
          }</p>
        </div>
  `;
}

function onExercisesCardClick(event) {
  setWorkoutCardsAndGetResponse(event.target.dataset.name);
  currentCard = event.target.dataset.name;
  toggleExercisesSection();
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
  } else if (currentExercisesPageState === 'filters') {
    document
      .querySelector('.exercises__header')
      .style.setProperty('--after-content', `""`);
  } else {
    throw new Error('Зламався currentExercisesPageState');
  }
}

function onWorkoutCardClick(event) {}

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

if (window.innerWidth <= 365) {
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
