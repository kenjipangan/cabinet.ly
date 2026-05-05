/**
 * Local Project Storage Service
 * Single Responsibility: save/load/list/delete projects in browser localStorage
 */
const STORAGE_PREFIX = 'cabinet_project_';
const LAST_OPENED_KEY = 'cabinet_last_opened';

export function saveProject(name, projectData) {
    if (!name) throw new Error('Project name required');
    const key = STORAGE_PREFIX + name;
    const payload = {
        ...projectData,
        savedAt: new Date().toISOString(),
        name
    };
    try {
        localStorage.setItem(key, JSON.stringify(payload));
        localStorage.setItem(LAST_OPENED_KEY, name);
        return true;
    } catch (e) {
        throw new Error('Storage full or unavailable: ' + e.message);
    }
}

export function loadProject(name) {
    const key = STORAGE_PREFIX + name;
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
        const parsed = JSON.parse(data);
        localStorage.setItem(LAST_OPENED_KEY, name);
        return parsed;
    } catch (e) {
        return null;
    }
}

export function listProjects() {
    const projects = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
            const name = key.substring(STORAGE_PREFIX.length);
            try {
                const data = JSON.parse(localStorage.getItem(key));
                projects.push({
                    name,
                    savedAt: data.savedAt,
                    cabinetCount: (data.cabinets || []).length,
                    clientName: data.projectInfo?.clientName || '',
                    projectName: data.projectInfo?.projectName || name
                });
            } catch (e) {
                // skip corrupted entries
            }
        }
    }
    // Sort most recent first
    projects.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
    return projects;
}

export function deleteProject(name) {
    const key = STORAGE_PREFIX + name;
    localStorage.removeItem(key);
    if (localStorage.getItem(LAST_OPENED_KEY) === name) {
        localStorage.removeItem(LAST_OPENED_KEY);
    }
}

export function getLastOpened() {
    return localStorage.getItem(LAST_OPENED_KEY);
}

export function getStorageInfo() {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
            used += (localStorage.getItem(key) || '').length;
        }
    }
    return {
        usedBytes: used,
        usedKB: (used / 1024).toFixed(1),
        projectCount: listProjects().length
    };
}
