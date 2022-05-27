const guildId = window.location.pathname.replace("/server/", "");

fetch(`https://service-7229.something.gg/api/guilds/${guildId}`)
.then((res) => res.json())
.then((guild) => {
  const serverIcon = document.getElementById("server-icon-image");
  
  const iconLoader = new Image();
  iconLoader.onerror = () => {
    serverIcon.src = "/images/discord.png";
  }
  iconLoader.src = guild.iconURL;

  serverIcon.src = iconLoader;
  document.getElementById("guild-title").textContent = guild.name;
  document.getElementById("server-players").textContent = `${guild.data.players.length || 0} players`;

  let lang = guild.data.language;
  if (lang === "en") lang = "us";

  if (lang !== undefined) {
    document.getElementById("guild-language-icon").src = `https://flagcdn.com/w2560/${lang}.png`;
  }

  fetch(`https://service-7229.something.gg/api/ingame`)
  .then((res) => res.json())
  .then(({ games }) => {
    document.getElementById("current-games").textContent = `${games.filter((g) => g.guildId === guildId).length} games in this server`;
  });

  fetch("https://service-7229.something.gg/api/users")
  .then((res) => res.json())
  .then((users) => {
    var players = (guild.data.players || []).map((p) => users.find((u) => u.ID === p));
    players = players.sort((a, b) => b.data.tp - a.data.tp);
    players = players.map((p, i) => ({ ...p, rank: i + 1 }));

    for (const user of players.slice(0, 10)) {
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
      leaderboardUserData.textContent = `${(user.data.tp || 1000).toLocaleString()} Tiny Points`;
      seeProfile.textContent = "See profile";
      seeProfile.href = `/profile/${user.ID}`;
      leaderboardItem.id = `${user.ID}-leaderboard-item`;
      
      leaderboardItem.classList.add("leaderboard-item");
      leaderboardRank.classList.add("leaderboard-rank");
      leaderboardIcon.classList.add("leaderboard-icon");
      leaderboardTag.classList.add("leaderboard-tag");
      leaderboardUserData.classList.add("leaderboard-user-data");
      seeProfile.classList.add("see-profile");
      if (user.rank % 2 === 0) leaderboardItem.classList.add("odd");
  
      leaderboardItem.append(leaderboardRank);
      leaderboardItem.append(leaderboardIcon);
      leaderboardItem.append(leaderboardTag);
      leaderboardItem.append(leaderboardUserData);
      leaderboardItem.append(seeProfile);
      document.getElementById("leaderboard-content").append(leaderboardItem);
    }

    if (accessToken) {
      fetch("https://discord.com/api/v9/users/@me", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then((res) => res.json())
      .then((data) => {
        if (players.find((p) => p.ID === data.id)) {
          document.getElementById(`${data.id}-leaderboard-item`).classList.add("me");
        }
      });
    }
  });
});