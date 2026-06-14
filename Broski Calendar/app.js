import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCLJiSh5dGVssNJrYlLgbiQqszcX41lH4M",
  authDomain: "broski-planner.firebaseapp.com",
  databaseURL: "https://broski-planner-default-rtdb.firebaseio.com",
  projectId: "broski-planner",
  storageBucket: "broski-planner.firebasestorage.app",
  messagingSenderId: "404917555860",
  appId: "1:404917555860:web:4522e47be81e52520e5a81",
  measurementId: "G-HKYDZHN5K2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

/* =========================================
   DOM ELEMENTS
========================================= */

const calendar =
document.getElementById("calendar");

const monthTitle =
document.getElementById("monthTitle");

const loginBtn =
document.getElementById("loginBtn");

const userInfo =
document.getElementById("userInfo");

const modal =
document.getElementById("eventModal");

const saveBtn =
document.getElementById("saveEvent");

const newEventBtn =
document.getElementById("newEventBtn");

const prevMonth =
document.getElementById("prevMonth");

const nextMonth =
document.getElementById("nextMonth");

const darkToggle =
document.getElementById("darkToggle");

/* =========================================
   STATE
========================================= */

let currentUser = null;

let selectedDate = null;

let currentDate = new Date();

let events = [];

/* =========================================
   DARK MODE
========================================= */

if(localStorage.getItem("darkMode")==="true"){
  document.body.classList.add("dark");
}

darkToggle.addEventListener("click",()=>{

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
});

/* =========================================
   AUTH
========================================= */

loginBtn.addEventListener(
"click",
async ()=>{

  try{

    await signInWithPopup(
      auth,
      provider
    );

  }catch(err){

    console.error(err);

    alert("Login failed");
  }

});

onAuthStateChanged(
auth,
(user)=>{

  currentUser=user;

  if(user){

    userInfo.innerHTML=`
      <div style="margin-top:15px">
        <img
          src="${user.photoURL}"
          width="50"
          height="50"
          style="
            border-radius:50%;
            display:block;
            margin-bottom:10px;
          "
        >

        <strong>
          ${user.displayName}
        </strong>

        <br>

        <small>
          ${user.email}
        </small>

        <br><br>

        <button id="logoutBtn">
          Logout
        </button>

      </div>
    `;

    document
    .getElementById("logoutBtn")
    .onclick=()=>signOut(auth);

    loginBtn.style.display="none";

  }else{

    loginBtn.style.display="block";

    userInfo.innerHTML="";
  }

});
/* =========================================
   MODAL
========================================= */

newEventBtn.addEventListener(
"click",
()=>{

  selectedDate =
  getTodayKey();

  modal.style.display="flex";

});

window.addEventListener(
"click",
(e)=>{

  if(e.target===modal){

    modal.style.display="none";
  }

});

/* =========================================
   CALENDAR
========================================= */

function renderCalendar(){

  calendar.innerHTML="";

  const year =
  currentDate.getFullYear();

  const month =
  currentDate.getMonth();

  monthTitle.textContent =
  currentDate.toLocaleString(
    "default",
    {
      month:"long",
      year:"numeric"
    }
  );

  const firstDay =
  new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth =
  new Date(
    year,
    month+1,
    0
  ).getDate();

  for(
    let i=0;
    i<firstDay;
    i++
  ){

    const blank =
    document.createElement("div");

    blank.className="day";

    calendar.appendChild(blank);
  }

  for(
    let day=1;
    day<=daysInMonth;
    day++
  ){

    const box =
    document.createElement("div");

    box.className="day";

    const dateKey =
    `${year}-${month+1}-${day}`;

    box.innerHTML=`
      <div
        style="
        font-weight:700;
        margin-bottom:10px;
      ">
        ${day}
      </div>
    `;

    const dayEvents =
    events.filter(
      event =>
      event.date===dateKey
    );

    dayEvents.forEach(
    event=>{

      const eventDiv =
      document.createElement("div");

      eventDiv.className="event";

      eventDiv.style.background =
      event.color;

      eventDiv.innerHTML=`
        <strong>
          ${event.time}
        </strong>
        <br>
        ${event.title}
      `;

      eventDiv.addEventListener(
      "dblclick",
      async (e)=>{

        e.stopPropagation();

        if(
          confirm(
            "Delete event?"
          )
        ){

          await deleteDoc(
            doc(
              db,
              "events",
              event.id
            )
          );

        }

      });

      box.appendChild(
        eventDiv
      );

    });

    box.addEventListener(
    "click",
    ()=>{

      selectedDate =
      dateKey;

      modal.style.display =
      "flex";

    });

    calendar.appendChild(
      box
    );
  }
}

/* =========================================
   SAVE EVENT
========================================= */

saveBtn.addEventListener(
"click",
async ()=>{

  if(!currentUser){

    alert(
      "Login first"
    );

    return;
  }

  const title =
  document
  .getElementById(
    "eventTitle"
  )
  .value
  .trim();

  const time =
  document
  .getElementById(
    "eventTime"
  )
  .value;

  const color =
  document
  .getElementById(
    "eventColor"
  )
  .value;

  if(!title){

    alert(
      "Event title required"
    );

    return;
  }

  try{

    await addDoc(
      collection(
        db,
        "events"
      ),
      {
        title,
        time,
        color,
        date:selectedDate,
        userId:
        currentUser.uid,
        userName:
        currentUser.displayName,
        createdAt:
        Date.now()
      }
    );

    document
    .getElementById(
      "eventTitle"
    )
    .value="";

    document
    .getElementById(
      "eventTime"
    )
    .value="";

    modal.style.display=
    "none";

  }catch(err){

    console.error(err);

    alert(
      "Failed to save"
    );

  }

});

/* =========================================
   FIRESTORE LIVE SYNC
========================================= */

const eventsQuery =
query(
  collection(
    db,
    "events"
  ),
  orderBy(
    "createdAt",
    "desc"
  )
);

onSnapshot(
eventsQuery,
(snapshot)=>{

  events =
  snapshot.docs.map(
  doc=>({

    id:doc.id,
    ...doc.data()

  }));

  renderCalendar();

});

/* =========================================
   MONTH NAVIGATION
========================================= */

prevMonth.addEventListener(
"click",
()=>{

  currentDate.setMonth(
    currentDate.getMonth()-1
  );

  renderCalendar();

});

nextMonth.addEventListener(
"click",
()=>{

  currentDate.setMonth(
    currentDate.getMonth()+1
  );

  renderCalendar();

});

/* =========================================
   HELPERS
========================================= */

function getTodayKey(){

  const d =
  new Date();

  return `${d.getFullYear()}-${
    d.getMonth()+1
  }-${
    d.getDate()
  }`;

}

/* =========================================
   INITIALIZE
========================================= */

renderCalendar();