document.getElementById("add-bot").addEventListener("click", () => {
  window.open("https://discord.com/oauth2/authorize?client_id=878580419736506388&permissions=34360126657&redirect_uri=https%3A%2F%2Ftiny-games.fr%2Fapi%2Fautoclose&response_type=token&scope=guilds%20identify%20bot%20applications.commands","Add tiny games","height=840px,width=500px;");
});

document.getElementById("see-commands").addEventListener("click", () => {
  window.location.href = "/commands";
});

const guildBlacklist = [ "954593716314705920" ]

const serversContainer = document.getElementById("first-servers-container");
const usersContainer = document.getElementById("first-users-container");

fetch("https://service-7229.something.gg/api/guilds")
.then((res) => res.json())
.then((data) => {
  data = data.filter((g) => !guildBlacklist.includes(g.id)).sort((a, b) => b.memberCount - a.memberCount);

  for (const guild of data.slice(0, 10)) {
    const guildContainer = document.createElement("a");
    const guildName = document.createElement("p");
    const guildIcon = document.createElement("img");
    const guildMemberCount = document.createElement("p");

    const iconLoader = new Image();
    iconLoader.onerror = () => {
      guildIcon.src = "/images/discord.png";
    }
    iconLoader.src = guild.iconURL;

    guildContainer.href = `/server/${guild.id}`;
    guildName.textContent = guild.name;
    guildIcon.src = guild.iconURL;
    guildMemberCount.textContent = guild.memberCount.toLocaleString() + " members";

    guildContainer.classList.add("guild-container");
    guildName.classList.add("guild-name");
    guildIcon.classList.add("guild-icon");
    guildMemberCount.classList.add("guild-member-count");

    guildContainer.append(guildIcon);
    guildContainer.append(guildName);
    guildContainer.append(guildMemberCount);
    serversContainer.append(guildContainer);
  }
});

fetch("https://service-7229.something.gg/api/users")
.then((res) => res.json())
.then((data) => {
  data = data.sort((a, b) => b.data.tp - a.data.tp);

  for (const user of data.slice(0, 10)) {
    const userContainer = document.createElement("a");
    const userName = document.createElement("p");
    const userAvatar = document.createElement("img");
    const userTpCount = document.createElement("p");

    const avatarURL = user.data.user.avatar?.startsWith("https://")?
      user.data.user.avatar:
      `https://cdn.discordapp.com/avatars/${user.ID}/${user.data.user.avatar}.webp?size=64`

    const profileImageLoader = new Image();
    profileImageLoader.onerror = () => {
      userAvatar.src = "/images/discord.png";
    }
    profileImageLoader.src = avatarURL;

    userContainer.href = `/profile/${user.ID}`;
    userName.textContent = user.data.user.tag.split("#")[0];
    userAvatar.src = avatarURL;
    userTpCount.textContent = user.data.tp.toLocaleString() + " Tiny Points";

    userContainer.classList.add("user-container");
    userName.classList.add("username");
    userAvatar.classList.add("user-icon");
    userTpCount.classList.add("user-tp-count");

    userContainer.append(userAvatar);
    userContainer.append(userName);
    userContainer.append(userTpCount);
    usersContainer.append(userContainer);
  }
});

refreshValues();
function refreshValues(i = 0) {
  fetch("https://service-7229.something.gg/api/commands/number")
  .then((res) => res.json())
  .then(({ value: commands }) => {
    fetch("https://service-7229.something.gg/api/chats")
    .then((res) => res.json())
    .then(({ value: chats }) => {
      document.getElementById("commands-number").textContent = (commands + chats).toLocaleString();
    });
  });

  if (i % 5 === 0) {
    fetch("https://service-7229.something.gg/api/votes")
    .then((res) => res.json())
    .then(({ total }) => {
      document.getElementById("votes-number").textContent = total.toLocaleString();
    });
  }

  fetch("https://service-7229.something.gg/api/guilds/number")
  .then((res) => res.json())
  .then(({ value }) => {
    document.getElementById("servers-number").textContent = value.toLocaleString();
  });
  
  setTimeout(() => refreshValues(i + 1), 2000);
}