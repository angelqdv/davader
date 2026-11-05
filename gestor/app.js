// Gestor de Habilidades y Jugadores - Versión Comercial v1.0
// Lógica Principal con Equipos Personalizables (Nombres, Subtítulos y Escudos) y Base Limpia

function getTeamKey() {
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    const paramTeam = params.get('team');
    if (paramTeam && (paramTeam === 'team_1' || paramTeam === 'team_2')) {
      return paramTeam;
    }
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('gestor_comercial_active_team') || 'team_1';
  }
  return 'team_1';
}

function getAllTeamsConfig() {
  const defaults = typeof DEFAULT_TEAMS_CONFIG !== 'undefined' ? DEFAULT_TEAMS_CONFIG : (global.DEFAULT_TEAMS_CONFIG || {});
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('gestor_comercial_teams_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            team_1: { ...(defaults.team_1 || {}), ...(parsed.team_1 || {}) },
            team_2: { ...(defaults.team_2 || {}), ...(parsed.team_2 || {}) }
          };
        }
      } catch (e) {
        console.warn('Error leyendo gestor_comercial_teams_config', e);
      }
    }
  }
  return JSON.parse(JSON.stringify(defaults));
}

function saveAllTeamsConfig(cfg) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('gestor_comercial_teams_config', JSON.stringify(cfg));
  }
}

function getTeamConfig(teamKey) {
  const configs = getAllTeamsConfig();
  return configs[teamKey] || configs['team_1'] || {
    id: teamKey || 'team_1',
    name: 'Equipo Principal',
    shortName: 'Equipo 1',
    subtitle: 'Control de stock en tiempo real y asignación interactiva de habilidades',
    badge: 'assets/team1_crest.svg',
    defaultSkills: typeof DEFAULT_SKILLS !== 'undefined' ? DEFAULT_SKILLS : [],
    defaultPlayers: []
  };
}

function getTeamStorageKey(teamKey) {
  return 'gestor_comercial_team_' + (teamKey || 'team_1') + '_v1';
}

let state = {
  currentTeam: 'team_1',
  skills: [],
  players: [],
  modelPlayers: [],
  deletedSkillIds: [],       // IDs de habilidades eliminadas intencionalmente por el usuario
  deletedModelPlayerIds: [], // IDs de perfiles modelo eliminados intencionalmente por el usuario
  activeTab: 'players', // 'players' | 'inventory' | 'models'
  searchQuery: '',
  statusFilter: 'all' // 'all' | 'alert' | 'valid' | 'incomplete'
};

const appRoot = typeof window !== 'undefined' ? window : global;
appRoot.state = state;
appRoot.initState = initState;
appRoot.switchTeam = switchTeam;
appRoot.getTeamConfig = getTeamConfig;
appRoot.getAllTeamsConfig = getAllTeamsConfig;
appRoot.saveAllTeamsConfig = saveAllTeamsConfig;
appRoot.updateTeamUI = updateTeamUI;
appRoot.computeInventoryStats = computeInventoryStats;
appRoot.evaluateSlotStatus = evaluateSlotStatus;
appRoot.updateSkill = updateSkill;
appRoot.addNewSkill = addNewSkill;
appRoot.deleteSkill = deleteSkill;
appRoot.addNewPlayer = addNewPlayer;
appRoot.addNewFullPlayer = addNewFullPlayer;
appRoot.handleCreateFullPlayer = handleCreateFullPlayer;
appRoot.updateNewPlayerSelectStyle = updateNewPlayerSelectStyle;
appRoot.updatePlayerName = updatePlayerName;
appRoot.updatePlayerSkill = updatePlayerSkill;
appRoot.deletePlayer = deletePlayer;
appRoot.addNewModelPlayer = addNewModelPlayer;
appRoot.deleteModelPlayer = deleteModelPlayer;
appRoot.transferModelToPlayer = transferModelToPlayer;
appRoot.applyModelToNewPlayerForm = applyModelToNewPlayerForm;
appRoot.saveSkillRow = saveSkillRow;
appRoot.clearPlayerSkills = clearPlayerSkills;
appRoot.consumePlayerSkill = consumePlayerSkill;
appRoot.exportBackup = exportBackup;
appRoot.importBackup = importBackup;
appRoot.openTeamConfigModal = openTeamConfigModal;
appRoot.closeTeamConfigModal = closeTeamConfigModal;
appRoot.handleCrestFileUpload = handleCrestFileUpload;
appRoot.resetTeamCrestToDefault = resetTeamCrestToDefault;
appRoot.saveTeamConfigFromModal = saveTeamConfigFromModal;

// ─────────────────────────────────────────────────────────────────
// PERSONALIZACIÓN DINÁMICA DE EQUIPOS (MODAL)
// ─────────────────────────────────────────────────────────────────

let tempUploadedCrest = null;

function openTeamConfigModal() {
  const teamConf = getTeamConfig(state.currentTeam);
  const modal = document.getElementById('team-config-modal');
  if (!modal) return;

  const nameInput = document.getElementById('cfg-team-name');
  const shortInput = document.getElementById('cfg-team-short');
  const subInput = document.getElementById('cfg-team-subtitle');
  const previewImg = document.getElementById('cfg-crest-preview');

  if (nameInput) nameInput.value = teamConf.name || '';
  if (shortInput) shortInput.value = teamConf.shortName || '';
  if (subInput) subInput.value = teamConf.subtitle || '';
  if (previewImg) previewImg.src = teamConf.badge || (state.currentTeam === 'team_1' ? 'assets/team1_crest.svg' : 'assets/team2_crest.svg');

  tempUploadedCrest = null;
  modal.classList.add('active');
}

function closeTeamConfigModal() {
  const modal = document.getElementById('team-config-modal');
  if (modal) modal.classList.remove('active');
  tempUploadedCrest = null;
}

function handleCrestFileUpload(event) {
  const file = event && event.target && event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, WebP)', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    tempUploadedCrest = base64Data;
    const previewImg = document.getElementById('cfg-crest-preview');
    if (previewImg) previewImg.src = base64Data;
    showToast('Imagen cargada. Haz clic en "Guardar Cambios" para aplicarla', 'info');
  };
  reader.readAsDataURL(file);
}

function resetTeamCrestToDefault() {
  const defaultBadge = state.currentTeam === 'team_1' ? 'assets/team1_crest.svg' : 'assets/team2_crest.svg';
  tempUploadedCrest = defaultBadge;
  const previewImg = document.getElementById('cfg-crest-preview');
  if (previewImg) previewImg.src = defaultBadge;
}

function saveTeamConfigFromModal() {
  const nameInput = document.getElementById('cfg-team-name');
  const shortInput = document.getElementById('cfg-team-short');
  const subInput = document.getElementById('cfg-team-subtitle');

  const newName = (nameInput && nameInput.value.trim()) || (state.currentTeam === 'team_1' ? 'Equipo Principal' : 'Equipo Secundario');
  const newShort = (shortInput && shortInput.value.trim()) || newName;
  const newSub = (subInput && subInput.value.trim()) || 'Control de stock en tiempo real y asignación interactiva';

  const allConfigs = getAllTeamsConfig();
  if (!allConfigs[state.currentTeam]) {
    allConfigs[state.currentTeam] = { id: state.currentTeam };
  }

  allConfigs[state.currentTeam].name = newName;
  allConfigs[state.currentTeam].shortName = newShort;
  allConfigs[state.currentTeam].subtitle = newSub;

  if (tempUploadedCrest) {
    allConfigs[state.currentTeam].badge = tempUploadedCrest;
  }

  saveAllTeamsConfig(allConfigs);
  updateTeamUI();
  closeTeamConfigModal();
  showToast(`¡Configuración de "${newName}" guardada con éxito!`, 'success');
}

// ─────────────────────────────────────────────────────────────────
// INICIALIZACIÓN Y PERSISTENCIA
// ─────────────────────────────────────────────────────────────────

