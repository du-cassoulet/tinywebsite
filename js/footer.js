const accentColors = {
  blue: {
    main: "#2294ed",
    hover: "#2484d0",
    transparent: "#2294ed99"
  },
  red: {
    main: "#ed2255",
    hover: "#c61743",
    transparent: "#ed225599"
  },
  green: {
    main: "#2bba50",
    hover: "#22a745",
    transparent: "#2bba5099"
  },
  purple: {
    main: "#8430db",
    hover: "#7225c1",
    transparent: "#8430db99"
  },
  orange: {
    main: "#db6530",
    hover: "#c35625",
    transparent: "#db653099"
  }
}

let accentColor = window.localStorage.getItem("accent_color");
if (accentColor) {
  accentColor = JSON.parse(accentColor);

  document.documentElement.style.setProperty("--accent-color", accentColor.main);
  document.documentElement.style.setProperty("--accent-color-hover", accentColor.hover);
  document.documentElement.style.setProperty("--accent-color-transparent", accentColor.transparent);
}

window.addEventListener("load", () => {
  fetch("https://service-7229.something.gg/api/bot")
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("bot-avatar-footer").src = data.avatarURL;
    document.getElementById("bot-name-footer").textContent = data.username;
  });

  const themePicker = document.getElementById("theme-picker");

  for (const color of Object.values(accentColors)) {
    const colorTheme = document.createElement("button");

    colorTheme.style.background = color.main;
    colorTheme.classList.add("color-theme");

    colorTheme.addEventListener("click", () => {
      window.localStorage.setItem("accent_color", JSON.stringify(color));
      window.location.reload();
    });

    themePicker.append(colorTheme);
  }
});