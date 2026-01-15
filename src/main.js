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

function setQuote() {
  const quoteText = document.querySelector('.aside__quote-text');
  const quoteAuthor = document.querySelector('.aside__quote-author');

  fetch('https://your-energy.b.goit.study/api/quote')
    .then(response => handleFetchResponse(response))
    .then(data => {
      quoteText.innerHTML = data.quote;
      quoteAuthor.innerHTML = data.author;
    })
    .catch(err => {
      console.log(err);
    });
}

function setExercisesCards(limit = 12, filter = 'Muscles', page = 1) {
  if (filter === 'Body Parts') {
    filter = 'Body%20parts';
  }

  fetch(
    `https://your-energy.b.goit.study/api/filters?limit=${limit}&filter=${filter}&page=${page}`
  )
    .then(response => handleFetchResponse(response))
    .then(data => {
      console.log(data);
      const cards = document.querySelector('.exercises__cards');
      cards.innerHTML = '';

      for (let item of data.results) {
        const card = new ExercisesCard(item);
        cards.innerHTML += card.getHTML();
      }
    })
    .catch(err => {
      console.log(err);
    });
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
    // console.log(target);
    setExercisesCards(12, target.textContent, 1);

    currentFilter.classList.toggle('exercises__filter--active');
    target.classList.toggle('exercises__filter--active');
    currentFilter = target;
  }
}

function subscribe(validAddress) {
  fetch('https://your-energy.b.goit.study/api/subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: validAddress,
    }),
  })
    .then(response => handleFetchResponse(response))
    .then(data => {
      console.log(data.message);
    })
    .catch(err => {
      console.log(err);
    });
}

setQuote();
setExercisesCards();

const mobMenuBtn = document.querySelector('.header__menu-btn');
const closeMenuBtn = document.querySelector('.mobile-menu__close-btn');

if (window.innerWidth <= 365) {
  mobMenuBtn.addEventListener('click', mobMenuOpenHandler);
}

let currentFilter = document.querySelector('.exercises__filter--active');

document.querySelectorAll('.exercises__filter').forEach(elem => {
  elem.addEventListener('click', event => {
    handleFilterClick(event.target);
  });
});

const subscriptionForm = document.querySelector('.footer__subscribe');
subscriptionForm.addEventListener('submit', event => {
  event.preventDefault();

  const emailInput = document.querySelector('.footer__subscribe-email');
  if (emailInput.value) {
    subscribe(emailInput.value);
  }
  emailInput.value = '';
});
