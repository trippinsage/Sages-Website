(function() {
  // =====================
  // Global DOM Elements
  // =====================
  const backToMainBtn = document.getElementById("back-to-main");
  const downloadDataBtn = document.getElementById("download-data");
  const uploadDataInput = document.getElementById("upload-data");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Elements for the Vivariums (Home) tab
  const aquariumNameInput = document.getElementById("aquarium-name");
  const addAquariumBtn = document.getElementById("add-aquarium-btn");
  const aquariumList = document.getElementById("aquarium-list");
  const dynamicTabBar = document.getElementById("dynamic-tab-bar");
  const dynamicTabContent = document.getElementById("dynamic-tab-content");

  // Overlays for species management
  const addSpeciesOverlay = document.getElementById("add-species-overlay");
  const overlaySpeciesTitle = document.getElementById("overlay-species-title");
  const overlaySpeciesDesc = document.getElementById("overlay-species-desc");
  const overlayAqSelect = document.getElementById("overlay-aq-select");
  const overlayQtyInput = document.getElementById("overlay-qty-input");
  const overlayStatusSelect = document.getElementById("overlay-status-select");
  const overlayCancelBtn = document.getElementById("overlay-cancel-btn");
  const overlayConfirmBtn = document.getElementById("overlay-confirm-btn");

  // Species Info Modal
  const speciesInfoModal = document.getElementById("species-info-modal");
  const speciesInfoImg = document.getElementById("species-info-img");
  const speciesInfoText = document.getElementById("species-info-text");
  const speciesInfoClose = document.getElementById("species-info-close");

  // Species Search elements
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const searchProgress = document.getElementById("search-progress");
  const searchBar = document.getElementById("search-progress-bar");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const pageInfo = document.getElementById("page-info");
  // Bottom pagination controls
  const prevPageBtnBottom = document.getElementById("prev-page-btn-bottom");
  const nextPageBtnBottom = document.getElementById("next-page-btn-bottom");
  const pageInfoBottom = document.getElementById("page-info-bottom");
  const resultsTableBody = document.getElementById("results-table").querySelector("tbody");

  // New elements for the Menu (Download/Upload)
  const dataMenuBtn = document.getElementById("data-menu-btn");
  const dataMenu = document.getElementById("data-menu");

  // =====================
  // Data Functions
  // =====================
  function getData() {
    try {
      return JSON.parse(localStorage.getItem("vivarium_data")) || { aquariums: [] };
    } catch (e) {
      return { aquariums: [] };
    }
  }
  function setData(data) {
    localStorage.setItem("vivarium_data", JSON.stringify(data));
  }

  // =====================
  // Initialization
  // =====================
  function initApp() {
    addSpeciesOverlay.classList.add("hidden");
    speciesInfoModal.classList.add("hidden");
    loadVivariumList();
    showTab("home-tab");
  }

  // =====================
  // Navigation
  // =====================
  backToMainBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  dataMenuBtn.addEventListener("click", () => {
    dataMenu.classList.toggle("hidden");
  });

  downloadDataBtn.addEventListener("click", () => {
    const data = localStorage.getItem("vivarium_data") || "{}";
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vivarium_data_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  });
  uploadDataInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const data = JSON.parse(event.target.result);
        setData(data);
        alert("Data uploaded successfully. Reloading...");
        location.reload();
      } catch (err) {
        alert("Invalid data file.");
      }
    };
    reader.readAsText(file);
  });

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      showTab(btn.getAttribute("data-tab"));
    });
  });
  function showTab(tabId) {
    tabContents.forEach(tc => {
      tc.classList.add("hidden");
      tc.style.display = "none";
    });
    const activeTab = document.getElementById(tabId);
    activeTab.classList.remove("hidden");
    activeTab.style.display = "block";
    if (tabId !== "search-tab") {
      // Clear search fields and hide search tab-specific elements
      document.getElementById("search-input").value = "";
      document.getElementById("results-table").classList.add("hidden");
      document.getElementById("pagination-top").style.display = "none";
      document.getElementById("pagination-bottom").style.display = "none";
    }
    if (tabId !== "home-tab") {
      dynamicTabBar.innerHTML = "";
      dynamicTabContent.innerHTML = "";
    }
  }

  function loadVivariumList() {
    aquariumList.innerHTML = "";
    const data = getData();
    const vivariums = data.aquariums || [];
    vivariums.forEach((v, index) => {
      const li = document.createElement("li");
      li.className = "aq-list-item";
      li.textContent = v.name;
      li.setAttribute("draggable", "true");
      li.dataset.index = index;
      li.addEventListener("dragstart", dragStart);
      li.addEventListener("dragover", dragOver);
      li.addEventListener("drop", drop);
      const delBtn = document.createElement("button");
      delBtn.textContent = "X";
      delBtn.className = "delete-btn";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Delete this vivarium?")) {
          vivariums.splice(index, 1);
          setData(data);
          loadVivariumList();
          removeDynamicTab(v.id);
        }
      });
      li.appendChild(delBtn);
      li.addEventListener("click", () => { openDynamicTab(v); });
      aquariumList.appendChild(li);
    });
  }

  let dragSrcIndex = null;
  function dragStart(e) {
    dragSrcIndex = +this.dataset.index;
    e.dataTransfer.effectAllowed = "move";
  }
  function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
  function drop(e) {
    e.stopPropagation();
    const targetIndex = +this.dataset.index;
    if (dragSrcIndex === targetIndex) return;
    const data = getData();
    const vivariums = data.aquariums || [];
    [vivariums[dragSrcIndex], vivariums[targetIndex]] = [vivariums[targetIndex], vivariums[dragSrcIndex]];
    setData(data);
    loadVivariumList();
  }

  addAquariumBtn.addEventListener("click", () => {
    const data = getData();
    const newName = aquariumNameInput.value.trim();
    if (!newName) { alert("Enter a name for the vivarium."); return; }
    const newId = Date.now();
    const newV = { id: newId, name: newName, notes: "", fish: [], logs: [] };
    data.aquariums.push(newV);
    setData(data);
    aquariumNameInput.value = "";
    loadVivariumList();
  });

  function openDynamicTab(vivarium) {
    let existingHeader = dynamicTabBar.querySelector(`[data-id="${vivarium.id}"]`);
    if (existingHeader) {
      selectDynamicTab(vivarium.id);
      return;
    }
    const tabHeader = document.createElement("div");
    tabHeader.className = "dynamic-tab-header";
    tabHeader.dataset.id = vivarium.id;
    const headerText = document.createElement("span");
    headerText.textContent = vivarium.name;
    tabHeader.appendChild(headerText);
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.className = "dynamic-tab-close";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeDynamicTab(vivarium.id);
    });
    tabHeader.appendChild(closeBtn);
    tabHeader.addEventListener("click", () => {
      selectDynamicTab(vivarium.id);
    });
    dynamicTabBar.appendChild(tabHeader);

    const tabContent = document.createElement("div");
    tabContent.className = "dynamic-tab-content-item";
    tabContent.dataset.id = vivarium.id;
    buildVivariumDetailUI(tabContent, vivarium.id);
    dynamicTabContent.appendChild(tabContent);

    selectDynamicTab(vivarium.id);
  }

  function selectDynamicTab(vivariumId) {
    const headers = dynamicTabBar.querySelectorAll(".dynamic-tab-header");
    headers.forEach(header => header.classList.remove("active"));
    const contents = dynamicTabContent.querySelectorAll(".dynamic-tab-content-item");
    contents.forEach(content => content.classList.add("hidden"));
    const activeHeader = dynamicTabBar.querySelector(`[data-id="${vivariumId}"]`);
    if (activeHeader) activeHeader.classList.add("active");
    const activeContent = dynamicTabContent.querySelector(`[data-id="${vivariumId}"]`);
    if (activeContent) activeContent.classList.remove("hidden");
  }

  function removeDynamicTab(vivariumId) {
    const header = dynamicTabBar.querySelector(`[data-id="${vivariumId}"]`);
    const content = dynamicTabContent.querySelector(`[data-id="${vivariumId}"]`);
    if (header) header.remove();
    if (content) content.remove();
  }

  function buildVivariumDetailUI(container, vivariumId) {
    container.innerHTML = "";
    const data = getData();
    const viv = (data.aquariums || []).find(v => v.id === vivariumId);
    if (!viv) {
      container.innerHTML = "<p>Error: Vivarium not found.</p>";
      return;
    }
    const header = document.createElement("div");
    header.className = "aq-detail-header";
    const title = document.createElement("h3");
    title.textContent = viv.name;
    title.className = "aquarium-title";
    header.appendChild(title);
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "header-actions";
    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    renameBtn.className = "btn-theme";
    renameBtn.addEventListener("click", () => {
      const newName = prompt("New vivarium name:", viv.name);
      if (newName && newName.trim()) {
        viv.name = newName.trim();
        setData(data);
        title.textContent = viv.name;
        const headerToUpdate = dynamicTabBar.querySelector(`[data-id="${vivariumId}"] span`);
        if (headerToUpdate) headerToUpdate.textContent = viv.name;
        loadVivariumList();
      }
    });
    actionsContainer.appendChild(renameBtn);
    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.className = "delete-btn";
    delBtn.addEventListener("click", () => {
      if (confirm(`Delete '${viv.name}'? This cannot be undone.`)) {
        data.aquariums = data.aquariums.filter(v => v.id !== vivariumId);
        setData(data);
        removeDynamicTab(vivariumId);
        loadVivariumList();
      }
    });
    actionsContainer.appendChild(delBtn);
    header.appendChild(actionsContainer);
    container.appendChild(header);

    const fishTitle = document.createElement("h4");
    fishTitle.textContent = "Inhabitants";
    container.appendChild(fishTitle);
    const fishList = document.createElement("div");
    fishList.className = "fish-list";
    fishList.style.minHeight = "80px";
    fishList.style.border = "1px dashed #ccc";
    container.appendChild(fishList);

    function renderFish() {
      fishList.innerHTML = "";
      if (viv.fish.length === 0) {
        const placeholder = document.createElement("div");
        placeholder.className = "empty-placeholder";
        placeholder.textContent = "No inhabitants added yet.";
        fishList.appendChild(placeholder);
      }
      viv.fish.forEach((f, idx) => {
        const fishRow = document.createElement("div");
        fishRow.className = "fish-row";
        fishRow.setAttribute("draggable", "true");
        fishRow.dataset.index = idx;
        fishRow.addEventListener("dragstart", function(e) {
          this.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", idx);
        });
        fishRow.addEventListener("dragover", function(e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        });
        fishRow.addEventListener("drop", function(e) {
          e.stopPropagation();
          const srcIdx = +e.dataTransfer.getData("text/plain");
          const targetIdx = +this.dataset.index;
          if (srcIdx === targetIdx) return;
          [viv.fish[srcIdx], viv.fish[targetIdx]] = [viv.fish[targetIdx], viv.fish[srcIdx]];
          setData(data);
          renderFish();
        });
        fishRow.addEventListener("dragend", function() {
          this.classList.remove("dragging");
        });

        // Fish name on its own row
        const nameDiv = document.createElement("div");
        nameDiv.className = "fish-name-container";
        nameDiv.textContent = f.species_name;

        // Controls row below the name
        const fishControls = document.createElement("div");
        fishControls.className = "fish-controls";

        const statusSelect = document.createElement("select");
        const statuses = ["", "Low Stock", "Quarantine", "Sold Out", "In Treatment", "Ready", "Personal"];
        statuses.forEach(st => {
          const opt = document.createElement("option");
          opt.value = st;
          opt.textContent = st || "None";
          statusSelect.appendChild(opt);
        });
        statusSelect.value = f.status || "";
        statusSelect.addEventListener("change", () => {
          f.status = statusSelect.value;
          setData(data);
        });

        const qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.value = f.quantity;
        qtyInput.min = "0";
        qtyInput.className = "fish-qty";
        qtyInput.addEventListener("change", () => {
          f.quantity = parseInt(qtyInput.value, 10) || 0;
          setData(data);
        });

        const btnContainer = document.createElement("div");
        btnContainer.className = "btn-container";
        const infoBtn = document.createElement("button");
        infoBtn.textContent = "Info";
        infoBtn.className = "btn-small";
        infoBtn.addEventListener("click", () => { showSpeciesModal(f); });
        const remBtn = document.createElement("button");
        remBtn.textContent = "X";
        remBtn.className = "btn-small";
        remBtn.style.backgroundColor = "#b30000";
        remBtn.style.color = "#fff";
        remBtn.addEventListener("click", () => {
          if (confirm(`Remove ${f.species_name}?`)) {
            viv.fish.splice(idx, 1);
            setData(data);
            renderFish();
          }
        });
        btnContainer.appendChild(infoBtn);
        btnContainer.appendChild(remBtn);

        fishControls.appendChild(statusSelect);
        fishControls.appendChild(qtyInput);
        fishControls.appendChild(btnContainer);

        fishRow.appendChild(nameDiv);
        fishRow.appendChild(fishControls);
        fishList.appendChild(fishRow);
      });
    }
    renderFish();

    const notesLabel = document.createElement("h4");
    notesLabel.textContent = "Notes:";
    container.appendChild(notesLabel);
    const notesArea = document.createElement("textarea");
    notesArea.className = "notes-area";
    notesArea.value = viv.notes || "";
    notesArea.addEventListener("input", () => {
      viv.notes = notesArea.value;
      setData(data);
    });
    container.appendChild(notesArea);

    const fishAddDiv = document.createElement("div");
    fishAddDiv.className = "add-fish-form";
    const fishNameInput = document.createElement("input");
    fishNameInput.type = "text";
    fishNameInput.placeholder = "Inhabitant name...";
    fishNameInput.style.marginRight = "8px";
    fishAddDiv.appendChild(fishNameInput);
    const addFishBtn = document.createElement("button");
    addFishBtn.textContent = "Add Inhabitant";
    addFishBtn.className = "btn-theme";
    addFishBtn.addEventListener("click", () => {
      const spName = fishNameInput.value.trim();
      if (!spName) { alert("Please enter a name."); return; }
      viv.fish.push({ species_name: spName, quantity: 1, status: "" });
      setData(data);
      fishNameInput.value = "";
      renderFish();
    });
    fishAddDiv.appendChild(addFishBtn);
    container.appendChild(fishAddDiv);

    const logTitle = document.createElement("h4");
    logTitle.textContent = "Maintenance Logs";
    container.appendChild(logTitle);
    const logTable = document.createElement("table");
    logTable.className = "maintenance-table";
    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>Timestamp</th><th>Event</th><th>Details</th><th>Delete</th></tr>";
    logTable.appendChild(thead);
    const tbody = document.createElement("tbody");
    logTable.appendChild(tbody);
    function renderLogs() {
      tbody.innerHTML = "";
      viv.logs.forEach((lg, idx) => {
        const tr = document.createElement("tr");
        const tdTime = document.createElement("td");
        const tdEvent = document.createElement("td");
        const tdDetails = document.createElement("td");
        const tdDel = document.createElement("td");
        tdTime.textContent = lg.timestamp;
        tdEvent.textContent = lg.event_type;
        tdDetails.textContent = lg.details;
        const delLogBtn = document.createElement("button");
        delLogBtn.textContent = "X";
        delLogBtn.className = "delete-btn";
        delLogBtn.addEventListener("click", () => {
          if (confirm("Delete this log?")) {
            viv.logs.splice(idx, 1);
            setData(data);
            renderLogs();
          }
        });
        tdDel.appendChild(delLogBtn);
        tr.appendChild(tdTime);
        tr.appendChild(tdEvent);
        tr.appendChild(tdDetails);
        tr.appendChild(tdDel);
        tbody.appendChild(tr);
      });
    }
    renderLogs();
    container.appendChild(logTable);

    const logForm = document.createElement("div");
    logForm.className = "log-form";
    const eventInput = document.createElement("input");
    eventInput.type = "text";
    eventInput.placeholder = "Event type (Feeding, Cleaning, etc.)";
    const detailsInput = document.createElement("input");
    detailsInput.type = "text";
    detailsInput.placeholder = "Details...";
    const addLogBtn = document.createElement("button");
    addLogBtn.textContent = "Add Log";
    addLogBtn.className = "btn-theme";
    addLogBtn.addEventListener("click", () => {
      const evType = eventInput.value.trim();
      if (!evType) { alert("Event type is required."); return; }
      const details = detailsInput.value.trim();
      const now = new Date().toISOString();
      viv.logs.unshift({ timestamp: now, event_type: evType, details: details });
      setData(data);
      eventInput.value = "";
      detailsInput.value = "";
      renderLogs();
    });
    logForm.appendChild(eventInput);
    logForm.appendChild(detailsInput);
    logForm.appendChild(addLogBtn);
    container.appendChild(logForm);
  }

  function showSpeciesModal(spData) {
    if (!spData) return;
    speciesInfoImg.innerHTML = "";
    speciesInfoText.innerHTML = "";
    if (spData.photo_url) {
      const img = document.createElement("img");
      img.src = spData.photo_url;
      img.alt = spData.species_name;
      img.className = "modal-species-img";
      speciesInfoImg.appendChild(img);
    }
    let html = `<strong>${spData.species_name}</strong><br/><br/>`;
    html += `<strong>Description:</strong><br/>${spData.description || "No description available."}<br/><br/>`;
    if (spData.wikipedia_url) {
      html += `<em><a href="${spData.wikipedia_url}" target="_blank">Open Wikipedia</a></em>`;
    }
    speciesInfoText.innerHTML = html;
    speciesInfoModal.classList.remove("hidden");
  }
  speciesInfoClose.addEventListener("click", () => {
    speciesInfoModal.classList.add("hidden");
  });

  let currentQuery = "";
  let currentPage = 1;
  let totalResults = 0;
  let perPage = 12;
  let totalPages = 1;
  let pageCache = {};

  function updatePaginationControls() {
    prevPageBtn.disabled = (currentPage <= 1);
    nextPageBtn.disabled = (currentPage >= totalPages);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtnBottom.disabled = (currentPage <= 1);
    nextPageBtnBottom.disabled = (currentPage >= totalPages);
    pageInfoBottom.textContent = `Page ${currentPage} of ${totalPages}`;
    if(totalPages > 1) {
      document.getElementById("pagination-top").style.display = "flex";
      document.getElementById("pagination-bottom").style.display = "flex";
    } else {
      document.getElementById("pagination-top").style.display = "none";
      document.getElementById("pagination-bottom").style.display = "none";
    }
  }

  searchBtn.addEventListener("click", () => {
    currentQuery = searchInput.value.trim();
    if (!currentQuery) { alert("Please enter a search term."); return; }
    currentPage = 1;
    pageCache = {};
    loadSpecies();
  });
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; loadSpecies(); }
  });
  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) { currentPage++; loadSpecies(); }
  });
  prevPageBtnBottom.addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; loadSpecies(); }
  });
  nextPageBtnBottom.addEventListener("click", () => {
    if (currentPage < totalPages) { currentPage++; loadSpecies(); }
  });

  async function loadSpecies() {
    if (!currentQuery) return;
    if (pageCache[currentPage]) {
      const [results, tot] = pageCache[currentPage];
      totalResults = tot;
      totalPages = Math.max(1, Math.ceil(totalResults / perPage));
      updatePaginationControls();
      buildResultsTable(results);
      return;
    }
    searchProgress.classList.remove("hidden");
    searchBar.style.width = "0%";
    let progressVal = 0;
    const progressInterval = setInterval(() => {
      if (progressVal < 80) { progressVal += 5; searchBar.style.width = progressVal + "%"; }
      else { clearInterval(progressInterval); }
    }, 100);
    try {
      const [resArray, tot] = await iNatSearch(currentQuery, currentPage, perPage);
      totalResults = tot;
      totalPages = Math.max(1, Math.ceil(totalResults / perPage));
      pageCache[currentPage] = [resArray, tot];
      updatePaginationControls();
      buildResultsTable(resArray);
    } catch (err) {
      alert(`Error fetching iNaturalist data: ${err.message}`);
    } finally {
      clearInterval(progressInterval);
      searchBar.style.width = "100%";
      setTimeout(() => { searchProgress.classList.add("hidden"); }, 600);
    }
  }

  async function iNatSearch(query, page = 1, per_page = 12) {
    const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("iNaturalist search failed.");
    const data = await resp.json();
    const allTaxa = data.results || [];
    const total = data.total_results || 0;
    const detailPromises = allTaxa.map(taxon => fetchTaxonDetail(taxon.id));
    let speciesData = await Promise.all(detailPromises);
    speciesData = speciesData.filter(s => s !== null);
    return [speciesData, total];
  }

  async function fetchTaxonDetail(taxonId) {
    if (!taxonId) return null;
    try {
      const detailUrl = `https://api.inaturalist.org/v1/taxa/${taxonId}?locale=en`;
      const resp = await fetch(detailUrl);
      if (!resp.ok) return null;
      const data = await resp.json();
      const details = data.results && data.results[0];
      if (!details) return null;
      const common = (details.preferred_common_name || "").trim();
      const scientific = (details.name || "").trim();
      let speciesName = scientific;
      if (common && common.toLowerCase() !== scientific.toLowerCase()) {
        speciesName = `${common} (${scientific})`;
      } else if (common) {
        speciesName = common;
      }
      const defaultPhoto = details.default_photo || {};
      return {
        species_name: speciesName,
        photo_url: defaultPhoto.square_url || "",
        description: details.wikipedia_summary || "No description available.",
        wikipedia_url: details.wikipedia_url || "",
        status: ""
      };
    } catch {
      return null;
    }
  }

  function buildResultsTable(speciesList) {
    document.getElementById("results-table").classList.remove("hidden");
    resultsTableBody.innerHTML = "";
    speciesList.forEach(sp => {
      const tr = document.createElement("tr");
      const tdPhoto = document.createElement("td");
      const img = document.createElement("img");
      img.width = 48;
      img.height = 48;
      img.style.objectFit = "cover";
      img.src = sp.photo_url;
      tdPhoto.appendChild(img);
      tr.appendChild(tdPhoto);
      const tdName = document.createElement("td");
      tdName.textContent = sp.species_name;
      tr.appendChild(tdName);
      const tdBtns = document.createElement("td");
      tdBtns.style.textAlign = "center";
      const infoBtn = document.createElement("button");
      infoBtn.textContent = "Info";
      infoBtn.className = "btn-small";
      infoBtn.style.marginRight = "8px";
      infoBtn.addEventListener("click", () => { showSpeciesModal(sp); });
      tdBtns.appendChild(infoBtn);
      const addBtn = document.createElement("button");
      addBtn.textContent = "Add";
      addBtn.className = "btn-theme";
      addBtn.addEventListener("click", () => { showAddSpeciesOverlay(sp); });
      tdBtns.appendChild(addBtn);
      tr.appendChild(tdBtns);
      resultsTableBody.appendChild(tr);
    });
  }

  let currentSpeciesToAdd = null;
  function showAddSpeciesOverlay(spData) {
    currentSpeciesToAdd = spData;
    overlaySpeciesTitle.textContent = `Add: ${spData.species_name}`;
    overlaySpeciesDesc.textContent = "Select a vivarium to add this species to.";
    overlayQtyInput.value = "1";
    overlayStatusSelect.value = "";
    const data = getData();
    const vivariums = data.aquariums || [];
    overlayAqSelect.innerHTML = "";
    if (!vivariums.length) {
      alert("No vivariums found. Please create one on the Vivariums tab.");
      return;
    }
    vivariums.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.name;
      overlayAqSelect.appendChild(opt);
    });
    addSpeciesOverlay.classList.remove("hidden");
  }
  overlayCancelBtn.addEventListener("click", () => {
    addSpeciesOverlay.classList.add("hidden");
    currentSpeciesToAdd = null;
  });
  overlayConfirmBtn.addEventListener("click", () => {
    const data = getData();
    const vId = parseInt(overlayAqSelect.value, 10);
    const viv = (data.aquariums || []).find(v => v.id === vId);
    if (!viv) {
      alert("Vivarium not found. Please refresh.");
      return;
    }
    const qty = parseInt(overlayQtyInput.value, 10) || 1;
    const stat = overlayStatusSelect.value;
    if (!currentSpeciesToAdd) {
      alert("No species selected.");
      addSpeciesOverlay.classList.add("hidden");
      return;
    }
    viv.fish.push({
      species_name: currentSpeciesToAdd.species_name || "Unknown",
      quantity: qty,
      status: stat || "",
      photo_url: currentSpeciesToAdd.photo_url || "",
      description: currentSpeciesToAdd.description || "",
      wikipedia_url: currentSpeciesToAdd.wikipedia_url || ""
    });
    setData(data);
    alert(`${currentSpeciesToAdd.species_name} x${qty} added to "${viv.name}"!`);
    addSpeciesOverlay.classList.add("hidden");
    currentSpeciesToAdd = null;
    const detailContent = dynamicTabContent.querySelector(`[data-id="${vId}"]`);
    if (detailContent) {
      buildVivariumDetailUI(detailContent, vId);
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    initApp();
  });
})();
