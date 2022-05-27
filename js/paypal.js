let selectedPlan = plans.all[0];

document.getElementById("monthly-button").addEventListener("click", () => {
  if (!accessToken) {
    window.location.href = "https://discord.com/oauth2/authorize?client_id=878580419736506388&redirect_uri=https%3A%2F%2Ftiny-games.fr&response_type=token&scope=identify%20email%20guilds";
  } else {
    displayPopup(plans.all[0]);
  }
});

document.getElementById("yearly-button").addEventListener("click", () => {
  if (!accessToken) {
    window.location.href = "https://discord.com/oauth2/authorize?client_id=878580419736506388&redirect_uri=https%3A%2F%2Ftiny-games.fr&response_type=token&scope=identify%20email%20guilds";
  } else {
    displayPopup(plans.all[1]);
  }
});

document.getElementById("lifetime-button").addEventListener("click", () => {
  if (!accessToken) {
    window.location.href = "https://discord.com/oauth2/authorize?client_id=878580419736506388&redirect_uri=https%3A%2F%2Ftiny-games.fr&response_type=token&scope=identify%20email%20guilds";
  } else {
    displayPopup(plans.all[2]);
  };
});

function displayPopup(plan) {
  selectedPlan = plan;
  document.getElementById("payment-popup").style.animation = "slide-in-xtranslated .1s ease-in-out";
  document.getElementById("payment-popup").hidden = false;
  document.getElementById("item-title").textContent = plan.data.description;
  document.getElementById("item-price").textContent = plan.data.amount.value;

  document.getElementById("item-adventages").innerHTML = "";

  for (let i in plans.data.original) {
    i = Number(i);

    if (plans.data.original[i].value === plans.data.premium[i].value) continue;

    const adventage = document.createElement("div");
    const adventageName = document.createElement("p");
    const adventageValue = document.createElement("i");

    adventageName.textContent = plans.data.original[i].name;

    adventageValue.classList.add("fas");
    adventageValue.classList.add("fa-check");
    adventageName.classList.add("adventage-name");
    adventage.classList.add("adventage");

    adventage.append(adventageName);
    adventage.append(adventageValue);
    document.getElementById("item-adventages").append(adventage);
  }
}

document.addEventListener("click", (e) => {
  if (!document.getElementById("payment-popup").hidden && !e.path.find((i) => [ "payment-popup", "monthly-button", "yearly-button", "lifetime-button" ].includes(i.id))) {
    document.getElementById("payment-popup").style.animation = "slide-out-xtranslated .1s ease-in-out";
    setTimeout(() => {
      document.getElementById("payment-popup").hidden = true;
    }, 100);
  }
});

function initPayPalButton() {
  paypal.Buttons({
    style: {
      shape: "rect",
      color: "gold",
      layout: "vertical",
      label: "buynow",
      tagline: false
    },

    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [ selectedPlan.data ]
      });
    },

    onApprove: function(data, actions) {
      return actions.order.capture().then(function(orderData) {
        fetch("https://discord.com/api/v9/users/@me", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        .then((res) => res.json())
        .then((data) => {
          fetch("https://service-7229.something.gg/api/send-payment", {
            method: "POST",
            body: JSON.stringify({ ...selectedPlan, orderData, userId: data.id })
          })
          .then((res) => {
            if (res.status === 200) {
              window.location.href = "/premium/success";
            }
          })
        });
      });
    },

    onError: function(err) {
      console.log(err);
    }
  }).render("#paypal-button-container");
}
initPayPalButton();