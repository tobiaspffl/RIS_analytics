// Add event listeners to example buttons
document.querySelectorAll('.example-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const keyword = this.getAttribute('data-keyword');
    searchInput.value = keyword;
    searchBtn.click();
  });
});
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const visualization = document.getElementById("visualization");

searchBtn.addEventListener("click", () => {
  const keywords = searchInput.value.trim();

  if (!keywords) {
    alert("Please enter some keywords");
    return;
  }

  // TEMPORARY: simulate backend response
  fakeSearchRequest(keywords);
});

function fakeSearchRequest(keywords) {
  visualization.innerHTML = "<p>Loading...</p>";

  setTimeout(() => {
    // Fake dataset returned from backend
    const data = [
      { label: "Result A", value: 10 },
      { label: "Result B", value: 25 },
      { label: "Result C", value: 15 }
    ];

    showResults(keywords, data);
  }, 800);
}

function showResults(keywords, data) {
  visualization.innerHTML = `
    <h3>Results for "${keywords}"</h3>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
}
