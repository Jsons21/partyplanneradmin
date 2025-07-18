const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api/";
const COHORT = "2505-FTB-CT-WEB-PT";
const API = BASE + COHORT;

let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button id="deleteButton">Delete Event</button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());

  const $deleteButton = $party.querySelector("#deleteButton");
  $deleteButton.addEventListener("click", () => {
    if (confirm("Confirm Delete?")) {
      deleteEvent(selectedParty.id);
    }
  });

  return $party;
}

function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

const form = () => {
  const $form = document.createElement("form");
  $form.style.width = "50%";
  $form.style.margin = "0 auto";

  $form.innerHTML = `
  <form>
  <div class="form-group">
    <label for = "eventName">Event Name</label>
    <input class="form-control" id="newEventName" placeholder="Name">
 <div>
   <div class="form-group">
    <label for="Description">Description</label>
    <input class="form-control" id="newEventDescription" placeholder="Description">
  </div>
   <div class="form-group">
    <label for="Date">Date</label>
    <input type="date" class="form-control" id="newEventDate" placeholder="Date">
  </div>
   <div class="form-group">
    <label for="Location">Location</label>
    <input class="form-control" id="newEventLocation" placeholder="Location">
  </div>
  <button type="submit" class="btn btn-primary">Create Event</button>
</form>
  `;

  $form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dateInput = document.querySelector("#newEventDate").value;

    if (dateInput) {
      const isoDate = new Date(dateInput).toISOString();
      console.log("ISO Date:", isoDate);
    }
  });

  return $form;
};

const addNewEvent = async (e) => {
  e.preventDefault();
  console.log(e);
  console.log(e.target);
  console.log(e.target[0]);
  console.log(e.target[0].value);
  console.log(e.target[1].value);
  console.log(e.target[2].value);
  console.log(e.target[3].value);

  const obj = {
    name: e.target[0].value,
    description: e.target[1].value,
    date: new Date(e.target[2].value).toISOString(),
    location: e.target[3].value,
  };

  console.log(obj);
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    console.log(response);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};

const deleteEvent = async (id) => {
  const response = await fetch(`${API}/events/${id}`, {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
  })
    .then((resp) => resp.json())
    .then(() => {
      $party.innerHTML = "";
      const home = $party.querySelector(`[data-id='${id}']`);
      party.remove();
    });
};

function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.addEventListener("submit", addNewEvent);
  $app.append(form());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
