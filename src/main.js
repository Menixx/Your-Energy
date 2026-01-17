// import { Notyf } from 'notyf';

class ExercisesCard {
  constructor({ name, filter, imgURL }) {
    this.name = name;
    this.filter = filter;
    this.imgURL = imgURL;
  }

  getHTML() {
    return `
      <li class="exercises__card" 
        style="background: 
                linear-gradient(rgba(17, 17, 17, 0.5), rgba(17, 17, 17, 0.5)),
                url(${this.imgURL});
              background-size: cover;
              background-repeat: no-repeat;
              background-position: center;
        ">
        <h3 class="exercises__card-name">${
          this.name[0].toUpperCase() + this.name.substring(1)
        }</h3>
        <p class="exercises__card-filter">${this.filter}</p>
      </li>
    `;
  }
}

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
  if (filter === 'Body Parts') {
    filter = 'Body%20parts';
  }

  try {
    // const response = await fetch(
    //   `https://your-energy.b.goit.study/api/filters?limit=${limit}&filter=${filter}&page=${page}`
    // );

    const response = await fetch(
      `https://your-energy.b.goit.study/api/filters?limit=${limit}&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Server error');
    }

    const data = await response.json();

    // console.log(data);
    const cards = document.querySelector('.exercises__cards');
    cards.innerHTML = '';

    for (let item of data.results) {
      const card = new ExercisesCard(item);
      cards.innerHTML += card.getHTML();
    }

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

function handleFilterClick(target) {
  if (target !== currentFilter) {
    setExercisesCardsAndGetResponse(12, target.textContent, 1);

    currentFilter.classList.toggle('exercises__filter--active');
    target.classList.toggle('exercises__filter--active');
    currentFilter = target;
  }
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

async function renderContentPage(content = 'exercises') {
  // An object containing GET-requests response data
  let responseData;

  if (content === 'exercises') {
    if (window.innerWidth <= 365) {
      responseData = await setExercisesCardsAndGetResponse(9);
    } else {
      responseData = await setExercisesCardsAndGetResponse(12);
    }
  }

  const { page, perPage, totalPages } = responseData;
  paginationState.page = Number(page);
  paginationState.perPage = Number(perPage);
  paginationState.totalPages = Number(totalPages);

  setPagination(paginationState);
}

// Встановлює кнопки пагінації на сторінці
function setPagination({ totalPages, page }) {
  const btns = document.querySelector('.exercises__pagination-btns');
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

  btns.addEventListener('click', onPaginationClick);
  btns.appendChild(container);
  btns.addEventListener('click', onPaginationClick);
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

  setExercisesCardsAndGetResponse(
    paginationState.perPage,
    currentFilter,
    paginationState.page
  );

  setPagination(paginationState);
}

// EXECUTION

const mobMenuBtn = document.querySelector('.header__menu-btn');
const closeMenuBtn = document.querySelector('.mobile-menu__close-btn');

let currentFilter = document.querySelector('.exercises__filter--active');

// Зберігає поточний стан пагінації
const paginationState = {
  totalPages: 1,
  page: 1,
  perPage: 12,
};

if (window.innerWidth <= 365) {
  mobMenuBtn.addEventListener('click', mobMenuOpenHandler);
}

setQuote();
renderContentPage();

document
  .querySelector('.exercises__filters')
  .addEventListener('click', event => {
    handleFilterClick(event.target);
  });

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
