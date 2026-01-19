document.addEventListener("DOMContentLoaded", () => {

  // ============================
  // ELEMENTI DOM
  // ============================
  const toggle = document.getElementById("terminal-toggle");
  const overlay = document.getElementById("terminal-overlay");
  const output = document.getElementById("terminal-output");
  const input = document.getElementById("terminal-input");

  let isOpen = false;

  // ============================
  // FUNZIONI OPEN / CLOSE
  // ============================
  function openTerminal() {
    overlay.style.display = "flex";
    input.focus();
    if (output.innerHTML === "") boot();
    isOpen = true;
  }

  function closeTerminal() {
    overlay.style.display = "none";
    isOpen = false;
  }

  toggle.addEventListener("click", () => {
    isOpen ? closeTerminal() : openTerminal();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && isOpen) closeTerminal();
  });

  // ============================
  // PRINT FUNZIONE
  // ============================
  function printLine(username = "", commandOrOutput = "", type = "output") {
    let line = document.createElement("div");

    if(type === "username") {
      line.innerHTML = `<span class="terminal-username">${username}</span> <span class="terminal-command">${commandOrOutput}</span>`;
    } else {
      line.textContent = commandOrOutput;
    }

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  // ============================
  // BOOT TERMINALE
  // ============================
  function boot() {
    printLine("", "UNIX System V", "output");
    printLine("", "Copyright (c) 1983", "output");
    printLine("", "Type 'help' for commands.\n", "output");
  }

  // ============================
  // ESECUZIONE COMANDI
  // ============================
  function executeCommand(cmd) {
    switch(cmd) {

      case "help":
        printLine("", "Available commands:", "output");
        printLine("", "help", "output");
        printLine("", "whoami", "output");
        printLine("", "skills", "output");
        printLine("", "clear", "output");
        printLine("", "exit", "output");
        break;

      case "whoami":
        printLine("", "Cyber Security Specialist", "output");
        break;

      case "skills":
        printLine("", "- Network & Web Pentesting", "output");
        printLine("", "- Incident Response", "output");
        printLine("", "- Threat Analysis", "output");
        printLine("", "- Linux / Python", "output");
        break;

      case "clear":
        output.innerHTML = "";
        break;

      case "exit":
        closeTerminal();
        break;

      case "":
        break;

      default:
        printLine("", "Command not found.", "output");
    }
  }

  // ============================
  // INPUT HANDLER
  // ============================
  input.addEventListener("keydown", e => {
    if(e.key === "Enter") {
      const cmd = input.value.trim();

      // mostra username + comando
      printLine("guest@system:~$", cmd, "username");

      // esegui comando
      executeCommand(cmd);

      // pulisci input
      input.value = "";
    }
  });

});
