if (window.location.pathname === "/" || window.location.pathname === "/home") {
  document.querySelector("main").addEventListener("scroll", (e) => {
    if (e.target.scrollTop === 0) {
      document.querySelector("nav").classList.remove("scrolled");
    } else {
      document.querySelector("nav").classList.add("scrolled");
    }
  });
} else {
  document.querySelector("nav").classList.add("scrolled");
}

const pages = [
  {
    name: "home",
    description: "The home page",
    redirect: "/"
  },
  {
    name: "commands",
    description: "The commands page",
    redirect: "/commands"
  },
  {
    name: "leaderboards",
    description: "The best players",
    redirect: "/leaderboards"
  },
  {
    name: "terms of service",
    description: "The terms of service of Tiny games",
    redirect: "/terms-of-service"
  },
  {
    name: "pricacy policy",
    description: "The pricacy policy of Tiny games",
    redirect: "/privacy-policy"
  },
  {
    name: "status",
    description: "See the status of Tiny games",
    redirect: "/status"
  },
  {
    name: "vote",
    description: "To vote for Tiny games",
    redirect: "/vote"
  },
  {
    name: "support server",
    description: "To join the support server",
    redirect: "/support"
  },
  {
    name: "premium",
    description: "To get info about the premium version",
    redirect: "/premium"
  },
  {
    name: "invite",
    description: "To invite the bot",
    redirect: "/invite"
  }
]

fetch("https://service-7229.something.gg/api/bot")
.then((res) => res.json())
.then((data) => {
  document.getElementById("bot-icon").src = data.avatarURL;
  document.getElementById("bot-username").textContent = data.username;
});

displayServers();
function displayServers() {
  fetch("https://service-7229.something.gg/api/guilds/number")
  .then((res) => res.json())
  .then((data) => {
    for (const element of document.getElementsByClassName("server-number")) {
      element.textContent = data.value;
    }
  });
  setTimeout(() => {
    displayServers();
  }, 2000);
};

var users = []
fetch("https://service-7229.something.gg/api/users")
.then((res) => res.json())
.then((data) => {
  users = data;
});

var guilds = []
fetch("https://service-7229.something.gg/api/guilds")
.then((res) => res.json())
.then((data) => {
  guilds = data;
});

var categories = []
var commands = []
fetch("https://service-7229.something.gg/api/commands")
.then((res) => res.json())
.then((data) => {
  commands = data;

  for (const command of data) {
    if (!categories.includes(command.category)) categories.push(command.category);
  }
});

var lastTyped = Date.now();
const waitTime = 500;

function createSuggestion(title, description, iconURL, href) {
  const suggestionElement = document.createElement("a");
  const imageElement = document.createElement("img");
  const titleElement = document.createElement("p");
  const descriptionElement = document.createElement("p");

  const image = new Image();
  image.onerror = () => {
    imageElement.src = "/images/discord.png";
  };
  image.src = iconURL;

  imageElement.src = image.src;
  titleElement.textContent = title;
  descriptionElement.textContent = description;

  if (window.location.pathname === "/commands" && href.includes("/commands")) {
    suggestionElement.addEventListener("click", () => {
      window.location.href = href;
      window.location.reload();
    });
  } else {
    suggestionElement.href = href;
  }

  suggestionElement.classList.add("suggestion-container");
  imageElement.classList.add("suggestion-icon");
  titleElement.classList.add("suggestion-title");
  descriptionElement.classList.add("suggestion-description");

  suggestionElement.append(imageElement);
  suggestionElement.append(titleElement);
  suggestionElement.append(descriptionElement);

  return suggestionElement;
}

var suggestions = []

document.getElementById("phone-search-button").addEventListener("click", () => {
  const searchbar = document.getElementById("phone-nav-searchbar");

  if (searchbar.classList.contains("active")) {
    searchbar.style.animation = "slide-out .1s ease-in-out";
    setTimeout(() => {
      searchbar.classList.remove("active");
      document.getElementById("phone-search-field").value = "";
    }, 100);
  } else {
    searchbar.classList.add("active");
    searchbar.style.animation = "slide-in .1s ease-in-out";
  }
});

document.getElementById("nav-searchbar").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const suggestion = suggestions[0];
  if (!suggestion) return;
  
  if (suggestion.type === "user") {
    window.location.href = `/profile/${suggestion.ID}`;
  } else if (suggestion.type === "command") {
    window.location.href = `/commands#${suggestion.name}`;
  } else {
    window.location.href = suggestion.redirect;
  }
});

listenInput();
listenInput("phone-");

