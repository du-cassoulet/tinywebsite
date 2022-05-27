fetch("https://service-7229.something.gg/api/commands")
.then((res) => res.json())
.then((data) => {
  const categories = {}

  for (const command of data) {
    if (!categories[command.category]) categories[command.category] = [command];
    else categories[command.category].push(command);
  }

  for (const category of Object.keys(categories)) {
    const button = document.createElement("a");

    button.classList.add("category-button");
    button.href = `#${category}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      document.querySelector("main.page-content").scroll({
        behavior: "smooth",
        left: 0,
        top: document.getElementById(`category-${category}`).offsetTop - 50
      });
    });

    document.getElementById("category-selector").append(button);
  }

  for (const category of Object.entries(categories).map((e) => ({ name: e[0], commands: e[1] }))) {
    const categoryContainer = document.createElement("div");
    const categoryTitle = document.createElement("p");
    const commandsContainer = document.createElement("div");

    categoryTitle.textContent = `${category.name} - ${category.commands.length || 0} commands`;
    categoryContainer.id = `category-${category.name}`;

    categoryContainer.classList.add("category-container");
    categoryTitle.classList.add("category-title");
    commandsContainer.classList.add("commands-container");
    commandsContainer.classList.add("box-item");

    for (const command of category.commands) {
      const commandContainer = document.createElement("div");
      const commandHeader = document.createElement("button");
      const commandIcon = document.createElement("img");
      const commandName = document.createElement("p");
      const commandAliases = document.createElement("p");
      const commandCarret = document.createElement("i");
      const commandContent = document.createElement("div");
      const commandDescription = document.createElement("p");
      const commandUsages = document.createElement("p");
      const commandExemples = document.createElement("p");
      const commandUsage = document.createElement("p");
      const commandCooldown = document.createElement("p");

      commandContainer.id = `command-${command.name}`;

      commandIcon.src = "/images/slash.png";
      commandName.textContent = command.name;
      commandDescription.textContent = command.description || "No description";
      commandUsages.textContent = `Used ${(command.usages || 0).toLocaleString()} times`;
      commandExemples.innerHTML = command.exemples;
      commandUsage.textContent = "," + command.usage;
      commandCooldown.textContent = `${timeSpent(command.cooldown)} cooldown`;
      commandAliases.textContent = (command.aliases || []).join(", ");

      commandContainer.classList.add("command-container");
      commandHeader.classList.add("command-header");
      commandName.classList.add("command-name");
      commandIcon.classList.add("command-icon");
      commandAliases.classList.add("command-aliases");
      commandCarret.classList.add("fas");
      commandCarret.classList.add("fa-caret-down");
      commandContent.classList.add("command-content");
      commandDescription.classList.add("command-description");
      commandUsages.classList.add("command-usages");
      commandExemples.classList.add("command-exemples");
      commandUsage.classList.add("command-usage");
      commandCooldown.classList.add("command-cooldown");

      commandHeader.addEventListener("click", () => {
        if (commandContainer.classList.contains("open")) {
          commandContainer.classList.remove("open");
        } else {
          commandContainer.classList.add("open");
        }
      });

      commandHeader.append(commandIcon);
      commandHeader.append(commandName);
      commandHeader.append(commandAliases);
      commandHeader.append(commandCarret);
      commandContent.append(commandDescription);
      commandContent.append(commandExemples);
      commandContent.append(commandUsage);
      commandContent.append(commandCooldown);
      commandContent.append(commandUsages);
      commandContainer.append(commandHeader);
      commandContainer.append(commandContent);
      commandsContainer.append(commandContainer);
    }

    categoryContainer.append(categoryTitle);
    categoryContainer.append(commandsContainer);

    document.getElementById("commands-list").append(categoryContainer);
  }

  if (Object.keys(categories).includes(window.location.hash.slice(1))) {
    document.querySelector("main.page-content").scroll({
      behavior: "smooth",
      left: 0,
      top: document.getElementById(`category-${window.location.hash.slice(1)}`).offsetTop - 50
    });
  } else if (data.find((c) => c.name == window.location.hash.slice(1))) {
    document.querySelector("main.page-content").scroll({
      behavior: "smooth",
      left: 0,
      top: document.getElementById(`command-${window.location.hash.slice(1)}`).offsetTop - 200
    });
    setTimeout(() => {
      document.getElementById(`command-${window.location.hash.slice(1)}`).classList.add("open");
    }, 700);
  }
});