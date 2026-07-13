const APIs = {
  sessions: "/api/sessions-types"
}

function close_input() {
  const add_session_input_container = document.querySelector(".add-session-input")

  add_session_input_container.style.left = "90%"
  add_session_input_container.style.width = "19%";
  add_session_input_container.style.visibility = "hidden";
}

// this function will be used in 2 pages (home, sessions)
async function load_sessions_types() {
  const response = await fetch(APIs.sessions)
  const sessions_types = await response.json()

  return sessions_types;
}

// sessions-editor  page
async function init_sessions_page() {
  const sessions_types = await load_sessions_types();   // await unwraps it here
  const table_body = document.querySelector("tbody");

  table_body.innerHTML = "";
  
  sessions_types.forEach(session_type => {
    const row = `
      <tr>
        <td>${session_type.name}</td>
        <td>${session_type.type}</td>
        <td>0</td>
        <td>0</td>
      </tr>
    `;
    table_body.innerHTML += row;
  });
}

async function add_session_type() {
  const add_session_input_container = document.querySelector(".add-session-input")
  const add_session_input = document.querySelector(".add-session-input input")
  const session_name = add_session_input.value;

  const drop_down_tag = document.querySelector(".add-session-input select")

  if (session_name === "" || drop_down_tag.value === "" || drop_down_tag.value === "Type") {
    console.log("EMPTY INPUT")
    add_session_input_container.style.visibility = "visible";
    add_session_input_container.style.width = "32%";
    add_session_input_container.style.left = "46%"
    return;
  };

  await fetch(APIs.sessions, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({name: session_name, type: drop_down_tag.value})
  })

  add_session_input.value = "";
  drop_down_tag.value = "Type";
  close_input();
  init_sessions_page();
}

// home page
async function init_home_page() {
  const response = await load_sessions_types();

  const sessions_container = document.querySelector(".main-sessions")
  sessions_container.innerHTML = "";

  response.forEach(session_type => {
    let title_students_num = null;
    if (session_type.type === "Group") title_students_num = "Group";

    const session_card = `
    <div class="session">
      <!-- header -->
      <div class="header">
        <span class="title">${session_type.name}</span>
        <span class="students">${title_students_num}<i class="fa-solid fa-user"></i></span>
      </div>
      <!-- cards -->
      <div class="cards">
        <div class="students-card session-card">
          <div class="card-title">Students</div>
          <div class="card-desc">You Have 29 Students At These Levels: (A+, C2, B2+)</div>
        </div>
        <div class="hours-card session-card">
          <div class="card-title">Hours</div>
          <div class="card-desc">you have worked 289 Hours in this Session type</div>
        </div>
      </div>
    </div>
    `
    sessions_container.innerHTML += session_card;
  })
}

// only run it on the sessions page
if (document.querySelector(".sessions-page-container")) {
  init_sessions_page();
} else if (document.querySelector(".home-page-container")) {
  init_home_page()
}