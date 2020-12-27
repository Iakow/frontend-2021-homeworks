"use strict";

disableFilters();

const USERS_AMOUNT = 100;

mountUserList(getPlaceholders());

const ALL_USER_CARDS = [];

fetch(`https://randomuser.me/api/?results=${USERS_AMOUNT}`)
  .then((response) => response.json())
  .then((response) => {
    response.results.forEach((userData) => {
      ALL_USER_CARDS.push(getUserCard(userData));
    });

    mountUserList(ALL_USER_CARDS);
    enableFilters();
  });

addHandlers();


function addHandlers() {
  const filtersBlock = document.querySelector("#filters-block");

  filtersBlock.addEventListener("input", (e) => {
    const { id } = e.target;

    if (id === "filter-name") {
      e.target.value = e.target.value.trim();
    }

    if (id === "filter-age-min" || id === "filter-age-max") {
      if (e.target.value === "0") e.target.value = "";
    }

    applyFilters();
  });

  filtersBlock.addEventListener("click", (e) => {
    const { id, value } = e.target;

    if (id === "filter-sex") {
      if (!value) {
        e.target.value = "female";
      } else if (value === "female") {
        e.target.value = "male";
      } else if (value === "male") {
        e.target.value = "";
      }
    } else if (id === "sort-age") {
      document.querySelector("#sort-name").value = "";

      if (!value) {
        e.target.value = "up";
      } else if (value === "up") {
        e.target.value = "down";
      } else if (value === "down") {
        e.target.value = "";
      }
    } else if (id === "sort-name") {
      document.querySelector("#sort-age").value = "";

      if (!value) {
        e.target.value = "up";
      } else if (value === "up") {
        e.target.value = "down";
      } else if (value === "down") {
        e.target.value = "";
      }
    } else {
      return;
    }

    applyFilters();
  });

  document.querySelector("#reset-filters").addEventListener("click", (e) => {
    e.target.disabled = true;

    document.querySelectorAll(".filter").forEach((ctrl) => (ctrl.value = ""));

    mountUserList(ALL_USER_CARDS);
  });
}

function applyFilters() {
  const filteredArr = [...ALL_USER_CARDS]
    .filter(filterByName)
    .filter(filterByAge)
    .filter(filterBySex)
    .sort(sortByAge)
    .sort(sortByName);

  mountUserList(filteredArr);

  const ctrls = document.querySelectorAll(".filter");
  document.querySelector("#reset-filters").disabled = [...ctrls].every(
    (ctrl) => ctrl.value === ""
  );

  function filterByName(user) {
    const firstName = user.userData.name.first.toLowerCase();
    const input = document.querySelector("#filter-name").value.toLowerCase();

    return firstName.startsWith(input);
  }

  function filterByAge(user) {
    const min = document.querySelector("#filter-age-min").value;
    const max = document.querySelector("#filter-age-max").value;
    const { age } = user.userData.dob;

    if (!min && !max) return user;
    if (min && !max) return +age >= +min;
    if (!min && max) return +age <= +max;
    if (min && max) return +age >= +min && +age <= +max;
  }

  function filterBySex(user) {
    const input = document.querySelector("#filter-sex").value;

    if (input === "male") {
      return user.userData.gender === "male";
    } else if (input === "female") {
      return user.userData.gender === "female";
    } else if (input === "") {
      return true;
    }
  }

  function sortByAge(user1, user2) {
    const input = document.querySelector("#sort-age").value;
    if (input === "down") {
      return +user2.userData.dob.age - +user1.userData.dob.age;
    } else if (input === "up") {
      return +user1.userData.dob.age - +user2.userData.dob.age;
    } else if (input === "") {
      return 0;
    }
  }

  function sortByName(user1, user2) {
    const input = document.querySelector("#sort-name").value;
    const name1 = user1.userData.name.first + user1.userData.name.last;
    const name2 = user2.userData.name.first + user2.userData.name.last;

    if (input === "up") {
      if (name1 > name2) return 1;
      if (name1 < name2) return -1;
      if (name1 === name2) return 0;
    } else if (input === "down") {
      if (name1 < name2) return 1;
      if (name1 > name2) return -1;
      if (name1 === name2) return 0;
    } else if (input === "") {
      return 0;
    }
  }
}

function disableFilters() {
  document
    .querySelectorAll(".filter")
    .forEach((controll) => (controll.disabled = true));
}

function enableFilters() {
  document
    .querySelectorAll(".filter")
    .forEach((controll) => (controll.disabled = false));
}

function getPlaceholders() {
  function getPlaceholder() {
    const fakeUserCard = document.createElement("div");
    fakeUserCard.classList.add("user-card", "placeholder");

    fakeUserCard.innerHTML = [
      `<img class="user-card__photo" height="100" width="100">`,
      `<p class="user-card__name">Full Name, AGE </p>`,
      `<p class="user-card__addr">Country, City</p>`,
      `<p class="user-card__phone">PHONE-NUMBER</p>`,
      `<p class="user-card__email">user e-mail address</p>`
    ].join("\n");

    return fakeUserCard;
  }

  const placeholders = [];

  for (let i = 0; i < USERS_AMOUNT; i++) {
    placeholders.push(getPlaceholder());
  }

  return placeholders;
}

function getUserCard(fetchedUserData) {
  const card = document.createElement("li");
  card.classList.add("user-card");
  card.userData = fetchedUserData;

  const {nat, picture, name, dob, location, phone, email} = fetchedUserData;

  const flag = `<img class="user-card__flag" src="https://www.countryflags.io/${nat}/flat/24.png">`;

  card.innerHTML = [
    `<div class="user-card__cover" style="background-image: url('${picture.large}')"></div>`,
    `<img class="user-card__photo" src="${picture.large}">`,
    `<p class="user-card__name">${name.first} ${name.last}, ${dob.age}</p>`,
    `<p class="user-card__addr">${flag}${location.country}, ${location.city}</p>`,
    `<p class="user-card__phone">${phone}</p>`,
    `<p class="user-card__email">${email}</p>`
  ].join("\n");

  return card;
}

function mountUserList(usercardsArr) {
  const userList = document.querySelector("#user-list");
  const fragment = document.createDocumentFragment();

  fragment.append(...usercardsArr);

  userList.innerHTML = "";
  userList.append(fragment);
}