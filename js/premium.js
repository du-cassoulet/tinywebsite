fetch("https://service-7229.something.gg/api/available")
.then((res) => {
  if (res.status !== 200) {
    window.location.href = "/";
  }
});

window.addEventListener("load", () => {
  const plansComparison = document.getElementById("plans-comparison");
  
  for (let i in plans.data.original) {
    i = Number(i);

    const planContainer = document.createElement("div");
    const plansTitle = document.createElement("p");
    const planFree = document.createElement("div");
    const planPremium = document.createElement("div");

    function crossMark() {
      const e = document.createElement("i");
      e.classList.add("fas");
      e.classList.add("fa-times");
      return e;
    }
    function checkMark() {
      const e = document.createElement("i");
      e.classList.add("fas");
      e.classList.add("fa-check");
      return e;
    }

    plansTitle.textContent = plans.data.original[i].name;
    
    if (plans.data.original[i].value === 0) {
      planFree.append(crossMark());
    } else {
      planFree.append(checkMark());
    }

    if (plans.data.premium[i].value === 0) {
      planPremium.append(crossMark());
    } else {
      planPremium.append(checkMark());
    }

    plansTitle.classList.add("plan-description");
    planFree.classList.add("plan-status");
    planPremium.classList.add("plan-status");
    planContainer.classList.add("plan-details");

    planContainer.append(plansTitle);
    planContainer.append(planFree);
    planContainer.append(planPremium);
    plansComparison.append(planContainer);
  }
});