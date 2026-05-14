function isLive(start, end) {
  const now = new Date();
  const startTime = new Date(start);
  const endTime = new Date(end);
  return now >= startTime && now <= endTime;
}

function isUpcoming(start) {
  const now = new Date();
  const startTime = new Date(start);
  return startTime > now;
}

function formatDateTime(dateTimeStr) {
  const date = new Date(dateTimeStr);
  return date.toLocaleString();
}

function formatDate(dateTimeStr) {
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString();
}

function formatTime(dateTimeStr) {
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

db.ref("lessons").on("value", snap => {
  const data = snap.val();
  const liveDiv = document.getElementById("liveLessons");
  const upcomingDiv = document.getElementById("upcomingLessons");

  liveDiv.innerHTML = "";
  upcomingDiv.innerHTML = "";

  if (data) {
    const lessonIds = Object.keys(data);
    let liveCount = 0;
    let upcomingCount = 0;

    // Sort lessons by start time
    const sortedLessons = lessonIds.map(id => ({id, ...data[id]}))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    sortedLessons.forEach(lesson => {
      const live = isLive(lesson.startTime, lesson.endTime);
      const upcoming = isUpcoming(lesson.startTime);

      const lessonCard = document.createElement("div");
      lessonCard.className = `lesson-card ${live ? 'live' : 'upcoming'}`;

      if (live) {
        lessonCard.innerHTML = `
          <div class="lesson-header">
            <h4>${lesson.title}</h4>
            <span class="live-badge">LIVE</span>
          </div>
          <div class="lesson-details">
            <p><strong>Started:</strong> ${formatTime(lesson.startTime)}</p>
            <p><strong>Ends:</strong> ${formatTime(lesson.endTime)}</p>
          </div>
          <a href="${lesson.zoomLink}" target="_blank" class="join-btn">Join Now</a>
        `;
        liveDiv.appendChild(lessonCard);
        liveCount++;
      } else if (upcoming) {
        lessonCard.innerHTML = `
          <div class="lesson-header">
            <h4>${lesson.title}</h4>
          </div>
          <div class="lesson-details">
            <p><strong>Date:</strong> ${formatDate(lesson.startTime)}</p>
            <p><strong>Time:</strong> ${formatTime(lesson.startTime)} - ${formatTime(lesson.endTime)}</p>
          </div>
          <div class="lesson-actions">
            <button onclick="addToCalendar('${lesson.title}', '${lesson.startTime}', '${lesson.endTime}')" class="calendar-btn">Add to Calendar</button>
            <button onclick="setReminder('${lesson.title}', '${lesson.startTime}')" class="reminder-btn">Set Reminder</button>
          </div>
        `;
        upcomingDiv.appendChild(lessonCard);
        upcomingCount++;
      }
    });

    if (liveCount === 0) {
      liveDiv.innerHTML = "<p>No live lessons at the moment.</p>";
    }
    if (upcomingCount === 0) {
      upcomingDiv.innerHTML = "<p>No upcoming lessons scheduled.</p>";
    }
  } else {
    liveDiv.innerHTML = "<p>No lessons available.</p>";
    upcomingDiv.innerHTML = "<p>No lessons available.</p>";
  }
});

function addToCalendar(title, startTime, endTime) {
  // Create Google Calendar URL
  const start = new Date(startTime).toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(endTime).toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=Study%20Marathon%20Lesson`;
  window.open(calendarUrl, '_blank');
}

function setReminder(title, startTime) {
  // Simple browser notification (if permitted)
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        const start = new Date(startTime);
        const now = new Date();
        const timeDiff = start - now;

        if (timeDiff > 0) {
          setTimeout(() => {
            new Notification(`Upcoming Lesson: ${title}`, {
              body: `Your lesson starts at ${start.toLocaleTimeString()}`,
              icon: '/favicon.ico'
            });
          }, Math.max(timeDiff - 300000, 0)); // 5 minutes before
          alert(`Reminder set for "${title}"`);
        } else {
          alert("Lesson has already started!");
        }
      } else {
        alert("Please enable notifications to set reminders.");
      }
    });
  } else {
    alert("Your browser doesn't support notifications.");
  }
}

function logout(){
  firebase.auth().signOut().then(() => {
    window.location = "index.html";
  });
}