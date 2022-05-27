const serverFilter = document.getElementById("server-filter");
const gameFilter = document.getElementById("game-filter");
const globalGuildFilter = document.getElementById("global-guild-filter");
const globalGameFilter = document.getElementById("global-game-filter");

const url = new URL(window.location.href);

globalGuildFilter.addEventListener("click", () => {
  url.searchParams.delete("guild");
  window.location.search = url.search;
});

globalGameFilter.addEventListener("click", () => {
  url.searchParams.delete("game");
  window.location.search = url.search;
});

if (url.searchParams.get("guild") === null) {
  globalGuildFilter.classList.add("selected");
  gameFilter.style.display= "none";
}

if (url.searchParams.get("game") === null) {
  globalGameFilter.classList.add("selected");
}

if (accessToken !== undefined) {
  fetch("https://service-7229.something.gg/api/guilds")
  .then((res) => res.json())
  .then((botGuilds) => {
    fetch("https://discord.com/api/v9/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then((res) => res.json())
    .then((userData) => {
      fetch(`https://service-7229.something.gg/api/users/${userData.id}`)
      .then((res) => res.json())
      .then((user) => {
        const servers = Object.keys(user?.servers || {});
        const guilds = botGuilds.filter((g) => servers.includes(g.id));
        
        for (const guild of guilds) {
          const guildElement = document.createElement("button");
          const guildIcon = document.createElement("img");
          const guildName = document.createElement("p");
          
          guildName.textContent = guild.name || "Unknown Guild";
          guildIcon.src = guild.iconURL;

          guildElement.addEventListener("click", () => {
            url.searchParams.set("guild", guild.id);
            window.location.search = url.search;
          });
  
          guildElement.addEventListener("mouseenter", () => {
            if (guild.iconURL.includes("/a_")) {
              guildIcon.src = guild.iconURL.replace(".png", ".gif");
            }
          });
  
          guildElement.addEventListener("mouseleave", () => {
            if (guild.iconURL.includes("/a_")) {
              guildIcon.src = guild.iconURL.replace(".gif", ".png");
            }
          });
  
          guildIcon.classList.add("leaderboard-side-item-icon");
          guildName.classList.add("leaderboard-side-item-name");
          guildElement.classList.add("leaderboard-side-item");

          if (url.searchParams.get("guild") === guild.id) {
            guildElement.classList.add("selected");
          }
  
          guildElement.append(guildIcon);
          guildElement.append(guildName);
          serverFilter.append(guildElement);
        }
      });
    });
  });
} else {
  serverFilter.style.display = "none";
}

fetch("https://service-7229.something.gg/api/commands")
.then((res) => res.json())
.then((data) => {
  const games = data.filter((c) => c.category === "games");
  
  for (const game of games) {
    const gameElement = document.createElement("button");
    const gameIcon = document.createElement("img");
    const gameName = document.createElement("p");
    
    gameName.textContent = game.name || "Unknown Game";
    gameIcon.src = `/images/icons/${game.name}.png`;

    gameElement.addEventListener("click", () => {
      url.searchParams.set("game", game.name);
      window.location.search = url.search;
    });

    gameIcon.classList.add("leaderboard-side-item-icon");
    gameName.classList.add("leaderboard-side-item-name");
    gameElement.classList.add("leaderboard-side-item");

    if (url.searchParams.get("game") === game.name) {
      gameElement.classList.add("selected");
    }

    gameElement.append(gameIcon);
    gameElement.append(gameName);
    gameFilter.append(gameElement);
  }
});

prepareLeaderboard();
async function prepareLeaderboard() {
  var guild;
  const usersRaw = await fetch(`https://service-7229.something.gg/api/users`);
  const users = await usersRaw.json();
  const userRaw = await fetch(`https://discord.com/api/v9/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const user = await userRaw.json();

  if (url.searchParams.get("guild")) {
    const guildRaw = await fetch(`https://service-7229.something.gg/api/guilds/${url.searchParams.get("guild")}`);
    guild = await guildRaw.json();
  }

  const leaderboardName = document.getElementById("leaderboard-server-name");
  const leaderboardIcon = document.getElementById("leaderboard-server-icon");
  
  const guildNameContent = guild === undefined ?
    "Global leaderboard":
    guild.name + "'s leaderboard";

  const guildIconURL = guild === undefined ? 
    "/images/all.png":
    guild.iconURL
  
  const gameNameContent = url.searchParams.get("game") === null ?
    "":
    `for the ${url.searchParams.get("game")} game`

  leaderboardName.textContent = guildNameContent + " " + gameNameContent;
  leaderboardIcon.src = guildIconURL;

  let players = users;
  if (guild) players = guild.data.players.map((p) => users.find((u) => u.ID === p));
  makeLeaderboard(players, user, guild?.id, url.searchParams.get("game"));
}

function makeLeaderboard(users, me, guildId, game) {
  if (game === null) {
    users = users.sort((a, b) => b.data.tp - a.data.tp);
  } else {
    users = users.sort((a, b) => (b.data.servers[guildId]?.[game]?.wins || 0) - (a.data.servers[guildId]?.[game]?.wins || 0));
  }
  users = users.slice(0, 50);
  users = users.map((u, i) => ({ rank: i + 1, ...u }));

  const leaderboardContent = document.getElementById("leaderboard-content");
  for (const user of users) {
    const leaderboardRank = document.createElement("p");
    const leaderboardItem = document.createElement("div");
    const leaderboardIcon = document.createElement("img");
    const leaderboardTag = document.createElement("p");
    const leaderboardUserData = document.createElement("p");
    const seeProfile = document.createElement("a");

    const avatarURL = user.data.user?.avatar?.startsWith("https://")?
      user.data?.user?.avatar:
      `https://cdn.discordapp.com/avatars/${user.ID}/${user.data.user.avatar}.webp?size=64`

    const avatarLoader = new Image();
    avatarLoader.onerror = () => {
      leaderboardIcon.src = "/images/discord.png";
    }
    avatarLoader.src = avatarURL;

    leaderboardRank.textContent = "#" + user.rank;
    leaderboardIcon.src = avatarURL;
    leaderboardTag.textContent = user.data.user?.tag || "Unknown User";
    leaderboardUserData.textContent = game === null ?
    `${(user.data.tp || 1000).toLocaleString()} Tiny Points`:
    `${(user.data.servers[guildId]?.[game]?.wins || 0).toLocaleString()} Wins`;
    seeProfile.textContent = "See profile";
    seeProfile.href = `/profile/${user.ID}`;

    leaderboardItem.classList.add("leaderboard-item");
    leaderboardRank.classList.add("leaderboard-rank");
    leaderboardIcon.classList.add("leaderboard-icon");
    leaderboardTag.classList.add("leaderboard-tag");
    leaderboardUserData.classList.add("leaderboard-user-data");
    seeProfile.classList.add("see-profile");
    if (user.rank % 2 === 0) leaderboardItem.classList.add("odd");
    if (user.ID === me.id) leaderboardItem.classList.add("me");

    leaderboardItem.append(leaderboardRank);
    leaderboardItem.append(leaderboardIcon);
    leaderboardItem.append(leaderboardTag);
    leaderboardItem.append(leaderboardUserData);
    leaderboardItem.append(seeProfile);
    leaderboardContent.append(leaderboardItem);
  }
}

document.getElementById("fold-button").addEventListener("click", () => {
  const phoneTouchField = document.getElementById("phone-touch-field");

  if (phoneTouchField.classList.contains("hidden")) {
    phoneTouchField.style.animation = "slide-translation-open .1s ease-in-out";
    phoneTouchField.classList.remove("hidden");
  } else {
    phoneTouchField.style.animation = "slide-translation-close .1s ease-in-out";
    setTimeout(() => {
      phoneTouchField.classList.add("hidden");
    }, 100);
  }
});

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