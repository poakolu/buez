function calculer() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const expenseInputs = document.querySelectorAll(".expense");
  const expenses = [];

  let totalExpenses = 0;

  expenseInputs.forEach(input => {
    const amount = parseFloat(input.value) || 0;
    totalExpenses += amount;
    expenses.push({
      label: input.dataset.label,
      value: amount
    });
  });

  const savings = income - totalExpenses;
  const savingsRate = income > 0 ? (savings / income * 100).toFixed(1) : 0;

  document.getElementById("savingsRate").textContent = 
    `Taux d'épargne : ${savingsRate}%`;

  afficherGraphique(expenses, savings);
}

function afficherGraphique(expenses, savings) {
  const ctx = document.getElementById("budgetChart").getContext("2d");
  
  const data = {
    labels: [...expenses.map(e => e.label), "Épargne"],
    datasets: [{
      label: 'Répartition du budget',
      data: [...expenses.map(e => e.value), savings > 0 ? savings : 0],
      backgroundColor: [
        '#3498db', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c', '#2ecc71'
      ]
    }]
  };

  if (window.budgetChart) window.budgetChart.destroy();
  window.budgetChart = new Chart(ctx, {
    type: 'pie',
    data: data
  });
}
