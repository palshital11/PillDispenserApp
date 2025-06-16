const dateInput = document.getElementById("doseDate");
const timeInput = document.getElementById("doseTime");
const doseList = document.getElementById("doseList");
const nextDose = document.getElementById("nextDose");

let pillTimeout; // <-- Add this at the top



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

let alertedDoses = new Set(); // to store "2024-06-09T10:00" like strings


function checkAlerts() {
  const now = new Date();
  const nowStr = now.getFullYear() + '-' +
                 String(now.getMonth() + 1).padStart(2, '0') + '-' +
                 String(now.getDate()).padStart(2, '0') + 'T' +
                 String(now.getHours()).padStart(2, '0') + ':' +
                 String(now.getMinutes()).padStart(2, '0');

  doses.forEach(dose => {
    const doseTimeStr = `${dose.date}T${dose.time}`;
    if (nowStr === doseTimeStr && !alertedDoses.has(doseTimeStr)) {
      showCustomAlert(doseTimeStr);
    }
  });
}



let currentAlertedDose = null;

function showCustomAlert(doseTimeStr) {
  customAlert.style.display = "flex";
  pillAlert.play();
  currentAlertedDose = doseTimeStr;

  // 🔔 Auto-close after 1 minute
  pillTimeout = setTimeout(() => {
    pillAlert.pause();
    pillAlert.currentTime = 0;
    customAlert.style.display = "none";
    currentAlertedDose && alertedDoses.add(currentAlertedDose); // Mark as alerted even if ignored
    if (currentAlertedDose) {
      alertedDoses.add(currentAlertedDose);
      updateNextDose(); // 🔄 Update next dose on auto-dismiss
    }
    currentAlertedDose = null;
  }, 60000);
}


function acknowledgeDose() {
  clearTimeout(pillTimeout);
  customAlert.style.display = "none";
  pillAlert.pause();
  pillAlert.currentTime = 0;
  getWell.play();
  
  // Mark dose as handled
  if (currentAlertedDose) {
    alertedDoses.add(currentAlertedDose);
    updateNextDose(); // 🔄 Update the next dose display
  }

  currentAlertedDose = null;
}




// 🔁 Start checking alerts every 30 seconds
setInterval(checkAlerts, 5000);