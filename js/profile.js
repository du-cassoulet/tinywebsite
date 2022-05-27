const profileHeader = document.getElementById("profile-header");
const profileImage = document.getElementById("profile-image");
const classImage = document.getElementById("class-image");
const profileTitle = document.getElementById("profile-title");
const tpNumber = document.getElementById("tp-number");
const userCreatedAt = document.getElementById("user-created-at");
const serverStatsContainer = document.getElementById("server-stats-container");
const globalServerHeader = document.getElementById("global-server-header");
const globalServerData = document.getElementById("global-server-data");
const lastTimePlayed = document.getElementById("last-time-played");

const userId = window.location.pathname.replace("/profile/", "");
var user;

fetch("https://service-7229.something.gg/api/users")
.then((res) => res.json())
.then((data) => {
  user = data.sort((a, b) => b.data.tp - a.data.tp).map((u, i) => ({ ...u, rank: i })).find((u) => u.ID == userId);
  user = { ...user.data, id: user.ID, rank: user.rank + 1 }

  const elo = user?.tp || 1400;
  const userClass = classes.find((c) => (c.range.min ? c.range.min <= elo: true) && (c.range.max ? c.range.max >= elo: true));
  
  const globalStats = getServerStats(user, "global");
  const played = globalStats.wins + globalStats.draws + globalStats.losses;
  document.getElementById("global-games-played").textContent = played + " games played • " + timeSpent(globalStats.time) + " spent playing";
  
  document.getElementById("user-xp").textContent = `${user.leveling.xp.toLocaleString()} Xp`;
  document.getElementById("user-level").textContent = `Level ${user.leveling.level.toLocaleString()}`;
  document.getElementById("level-progression").style.width = Math.round(user.leveling.xp / (user.leveling.level * 500) * 100) + "%";

  document.getElementById("user-rank").textContent = `#${user.rank} / ${data.length} players`;

  document.getElementById("token-value-donuts").textContent = (user.tokens?.donuts || 3000).toLocaleString();
  document.getElementById("token-value-hearts").textContent = (user.tokens?.hearts || 200).toLocaleString();
  document.getElementById("token-value-stars").textContent = (user.tokens?.stars || 3).toLocaleString();

  const statsContext = document.getElementById("global-stats-progression").getContext("2d");
  makeGameChart(statsContext, globalStats);

  const avatarURL = user.user.avatar?.startsWith("https://")?
    user.user.avatar:
    `https://cdn.discordapp.com/avatars/${user.id}/${user.user.avatar}.webp?size=64`
  
  const profileImageLoader = new Image();
  profileImageLoader.onerror = () => {
    profileImage.src = "/images/discord.png";
  }
  profileImageLoader.src = avatarURL;

  const classImageLoader = new Image();
  classImageLoader.onerror = () => {
    classImage.src = "/images/discord.png";
  }
  classImageLoader.src = userClass.icon;

  profileTitle.textContent = (user.user?.tag || "Unknown User") + "'s profile";
  tpNumber.textContent = elo.toLocaleString() + " TP";
  userCreatedAt.textContent = `Created the ${new Date(user.created).toDateString()}`;
  lastTimePlayed.textContent = `Last time played ${new Date(Number(user.history[user.history.length - 1].split("-")[2])).toDateString()}`
  profileImage.src = profileImageLoader.src;
  classImage.src = classImageLoader.src;

  globalServerHeader.addEventListener("click", () => unfoldGuildData("global"));

  const advencement = user.advencement.split(":").map((e) => Number(e));
  const progressionContext = document.getElementById("progression-chart").getContext("2d");
  new Chart(progressionContext, {
    type: "line",
    data: {
      labels: advencement.map((_, i) => i),
      datasets: [{
        label: "Tiny Points",
        data: advencement,
        backgroundColor: [
          JSON.parse(window.localStorage.getItem("accent_color"))?.transparent||"#2294ed99",
        ],
        borderColor: [
          JSON.parse(window.localStorage.getItem("accent_color"))?.main||"#2294ed",
        ],
        borderWidth: 1
      }]
    },
    options:{
      lineTension: .4,
      elements: {
        point: {
          radius: 1
        }
      }
    }
  });

  const mostPlayedCtx = document.getElementById("played-games-chart").getContext("2d");
  const gamesChart = makePlayedChart(mostPlayedCtx, user);

  const guildsFilter = document.getElementById("guilds-filter");
  document.getElementById("selected-guild").addEventListener("click", () => {
    if (guildsFilter.classList.contains("hidden")) {
      guildsFilter.classList.remove("hidden");
    } else {
      guildsFilter.classList.add("hidden");
    }
  });

  if (user.tags.includes("premium")) {
    const premium = document.createElement("img");
    premium.src = "/images/premium.png";
    premium.classList.add("premium-icon-profile");

    profileHeader.append(premium);
  }
  const pageName = document.createElement("meta");
  pageName.setAttribute("property", "og:title")
  pageName.setAttribute("property", `${user.user?.tag || "Unknown user"}'s profile`);

  const pageImage = document.createElement("meta");
  pageImage.setAttribute("property", "og:image")
  pageImage.setAttribute("property", avatarURL || "https://tiny-games.fr/images/tinygames.png");

  document.head.append(pageName);
  document.head.append(pageImage);

  fetch("https://service-7229.something.gg/api/guilds")
  .then((res) => res.json())
  .then((guilds) => {
    fetch("https://service-7229.something.gg/api/ingame")
    .then((res) => res.json())
    .then(({ games }) => {
      const game = games.find((g) => g.players?.includes(user.id));
      if (game) {
        const sideDetails = document.getElementById("side-details");
        const guild = guilds.find((g) => g.id == game.guildId);
        
        const gameBox = document.createElement("div");
        const gameHeader = document.createElement("div");
        const gameTitle = document.createElement("p");
        const startedAt = document.createElement("p");
        const inGuildBox = document.createElement("div");
        const inGuildTextData = document.createElement("div");
        const inGuildName = document.createElement("p");
        const inGuildIcon = document.createElement("img");
        const playerNumber = document.createElement("p");

        const playerLength = game.players?.length || 1;

        gameTitle.textContent = `Playing ${game.name.toLowerCase()}`;
        startedAt.textContent = new Date(game.start).toDateString() + " " + new Date(game.start).toLocaleTimeString();
        playerNumber.textContent = `${playerLength} player${playerLength > 1 ? "s": ""}`;
        inGuildIcon.src = guild.iconURL;
        inGuildName.textContent = `In ${guild.name}`;

        gameBox.classList.add("game-box");
        gameHeader.classList.add("game-header");
        gameTitle.classList.add("game-title");
        playerNumber.classList.add("game-player-number");
        startedAt.classList.add("game-started-at");
        inGuildIcon.classList.add("game-guild-icon");
        inGuildName.classList.add("game-guild-name");
        inGuildBox.classList.add("game-guild-box");

        gameHeader.append(gameTitle);
        gameHeader.append(startedAt);
        gameBox.append(gameHeader);
        inGuildBox.append(inGuildIcon);
        inGuildTextData.append(inGuildName);
        inGuildTextData.append(playerNumber);
        inGuildBox.append(inGuildTextData);
        gameBox.append(inGuildBox);
        sideDetails.append(gameBox);
      }
    });

    document.getElementById("guild-filter-global").addEventListener("click", () => {
      guildsFilter.classList.add("hidden");

      document.getElementById("selected-filter-icon").src = "/images/slash.png";
      document.getElementById("selected-filter-name").textContent = "Global";

      const gamesObj = {}

      for (const server of Object.values(user.servers)) {
        for (const game of Object.entries(server)) {
          const [name, { ...data }] = game;
          if (!gamesObj[name]) {
            gamesObj[name] = data;
          } else {
            gamesObj[name].wins += data.wins;
            gamesObj[name].losses += data.losses;
            gamesObj[name].draws += data.draws;
          }
        }
      }
    
      const games = Object.entries(gamesObj).map((g) => ({ name: g[0], played: (g[1].wins || 0) + (g[1].losses || 0) + (g[1].draws || 0) })).sort((a, b) => b.played - a.played);

      gamesChart.data.datasets[0].data = games.map((g) => g.played);
      gamesChart.data.labels = games.map((g) => g.name);

      gamesChart.update();
    });
    
    for (const guildId of Object.keys(user.servers)) {
      const guild = guilds.find((g) => g.id == guildId);

      const filterGuildBox = document.createElement("button")
      const filterGuildIcon = document.createElement("img");
      const filterGuildName = document.createElement("p");

      filterGuildBox.addEventListener("click", () => {
        guildsFilter.classList.add("hidden");

        const selectedGuildFilterIconLoader = new Image();
        selectedGuildFilterIconLoader.onerror = () => {
          document.getElementById("selected-filter-icon").src = "/images/discord.png";
        }
        selectedGuildFilterIconLoader.src = guild.iconURL;

        document.getElementById("selected-filter-icon").src = guild.iconURL;
        document.getElementById("selected-filter-name").textContent = guild.name.length > 14 ? guild.name.slice(0, 12) + "...": guild.name;

        const games = Object.entries(user.servers[guildId]).map((g) => ({ name: g[0], played: (g[1].wins || 0) + (g[1].losses || 0) + (g[1].draws || 0) })).sort((a, b) => b.played - a.played);

        gamesChart.data.labels = games.map((g) => g.name);
        gamesChart.data.datasets[0].data = games.map((g) => g.played);
        gamesChart.update();  
      });

      const guildFilterIconLoader = new Image();
      guildFilterIconLoader.onerror = () => {
        filterGuildIcon.src = "/images/discord.png";
      }
      guildFilterIconLoader.src = guild.iconURL;

      filterGuildIcon.src = guild.iconURL;
      filterGuildName.textContent = guild.name.length > 14 ? guild.name.slice(0, 12) + "...": guild.name;

      filterGuildBox.classList.add("guild-filter");
      filterGuildIcon.classList.add("guild-filter-icon");
      filterGuildName.classList.add("guild-filter-name");

      filterGuildBox.append(filterGuildIcon);
      filterGuildBox.append(filterGuildName);

      document.getElementById("guild-filter-container").append(filterGuildBox);
      const serverItem = document.createElement("div");
      const serverHeader = document.createElement("button");
      const guildIcon = document.createElement("img");
      const guildName = document.createElement("p");
      const guildCarret = document.createElement("i"); 
      const serverContent = document.createElement("div");
      const gamesPlayed = document.createElement("p");
      const statsProgressions = document.createElement("canvas");

      const guildIconLoader = new Image();
      guildIconLoader.onerror = () => {
        guildIcon.src = "/images/discord.png";
      }
      guildIconLoader.src = guild.iconURL;

      const guildStats = getServerStats(user, guildId);
      const played = guildStats.wins + guildStats.draws + guildStats.losses;

      serverItem.id = `${guild.id}-server-item`;
      guildIcon.src = guildIconLoader.src;
      guildName.textContent = guild.name;
      gamesPlayed.textContent = played + " games played • " + timeSpent(guildStats.time) + " spent playing";

      serverHeader.addEventListener("click", () => unfoldGuildData(guild.id));

      const ctx = statsProgressions.getContext("2d");
      makeGameChart(ctx, guildStats);

      gamesPlayed.classList.add("games-played");
      serverContent.classList.add("server-content");
      serverItem.classList.add("server-item");
      serverHeader.classList.add("server-header");
      guildIcon.classList.add("server-icon");
      guildName.classList.add("server-title");
      guildCarret.classList.add("fas");
      guildCarret.classList.add("fa-caret-down");
      statsProgressions.classList.add("stats-progressions");

      serverHeader.append(guildIcon);
      serverHeader.append(guildName);
      serverHeader.append(guildCarret);
      serverContent.append(gamesPlayed);
      serverContent.append(statsProgressions);
      serverItem.append(serverHeader);
      serverItem.append(serverContent);
      serverStatsContainer.append(serverItem);
    }
  });
});

