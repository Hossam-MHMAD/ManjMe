const APIs = {
  sessions: "/api/sessions-types",
  levels: "/api/levels",
  lessons: (level_id) => `/api/${level_id}/sessions`,
  lesson: (lesson_id) => `/api/${lesson_id}/session`,
  students: "/api/students"
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
    body: JSON.stringify({ name: session_name, type: drop_down_tag.value })
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
    body: JSON.stringify({ name: level_name })
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

  const textares_container = document.querySelector(".session-questions")
  textares_container.innerHTML = "";
  textares_container.innerHTML = `
  <!-- Main Question -->
  <div class="main-question">
    <div class="question-header">
      <span>Main Question</span>
      <button class="add-follow-btn" type="button" onclick="add_followUP_question(this)">
        + Follow-up
      </button>
    </div>
    <textarea class="question-input main-q-inpt" placeholder="Write the main question..."></textarea>
    <div class="followups">
      <!-- Follow-up -->
      <div class="followup-question">
        <span>↳ Follow-up</span>
        <textarea class="question-input followUP-q-inpt" placeholder="Write a follow-up question..."></textarea>
      </div>
    </div>
  </div>
  `;

  const choosed_lesson = document.querySelector(".choosed")
  if (choosed_lesson) choosed_lesson.classList.remove("choosed");

  input.readOnly = false;
  input.value = "";
  current_role.textContent = "edit mode";
  current_role.style.color = "#38BDF8";
}

function view_mode() {
  const inputs_section = document.querySelector(".view-add-section")
  const current_role = document.querySelector(".view-add-section .section-current-role")
  const input = document.querySelector(".view-add-section input")
  const textares_container = document.querySelector(".session-questions")

  input.value = "";
  input.readOnly = true;
  
  current_role.textContent = "view mode";
  current_role.style.color = "#EF4444";

  textares_container.innerHTML = "";
  textares_container.innerHTML = `
  <!-- Main Question -->
  <div class="main-question">
    <div class="question-header">
      <span>Main Question</span>
      <button class="add-follow-btn" type="button" onclick="add_followUP_question(this)">
        + Follow-up
      </button>
    </div>
    <textarea class="question-input main-q-inpt" placeholder="Write the main question..." readonly></textarea>
    <div class="followups">
      <!-- Follow-up -->
      <div class="followup-question">
        <span>↳ Follow-up</span>
        <textarea class="question-input followUP-q-inpt" placeholder="Write a follow-up question..." readonly></textarea>
      </div>
    </div>
  </div>
  `;
}

function add_main_question() {
  const current_role = document.querySelector(".view-add-section .section-current-role");
  if (current_role.textContent === "view mode") return;

  const container = document.querySelector(".session-questions");

  const mainQuestion = document.createElement("div");
  mainQuestion.className = "main-question";

  mainQuestion.innerHTML = `
  <div class="question-header">
    <span>Main Question</span>
    <button class="add-follow-btn" type="button" onclick="add_followUP_question(this)">
      + Follow-up
    </button>
  </div>
  <textarea class="question-input main-q-inpt" placeholder="Write the main question..."></textarea>
  <div class="followups">
    <div class="followup-question">
      <span>↳ Follow-up</span>
      <textarea class="question-input followUP-q-inpt" placeholder="Write a follow-up question..."></textarea>
    </div>
  </div>
    `;

  container.appendChild(mainQuestion);
}

function add_followUP_question(new_followUP_btn) {
  const current_role = document.querySelector(".view-add-section .section-current-role");
  if (current_role.textContent === "view mode") return;

  const container = new_followUP_btn
    .closest(".main-question")
    .querySelector(".followups");

  const followup = document.createElement("div");
  followup.className = "followup-question";

  followup.innerHTML = `
    <span>↳ Follow-up</span>
    <textarea class="question-input followUP-q-inpt" placeholder="Write a follow-up question..."></textarea>
  `;

  container.appendChild(followup);
}

async function add_lesson() {
  const current_mode = document.querySelector(".view-add-section .section-current-role")
  const input = document.querySelector(".view-add-section input")
  const textareas = document.querySelectorAll(".session-questions textarea")

  const all_questions_containers = document.querySelectorAll(".main-question")


  if (current_mode.textContent === "view mode") edit_mode();

  else if (current_mode.textContent === "edit mode") {
    if (input.value.trim() === "" || !/^\d+$/.test(input.value.trim())) return; // first check

    // second check
    for (const txtarea of textareas) {
      if (txtarea.value.trim() === "") {
        alert("Please fill all questions.");
        return; // This returns from your outer function.
      }
    }

    const num = Number(input.value.trim())
    if (num < 1 || num > 8) return;

    let questions = []; // this here is the content array of objects {main: "Tell me about yourself", followUPS: ["why", "tell me"]}

    all_questions_containers.forEach(question_container => {
      const main_Qs_input = question_container.querySelector(".main-q-inpt");
      const followUP_Qs_inputs = question_container.querySelectorAll(".followUP-q-inpt");

      let question = {};

      question.main_question = main_Qs_input.value.trim(); // add main question

      let followUPS_Qs = []; // get all follow ups
      followUP_Qs_inputs.forEach(followUP_question => {
        followUPS_Qs.push(followUP_question.value.trim());
      });

      question.followUPs = followUPS_Qs; // add follow ups questions

      questions.push(question);
    })

    console.log(questions);

    const level_id = window.location.pathname.split("/").pop();

    await fetch(APIs.lessons(level_id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: num, content: questions })
    })

    view_mode();
    init_level_page()
  }
}