function initState(teamKey) {
  state.currentTeam = teamKey || getTeamKey();
  const storageKey = getTeamStorageKey(state.currentTeam);
  const teamConf = getTeamConfig(state.currentTeam);

  let loadedSkills = null;
  let loadedPlayers = null;
  let loadedModelPlayers = null;
  let loadedDeletedSkillIds = [];
  let loadedDeletedModelPlayerIds = [];

  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.skills)) {
          loadedSkills = parsed.skills;
          if (Array.isArray(parsed.players)) {
            loadedPlayers = parsed.players;
          }
          if (Array.isArray(parsed.modelPlayers)) {
            loadedModelPlayers = parsed.modelPlayers;
          }
          if (Array.isArray(parsed.deletedSkillIds)) {
            loadedDeletedSkillIds = parsed.deletedSkillIds;
          }
          if (Array.isArray(parsed.deletedModelPlayerIds)) {
            loadedDeletedModelPlayerIds = parsed.deletedModelPlayerIds;
          }
        }
      } catch (e) {
        console.warn('Error leyendo LocalStorage para ' + state.currentTeam, e);
      }
    }
  }

  // Establecer habilidades y jugadores base (en limpio si es la primera vez)
  if (!loadedSkills || loadedSkills.length === 0) {
    state.skills = JSON.parse(JSON.stringify(teamConf.defaultSkills || []));
  } else {
    state.skills = loadedSkills;
  }

  if (!loadedPlayers) {
    state.players = JSON.parse(JSON.stringify(teamConf.defaultPlayers || []));
  } else {
    state.players = loadedPlayers;
  }

  state.deletedModelPlayerIds = loadedDeletedModelPlayerIds || [];

  // Cargar perfiles modelo
  const defaultModels = typeof DEFAULT_MODEL_PLAYERS !== 'undefined' ? DEFAULT_MODEL_PLAYERS : [];
  if (!loadedModelPlayers) {
    state.modelPlayers = JSON.parse(JSON.stringify(defaultModels));
    state.modelPlayers = state.modelPlayers.filter(m => !state.deletedModelPlayerIds.includes(m.id));
  } else {
    const existingIds = new Set(loadedModelPlayers.map(m => m.id));
    const merged = [...loadedModelPlayers];
    defaultModels.forEach(dm => {
      if (!existingIds.has(dm.id) && !state.deletedModelPlayerIds.includes(dm.id)) {
        merged.push(JSON.parse(JSON.stringify(dm)));
      }
    });
    state.modelPlayers = merged;
  }

  state.deletedSkillIds = loadedDeletedSkillIds || [];

  // RECUPERACIÓN Y FUSIÓN GARANTIZADA DE HABILIDADES
  let addedCount = 0;
  const existingSkillNames = new Set(state.skills.map(s => (s.name || '').toLowerCase().trim()));
  const existingSkillIds   = new Set(state.skills.map(s => s.id));
  const deletedSkillIdsSet = new Set(state.deletedSkillIds);

  (teamConf.defaultSkills || []).forEach(defSkill => {
    if (!defSkill || !defSkill.name) return;
    if (defSkill.id && deletedSkillIdsSet.has(defSkill.id)) return;
    if (defSkill.id && existingSkillIds.has(defSkill.id)) return;
    const key = defSkill.name.toLowerCase().trim();
    if (existingSkillNames.has(key)) return;
    state.skills.push({
      id: defSkill.id || ('skill_' + (state.skills.length + 1) + '_' + Date.now()),
      name: defSkill.name,
      stock: defSkill.stock !== undefined ? defSkill.stock : 0
    });
    existingSkillNames.add(key);
    existingSkillIds.add(defSkill.id);
    addedCount++;
  });

  // Asegurar registro de habilidades de jugadores
  state.players.forEach(p => {
    (p.skills || []).forEach(skName => {
      if (skName && skName.trim() !== '') {
        const key = skName.toLowerCase().trim();
        if (!existingSkillNames.has(key)) {
          state.skills.push({
            id: 'skill_auto_' + (state.skills.length + 1) + '_' + Date.now(),
            name: skName.trim(),
            stock: 0
          });
          existingSkillNames.add(key);
          addedCount++;
        }
      }
    });
  });

  saveState();
  updateTeamUI();
}

function saveState() {
  if (typeof localStorage !== 'undefined') {
    const storageKey = getTeamStorageKey(state.currentTeam);
    localStorage.setItem(storageKey, JSON.stringify({
      skills: state.skills,
      players: state.players,
      modelPlayers: state.modelPlayers,
      deletedSkillIds: state.deletedSkillIds,
      deletedModelPlayerIds: state.deletedModelPlayerIds
    }));
    localStorage.setItem('gestor_comercial_active_team', state.currentTeam);
  }
}

function switchTeam(newTeamKey) {
  if (state.currentTeam === newTeamKey) return;
  saveState();
  initState(newTeamKey);
  render();
  const teamConf = getTeamConfig(state.currentTeam);
  showToast('Equipo activo: ' + teamConf.name, 'info');
}

function updateTeamUI() {
  if (typeof document === 'undefined') return;
  const allConfigs = getAllTeamsConfig();
  const teamConf = getTeamConfig(state.currentTeam);
  
  const titleEl = document.getElementById('team-title');
  if (titleEl) titleEl.textContent = teamConf.name;

  const subtitleEl = document.getElementById('team-subtitle');
  if (subtitleEl) subtitleEl.textContent = teamConf.subtitle;

  const badgeImg = document.getElementById('team-badge-img');
  if (badgeImg) {
    badgeImg.src = teamConf.badge;
    badgeImg.alt = 'Escudo ' + teamConf.name;
  }

  // Actualizar los textos y escudos en los botones del selector superior
  ['team_1', 'team_2'].forEach(tKey => {
    const conf = allConfigs[tKey];
    if (conf) {
      const nameSpan = document.getElementById('switch-name-' + tKey);
      if (nameSpan) nameSpan.textContent = conf.shortName || conf.name;
      const imgEl = document.getElementById('switch-img-' + tKey);
      if (imgEl && conf.badge) imgEl.src = conf.badge;
    }
  });

  // Marcar botón activo en el selector de equipo
  document.querySelectorAll('.btn-team-switch').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.team === state.currentTeam);
  });
}

function resetToDefault() {
  const teamConf = getTeamConfig(state.currentTeam);
  if (confirm(`¿Estás seguro de restablecer los datos de ${teamConf.name} a su plantilla inicial vacía?`)) {
    state.skills = JSON.parse(JSON.stringify(teamConf.defaultSkills || []));
    state.players = [];
    state.modelPlayers = [];
    state.deletedSkillIds = [];
    state.deletedModelPlayerIds = [];
    saveState();
    render();
    showToast(`Datos de ${teamConf.name} restablecidos correctamente`, 'info');
  }
}

// ─────────────────────────────────────────────────────────────────
// SISTEMA DE RESPALDO (EXPORTAR / IMPORTAR BACKUP JSON)
// ─────────────────────────────────────────────────────────────────