function unfoldGuildData(guildId) {
  const guildItem = document.getElementById(`${guildId}-server-item`);
  
  if (guildItem.classList.contains("open")) {
    guildItem.classList.remove("open");
  } else {
    guildItem.classList.add("open");
  } 
  
  for (const node of serverStatsContainer.children) {
    if (node != guildItem) node.classList.remove("open");
  }
}

function readSearchParams() {
  const d = {}
  const h = window.location.search.slice(1);
  for (const i of h.split("&")) {
    const [n, v] = i.split("=");
    d[n] = v;
  }
  
  return d;
}

function getGames(s) {
  const g = []
  for (const sg of Object.values(s)) {
    for (const game of Object.keys(sg)) {
      if (!g.includes(game)) g.push(game);
    }
  }
  return g;
}

function getServerStats(u, serverId) {
  if (serverId == "global") {
    return u.stats;
  } else {
    const stats = {
      wins: 0,
      draws: 0,
      losses: 0,
      time: 0
    }
    for (const game of Object.values(u.servers[serverId])) {
      stats.wins += (game.wins || 0);
      stats.draws += (game.draws || 0);
      stats.losses += (game.losses || 0);
      stats.time += (game.time || 0);
    }
    return stats;
  }
}

function makeGameChart(ctx, stats) {
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Wins", "Draws", "Losses"],
      datasets: [{
        label: "Game stats",
        data: [stats.wins, stats.draws, stats.losses],
        backgroundColor: [
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(255, 99, 132, 0.2)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function makePlayedChart(ctx, user) {
  const gamesObj = {};

  for (const server of Object.values(user.servers)) {
    for (const game of Object.entries(server)) {
      const [name, { ...data }] = game;
      if (!gamesObj[name]) {
        gamesObj[name] = data;
      } else {
        gamesObj[name].wins += data.wins;
        gamesObj[name].losses += data.losses;
        gamesObj[name].draws += data.draws;
        gamesObj[name].time += data.time;
        gamesObj[name].winstreak += data.winstreak;
      }
    }
  }

  const games = Object.entries(gamesObj).map((g) => ({ name: g[0], played: (g[1].wins || 0) + (g[1].losses || 0) + (g[1].draws || 0), color: { h: Math.floor(Math.random() * 360), l: Math.floor(Math.random() * 2) * 10 + 75 } })).sort((a, b) => b.played - a.played);

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: games.map((g) => g.name),
      datasets: [{
        label: "Games played",
        data: games.map((e) => e.played),
        backgroundColor: games.map((g) => `hsla(${g.color.h}, 100%, ${g.color.l}%, .2)`),
        borderColor: games.map((g) => `hsla(${g.color.h}, 100%, ${g.color.l}%, 1)`),
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}