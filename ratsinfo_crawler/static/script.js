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
  fetchData(keywords);
});

function fetchData(word) {
    fetch(`/get_dataframe?word=${word}`)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("resultList");
            if (data.length === 0) {
                visualization.innerHTML = "<li>No results</li>";
                return;
            }
            visualization.innerHTML = (data.length + " entries found");
            // data is a list of objects (dicts)
            data.forEach(row => {
                for (const [key, value] of Object.entries(row)) {
                    const li = document.createElement("li");
                    li.textContent = `${key}: ${value}`;
                    visualization.appendChild(li);
                }
                // optional: separator between rows
                const hr = document.createElement("hr");
                visualization.appendChild(hr);
            });
        })
        .catch(err => console.error(err));
}

