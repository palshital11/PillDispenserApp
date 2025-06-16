const dateInput = document.getElementById("doseDate");
const timeInput = document.getElementById("doseTime");
const doseList = document.getElementById("doseList");
const nextDose = document.getElementById("nextDose");

let doses = JSON.parse(localStorage.getItem("doses")) || [];

function saveDoses() {
  localStorage.setItem("doses", JSON.stringify(doses));
  renderDoses();
  updateNextDose();
}

function addDose() {
  const date = dateInput.value;
  const time = timeInput.value;
  if (!date || !time) {
    alert("Please select date and time!");
    return;
  }

  if (doses.length >= 21) {
    alert("Only 21 doses allowed for the week!");
    return;
  }

  doses.push({ date, time });
  doses.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  saveDoses();
  dateInput.value = "";
  timeInput.value = "";
}

function renderDoses() {
  doseList.innerHTML = "";
  doses.forEach((dose, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${dose.date} at ${dose.time}
      <button onclick="removeDose(${index})">Delete</button>
    `;
    doseList.appendChild(li);
  });
}

function removeDose(index) {
  doses.splice(index, 1);
  saveDoses();
}

function updateNextDose() {
  const now = new Date();
  const upcoming = doses.find(d => new Date(`${d.date}T${d.time}`) > now);
  if (upcoming) {
    const dt = new Date(`${upcoming.date}T${upcoming.time}`);
    nextDose.textContent = `${dt.toDateString()} at ${dt.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
  } else {
    nextDose.textContent = "No upcoming dose.";
  }
}

// Initial load
renderDoses();
updateNextDose();

const alarmSound = document.getElementById("alarm");

const pillAlert = document.getElementById("pillAlert");
const getWell = document.getElementById("getWell");
const customAlert = document.getElementById("customAlert");

let alerted = false;

function checkAlerts() {
  const now = new Date();
  const nowStr = now.getFullYear() + '-' +
                 String(now.getMonth() + 1).padStart(2, '0') + '-' +
                 String(now.getDate()).padStart(2, '0') + 'T' +
                 String(now.getHours()).padStart(2, '0') + ':' +
                 String(now.getMinutes()).padStart(2, '0');

  doses.forEach(dose => {
    const doseTimeStr = `${dose.date}T${dose.time}`;
    const doseTime = new Date(doseTimeStr);
const diff = Math.abs(now - doseTime);

if (diff < 5000 && !alerted) {
  showCustomAlert();
  alerted = true;
}

  });
}



function showCustomAlert() {
  customAlert.style.display = "flex"; // Ensure 'flex' for centering
  pillAlert.play();
}

function acknowledgeDose() {
  customAlert.style.display = "none";
  pillAlert.pause();
  pillAlert.currentTime = 0;
  getWell.play();
  alerted = false;
}

// 🔁 Start checking alerts every 30 seconds
setInterval(checkAlerts, 5000);