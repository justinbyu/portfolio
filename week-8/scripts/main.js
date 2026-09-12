// Responsive menu toggle
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
menuToggle.addEventListener('click', () => {
  navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
});

// Dynamic year + last modified
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('lastModified').textContent = document.lastModified;

// Course array
const courses = [
  { code: "WDD130", name: "Web Fundamentals", credits: 3, subject: "WDD", completed: true },
  { code: "WDD131", name: "Dynamic Web Fundamentals", credits: 3, subject: "WDD", completed: false },
  { code: "CSE110", name: "Intro to Programming", credits: 2, subject: "CSE", completed: true },
  { code: "CSE210", name: "Programming with Classes", credits: 3, subject: "CSE", completed: false }
];

const courseList = document.getElementById('course-list');
const totalCreditsEl = document.getElementById('total-credits');

// Render courses
function renderCourses(filter = "all") {
  courseList.innerHTML = "";
  let filtered = courses.filter(c => filter === "all" || c.subject === filter);

  filtered.forEach(course => {
    const item = document.createElement('p');
    item.textContent = `${course.code} - ${course.name} (${course.credits} credits)`;
    if (course.completed) item.classList.add("completed");
    courseList.appendChild(item);
  });

  // Reduce for credits
  const totalCredits = filtered.reduce((sum, c) => sum + c.credits, 0);
  totalCreditsEl.textContent = totalCredits;
}

// Initial render
renderCourses();

// Filter buttons
document.querySelectorAll("#course-filters button").forEach(btn => {
  btn.addEventListener("click", () => {
    renderCourses(btn.dataset.subject);
  });
});
