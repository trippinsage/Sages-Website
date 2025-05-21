(function() {
  // DOM Elements
  const elements = {
    downloadDataBtn: document.getElementById("download-data"),
    uploadDataInput: document.getElementById("upload-data"),
    uploadDataBtn: document.getElementById("upload-data-btn"),
    vivariumNameInput: document.getElementById("vivarium-name"),
    vivariumTypeSelect: document.getElementById("vivarium-type"),
    vivariumSizeInput: document.getElementById("vivarium-size"),
    addVivariumBtn: document.getElementById("add-vivarium-btn"),
    vivariumList: document.getElementById("vivarium-list"),
    dynamicTabBar: document.getElementById("dynamic-tab-bar"),
    dynamicTabContent: document.getElementById("dynamic-tab-content"),
    dataMenuBtn: document.getElementById("data-menu-btn"),
    dataMenu: document.getElementById("data-menu"),
    searchVivariumInput: document.getElementById("search-vivarium"),
    notificationDiv: document.getElementById("notification"),
    themeToggleBtn: document.getElementById("theme-toggle"),
    settingsBtn: document.getElementById("settings-btn"),
    helpBtn: document.getElementById("help-btn")
  };

  // Check for null DOM elements
  Object.keys(elements).forEach(key => {
    if (!elements[key]) {
      console.warn(`Element with ID "${key}" not found in the DOM`);
    }
  });

  // Data Management
  const getData = () => {
    try {
      let data = localStorage.getItem("vivarium_data");
      if (data) {
        data = JSON.parse(data);
        if (data.aquariums && !data.vivariums) {
          data.vivariums = data.aquariums;
          delete data.aquariums;
          setData(data);
        }
      } else {
        data = { vivariums: [], settings: {} };
      }
      return data;
    } catch (e) {
      console.error("Error parsing localStorage data:", e);
      return { vivariums: [], settings: {} };
    }
  };

  const setData = (data) => {
    try {
      if (!validateVivariumData(data)) {
        throw new Error("Invalid vivarium data structure");
      }
      localStorage.setItem("vivarium_data", JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Error saving data to localStorage:", e);
      return false;
    }
  };

  const validateVivariumData = (data) => {
    if (!data || typeof data !== "object" || !Array.isArray(data.vivariums)) {
      return false;
    }
    return data.vivariums.every(v =>
      v.id &&
      typeof v.name === "string" &&
      v.name.length > 0 &&
      (v.type === undefined || typeof v.type === "string") &&
      (v.size === undefined || (typeof v.size === "number" && v.size >= 0)) &&
      Array.isArray(v.species) &&
      v.species.every(s => s.name && typeof s.quantity === "number" && s.quantity >= 0) &&
      (v.notes === undefined || typeof v.notes === "string") &&
      (v.logs === undefined || (Array.isArray(v.logs) && v.logs.every(l => l.timestamp && l.text)))
    );
  };

  const sanitizeInput = (input) => {
    return typeof input === "string" ? input.trim().replace(/[<>&"]/g, "") : "";
  };

  // Notification System
  const showNotification = (message, type = "info") => {
    if (!elements.notificationDiv) return;
    elements.notificationDiv.textContent = message;
    elements.notificationDiv.className = `notification ${type}`;
    elements.notificationDiv.classList.remove("hidden");
    setTimeout(() => {
      elements.notificationDiv.classList.add("hidden");
    }, 3000);
  };

  // Menu Management
  const createMenu = (target, options, className = "custom-menu") => {
    const existingMenu = document.querySelector(`.${className}`);
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement("div");
    menu.className = className;
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt.label;
      btn.className = "menu-item";
      btn.addEventListener("click", () => {
        opt.action();
        menu.remove();
      });
      menu.appendChild(btn);
    });

    const rect = target.getBoundingClientRect();
    const menuHeight = options.length * 40;
    const topPosition = rect.bottom + window.scrollY;
    const leftPosition = Math.min(rect.left, window.innerWidth - 150);

    if (topPosition + menuHeight > window.innerHeight + window.scrollY) {
      menu.style.top = `${rect.top + window.scrollY - menuHeight}px`;
    } else {
      menu.style.top = `${topPosition}px`;
    }
    menu.style.left = `${leftPosition}px`;

    document.body.appendChild(menu);

    const closeHandler = (e) => {
      if (!menu.contains(e.target) && e.target !== target) {
        menu.remove();
      }
      document.removeEventListener("click", closeHandler);
      document.removeEventListener("scroll", closeHandler);
      document.removeEventListener("touchstart", closeHandler);
    };

    setTimeout(() => {
      document.addEventListener("click", closeHandler);
      document.addEventListener("scroll", closeHandler);
      document.addEventListener("touchstart", closeHandler);
    }, 0);

    return menu;
  };

  // Theme Management
  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      if (elements.themeToggleBtn) {
        elements.themeToggleBtn.textContent = "☀️";
      }
    }
  };

  const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.textContent = isDarkMode ? "☀️" : "🌙";
    }
  };

  // Initialization
  const initApp = () => {
    if (!elements.vivariumList || !elements.dataMenu || !elements.uploadDataBtn || !elements.downloadDataBtn) {
      console.error("Required DOM elements missing. Cannot initialize app.");
      return;
    }
    elements.dataMenu.classList.add("hidden");
    elements.uploadDataBtn.classList.remove("hidden");
    elements.downloadDataBtn.classList.remove("hidden");
    loadVivariumList();
    initTheme();
  };

  // Navigation
  if (elements.dataMenuBtn && elements.dataMenu) {
    elements.dataMenuBtn.addEventListener("click", () => {
      elements.dataMenu.classList.toggle("hidden");
    });
  }

  if (elements.downloadDataBtn) {
    elements.downloadDataBtn.addEventListener("click", () => {
      const data = getData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vivarium_data_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      elements.dataMenu.classList.add("hidden");
    });
  }

  if (elements.uploadDataBtn && elements.uploadDataInput) {
    elements.uploadDataBtn.addEventListener("click", () => {
      elements.uploadDataInput.click();
      elements.dataMenu.classList.add("hidden");
    });
  }

  if (elements.uploadDataInput) {
    elements.uploadDataInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file || file.type !== "application/json") {
        showNotification("Please upload a valid JSON file", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (!validateVivariumData(data)) {
            throw new Error("Invalid data structure");
          }
          if (setData(data)) {
            showNotification("Data uploaded successfully", "success");
            location.reload();
          } else {
            showNotification("Failed to save uploaded data", "error");
          }
        } catch (err) {
          showNotification(`Upload error: ${err.message}`, "error");
        }
      };
      reader.onerror = () => showNotification("Error reading file", "error");
      reader.readAsText(file);
      e.target.value = "";
    });
  }

  if (elements.settingsBtn) {
    elements.settingsBtn.addEventListener("click", () => {
      showNotification("Settings functionality coming soon!", "info");
      elements.dataMenu.classList.add("hidden");
    });
  }

  if (elements.helpBtn) {
    elements.helpBtn.addEventListener("click", () => {
      window.open("help.html", "_blank");
      elements.dataMenu.classList.add("hidden");
    });
  }

  // Vivarium Management
  const loadVivariumList = (query = "") => {
    if (!elements.vivariumList) return;
    elements.vivariumList.innerHTML = "";
    const data = getData();
    const filteredVivariums = data.vivariums.filter(v => v.name.toLowerCase().includes(query.toLowerCase()));
    filteredVivariums.sort((a, b) => a.name.localeCompare(b.name)).forEach((v) => {
      const li = document.createElement("li");
      li.className = "viv-list-item";
      li.innerHTML = `
        <span>${sanitizeInput(v.name)}</span>
        <span class="species-count">(${v.species.length} species)</span>
        <button class="viv-menu-btn" aria-label="Vivarium options">⋮</button>
      `;
      const menuBtn = li.querySelector(".viv-menu-btn");
      if (menuBtn) {
        menuBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          createMenu(e.target, [
            {
              label: "Open",
              action: () => openDynamicTab(v)
            },
            {
              label: "Delete",
              action: () => {
                if (confirm(`Delete "${v.name}" and all its data?`)) {
                  removeVivarium(v.id);
                }
              }
            }
          ], "vivarium-menu");
        });
      }
      li.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") openDynamicTab(v);
      });
      elements.vivariumList.appendChild(li);
    });
  };

  if (elements.addVivariumBtn && elements.vivariumNameInput) {
    elements.addVivariumBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const data = getData();
      const name = sanitizeInput(elements.vivariumNameInput.value);
      const type = elements.vivariumTypeSelect.value;
      const size = parseFloat(elements.vivariumSizeInput.value) || 0;
      if (!name) {
        showNotification("Please enter a vivarium name", "error");
        return;
      }
      if (data.vivariums.some(v => v.name.toLowerCase() === name.toLowerCase())) {
        showNotification("A vivarium with this name already exists", "error");
        return;
      }
      const newV = {
        id: Date.now(),
        name,
        type,
        size,
        species: [],
        notes: "",
        logs: [],
        created: new Date().toISOString()
      };
      data.vivariums.push(newV);
      if (setData(data)) {
        elements.vivariumNameInput.value = "";
        elements.vivariumTypeSelect.value = "";
        elements.vivariumSizeInput.value = "";
        loadVivariumList();
        openDynamicTab(newV);
        showNotification("Vivarium added successfully", "success");
      } else {
        showNotification("Failed to save new vivarium", "error");
      }
    });
  }

  if (elements.searchVivariumInput) {
    let debounceTimer;
    elements.searchVivariumInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = elements.searchVivariumInput.value;
        loadVivariumList(query);
      }, 300);
    });
  }

  const removeVivarium = (id) => {
    const data = getData();
    data.vivariums = data.vivariums.filter(v => v.id !== id);
    if (setData(data)) {
      loadVivariumList();
      removeDynamicTab(id);
      showNotification("Vivarium deleted", "success");
    }
  };

  // Dynamic Tabs
  const openDynamicTab = (vivarium) => {
    if (!elements.dynamicTabBar || !elements.dynamicTabContent) return;
    let tab = elements.dynamicTabBar.querySelector(`[data-id="${vivarium.id}"]`);
    if (tab) {
      selectDynamicTab(vivarium.id);
      return;
    }
    const tabHeader = document.createElement("div");
    tabHeader.className = "dynamic-tab-header";
    tabHeader.dataset.id = vivarium.id;
    tabHeader.draggable = true;
    tabHeader.innerHTML = `<span>${sanitizeInput(vivarium.name)}</span>`;
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.className = "dynamic-tab-close";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeDynamicTab(vivarium.id);
    });
    tabHeader.appendChild(closeBtn);
    tabHeader.addEventListener("click", () => selectDynamicTab(vivarium.id));
    setupTabDragEvents(tabHeader, vivarium.id);
    elements.dynamicTabBar.appendChild(tabHeader);

    const tabContent = document.createElement("div");
    tabContent.className = "dynamic-tab-content-item hidden";
    tabContent.dataset.id = vivarium.id;
    buildVivariumDetailUI(tabContent, vivarium.id);
    elements.dynamicTabContent.appendChild(tabContent);
    selectDynamicTab(vivarium.id);
  };

  const selectDynamicTab = (id) => {
    if (!elements.dynamicTabBar || !elements.dynamicTabContent) return;
    elements.dynamicTabBar.querySelectorAll(".dynamic-tab-header").forEach(h => h.classList.remove("active"));
    elements.dynamicTabContent.querySelectorAll(".dynamic-tab-content-item").forEach(c => c.classList.add("hidden"));
    const header = elements.dynamicTabBar.querySelector(`[data-id="${id}"]`);
    const content = elements.dynamicTabContent.querySelector(`[data-id="${id}"]`);
    if (header) header.classList.add("active");
    if (content) content.classList.remove("hidden");
  };

  const removeDynamicTab = (id) => {
    if (!elements.dynamicTabBar || !elements.dynamicTabContent) return;
    const header = elements.dynamicTabBar.querySelector(`[data-id="${id}"]`);
    const content = elements.dynamicTabContent.querySelector(`[data-id="${id}"]`);
    if (header) header.remove();
    if (content) content.remove();
    const firstTab = elements.dynamicTabBar.querySelector(".dynamic-tab-header");
    if (firstTab) selectDynamicTab(firstTab.dataset.id);
  };

  const setupTabDragEvents = (tabHeader, id) => {
    tabHeader.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", id);
      tabHeader.classList.add("dragging");
    });
    tabHeader.addEventListener("dragend", () => tabHeader.classList.remove("dragging"));
    tabHeader.addEventListener("dragover", (e) => {
      e.preventDefault();
      const dragging = elements.dynamicTabBar.querySelector(".dragging");
      if (dragging && dragging !== tabHeader) {
        const rect = tabHeader.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        if (e.clientX < midX) {
          tabHeader.before(dragging);
        } else {
          tabHeader.after(dragging);
        }
      }
    });
    tabHeader.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      if (draggedId !== id.toString()) {
        const data = getData();
        const draggedIdx = data.vivariums.findIndex(v => v.id === parseInt(draggedId));
        const targetIdx = data.vivariums.findIndex(v => v.id === parseInt(id));
        if (draggedIdx > -1 && targetIdx > -1) {
          const [moved] = data.vivariums.splice(draggedIdx, 1);
          data.vivariums.splice(targetIdx, 0, moved);
          setData(data);
          loadVivariumList();
        }
      }
    });
  };

  // Vivarium Detail UI
  const buildVivariumDetailUI = (container, id) => {
    if (!container) return;
    const data = getData();
    const viv = data.vivariums.find(v => v.id === id);
    if (!viv) {
      container.innerHTML = "<p>Vivarium not found.</p>";
      return;
    }

    container.innerHTML = `
      <div class="viv-detail-header">
        <h3>${sanitizeInput(viv.name)}</h3>
        <p>Type: ${viv.type || "Not specified"}</p>
        <p>Size: ${viv.size ? viv.size + " liters" : "Not specified"}</p>
        <div class="header-actions">
          <button class="btn-theme action-btn">Actions</button>
        </div>
      </div>
      <div class="species-section">
        <h4>Species</h4>
        <div class="species-list"></div>
        <form class="add-species-form">
          <input type="text" placeholder="Species name" class="species-name-input" required>
          <input type="number" placeholder="Qty" min="1" value="1" class="species-qty-input">
          <button type="submit" class="btn-theme add-species-btn">+ Add</button>
        </form>
      </div>
      <div class="notes-section">
        <h4>Notes</h4>
        <textarea class="viv-notes" placeholder="Add care notes...">${sanitizeInput(viv.notes)}</textarea>
        <button class="btn-theme save-notes-btn">Save Notes</button>
      </div>
      <div class="log-section">
        <h4>Logs</h4>
        <ul class="log-list"></ul>
        <form class="add-log-form">
          <input type="text" class="log-input" placeholder="Log event (e.g., Fed crickets)">
          <button type="submit" class="btn-theme add-log-btn">+ Add</button>
        </form>
      </div>
    `;

    const actionBtn = container.querySelector(".action-btn");
    if (actionBtn) {
      actionBtn.addEventListener("click", (e) => {
        createMenu(e.target, [
          {
            label: "Rename Vivarium",
            action: () => {
              const newName = sanitizeInput(prompt("New name:", viv.name));
              if (newName && newName !== viv.name && !data.vivariums.some(v => v.name.toLowerCase() === newName.toLowerCase())) {
                viv.name = newName;
                if (setData(data)) {
                  updateVivariumUI(id, newName);
                  showNotification("Vivarium renamed", "success");
                }
              } else if (data.vivariums.some(v => v.name.toLowerCase() === newName.toLowerCase())) {
                showNotification("Name already in use!", "error");
              }
            }
          },
          {
            label: "Edit Type",
            action: () => {
              const newType = prompt("New type:", viv.type || "");
              if (newType !== null) {
                viv.type = sanitizeInput(newType);
                if (setData(data)) {
                  buildVivariumDetailUI(container, id);
                  showNotification("Type updated", "success");
                }
              }
            }
          },
          {
            label: "Edit Size",
            action: () => {
              const newSize = prompt("New size (liters):", viv.size || "");
              const parsedSize = parseFloat(newSize);
              if (!isNaN(parsedSize) && parsedSize >= 0) {
                viv.size = parsedSize;
                if (setData(data)) {
                  buildVivariumDetailUI(container, id);
                  showNotification("Size updated", "success");
                }
              } else if (newSize !== "") {
                showNotification("Please enter a valid number for size", "error");
              }
            }
          },
          {
            label: "Export Vivarium",
            action: () => {
              const blob = new Blob([JSON.stringify(viv, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${viv.name}_data_${new Date().toISOString().slice(0,10)}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              showNotification("Vivarium exported", "success");
            }
          },
          {
            label: "Delete Vivarium",
            action: () => {
              if (confirm(`Delete "${viv.name}" and all its data?`)) {
                removeVivarium(id);
              }
            }
          }
        ], "vivarium-menu");
      });
    }

    const speciesList = container.querySelector(".species-list");
    viv.species.forEach((s, idx) => {
      const div = document.createElement("div");
      div.className = "species-item";
      div.draggable = true;
      div.dataset.index = idx;
      div.innerHTML = `
        <span class="species-name">${sanitizeInput(s.name)}</span>
        <span class="species-qty">Qty: ${s.quantity}</span>
        <button class="species-menu-btn" aria-label="Species options">⋮</button>
      `;
      setupSpeciesDragEvents(div, id, idx);
      const menuBtn = div.querySelector(".species-menu-btn");
      if (menuBtn) {
        menuBtn.addEventListener("click", (e) => {
          createMenu(e.target, [
            {
              label: "Edit",
              action: () => editSpecies(id, idx)
            },
            {
              label: "Delete",
              action: () => deleteSpecies(id, idx)
            }
          ], "species-menu");
        });
      }
      speciesList.appendChild(div);
    });

    const addSpeciesForm = container.querySelector(".add-species-form");
    if (addSpeciesForm) {
      addSpeciesForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = sanitizeInput(addSpeciesForm.querySelector(".species-name-input").value);
        const qty = parseInt(addSpeciesForm.querySelector(".species-qty-input").value) || 1;
        if (!name) {
          showNotification("Please enter a species name", "error");
          return;
        }
        viv.species.push({ name, quantity: qty });
        if (setData(data)) {
          buildVivariumDetailUI(container, id);
          showNotification("Species added", "success");
        }
      });
    }

    const saveNotesBtn = container.querySelector(".save-notes-btn");
    if (saveNotesBtn) {
      saveNotesBtn.addEventListener("click", () => {
        viv.notes = sanitizeInput(container.querySelector(".viv-notes").value);
        if (setData(data)) {
          showNotification("Notes saved!", "success");
        }
      });
    }

    const logList = container.querySelector(".log-list");
    viv.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach((log, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${log.timestamp}: ${sanitizeInput(log.text)}</span>
        <button class="log-menu-btn" aria-label="Log options">⋮</button>
      `;
      const menuBtn = li.querySelector(".log-menu-btn");
      if (menuBtn) {
        menuBtn.addEventListener("click", (e) => {
          createMenu(e.target, [
            {
              label: "Edit",
              action: () => editLog(id, idx)
            },
            {
              label: "Delete",
              action: () => deleteLog(id, idx)
            }
          ], "log-menu");
        });
      }
      logList.appendChild(li);
    });

    const addLogForm = container.querySelector(".add-log-form");
    if (addLogForm) {
      addLogForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = sanitizeInput(addLogForm.querySelector(".log-input").value);
        if (!text) return;
        viv.logs.push({ timestamp: new Date().toLocaleString(), text });
        if (setData(data)) {
          buildVivariumDetailUI(container, id);
          showNotification("Log added", "success");
        }
      });
    }
  };

  const updateVivariumUI = (id, newName) => {
    if (!elements.dynamicTabBar || !elements.dynamicTabContent) return;
    const tabHeaderSpan = elements.dynamicTabBar.querySelector(`[data-id="${id}"] span`);
    const contentHeader = elements.dynamicTabContent.querySelector(`[data-id="${id}"] h3`);
    if (tabHeaderSpan) tabHeaderSpan.textContent = newName;
    if (contentHeader) contentHeader.textContent = newName;
    loadVivariumList();
  };

  const setupSpeciesDragEvents = (div, vivId, idx) => {
    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", `${vivId},${idx}`);
      div.classList.add("dragging");
    });
    div.addEventListener("dragend", () => div.classList.remove("dragging"));
    div.addEventListener("dragover", (e) => {
      e.preventDefault();
      const dragging = div.parentElement.querySelector(".dragging");
      if (dragging && dragging !== div) {
        const rect = div.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          div.before(dragging);
        } else {
          div.after(dragging);
        }
      }
    });
    div.addEventListener("drop", (e) => {
      e.preventDefault();
      const [srcId, srcIdx] = e.dataTransfer.getData("text/plain").split(",");
      if (srcId === vivId.toString() && srcIdx !== idx.toString()) {
        const data = getData();
        const viv = data.vivariums.find(v => v.id === parseInt(vivId));
        if (viv && srcIdx >= 0 && idx >= 0 && srcIdx < viv.species.length && idx < viv.species.length) {
          const [moved] = viv.species.splice(parseInt(srcIdx), 1);
          viv.species.splice(idx, 0, moved);
          if (setData(data)) {
            buildVivariumDetailUI(div.closest(".dynamic-tab-content-item"), vivId);
            showNotification("Species reordered", "success");
          }
        }
      }
    });
  };

  const editSpecies = (vivId, idx) => {
    const data = getData();
    const viv = data.vivariums.find(v => v.id === vivId);
    if (!viv || idx < 0 || idx >= viv.species.length) return;
    const species = viv.species[idx];
    const newName = sanitizeInput(prompt("New species name:", species.name));
    if (newName) {
      species.name = newName;
    }
    const newQtyStr = prompt("New quantity:", species.quantity);
    const newQty = parseInt(newQtyStr);
    if (!isNaN(newQty) && newQty >= 0) {
      species.quantity = newQty;
    }
    if (setData(data)) {
      buildVivariumDetailUI(elements.dynamicTabContent.querySelector(`[data-id="${vivId}"]`), vivId);
      showNotification("Species updated", "success");
    }
  };

  const deleteSpecies = (vivId, idx) => {
    const data = getData();
    const viv = data.vivariums.find(v => v.id === vivId);
    if (!viv || idx < 0 || idx >= viv.species.length) return;
    const species = viv.species[idx];
    if (confirm(`Remove "${species.name}" from ${viv.name}?`)) {
      viv.species.splice(idx, 1);
      if (setData(data)) {
        buildVivariumDetailUI(elements.dynamicTabContent.querySelector(`[data-id="${vivId}"]`), vivId);
        showNotification("Species removed", "success");
      }
    }
  };

  const editLog = (vivId, idx) => {
    const data = getData();
    const viv = data.vivariums.find(v => v.id === vivId);
    if (!viv || idx < 0 || idx >= viv.logs.length) return;
    const log = viv.logs[idx];
    const newText = sanitizeInput(prompt("Edit log entry:", log.text));
    if (newText) {
      log.text = newText;
      log.timestamp = new Date().toLocaleString();
      if (setData(data)) {
        buildVivariumDetailUI(elements.dynamicTabContent.querySelector(`[data-id="${vivId}"]`), vivId);
        showNotification("Log updated", "success");
      }
    }
  };

  const deleteLog = (vivId, idx) => {
    const data = getData();
    const viv = data.vivariums.find(v => v.id === vivId);
    if (!viv || idx < 0 || idx >= viv.logs.length) return;
    const log = viv.logs[idx];
    if (confirm(`Delete log: "${log.text}"?`)) {
      viv.logs.splice(idx, 1);
      if (setData(data)) {
        buildVivariumDetailUI(elements.dynamicTabContent.querySelector(`[data-id="${vivId}"]`), vivId);
        showNotification("Log deleted", "success");
      }
    }
  };

  // Keyboard Accessibility
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      elements.vivariumNameInput?.focus();
    }
    if (e.key === "Escape") {
      elements.dataMenu?.classList.add("hidden");
      const menu = document.querySelector(".custom-menu, .data-menu-options, .species-menu, .log-menu, .vivarium-menu, .species-edit-menu, .log-edit-menu");
      if (menu) menu.remove();
    }
  });

  // Responsive Adjustments
  const adjustLayout = () => {
    if (!elements.dynamicTabBar) return;
    const tabs = elements.dynamicTabBar.children;
    if (window.innerWidth < 768 && tabs.length > 3) {
      elements.dynamicTabBar.style.overflowX = "auto";
    } else {
      elements.dynamicTabBar.style.overflowX = "visible";
    }
  };

  // Event Listeners
  window.addEventListener("resize", adjustLayout);
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener("click", toggleTheme);
  }
  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");
    initApp();
    adjustLayout();
  });
})();