const articles = [
  {
    title: "Article 1",
    file: "article1.md",
    description: "First article.",
    date: "2026-01-19"
  },
  {
    title: "Article 2",
    file: "article2.md",
    description: "Second article.",
    date: "2026-01-19"
  },
];

const grid = document.getElementById("articles-grid");

articles.forEach(a => {
  const card = document.createElement("div");
  card.classList.add("article-card");
  card.innerHTML = `
    <h2>${a.title}</h2>
    <p>${a.description}</p>
    <small>${a.date}</small>
  `;
  card.addEventListener("click", () => {
    window.location.href = `article.html?f=${a.file}`;
  });
  grid.appendChild(card);
});
