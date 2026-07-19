const APIs = {
  sessions: "/api/sessions-types",
  levels: "/api/levels",
  sessions: "/api/level/sessiions"
}

function close_input() {
  const add_input_container = document.querySelector(".closed-input")

  add_input_container.style.left = "90%"
  add_input_container.style.width = "10%";
  add_input_container.style.visibility = "hidden";
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

// levels page
async function load_levels() {
  const response = await fetch(APIs.levels)
  const levels = await response.json()

  return levels;
}

async function init_levels_page() {
  const data = await load_levels();
  const levels_container = document.querySelector(".levels-boxes")

  levels_container.innerHTML = "";

  data.forEach(level => {    
    const level_div = `
    <div class="level">
      <a href="/levels/${level.id}">${level.name}</a>
    </div>
    `
    levels_container.innerHTML += level_div;
  });
}

async function add_level() {
  const add_level_input_container = document.querySelector(".add-level-input")
  const add_level_input = document.querySelector(".add-level-input input")
  const level_name = add_level_input.value;

  if (level_name === "") {
    console.log("EMPTY INPUT")
    add_level_input_container.style.visibility = "visible";
    add_level_input_container.style.width = "25%";
    add_level_input_container.style.left = "52%"
    return;
  };

  await fetch(APIs.levels, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({name: level_name})
  })

  add_level_input.value = "";
  close_input();
  init_levels_page();
}

// level page

function edit_mode() {
  const inputs_section = document.querySelector(".view-add-section")
  const current_role = document.querySelector(".view-add-section .section-current-role")
  const input = document.querySelector(".view-add-section input")
  const textarea = document.querySelector(".view-add-section textarea")

  input.readOnly = false;
  textarea.readOnly = false;
  current_role.textContent = "edit mode";
  current_role.style.color = "#38BDF8";
}

async function add_lesson() {
  const current_role = document.querySelector(".view-add-section .section-current-role")
  const input = document.querySelector(".view-add-section input")
  const textarea = document.querySelector(".view-add-section textarea")

  if (current_role.textContent === "view mode") edit_mode();
  else if(current_role.textContent === "edit mode") {
    if (input.value.trim() === "" || textarea.value.trim() === "" || !/^\d+$/.test(input.value.trim())) return;
    const num = Number(input.value.trim())
    if (num < 1 || num > 8) return;

    
  }
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
  init_home_page();
} else if (document.querySelector(".levels-page-container")) {
  init_levels_page();
}