async function load_lessons() {
  const level_id = parseInt(window.location.pathname.split("/").filter(Boolean).pop());
  const response = await fetch(APIs.lessons(level_id))
  const data = await response.json()

  return data;
}

async function init_level_page() {
  const data = await load_lessons();

  const lessons_container = document.querySelector(".sessions-container");
  const section_intro_level = document.querySelector(".section-intro span")
  lessons_container.innerHTML = "";
  section_intro_level.textContent = data.level_name;

  data.lessons.forEach(lesson => {
    const lesson_tag = `
    <div id="${lesson.id}" onclick="get_lesson(${lesson.id}, this)">Session ${lesson.number}</div>
    `;

    lessons_container.innerHTML += lesson_tag;
  })
}

async function get_lesson(lesson_id, lesson) {
  view_mode();
  const response = await fetch(APIs.lesson(lesson_id))
  const data = await response.json()

  const choosed_lesson = document.querySelector(".choosed")
  if (choosed_lesson) choosed_lesson.classList.remove("choosed");
  lesson.classList.add("choosed")

  const input = document.querySelector(".view-add-section input")
  

  input.value = data.number;
}

// students page
function select(element) {
  const dropdownParent = element.closest('.dropdown');
  const button = dropdownParent.querySelector('button');
  button.textContent = element.textContent;
  button.id = element.id;
}

async function load_students() {
  const response = await fetch(APIs.students);
  const data = await response.json();

  return data;
}

async function add_student() {
  const name_tag = document.querySelector(".student-name-input")
  const level_tag = document.querySelector("button.student-level")
  const nxt_lesson_tag = document.querySelector(".student-next-lesson")

  const name = name_tag.value.trim();
  const level = level_tag.id;
  const nxt_lesson = nxt_lesson_tag.id;

  if (!name || !level || !nxt_lesson) return;

  await fetch(APIs.students, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_name: name, level_id: level, student_nxt_lesson: nxt_lesson })
  })

  name_tag.value = "";
  level_tag.textContent = "Student Level";
  nxt_lesson_tag.textContent = "Next Lesson";
  level_tag.id = "";
  nxt_lesson_tag.id = "";
  init_students_page();
}

async function init_students_page() {
  const levels = await load_levels()
  const students = await load_students()

  const levels_dropdown = document.querySelector(".levels-dropdown");
  const students_boxes_container = document.querySelector(".students-boxes")

  levels_dropdown.innerHTML = "";
  students_boxes_container.innerHTML = "";

  levels.forEach(level => {
    const level_tag = `
    <li><a class="dropdown-item" id="${level.id}" onclick="select(this)">${level.name}</a></li>
    `;
    levels_dropdown.innerHTML += level_tag;
  });

  students.forEach(student => {
    const student_tag = `
    <a href="/students/${student.id}" class="student">
      <h1 class="student-name">${student.name}</h1>
      <div class="details">
        <div class="student-level">Level: <span>${student.level_name}</span></div>
        <div class="next-lesson-number">Next Lesson: <span>${student.next_lesson}</span></div>
      </div>
    </a>
    `
    students_boxes_container.innerHTML += student_tag;
  })
}


function filter_students() {
  const input_field = document.querySelector("input.search-bar")
  const text = input_field.value.trim().toLowerCase()

  const students = document.querySelectorAll(".student");

  students.forEach(student => {

    const title = student.querySelector("h1.student-name").textContent.toLowerCase();

    if (title.includes(text)) {
      student.style.display = "";
    } else {
      student.style.display = "none";
    }
  });
}

//student page
function move_screens(left = false, reset = true, right = false) {
  const screens_container = document.querySelector(".track")
  const start_lesson_btn = document.querySelector(".start-lesson-btn")


  if (reset) { // see history
    screens_container.style.transform = "translateX(calc(-100%/3))";
  } else if (left) { // start lesson
    screens_container.style.transform = "translateX(0)";
    start_lesson_btn.style.top = "-10px";
  } else if (right) { // see certain session note
    screens_container.style.transform = "translateX(calc(-100%/1.5))";
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
} else if (document.querySelector(".level-page-container")) {
  init_level_page();
} else if (document.querySelector(".students-page-container")) {
  init_students_page();
  document.querySelector("input.search-bar").addEventListener("input", function () {
    filter_students()
  })
}