function exportBackup() {
  try {
    saveState();
    const backup = {
      version: 1,
      appName: 'Gestor de Habilidades y Jugadores',
      edition: 'comercial',
      exportDate: new Date().toISOString(),
      activeTeam: state.currentTeam,
      teamsConfig: getAllTeamsConfig(),
      teamsData: {}
    };

    const teamKeys = ['team_1', 'team_2'];
    teamKeys.forEach(tKey => {
      const storageKey = getTeamStorageKey(tKey);
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          try {
            backup.teamsData[tKey] = JSON.parse(raw);
          } catch (e) {}
        }
      }
    });

    backup.teamsData[state.currentTeam] = {
      skills: state.skills,
      players: state.players,
      modelPlayers: state.modelPlayers,
      deletedSkillIds: state.deletedSkillIds || [],
      deletedModelPlayerIds: state.deletedModelPlayerIds || []
    };

    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    a.href = url;
    a.download = `Respaldo_Gestor_Comercial_${dateStr}_${timeStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('📦 Respaldo comercial exportado exitosamente', 'success');
  } catch (err) {
    console.error('Error exportando respaldo:', err);
    showToast('Error al exportar la copia de seguridad', 'danger');
  }
}

function importBackup(event) {
  const file = event && event.target && event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      const backup = JSON.parse(content);

      if (!backup || (!backup.teamsData && !backup.skills)) {
        showToast('El archivo no parece ser un respaldo válido de la aplicación', 'danger');
        return;
      }

      if (!confirm('¿Deseas restaurar esta copia de seguridad? Se reemplazarán los datos guardados en los equipos.')) {
        event.target.value = '';
        return;
      }

      if (typeof localStorage !== 'undefined') {
        if (backup.teamsConfig) {
          saveAllTeamsConfig(backup.teamsConfig);
        }
        if (backup.teamsData) {
          Object.keys(backup.teamsData).forEach(tKey => {
            const storageKey = getTeamStorageKey(tKey);
            localStorage.setItem(storageKey, JSON.stringify(backup.teamsData[tKey]));
          });
        }
        if (backup.activeTeam) {
          localStorage.setItem('gestor_comercial_active_team', backup.activeTeam);
          state.currentTeam = backup.activeTeam;
        }
      }

      initState(state.currentTeam);
      render();
      showToast('✅ ¡Copia de seguridad restaurada correctamente!', 'success');
    } catch (err) {
      console.error('Error restaurando respaldo:', err);
      showToast('Error al leer o procesar el archivo JSON de respaldo', 'danger');
    } finally {
      if (event && event.target) event.target.value = '';
    }
  };

  reader.readAsText(file);
}

// Cálculo de inventario y consumo en tiempo real
function computeInventoryStats() {
  const usageMap = {};
  state.skills.forEach(s => {
    usageMap[s.name.toLowerCase().trim()] = 0;
  });

  state.players.forEach(p => {
    p.skills.forEach(skillName => {
      if (skillName && skillName.trim() !== '') {
        const key = skillName.toLowerCase().trim();
        usageMap[key] = (usageMap[key] || 0) + 1;
      }
    });
  });

  const skillStats = {};
  let totalAvailableStock = 0;
  let totalAssigned = 0;
  let alertSkillsCount = 0;

  state.skills.forEach(skill => {
    const key = skill.name.toLowerCase().trim();
    const used = usageMap[key] || 0;
    const remaining = skill.stock - used;
    totalAvailableStock += skill.stock;
    totalAssigned += used;

    let status = 'ok';
    if (skill.stock === 0 && used > 0) {
      status = 'danger'; // Asignada con stock 0
      alertSkillsCount++;
    } else if (used > skill.stock) {
      status = 'danger'; // Sobreasignada
      alertSkillsCount++;
    } else if (remaining === 0 && skill.stock > 0) {
      status = 'exhausted'; // Agotada exactamente
    } else if (remaining === 1 && skill.stock > 1) {
      status = 'warning'; // Stock bajo
    } else if (skill.stock === 0 && used === 0) {
      status = 'zero_available';
    }

    skillStats[key] = {
      id: skill.id,
      name: skill.name,
      stock: skill.stock,
      used: used,
      remaining: remaining,
      status: status
    };
  });

  return {
    skillStats,
    totalAvailableStock,
    totalAssigned,
    alertSkillsCount
  };
}

// Evaluación del estado de un slot específico para un jugador
function evaluateSlotStatus(skillName, skillStats) {
  if (!skillName || skillName.trim() === '') {
    return { status: 'empty', label: 'Sin asignar', badgeClass: '', message: '' };
  }

  const key = skillName.toLowerCase().trim();
  const stat = skillStats[key];

  if (!stat) {
    return {
      status: 'danger',
      label: 'No registrada',
      badgeClass: 'badge-danger',
      message: 'Esta habilidad no existe en el listado maestro'
    };
  }

  if (stat.stock === 0) {
    return {
      status: 'danger',
      label: 'Sin Stock (0)',
      badgeClass: 'badge-danger',
      message: `Stock inicial: 0. Asignadas: ${stat.used}`
    };
  }

  if (stat.used > stat.stock) {
    return {
      status: 'danger',
      label: `Sobrecupo (${stat.used}/${stat.stock})`,
      badgeClass: 'badge-danger',
      message: `Excedido: se han asignado ${stat.used} de ${stat.stock} disponibles`
    };
  }

  if (stat.remaining === 0) {
    return {
      status: 'ok',
      label: `En Stock (0 disp.)`,
      badgeClass: 'badge-ok',
      message: `Todas las ${stat.stock} unidades están en uso`
    };
  }

  if (stat.remaining === 1) {
    return {
      status: 'warning',
      label: `1 disp. en stock`,
      badgeClass: 'badge-warning',
      message: `Última unidad restante de ${stat.stock}`
    };
  }

  return {
    status: 'ok',
    label: `${stat.remaining} disp. en stock`,
    badgeClass: 'badge-ok',
    message: `En stock disponible: ${stat.remaining} restantes de ${stat.stock}`
  };
}

// Sincronización reactiva: Renombrar o ajustar habilidad
function updateSkill(skillId, newName, newStock) {
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill) return;

  const oldName = skill.name;
  const trimmedNewName = newName.trim();

  if (trimmedNewName === '') {
    showToast('El nombre de la habilidad no puede estar vacío', 'danger');
    render();
    return;
  }

  // Verificar si ya existe otra habilidad con ese mismo nombre
  const duplicate = state.skills.find(s => s.id !== skillId && s.name.toLowerCase().trim() === trimmedNewName.toLowerCase());
  if (duplicate) {
    showToast(`Ya existe una habilidad con el nombre "${trimmedNewName}"`, 'warning');
    render();
    return;
  }

  skill.name = trimmedNewName;
  const parsedNewStock = Math.max(0, parseInt(newStock, 10) || 0);

  // Si no cambió ni el nombre ni el stock, no hacer nada
  if (oldName === trimmedNewName && skill.stock === parsedNewStock) return;

  skill.stock = parsedNewStock;

  // Requisito clave: Si se cambia el nombre, actualizar en todas las 5 listas desplegables
  // de todos los jugadores que tenían asignado el nombre anterior
  if (oldName !== trimmedNewName) {
    let affectedCount = 0;
    state.players.forEach(player => {
      player.skills = player.skills.map(assignedSkill => {
        if (assignedSkill && assignedSkill.toLowerCase().trim() === oldName.toLowerCase().trim()) {
          affectedCount++;
          return trimmedNewName;
        }
        return assignedSkill;
      });
    });
    if (affectedCount > 0) {
      showToast(`Habilidad actualizada a "${trimmedNewName}". Sincronizada en ${affectedCount} casillas de jugadores.`, 'success');
    }
  }

  saveState();
  render();
}

function saveSkillRow(skillId) {
  const row = document.querySelector(`tr[data-skill-id="${skillId}"]`);
  if (!row) return;
  const nameInput = row.querySelector('.input-inline-skill');
  const stockInput = row.querySelector('.input-inline-stock');
  if (nameInput && stockInput) {
    updateSkill(skillId, nameInput.value, stockInput.value);
    // showToast extra para dar confirmación visual si updateSkill no hizo toast (porque solo cambió stock)
    const skill = state.skills.find(s => s.id === skillId);
    if (skill) {
      showToast(`Cambios guardados en "${skill.name}"`, 'success');
    }
  }
}

function addNewSkill(name, stock) {
  const trimmed = name.trim();
  if (!trimmed) {
    showToast('Ingresa un nombre para la nueva habilidad', 'warning');
    return false;
  }

  if (state.skills.some(s => s.name.toLowerCase().trim() === trimmed.toLowerCase())) {
    showToast(`La habilidad "${trimmed}" ya existe en el inventario`, 'warning');
    return false;
  }

  const newId = 'skill_' + (Date.now());
  state.skills.push({
    id: newId,
    name: trimmed,
    stock: Math.max(0, parseInt(stock, 10) || 0)
  });

  saveState();
  render();
  showToast(`Habilidad "${trimmed}" agregada al inventario`, 'success');
  return true;
}

function deleteSkill(skillId) {
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill) return;

  if (confirm(`¿Deseas eliminar la habilidad "${skill.name}"? Los jugadores que la tengan asignada mostrarán advertencia.`)) {
    state.skills = state.skills.filter(s => s.id !== skillId);
    if (!state.deletedSkillIds.includes(skillId)) {
      state.deletedSkillIds.push(skillId);
    }
    saveState();
    render();
    showToast(`Habilidad "${skill.name}" eliminada`, 'info');
  }
}

// Gestión de Jugadores
function addNewPlayer(name) {
  const trimmed = (name || '').trim() || `Jugador ${state.players.length + 1}`;
  const newPlayer = {
    id: 'player_' + Date.now(),
    name: trimmed,
    skills: ['', '', '', '', ''],
    notes: ''
  };

  state.players.unshift(newPlayer);
  saveState();
  render();
  showToast(`Jugador "${trimmed}" agregado`, 'success');
}

function addNewFullPlayer(name, s1, s2, s3, s4, s5) {
  const trimmed = (name || '').trim() || `Jugador ${state.players.length + 1}`;
  const newPlayer = {
    id: 'player_' + Date.now(),
    name: trimmed,
    skills: [s1 || '', s2 || '', s3 || '', s4 || '', s5 || ''],
    notes: ''
  };

  state.players.unshift(newPlayer);
  saveState();
  render();
  showToast(`Jugador "${trimmed}" agregado con éxito con sus habilidades`, 'success');
}

function handleCreateFullPlayer(e) {
  if (e && e.preventDefault) e.preventDefault();
  const nameInput = document.getElementById('full-player-name');
  const s1El = document.getElementById('full-player-s1');
  const s2El = document.getElementById('full-player-s2');
  const s3El = document.getElementById('full-player-s3');
  const s4El = document.getElementById('full-player-s4');
  const s5El = document.getElementById('full-player-s5');

  if (!nameInput || !nameInput.value.trim()) {
    showToast('Por favor escribe el nombre del jugador', 'warning');
    return;
  }

  const name = nameInput.value;
  const s1 = s1El ? s1El.value : '';
  const s2 = s2El ? s2El.value : '';
  const s3 = s3El ? s3El.value : '';
  const s4 = s4El ? s4El.value : '';
  const s5 = s5El ? s5El.value : '';

  addNewFullPlayer(name, s1, s2, s3, s4, s5);
}

function updateNewPlayerSelectStyle(selectEl, skillStats) {
  if (!selectEl) return;
  const skillName = selectEl.value;
  selectEl.className = 'skill-select select-empty';
  if (!skillName) return;
  const stats = skillStats || computeInventoryStats().skillStats;
  const stat = stats[skillName.toLowerCase().trim()];
  if (!stat || stat.stock === 0 || stat.used >= stat.stock) {
    selectEl.className = 'skill-select select-danger';
  } else if (stat.remaining === 1) {
    selectEl.className = 'skill-select select-warning';
  } else {
    selectEl.className = 'skill-select select-ok';
  }
}

function updatePlayerName(playerId, newName) {
  const player = state.players.find(p => p.id === playerId);
  if (player) {
    player.name = newName.trim() || player.name;
    saveState();
  }
}

function updatePlayerSkill(playerId, slotIndex, newSkillName) {
  const player = state.players.find(p => p.id === playerId);
  if (player) {
    player.skills[slotIndex] = newSkillName;
    saveState();
    render();
  }
}

function deletePlayer(playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (player && confirm(`¿Deseas eliminar al jugador "${player.name}"?`)) {
    state.players = state.players.filter(p => p.id !== playerId);
    saveState();
    render();
    showToast(`Jugador eliminado`, 'info');
  }
}

function clearPlayerSkills(playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (player) {
    player.skills = ['', '', '', '', ''];
    saveState();
    render();
    showToast(`Habilidades de "${player.name}" reiniciadas`, 'info');
  }
}

function consumePlayerSkill(playerId, slotIndex) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return;

  const assignedSkill = (player.skills && player.skills[slotIndex]) || '';
  if (!assignedSkill || assignedSkill.trim() === '') {
    if (typeof showToast !== 'undefined') {
      showToast('Esta casilla ya se encuentra en "Seleccionar".', 'info');
    }
    return;
  }

  const skillKey = assignedSkill.toLowerCase().trim();
  const skill = state.skills.find(s => s.name && s.name.toLowerCase().trim() === skillKey);

  // Validar si hay stock disponible en el inventario maestro (1 o más)
  if (!skill || skill.stock < 1) {
    const currentStock = skill ? skill.stock : 0;
    const errorMsg = `⚠️ No hay inventario disponible en el listado maestro para "${assignedSkill}" (Stock actual: ${currentStock}). No es posible descontar.`;
    if (typeof showToast !== 'undefined') {
      showToast(errorMsg, 'danger');
    } else {
      alert(errorMsg);
    }
    return;
  }

  // Descontar 1 unidad del inventario maestro
  skill.stock = skill.stock - 1;

  // Dejar la casilla en "-- Seleccionar --" (primera opción de la lista)
  player.skills[slotIndex] = '';

  saveState();
  render();

  const successMsg = `✅ Se descontó 1 unidad de "${skill.name}" del inventario maestro (Stock restante: ${skill.stock}). Casilla restablecida a "Seleccionar".`;
  if (typeof showToast !== 'undefined') {
    showToast(successMsg, 'success');
  }
}

// ─────────────────────────────────────────────────────────────────
// JUGADORES MODELO: Motor de detección y funciones CRUD
// ─────────────────────────────────────────────────────────────────

function checkPlayerModelMatches(playerSkills) {
  const playerSkillSet = new Set(
    (playerSkills || []).filter(s => s && s.trim() !== '').map(s => s.toLowerCase().trim())
  );
  const results = [];
  (state.modelPlayers || []).forEach(model => {
    if (!model || !Array.isArray(model.skills)) return;
    const modelSkills = model.skills.filter(s => s && s.trim() !== '');
    if (modelSkills.length === 0) return;
    let matchCount = 0;
    modelSkills.forEach(ms => {
      if (playerSkillSet.has(ms.toLowerCase().trim())) matchCount++;
    });
    if (matchCount >= 3) {
      results.push({
        model,
        matchCount,
        total: modelSkills.length,
        isFullMatch: matchCount === modelSkills.length && modelSkills.length > 0
      });
    }
  });
  // Ordenar: primero los matches completos, luego por cantidad descendente
  results.sort((a, b) => (b.isFullMatch ? 1 : 0) - (a.isFullMatch ? 1 : 0) || b.matchCount - a.matchCount);
  return results;
}

function addNewModelPlayer(name, skills, description) {
  if (!name || !name.trim()) { showToast('El nombre del perfil no puede estar vacío', 'error'); return; }
  const id = 'model_' + Date.now();
  state.modelPlayers.push({ id, name: name.trim(), skills: skills || [], description: description || '' });
  saveState();
  render();
  showToast(`Perfil "${name.trim()}" creado`, 'success');
}

function deleteModelPlayer(modelId) {
  const idx = state.modelPlayers.findIndex(m => m.id === modelId);
  if (idx === -1) return;
  const name = state.modelPlayers[idx].name;
  if (!confirm(`¿Eliminar el perfil modelo "${name}"?`)) return;
  state.modelPlayers.splice(idx, 1);
  if (!state.deletedModelPlayerIds.includes(modelId)) {
    state.deletedModelPlayerIds.push(modelId);
  }
  saveState();
  render();
  showToast(`Perfil "${name}" eliminado`, 'info');
}

function transferModelToPlayer(modelId, playerId) {
  const model = state.modelPlayers.find(m => m.id === modelId);
  const player = state.players.find(p => p.id === playerId);
  if (!model || !player) { showToast('No se encontró el perfil o el jugador', 'error'); return; }
  const newSkills = [...(model.skills || [])];
  while (newSkills.length < 5) newSkills.push('');
  player.skills = newSkills.slice(0, 5);
  saveState();
  render();
  showToast(`Habilidades de "${model.name}" transferidas a "${player.name}"`, 'success');
}

function applyModelToNewPlayerForm(modelId) {
  if (!modelId) {
    for (let i = 1; i <= 5; i++) {
      const sel = document.getElementById(`full-player-s${i}`);
      if (sel) { sel.value = ''; updateNewPlayerSelectStyle(sel); }
    }
    return;
  }
  const model = state.modelPlayers.find(m => m.id === modelId);
  if (!model) return;
  const skills = model.skills || [];
  for (let i = 1; i <= 5; i++) {
    const sel = document.getElementById(`full-player-s${i}`);
    if (sel) {
      const skillVal = skills[i - 1] || '';
      // Buscar opción que coincida (case-insensitive)
      const matchOption = Array.from(sel.options).find(o => o.value.toLowerCase().trim() === skillVal.toLowerCase().trim());
      sel.value = matchOption ? matchOption.value : '';
      updateNewPlayerSelectStyle(sel);
    }
  }
}

function handleCreateModelPlayer(event) {
  if (event) event.preventDefault();
  const nameEl = document.getElementById('new-model-name');
  const descEl = document.getElementById('new-model-desc');
  const skills = [];
  for (let i = 1; i <= 5; i++) {
    const sel = document.getElementById(`new-model-s${i}`);
    skills.push(sel ? sel.value : '');
  }
  const name = nameEl ? nameEl.value.trim() : '';
  const desc = descEl ? descEl.value.trim() : '';
  if (!name) { showToast('El nombre del perfil no puede estar vacío', 'error'); return; }
  addNewModelPlayer(name, skills, desc);
  if (nameEl) nameEl.value = '';
  if (descEl) descEl.value = '';
  for (let i = 1; i <= 5; i++) {
    const sel = document.getElementById(`new-model-s${i}`);
    if (sel) { sel.value = ''; updateNewPlayerSelectStyle && updateNewPlayerSelectStyle(sel); }
  }
}

function renderModelsTab(stats) {
  const container = document.getElementById('tab-content');
  const allPlayers = state.players;

  const modelsHtml = (state.modelPlayers || []).map(model => {
    const modelSkills = (model.skills || []).filter(s => s && s.trim() !== '');

    // Jugadores que hacen match (≥3/5)
    const matchingPlayers = allPlayers.map(p => {
      const playerSkillSet = new Set(
        (p.skills || []).filter(s => s && s.trim() !== '').map(s => s.toLowerCase().trim())
      );
      let matchCount = 0;
      modelSkills.forEach(ms => { if (playerSkillSet.has(ms.toLowerCase().trim())) matchCount++; });
      return { player: p, matchCount, isFullMatch: matchCount === modelSkills.length && modelSkills.length > 0 };
    }).filter(m => m.matchCount >= 3).sort((a, b) => b.matchCount - a.matchCount);

    const skillsListHtml = model.skills.map((sk, idx) => {
      if (!sk || !sk.trim()) {
        return `<div class="model-skill-row empty"><span class="model-skill-idx">${idx + 1}</span><span class="model-skill-name text-muted">— Sin asignar —</span></div>`;
      }
      const ev = evaluateSlotStatus(sk, stats.skillStats);
      return `<div class="model-skill-row"><span class="model-skill-idx">${idx + 1}</span><span class="model-skill-name">${escapeHtml(sk)}</span><span class="slot-badge ${ev.badgeClass}" style="font-size:0.75rem;">${ev.label}</span></div>`;
    }).join('');

    const matchPlayersHtml = matchingPlayers.length === 0
      ? `<div class="text-muted" style="font-size:0.82rem;padding:6px 0;">Ningún jugador con ≥3 habilidades coincidentes</div>`
      : matchingPlayers.map(m => {
          const badgeClass = m.isFullMatch ? 'badge-match' : 'badge-partial-match';
          const icon = m.isFullMatch ? '🎯' : '🟡';
          return `
            <div class="model-match-row">
              <span class="${badgeClass}">${icon} ${escapeHtml(m.player.name)} (${m.matchCount}/${modelSkills.length})</span>
              <button class="btn btn-micro" onclick="transferModelToPlayer('${model.id}','${m.player.id}')" title="Transferir todas las habilidades del perfil a este jugador">⚡ Completar</button>
            </div>
          `;
        }).join('');

    // Select de jugadores para transferencia manual
    const transferSelectHtml = `
      <div class="model-transfer-bar">
        <select id="transfer-select-${model.id}" class="form-control" style="flex:1; font-size:0.83rem;">
          <option value="">-- Seleccionar jugador --</option>
          ${allPlayers.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
        </select>
        <button class="btn btn-primary btn-sm" onclick="(function(){const s=document.getElementById('transfer-select-${model.id}');if(s&&s.value)transferModelToPlayer('${model.id}',s.value);else showToast('Selecciona un jugador','error');})()">⚡ Transferir</button>
      </div>
    `;

    return `
      <div class="model-card">
        <div class="model-card-header">
          <div class="model-title-area">
            <span class="model-title">👤 ${escapeHtml(model.name)}</span>
            ${model.description ? `<span class="model-desc">${escapeHtml(model.description)}</span>` : ''}
          </div>
          <button class="btn btn-outline btn-sm" style="color:#ef4444;" onclick="deleteModelPlayer('${model.id}')" title="Eliminar perfil">🗑️</button>
        </div>
        <div class="model-skills-list">${skillsListHtml}</div>
        <div class="model-matches-box">
          <div style="font-size:0.78rem;font-weight:600;color:var(--text-muted);margin-bottom:6px;">JUGADORES CON MATCH</div>
          ${matchPlayersHtml}
        </div>
        <div style="font-size:0.78rem;font-weight:600;color:var(--text-muted);margin:10px 0 4px;">TRANSFERIR A JUGADOR</div>
        ${transferSelectHtml}
      </div>
    `;
  }).join('');

  const skillOptionsHtml = (prefix) => {
    return state.skills.map(sk => `<option value="${escapeHtml(sk.name)}">${escapeHtml(sk.name)}</option>`).join('');
  };

  const newModelFormHtml = `
    <div class="new-model-box">
      <h4 style="margin:0 0 14px;font-size:1rem;">➕ Nuevo Perfil Modelo</h4>
      <form onsubmit="handleCreateModelPlayer(event)">
        <div style="margin-bottom:10px;">
          <label style="font-size:0.85rem;font-weight:600;">Nombre del Perfil:</label>
          <input type="text" id="new-model-name" class="form-control" placeholder="Ej. Defensa Central..." required style="margin-top:4px;" />
        </div>
        <div style="margin-bottom:10px;">
          <label style="font-size:0.85rem;font-weight:600;">Descripción (opcional):</label>
          <input type="text" id="new-model-desc" class="form-control" placeholder="Descripción del perfil..." style="margin-top:4px;" />
        </div>
        ${[1,2,3,4,5].map(i => `
        <div style="margin-bottom:8px;">
          <label style="font-size:0.82rem;">Habilidad ${i}:</label>
          <select id="new-model-s${i}" class="skill-select select-empty" onchange="updateNewPlayerSelectStyle(this)" style="margin-top:3px;">
            <option value="">-- Sin asignar --</option>
            ${skillOptionsHtml(i)}
          </select>
        </div>`).join('')}
        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">✅ Guardar Perfil</button>
      </form>
    </div>
  `;

  container.innerHTML = `
    <div class="models-container">
      <div class="models-grid">
        ${state.modelPlayers.length === 0
          ? `<div class="text-muted" style="padding:40px;text-align:center;">No hay perfiles modelo. Crea uno en el panel lateral →</div>`
          : modelsHtml}
      </div>
      ${newModelFormHtml}
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────
// Renderizado de la Interfaz
function render() {
  if (typeof document === 'undefined') return;
  const stats = computeInventoryStats();

  // Actualizar Cards de Estadísticas
  document.getElementById('stat-total-skills').textContent = state.skills.length;
  document.getElementById('stat-total-stock').textContent = stats.totalAvailableStock;
  document.getElementById('stat-total-assigned').textContent = stats.totalAssigned;
  
  const alertCard = document.getElementById('card-alerts');
  const alertVal = document.getElementById('stat-alerts');
  alertVal.textContent = stats.alertSkillsCount;
  if (stats.alertSkillsCount > 0) {
    alertCard.className = 'stat-card stat-danger';
  } else {
    alertCard.className = 'stat-card stat-ok';
  }

  // Renderizar contenido según la pestaña activa
  if (state.activeTab === 'players') {
    renderPlayersTab(stats);
  } else if (state.activeTab === 'models') {
    renderModelsTab(stats);
  } else {
    renderInventoryTab(stats);
  }
}

function renderPlayersTab(stats) {
  const container = document.getElementById('tab-content');
  
  // Filtrar jugadores por búsqueda y por estado
  let filteredPlayers = state.players.filter(p => {
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSkills = p.skills.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchSkills) return false;
    }

    if (state.statusFilter === 'all') return true;

    // Evaluar slots del jugador
    const slotEvaluations = p.skills.map(s => evaluateSlotStatus(s, stats.skillStats));
    const hasDanger = slotEvaluations.some(e => e.status === 'danger');
    const allAssigned = p.skills.filter(s => s && s.trim() !== '').length === 5;

    if (state.statusFilter === 'alert') return hasDanger;
    if (state.statusFilter === 'valid') return !hasDanger && allAssigned;
    if (state.statusFilter === 'incomplete') return !allAssigned;

    return true;
  });

  let html = `
    <div class="controls-bar">
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <input 
          type="text" 
          id="player-search" 
          class="search-input" 
          placeholder="🔍 Buscar jugador o habilidad..." 
          value="${escapeHtml(state.searchQuery)}"
        />
        <select id="status-filter" class="form-control" style="width: auto; font-size: 0.88rem;">
          <option value="all" ${state.statusFilter === 'all' ? 'selected' : ''}>Todos los Jugadores (${state.players.length})</option>
          <option value="alert" ${state.statusFilter === 'alert' ? 'selected' : ''}>⚠️ Con Alertas de Stock</option>
          <option value="valid" ${state.statusFilter === 'valid' ? 'selected' : ''}>✅ 5 Habilidades en Stock</option>
          <option value="incomplete" ${state.statusFilter === 'incomplete' ? 'selected' : ''}>⏳ Incompletos (&lt; 5)</option>
        </select>
      </div>

      <div class="legend-bar">
        <span class="legend-item"><span class="dot dot-success"></span> En Stock (Disponible)</span>
        <span class="legend-item"><span class="dot dot-danger"></span> Sin Stock</span>
        <span class="legend-item"><span class="dot dot-warning"></span> Última unidad</span>
        <span class="legend-item"><span class="dot dot-neutral"></span> Sin asignar</span>
      </div>
    </div>

    <!-- Panel para agregar nuevo jugador con sus 5 habilidades directamente en la pestaña -->
    <div class="new-player-card">
      <div class="new-player-header">
        <h4>➕ Agregar Nuevo Jugador</h4>
        <span class="text-muted">Ingresa el nombre y selecciona sus 5 habilidades:</span>
      </div>
      ${state.modelPlayers && state.modelPlayers.length > 0 ? `
      <div class="model-template-bar">
        <span class="model-template-label">📋 Usar perfil modelo:</span>
        <select id="model-template-select" onchange="applyModelToNewPlayerForm(this.value)" class="form-control" style="width:auto; font-size:0.85rem;">
          <option value="">-- Sin plantilla --</option>
          ${state.modelPlayers.map(m => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('')}
        </select>
        <span class="text-muted" style="font-size:0.8rem;">Autocompleta las 5 habilidades del perfil seleccionado</span>
      </div>
      ` : ''}
      <form id="form-add-player-full" onsubmit="handleCreateFullPlayer(event)" class="new-player-form-grid">
        <div>
          <label for="full-player-name">Nombre del Jugador:</label>
          <input type="text" id="full-player-name" class="form-control" placeholder="Ej. Mbappé, Haaland..." required />
        </div>
        <div>
          <label for="full-player-s1">Habilidad 1:</label>
          <select id="full-player-s1" class="skill-select select-empty" onchange="updateNewPlayerSelectStyle(this)">
            <option value="">-- Habilidad 1 --</option>
            ${renderSkillOptions('', stats.skillStats)}
          </select>
        </div>
        <div>
          <label for="full-player-s2">Habilidad 2:</label>
          <select id="full-player-s2" class="skill-select select-empty" onchange="updateNewPlayerSelectStyle(this)">
            <option value="">-- Habilidad 2 --</option>
            ${renderSkillOptions('', stats.skillStats)}
          </select>
        </div>
        <div>
          <label for="full-player-s3">Habilidad 3:</label>
          <select id="full-player-s3" class="skill-select select-empty" onchange="updateNewPlayerSelectStyle(this)">
            <option value="">-- Habilidad 3 --</option>
            ${renderSkillOptions('', stats.skillStats)}
          </select>
        </div>
        <div>
          <label for="full-player-s4">Habilidad 4:</label>
          <select id="full-player-s4" class="skill-select select-empty" onchange="updateNewPlayerSelectStyle(this)">
            <option value="">-- Habilidad 4 --</option>
            ${renderSkillOptions('', stats.skillStats)}
          </select>
        </div>
        <div>
          <label for="full-player-s5">Habilidad 5:</label>
          <select id="full-player-s5" class="skill-select select-empty" onchange="updateNewPlayerSelectStyle(this)">
            <option value="">-- Habilidad 5 --</option>
            ${renderSkillOptions('', stats.skillStats)}
          </select>
        </div>
        <div>
          <button type="submit" class="btn btn-primary" style="height: 38px; width: 100%; white-space: nowrap;">
            ➕ Guardar
          </button>
        </div>
      </form>
    </div>

    <div class="table-card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">#</th>
              <th style="min-width: 150px;">Jugador</th>
              <th class="skill-header">Habilidad 1</th>
              <th class="skill-header">Habilidad 2</th>
              <th class="skill-header">Habilidad 3</th>
              <th class="skill-header">Habilidad 4</th>
              <th class="skill-header">Habilidad 5</th>
              <th style="min-width: 125px; text-align: center;">Estado Global</th>
              <th style="min-width: 90px; text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
  `;

  if (filteredPlayers.length === 0) {
    html += `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No se encontraron jugadores con los filtros seleccionados.
        </td>
      </tr>
    `;
  } else {
    filteredPlayers.forEach((player, idx) => {
      const slotEvaluations = player.skills.map(s => evaluateSlotStatus(s, stats.skillStats));
      const dangerCount = slotEvaluations.filter(e => e.status === 'danger').length;
      const emptyCount = slotEvaluations.filter(e => e.status === 'empty').length;
      const okCount = slotEvaluations.filter(e => e.status === 'ok' || e.status === 'warning').length;

      let globalBadge = '';
      if (dangerCount > 0) {
        globalBadge = `<span class="status-pill badge-danger">🔴 ${dangerCount} sin stock</span>`;
      } else if (emptyCount === 0 && okCount === 5) {
        globalBadge = `<span class="status-pill badge-ok">🟢 5/5 en stock</span>`;
      } else {
        globalBadge = `<span class="status-pill badge-warning">🟡 ${okCount} en stock (${emptyCount} vacías)</span>`;
      }

      html += `
        <tr data-player-id="${player.id}">
          <td style="color: var(--text-muted); font-weight: 600;">${idx + 1}</td>
          <td class="player-name-cell">
            <input 
              type="text" 
              class="player-name-input" 
              value="${escapeHtml(player.name)}"
              onblur="updatePlayerName('${player.id}', this.value)"
              onkeydown="if(event.key==='Enter'){ this.blur(); }"
              title="Haz clic para editar el nombre del jugador"
            />
          </td>
      `;

      // 5 Columnas de Habilidades
      for (let sIdx = 0; sIdx < 5; sIdx++) {
        const assignedSkill = player.skills[sIdx] || '';
        const slotEval = slotEvaluations[sIdx];

        let selectClass = 'skill-select select-empty';
        if (slotEval.status === 'ok') selectClass = 'skill-select select-ok';
        else if (slotEval.status === 'danger') selectClass = 'skill-select select-danger';
        else if (slotEval.status === 'warning') selectClass = 'skill-select select-warning';

        html += `
          <td class="skill-slot-cell">
            <div class="select-wrapper">
              <select 
                class="${selectClass}" 
                onchange="updatePlayerSkill('${player.id}', ${sIdx}, this.value)"
                title="${escapeHtml(slotEval.message || slotEval.label)}"
              >
                <option value="" ${assignedSkill === '' ? 'selected' : ''}>-- Seleccionar --</option>
                ${renderSkillOptions(assignedSkill, stats.skillStats)}
              </select>
              ${slotEval.status !== 'empty' ? `
                <div class="slot-badge-row">
                  <span class="slot-badge ${slotEval.badgeClass}" title="${escapeHtml(slotEval.message)}">
                    ${slotEval.label}
                  </span>
                  <button 
                    type="button" 
                    class="btn-consume-skill" 
                    onclick="consumePlayerSkill('${player.id}', ${sIdx})"
                    title="Descontar 1 del inventario maestro y restablecer a Seleccionar"
                  >
                    ⬇️ Descontar
                  </button>
                </div>
              ` : ''}
            </div>
          </td>
        `;
      }

      html += `
          <td style="text-align: center;">
            ${globalBadge}
            ${(() => {
              const matches = checkPlayerModelMatches(player.skills);
              if (matches.length === 0) return '';
              return matches.map(m => {
                if (m.isFullMatch) {
                  return `<div class="match-pill-wrapper"><span class="badge-match" title="Match completo con ${escapeHtml(m.model.name)}">🎯 ${escapeHtml(m.model.name)}</span></div>`;
                } else {
                  return `<div class="match-pill-wrapper"><span class="badge-partial-match" title="${m.matchCount}/5 habilidades coinciden con ${escapeHtml(m.model.name)}">🟡 ${m.matchCount}/5 ${escapeHtml(m.model.name)}</span></div>`;
                }
              }).join('');
            })()}
          </td>
          <td style="text-align: center;">
            <div style="display: inline-flex; gap: 6px; justify-content: center;">
              <button class="btn btn-outline btn-sm" onclick="clearPlayerSkills('${player.id}')" title="Limpiar selecciones">🧹</button>
              <button class="btn btn-outline btn-sm" style="color: #ef4444;" onclick="deletePlayer('${player.id}')" title="Eliminar jugador">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    });
  }

  html += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="9" style="padding: 14px; background: #f8fafc; text-align: center; border-top: 1px solid var(--border-color);">
                <button class="btn btn-outline" onclick="addNewPlayer('')" style="font-weight: 600; font-size: 0.88rem;">
                  ➕ Agregar Fila Vacía de Jugador en la Tabla
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Listeners de búsqueda y filtro
  const searchEl = document.getElementById('player-search');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderPlayersTab(stats);
    });
  }

  const filterEl = document.getElementById('status-filter');
  if (filterEl) {
    filterEl.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      renderPlayersTab(stats);
    });
  }
}

// Opciones para el <select> de habilidades (solo el nombre de la habilidad, sin la palabra AGOTADO)
function renderSkillOptions(currentSelected, skillStats) {
  // Ordenar habilidades alfabéticamente
  const sortedSkills = [...state.skills].sort((a, b) => a.name.localeCompare(b.name));

  return sortedSkills.map(skill => {
    const isSelected = skill.name.toLowerCase().trim() === currentSelected.toLowerCase().trim();
    return `<option value="${escapeHtml(skill.name)}" ${isSelected ? 'selected' : ''}>${escapeHtml(skill.name)}</option>`;
  }).join('');
}

// Pestaña de Inventario / Edición de Habilidades (Columnas A y B)
function renderInventoryTab(stats) {
  const container = document.getElementById('tab-content');

  let html = `
    <div class="inventory-container">
      <div>
        <div class="controls-bar" style="margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 1.1rem; color: #1e293b;">Inventario Maestro de Habilidades</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
              Edita el nombre o stock de cualquier habilidad. Al modificar un nombre, se actualizará instantáneamente en las 5 listas desplegables de todos los jugadores.
            </p>
          </div>
        </div>

        <div class="table-card">
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>Habilidad</th>
                  <th style="width: 120px; text-align: center;">Stock Inicial</th>
                  <th style="width: 110px; text-align: center;">En Uso</th>
                  <th style="width: 120px; text-align: center;">Disponible</th>
                  <th style="width: 130px;">Estado</th>
                  <th style="width: 80px; text-align: right;">Acciones</th>
                </tr>
              </thead>
              <tbody>
  `;

  state.skills.forEach((skill, idx) => {
    const key = skill.name.toLowerCase().trim();
    const stat = stats.skillStats[key] || { used: 0, remaining: skill.stock, status: 'ok' };

    let statusPill = '';
    if (stat.status === 'danger') {
      statusPill = `<span class="status-pill badge-danger">Excedido</span>`;
    } else if (stat.status === 'exhausted') {
      statusPill = `<span class="status-pill badge-ok" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;">Agotado (exacto)</span>`;
    } else if (stat.status === 'warning') {
      statusPill = `<span class="status-pill badge-warning">Última unidad</span>`;
    } else if (stat.stock === 0) {
      statusPill = `<span class="status-pill" style="background:#f1f5f9; color:#64748b;">Sin stock (0)</span>`;
    } else {
      statusPill = `<span class="status-pill badge-ok">Disponible</span>`;
    }

    html += `
      <tr data-skill-id="${skill.id}">
        <td style="color: var(--text-muted);">${idx + 1}</td>
        <td>
          <input 
            type="text" 
            class="input-inline-skill" 
            value="${escapeHtml(skill.name)}"
            data-skill-id="${skill.id}"
            onblur="updateSkill('${skill.id}', this.value, ${skill.stock})"
            onkeydown="if(event.key==='Enter'){ event.preventDefault(); this.blur(); }"
            title="Haz clic para renombrar la habilidad"
          />
        </td>
        <td style="text-align: center;">
          <input 
            type="number" 
            class="input-inline-stock" 
            value="${skill.stock}" 
            min="0"
            onblur="updateSkill('${skill.id}', '${escapeHtml(skill.name)}', this.value)"
            onkeydown="if(event.key==='Enter'){ event.preventDefault(); this.blur(); }"
          />
        </td>
        <td style="text-align: center; font-weight: 700;">${stat.used}</td>
        <td style="text-align: center; font-weight: 800; color: ${stat.remaining < 0 ? '#dc2626' : (stat.remaining === 0 ? '#64748b' : '#16a34a')};">
          ${stat.remaining}
        </td>
        <td>${statusPill}</td>
        <td style="text-align: right; display: flex; gap: 4px; justify-content: flex-end;">
          <button class="btn btn-primary btn-sm" onclick="saveSkillRow('${skill.id}')" title="Guardar cambios">💾</button>
          <button class="btn btn-outline btn-sm" style="color: #ef4444;" onclick="deleteSkill('${skill.id}')" title="Eliminar habilidad">🗑️</button>
        </td>
      </tr>
    `;
  });

  html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Formulario para agregar nueva habilidad -->
      <div>
        <div class="new-skill-box">
          <h3>➕ Nueva Habilidad</h3>
          <form id="new-skill-form" onsubmit="handleCreateSkill(event)">
            <div class="form-group">
              <label for="new-skill-name">Nombre de la Habilidad:</label>
              <input type="text" id="new-skill-name" class="form-control" placeholder="Ej. sombrero invertido" required />
            </div>
            <div class="form-group">
              <label for="new-skill-stock">Stock Disponible Inicial:</label>
              <input type="number" id="new-skill-stock" class="form-control" min="0" value="1" required />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Agregar al Inventario</button>
          </form>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function handleCreateSkill(e) {
  e.preventDefault();
  const nameInput = document.getElementById('new-skill-name');
  const stockInput = document.getElementById('new-skill-stock');
  if (addNewSkill(nameInput.value, stockInput.value)) {
    nameInput.value = '';
    stockInput.value = '1';
  }
}

// Cambio de pestaña
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  render();
}

