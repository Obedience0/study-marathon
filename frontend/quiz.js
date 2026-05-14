let questions = [];

db.ref("quiz").on("value", snap => {
  const data = snap.val();
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";
  questions = [];

  if (data) {
    let i = 0;
    for (let id in data) {
      let q = data[id];
      questions.push(q);

      quizDiv.innerHTML += `
        <div class="question">
          <h4>Question ${i + 1}</h4>
          <p>${q.q}</p>
          <label><input type="radio" name="q${i}" value="a"> ${q.a}</label><br>
          <label><input type="radio" name="q${i}" value="b"> ${q.b}</label><br>
          <label><input type="radio" name="q${i}" value="c"> ${q.c}</label><br>
        </div>
      `;
      i++;
    }

    if (questions.length > 0) {
      document.getElementById("submitBtn").style.display = "block";
    }
  } else {
    quizDiv.innerHTML = "<p>No quiz questions available. Please check back later.</p>";
  }
});

function submitQuiz(){
  let score = 0;
  const totalQuestions = questions.length;

  questions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (selected && selected.value === q.correct) {
      score++;
    }
  });

  const percentage = Math.round((score / totalQuestions) * 100);

  document.getElementById("score").innerText = `Score: ${score} out of ${totalQuestions}`;
  document.getElementById("percentage").innerText = `Percentage: ${percentage}%`;

  // Hide quiz, show results
  document.getElementById("quiz").style.display = "none";
  document.getElementById("submitBtn").style.display = "none";
  document.getElementById("results").style.display = "block";

  // Save result to database
  if (auth.currentUser) {
    db.ref("results").push({
      user: auth.currentUser.email,
      score: score,
      total: totalQuestions,
      percentage: percentage,
      timestamp: Date.now()
    });
  }
}

function retakeQuiz() {
  // Reset quiz
  document.getElementById("results").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  // Reload questions
  db.ref("quiz").once("value", snap => {
    const data = snap.val();
    const quizDiv = document.getElementById("quiz");
    quizDiv.innerHTML = "";
    questions = [];

    if (data) {
      let i = 0;
      for (let id in data) {
        let q = data[id];
        questions.push(q);

        quizDiv.innerHTML += `
          <div class="question">
            <h4>Question ${i + 1}</h4>
            <p>${q.q}</p>
            <label><input type="radio" name="q${i}" value="a"> ${q.a}</label><br>
            <label><input type="radio" name="q${i}" value="b"> ${q.b}</label><br>
            <label><input type="radio" name="q${i}" value="c"> ${q.c}</label><br>
          </div>
        `;
        i++;
      }

      document.getElementById("submitBtn").style.display = "block";
    }
  });
}

function logout(){
  firebase.auth().signOut().then(() => {
    window.location = "index.html";
  });
}