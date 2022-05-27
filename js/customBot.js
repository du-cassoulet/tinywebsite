const customBotAvatar = document.getElementById("custom-bot-avatar");
const customBotUsername = document.getElementById("custom-bot-username");
if (!accessToken) window.location.href = "/";

fetch("https://discord.com/api/v9/users/@me", {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})
.then((res) => res.json())
.then((user) => {
  fetch(`http://localhost:2000/api/custom-bot/get/${user.id}`)
  .then((res) => res.json())
  .then((bot) => {
    customBotAvatar.src = bot.avatar ?
    `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.webp?size=1024`:
    "/images/discord.png"

    const img = new Image();
    img.src = customBotAvatar.src;
    img.onerror = () => {
      customBotAvatar.src = "/images/discord.png"
    }

    customBotUsername.textContent = bot.username;

    const startBot = document.getElementById("start-bot");
    const stopBot = document.getElementById("stop-bot");

    startBot.disabled = bot.started;
    stopBot.disabled = !bot.started;

    startBot.addEventListener("click", () => {
      fetch("http://localhost:2000/api/custom-bot/start", {
        body: JSON.stringify({ accessToken }),
        method: "POST"
      })
      .then((res) => {
        if (res.status === 200) {
          startBot.disabled = !startBot.disabled;
          stopBot.disabled = !stopBot.disabled;
        }
      });
    });

    stopBot.addEventListener("click", () => {
      fetch("http://localhost:2000/api/custom-bot/stop", {
        body: JSON.stringify({ accessToken }),
        method: "POST"
      })
      .then((res) => {
        if (res.status === 200) {
          startBot.disabled = !startBot.disabled;
          stopBot.disabled = !stopBot.disabled;
        }
      });
    });

    const tokenField = document.getElementById("token-field");

    document.getElementById("submit-token").addEventListener("click", () => {
      fetch("https://discord.com/api/v9/users/@me", {
        headers: {
          Authorization: `Bot ${tokenField.value}`
        }
      })
      .then((res) => {
        if (res.status === 200) {
          fetch("http://localhost:2000/api/custom-bot/edit", {
            body: JSON.stringify({ accessToken, token: tokenField.value }),
            method: "POST"
          })
          .then(() => {
            window.location.reload();
          });
        }
      });
    });
  });
});