// Exportar a Excel (.xlsx) con la estructura del Google Sheet
function exportToExcel() {
  const stats = computeInventoryStats();
  const wsData = [];

  // Fila de encabezado idéntica al Google Sheet
  wsData.push([
    'Listado de Habilidades',
    'Stock Disponible',
    '',
    'Jugadores',
    'Habilidad 1',
    'Habilidad 2',
    'Habilidad 3',
    'Habilidad 4',
    'Habilidad 5',
    'Estado Global'
  ]);

  const maxRows = Math.max(state.skills.length, state.players.length);

  for (let i = 0; i < maxRows; i++) {
    const row = [];

    // Col A & B: Habilidad y Stock
    if (i < state.skills.length) {
      row.push(state.skills[i].name);
      row.push(state.skills[i].stock);
    } else {
      row.push('');
      row.push('');
    }

    // Col C: espacio
    row.push('');

    // Col D a I: Jugador y sus 5 habilidades
    if (i < state.players.length) {
      const p = state.players[i];
      row.push(p.name);
      row.push(p.skills[0] || '');
      row.push(p.skills[1] || '');
      row.push(p.skills[2] || '');
      row.push(p.skills[3] || '');
      row.push(p.skills[4] || '');

      // Evaluar estado del jugador
      const slotEvals = p.skills.map(s => evaluateSlotStatus(s, stats.skillStats));
      const hasDanger = slotEvals.some(e => e.status === 'danger');
      const allAssigned = p.skills.filter(s => s && s.trim() !== '').length === 5;
      
      let statusStr = 'Incompleto';
      if (hasDanger) statusStr = 'ALERTA: Sin Stock';
      else if (allAssigned) statusStr = 'VÁLIDO (En Stock)';
      else statusStr = 'Parcial (En Stock)';

      row.push(statusStr);
    } else {
      row.push('');
      row.push('');
      row.push('');
      row.push('');
      row.push('');
      row.push('');
      row.push('');
    }

    wsData.push(row);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 30 }, // A: Habilidades
    { wch: 18 }, // B: Stock
    { wch: 4 },  // C: blank
    { wch: 22 }, // D: Jugadores
    { wch: 26 }, // E: Habilidad 1
    { wch: 26 }, // F: Habilidad 2
    { wch: 26 }, // G: Habilidad 3
    { wch: 26 }, // H: Habilidad 4
    { wch: 26 }, // I: Habilidad 5
    { wch: 20 }  // J: Estado
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Habilidades y Jugadores');
  const teamConf = getTeamConfig(state.currentTeam);
  const fileName = `${teamConf.shortName.replace(/\s+/g, '_')}_Habilidades.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast(`Archivo Excel de ${teamConf.name} exportado exitosamente`, 'success');
}

// Importar desde archivo Excel (.xlsx / .csv)
function handleExcelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!rows || rows.length < 2) {
        showToast('El archivo no contiene suficientes filas de datos', 'warning');
        return;
      }

      const newSkills = [];
      const newPlayers = [];

      // Procesar filas (saltando la cabecera si la primera fila son títulos)
      const startRow = (rows[0][0] && rows[0][0].toString().toLowerCase().includes('habilidad')) ? 1 : 0;

      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        // Col A & B: Habilidades
        const skillName = row[0] !== undefined ? String(row[0]).trim() : '';
        const stockVal = row[1] !== undefined ? parseInt(row[1], 10) : null;

        if (skillName && skillName.toLowerCase() !== 'listado de habilidades') {
          newSkills.push({
            id: 'skill_' + (newSkills.length + 1),
            name: skillName,
            stock: isNaN(stockVal) || stockVal === null ? 0 : Math.max(0, stockVal)
          });
        }

        // Col D & E a I: Jugadores
        const playerName = row[3] !== undefined ? String(row[3]).trim() : '';
        if (playerName && playerName.toLowerCase() !== 'jugadores') {
          const s1 = row[4] !== undefined ? String(row[4]).trim() : '';
          const s2 = row[5] !== undefined ? String(row[5]).trim() : '';
          const s3 = row[6] !== undefined ? String(row[6]).trim() : '';
          const s4 = row[7] !== undefined ? String(row[7]).trim() : '';
          const s5 = row[8] !== undefined ? String(row[8]).trim() : '';

          newPlayers.push({
            id: 'player_' + (newPlayers.length + 1),
            name: playerName,
            skills: [s1, s2, s3, s4, s5],
            notes: ''
          });
        }
      }

      if (newSkills.length > 0) state.skills = newSkills;
      if (newPlayers.length > 0) state.players = newPlayers;

      saveState();
      render();
      const teamConf = getTeamConfig(state.currentTeam);
      showToast(`Excel cargado con éxito en ${teamConf.name}: ${newSkills.length} habilidades y ${newPlayers.length} jugadores`, 'success');
    } catch (err) {
      console.error('Error importando Excel:', err);
      showToast('Ocurrió un error al procesar el archivo Excel', 'danger');
    }
  };

  reader.readAsArrayBuffer(file);
  event.target.value = ''; // Reset input
}

// Mensajes Toast flotantes
function showToast(message, type = 'info') {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'danger') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Utilidad para escapar HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  initState();
  render();

  // Selector de equipos
  document.querySelectorAll('.btn-team-switch').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTeam(btn.dataset.team);
    });
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Botón Nuevo Jugador
  const btnNewPlayer = document.getElementById('btn-add-player');
  if (btnNewPlayer) {
    btnNewPlayer.addEventListener('click', () => {
      const name = prompt('Nombre del nuevo jugador:');
      if (name !== null) addNewPlayer(name);
    });
  }

  // Botón Exportar Excel
  const btnExport = document.getElementById('btn-export-excel');
  if (btnExport) {
    btnExport.addEventListener('click', exportToExcel);
  }

  // Input Importar Excel
  const inputUpload = document.getElementById('excel-file-input');
  if (inputUpload) {
    inputUpload.addEventListener('change', handleExcelUpload);
  }

  // Botón Restablecer
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', resetToDefault);
  }
});

// ─────────────────────────────────────────────────────────────────
// BLOQUEO DE SEGURIDAD Y CONTROL DE MODIFICACIÓN ESTRUCTURAL
// ─────────────────────────────────────────────────────────────────

const MASTER_KEY = 'Mila889*';
const CREATOR_EMAIL = 'davidpenuela@gmail.com';

function openSecurityLockModal() {
  const modal = document.getElementById('security-lock-modal');
  const input = document.getElementById('security-key-input');
  const msg = document.getElementById('security-msg');
  if (msg) { msg.textContent = ''; msg.style.color = ''; }
  if (input) input.value = '';
  if (modal) {
    modal.classList.add('active');
    setTimeout(() => { if (input) input.focus(); }, 150);
  }
}

function closeSecurityLockModal() {
  const modal = document.getElementById('security-lock-modal');
  if (modal) modal.classList.remove('active');
}

function submitSecurityKey() {
  const input = document.getElementById('security-key-input');
  const msg = document.getElementById('security-msg');
  const enteredKey = (input && input.value) || '';

  const isSuccess = (enteredKey === MASTER_KEY);

  // Enviar alerta de intento/petición de modificación al correo oficial del creador
  try {
    const payload = JSON.stringify({
      to: CREATOR_EMAIL,
      subject: `[Alerta] Intento de Modificación de Estructura - Gestor Comercial v1.0`,
      fecha: new Date().toLocaleString(),
      autorizado: isSuccess ? 'SÍ (Clave Maestra Correcta)' : 'NO (Intento Bloqueado)',
      claveIngresada: isSuccess ? '*** CORRECTA ***' : (enteredKey.length > 0 ? enteredKey.slice(0, 15) : '(Vacía)'),
      userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconocido')
    });

    if (typeof fetch !== 'undefined') {
      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CREATOR_EMAIL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: payload
      }).catch(() => {});
    }
  } catch (e) {}

  if (isSuccess) {
    if (msg) {
      msg.textContent = '✅ Clave correcta. Acceso de desarrollo autorizado.';
      msg.style.color = '#10b981';
    }
    showToast('🔓 Modo de modificación estructural desbloqueado.', 'success');
    setTimeout(() => {
      closeSecurityLockModal();
    }, 1000);
  } else {
    if (msg) {
      msg.textContent = '❌ Clave incorrecta. El intento de modificación no autorizada fue registrado.';
      msg.style.color = '#ef4444';
    }
    showToast('Acceso denegado. Intento registrado y notificado.', 'danger');
  }
}

appRoot.openSecurityLockModal = openSecurityLockModal;
appRoot.closeSecurityLockModal = closeSecurityLockModal;
appRoot.submitSecurityKey = submitSecurityKey;

// Bloquear menú contextual de clic derecho
if (typeof document !== 'undefined') {
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Atajos para solicitar clave si se intenta abrir inspector
  document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.altKey && (e.key === 'm' || e.key === 'M'))) {
      e.preventDefault();
      openSecurityLockModal();
    }
  });
}
