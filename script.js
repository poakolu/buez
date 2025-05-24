const form = document.getElementById("budgetForm");
const resultsSection = document.getElementById("results");
const historySection = document.getElementById("history");
const totalDepensesEl = document.getElementById("totalDepenses");
const epargneEl = document.getElementById("epargne");
const historyBody = document.getElementById("historyBody");
const periodRadios = document.querySelectorAll('input[name="period"]');

let chart; 

function getPeriod() {
  return document.querySelector('input[name="period"]:checked').value;
}

function calculateTotals(income, expenses) {
  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const savings = income - totalExpenses;
  return { totalExpenses, savings };
}

function saveToHistory(income, expenses, savings) {
  let history = JSON.parse(localStorage.getItem("budgetHistory")) || [];
  const date = new Date();
  const period = getPeriod();
  const month = period === "mois" ? date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }) : date.getFullYear();

  // Limit history à 12 entrées max
  if (history.length >= 12) history.shift();

  history.push({ month, income, expenses, savings, period });
  localStorage.setItem("budgetHistory", JSON.stringify(history));
  return history;
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("budgetHistory")) || [];
  historyBody.innerHTML = "";
  history.forEach((entry, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.month}</td>
      <td>${entry.income.toFixed(2)}</td>
      <td>${entry.expenses.toFixed(2)}</td>
      <td>${entry.savings.toFixed(2)}</td>
    `;
    historyBody.appendChild(tr);
  });
  historySection.style.display = history.length > 0 ? "block" : "none";
}

function drawChart(expenses) {
  const ctx = document.getElementById("chart").getContext("2d");
  const labels = Object.keys(expenses);
  const data = Object.values(expenses);
  const colors = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f"];

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const income = parseFloat(document.getElementById("income").value);
  const expenses = {
    logement: parseFloat(form.logement.value) || 0,
    alimentation: parseFloat(form.alimentation.value) || 0,
    transport: parseFloat(form.transport.value) || 0,
    loisirs: parseFloat(form.loisirs.value) || 0,
    autres: parseFloat(form.autres.value) || 0,
  };

  const period = getPeriod();

  // Si période annuelle, on divise tout par 12 pour afficher mensuel et calculer taux d'épargne mensuel
  const factor = period === "annee" ? 1/12 : 1;
  const adjustedIncome = income * factor;
  const adjustedExpenses = {};
  Object.entries(expenses).forEach(([k,v]) => {
    adjustedExpenses[k] = v * factor;
  });

  const { totalExpenses, savings } = calculateTotals(adjustedIncome, adjustedExpenses);

  // Affichage résultats
  totalDepensesEl.textContent = `Total des dépenses mensuelles : ${totalExpenses.toFixed(2)} €`;
  epargneEl.textContent = `Épargne mensuelle estimée : ${savings.toFixed(2)} € (${((savings / adjustedIncome) * 100).toFixed(1)}%)`;

  drawChart(adjustedExpenses);

  resultsSection.style.display = "block";

  // Sauvegarde dans historique
  saveToHistory(adjustedIncome, totalExpenses, savings);
  loadHistory();
});

window.addEventListener("load", loadHistory);