function listenInput(p = "") {
  const navInput = document.getElementById(p + "search-field");
  const navSuggestions = document.getElementById(p + "nav-suggestions");
  const suggestionProfiles = document.getElementById(p + "suggestion-profiles");
  const suggestionCommands = document.getElementById(p + "suggestion-commands");
  const suggestionPages = document.getElementById(p + "suggestion-pages");
  const suggestionGuilds = document.getElementById(p + "suggestion-guilds");
  navInput.addEventListener("input", (e) => {
    if (p === "") {
      if (navInput.value === "") {
        document.getElementById("nav-searchbar").classList.remove("typed");
      } else {
        document.getElementById("nav-searchbar").classList.add("typed");
      }
    }

    lastTyped = Date.now();
    setTimeout(() => {
      if (Date.now() - waitTime >= lastTyped) {
        if (e.target.value === "") {
          navSuggestions.style.animation = `slide-in${p === "-phone" ? "": "-translated"} .1s ease-in-out`;
          setTimeout(() => {
            navSuggestions.hidden = true;
          }, 100);
        } else {
          navSuggestions.style.animation = `slide-in${p === "-phone" ? "": "-translated"} .1s ease-in-out`;
          navSuggestions.hidden = false;
        }
  
        const filter = readable(e.target.value.toLowerCase());
        suggestionProfiles.innerHTML = "";
        suggestionCommands.innerHTML = "";
        suggestionPages.innerHTML = "";
        suggestionGuilds.innerHTML = "";
        if (filter.length > 0) {
          const filteredUsers = users.filter((e) => {
            if(!e.data?.user?.tag)return false;
            if (e.ID.startsWith(filter)) return true;
            if (readable(e.data?.user?.tag?.toLowerCase()).startsWith(filter)) return true;
            return false;
          });
          suggestionProfiles.dataset.number = filteredUsers.length;
          for (const user of filteredUsers.slice(0, 10)) {
            suggestionProfiles.append(createSuggestion(
              user.data.user.tag,
              user.ID,
              user.data.user?.avatar?.startsWith("https://")?
                user.data.user.avatar:
                `https://cdn.discordapp.com/avatars/${user.ID}/${user.data.user.avatar}.webp?size=64`,
              `/profile/${user.ID}`
            ));
          }

          const filteredPages = pages.filter((e) => {
            if (e.name.startsWith(filter)) return true;
            return false;
          });
          suggestionPages.dataset.number = filteredPages.length;
          for (const page of filteredPages.slice(0, 10)) {
            suggestionPages.append(createSuggestion(
              page.name,
              page.description,
              "/images/page.png",
              page.redirect
            ));
          }

          const filteredGuilds = guilds.filter((e) => {
            if (e.name.startsWith(filter)) return true;
            return false;
          });
          suggestionGuilds.dataset.number = filteredGuilds.length;
          for (const page of filteredGuilds.slice(0, 10)) {
            suggestionGuilds.append(createSuggestion(
              page.name,
              `${page.memberCount.toLocaleString()} members`,
              page.iconURL,
              `/server/${page.id}`
            ));
          }
  
          const toFilterCommands = [
            ...categories.map((c) => ({ name: c, type: 2, shortRules: `The ${c} category` })),
            ...commands.map((c) => ({ ...c, type: 1 }))
          ];
  
          const filteredCommands = toFilterCommands.filter((e) => {
            if (e.name.toLowerCase().startsWith(filter)) return true;
            var hasAlias = false;
            for (const alias of (e.aliases || [])) {
              if (alias.toLowerCase().startsWith(filter)) {
                hasAlias = true;
              }
            }
            return hasAlias;
          });
          suggestionCommands.dataset.number = filteredCommands.length;
          for (const command of filteredCommands.slice(0, 10)) {
            suggestionCommands.append(createSuggestion(
              command?.game?.name || command.name,
              command.shortRules,
              command.type === 1 ?
                "/images/slash.png":
                "/images/categories.png",
              `/commands#${command.name}`
            ));
          }
  
          suggestions = [
            ...filteredUsers.map((e) => ({ ...e, type: "user" })),
            ...filteredCommands.map((e) => ({ ...e, type: "command" })),
            ...filteredPages.map((e) => ({ ...e, type: "page" }))
          ]
        }
      }
    }, waitTime);
  });
};

const params = readHashParams();

if (params.access_token) {
  setCookie("token", params.access_token, Number(params.expires_in));
  window.location.href = "/";
}

const accessToken = getCookie("token");

if (accessToken) {
  fetch("https://discord.com/api/v9/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((res) => res.json())
  .then((data) => {
    fetch(`https://service-7229.something.gg/api/users`)
    .then((res) => res.json())
    .then((users) => {
      const user = users.find((u) => u.ID === data.id);
      if (!(user.data?.tags || []).includes("premium")) {
        document.getElementById("premium-button").style.display = "flex";
      }
    });

    const userAvatar = document.createElement("img");
    const userTag = document.createElement("a");
  
    userAvatar.src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.webp?size=32`;
    userAvatar.classList.add("user-avatar");

    userTag.textContent = data.username;
    userTag.href = `/profile/${data.id}`;
    userTag.classList.add("user-tag");

    userAvatar.addEventListener("click", () => {
      window.location.href = userTag.href;
    });

    document.getElementById("user-info").append(userTag);
    document.getElementById("user-info").append(userAvatar);
  });
} else {
  const login = document.createElement("a");

  login.href = "https://discord.com/oauth2/authorize?client_id=878580419736506388&redirect_uri=https%3A%2F%2Ftiny-games.fr&response_type=token&scope=identify%20email%20guilds";
  login.textContent = "Login";
  login.classList.add("login");

  document.getElementById("user-info").append(login);
}

function setCookie(n, v, s) {
  var expires = "";
  if (s) {
    var date = new Date();
    date.setTime(date.getTime() + (s * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = n + "=" + (v || "")  + expires + "; path=/";
}

function getCookie(n) {
  var nameEQ = n + "=";
  var ca = document.cookie.split(";");
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(n) {   
  document.cookie = n + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function readHashParams() {
  const d = {}
  const h = window.location.hash.slice(1);
  for (const i of h.split("&")) {
    const [n, v] = i.split("=");
    d[n] = v;
  }
  
  return d;
}

function readable(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}