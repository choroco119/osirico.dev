let PARTS_PRESETS = {};
let LAYOUT_PRESETS = {};

const CONFIG = {
    DEFAULT_WIDTH: 400,
    DEFAULT_HEIGHT: 250
};

const state = {
    parts: [],
    selectedIds: [],
    isDragging: false,
    isMarquee: false,
    marqueeStart: { x: 0, y: 0 },
    dragOffsets: {}, // id -> {x, y}
    canvasSize: { width: CONFIG.DEFAULT_WIDTH, height: CONFIG.DEFAULT_HEIGHT },
    bgScale: 1.0,
    bgX: 0,
    bgY: 0
};

const canvasEl = document.getElementById('canvas');
const canvasContainerEl = document.getElementById('canvas-container');
const canvasViewportEl = document.getElementById('main-view');
const btnResize = document.getElementById('btn-resize-canvas');
const inputWidth = document.getElementById('canvas-width');
const inputHeight = document.getElementById('canvas-height');
const propertyPanel = document.getElementById('property-panel');
const bgLayer = document.getElementById('bg-layer');
const marqueeEl = document.getElementById('selection-marquee');
const propTypeSelect = document.getElementById('prop-type');
const propNameInput = document.getElementById('prop-name');
const propXInput = document.getElementById('prop-x');
const propYInput = document.getElementById('prop-y');

/**
 * Sync the property panel inputs with the current state of a selected part.
 * Used during real-time movements like dragging or arrow key steps.
 */
function syncPropertyPanelPositions() {
    if (state.selectedIds.length === 1) {
        const p = state.parts.find(part => part.id === state.selectedIds[0]);
        if (p) {
            const px = document.getElementById('prop-x');
            const py = document.getElementById('prop-y');
            if (px) px.value = Math.round(p.x);
            if (py) py.value = Math.round(p.y);
        }
    }
}

async function init() {
    updateCanvasSize();
    await loadPresets();
    renderSidebarUI();
    populateTypeOptions();
    setupEventListeners();
    
    // Initial Mobile View (Main)
    if (window.innerWidth <= 768) {
        switchMobileView('main');
    }
}

async function loadPresets() {
    const timestamp = Date.now();
    const urls = {
        parts: `/apps/web/arcade-layout/parts.json?t=${timestamp}`,
        layouts: `/apps/web/arcade-layout/layouts.json?t=${timestamp}`
    };

    try {
        const pRes = await fetch(urls.parts);
        if (!pRes.ok) throw new Error(`parts.json の取得に失敗しました (Status: ${pRes.status})`);
        PARTS_PRESETS = await pRes.json();
        
        const lRes = await fetch(urls.layouts);
        if (!lRes.ok) throw new Error(`layouts.json の取得に失敗しました (Status: ${lRes.status})`);
        LAYOUT_PRESETS = await lRes.json();
        
        console.log("Presets loaded successfully from JSON.");
    } catch (err) {
        console.error("プリセットデータの読み込みに失敗しました:", err);
        const fullUrl = new URL(urls.parts, window.location.href).href;
        alert(
            `【エラー】JSONデータの読み込みに失敗しました。\n\n` +
            `エラー内容: ${err.message}\n` +
            `アクセス先: ${fullUrl}\n\n` +
            `■ 対処法:\n` +
            `1. GitHubのリポジトリに parts.json と layouts.json がプッシュされているか確認してください。\n` +
            `2. ファイル名の大文字小文字（p と P など）が一致しているか確認してください。\n` +
            `3. ブラウザの F12 キー ＞ Console タブに赤いエラー（404 Not Found 等）が出ていないか確認してください。`
        );
    }
}

function renderSidebarUI() {
    const leversGrid = document.getElementById('levers-grid');
    const buttonsGrid = document.getElementById('buttons-grid');
    const layoutsList = document.getElementById('layouts-list');
    
    leversGrid.innerHTML = '';
    buttonsGrid.innerHTML = '';
    layoutsList.innerHTML = '';

    // Grouping by Category -> Maker
    const grouped = {};
    for (const key in PARTS_PRESETS) {
        const p = PARTS_PRESETS[key];
        if (!grouped[p.category]) grouped[p.category] = {};
        const maker = p.maker || 'その他';
        if (!grouped[p.category][maker]) grouped[p.category][maker] = [];
        grouped[p.category][maker].push({ key, ...p });
    }

    const renderCategoryMakers = (category, container) => {
        const makers = grouped[category] || {};
        for (const makerName in makers) {
            const makerBlock = document.createElement('div');
            makerBlock.className = 'part-maker collapsed';
            
            const makerTitle = document.createElement('div');
            makerTitle.className = 'part-maker-title';
            makerTitle.innerText = makerName;
            makerTitle.addEventListener('click', (e) => {
                e.stopPropagation();
                makerBlock.classList.toggle('collapsed');
            });

            const grid = document.createElement('div');
            grid.className = 'parts-grid';

            makers[makerName].forEach(p => {
                const btn = document.createElement('div');
                btn.className = 'add-part';
                btn.dataset.type = p.key;
                
                const preview = document.createElement('div');
                preview.className = `part-preview-mini ${p.shape === 'rect' ? 'square' : 'circle'}`;
                if (p.shape === 'rect') {
                    preview.style.width = '14px'; preview.style.height = '18px';
                } else {
                    preview.style.width = '16px'; preview.style.height = '16px';
                }
                
                const span = document.createElement('span');
                span.innerText = p.label;
                
                btn.appendChild(preview);
                btn.appendChild(span);
                btn.addEventListener('click', () => addPart(p.key));
                grid.appendChild(btn);
            });

            makerBlock.appendChild(makerTitle);
            makerBlock.appendChild(grid);
            container.appendChild(makerBlock);
        }
    };

    renderCategoryMakers('lever', leversGrid);
    renderCategoryMakers('button', buttonsGrid);

    for (const key in LAYOUT_PRESETS) {
        const btn = document.createElement('button');
        btn.className = 'btn-preset';
        btn.innerText = key.charAt(0).toUpperCase() + key.slice(1);
        btn.addEventListener('click', () => {
            applyLayoutPreset(key);
            if (window.innerWidth <= 768) switchMobileView('main');
        });
        layoutsList.appendChild(btn);
    }
}

function switchMobileView(view) {
    const parts = document.getElementById('sidebar-parts');
    const main = document.getElementById('main-view');
    const props = document.getElementById('sidebar-props');
    const btnLeft = document.getElementById('btn-nav-left');
    const btnMain = document.getElementById('btn-nav-main');
    const btnRight = document.getElementById('btn-nav-right');

    [parts, main, props].forEach(el => el.classList.remove('active'));
    [btnLeft, btnMain, btnRight].forEach(el => el.classList.remove('active'));

    if (view === 'left') {
        parts.classList.add('active');
        btnLeft.classList.add('active');
    } else if (view === 'main') {
        main.classList.add('active');
        btnMain.classList.add('active');
    } else if (view === 'right') {
        props.classList.add('active');
        btnRight.classList.add('active');
    } else if (view === 'info') {
        document.getElementById('sidebar-info').classList.add('active');
        document.getElementById('btn-nav-info').classList.add('active');
    }
}

function getEvtCoords(e) {
    const evt = e.touches ? e.touches[0] : e;
    return { clientX: evt.clientX, clientY: evt.clientY };
}

function getCanvasCoords(e) {
    const coords = getEvtCoords(e);
    const rect = canvasEl.getBoundingClientRect();
    
    // Scale factor between CSS pixel size and logical internal size
    const scaleX = rect.width / state.canvasSize.width;
    const scaleY = rect.height / state.canvasSize.height;
    
    // Screen coords to local logical coords
    const localX = (coords.clientX - rect.left) / scaleX;
    const localY = (coords.clientY - rect.top) / scaleY;
    
    return {
        x: localX,
        y: state.canvasSize.height - localY // Invert Y
    };
}

function populateTypeOptions(category = null) {
    propTypeSelect.innerHTML = '';
    for (const key in PARTS_PRESETS) {
        const preset = PARTS_PRESETS[key];
        if (category && preset.category !== category) continue;
        
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = preset.label;
        propTypeSelect.appendChild(opt);
    }
}

function setupEventListeners() {
    btnResize.addEventListener('click', () => {
        state.canvasSize.width = parseInt(inputWidth.value) || 400;
        state.canvasSize.height = parseInt(inputHeight.value) || 250;
        updateCanvasSize();
        updateBgTransform(); // Background needs to re-scale too
        renderAll();
    });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', updateBgTransform);
    
    // Mouse Events for Canvas
    canvasEl.addEventListener('mousedown', handleMouseDown);
    
    // Touch Events
    canvasEl.addEventListener('touchstart', handleMouseDown, { passive: false });
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    canvasEl.addEventListener('touchend', handleMouseUp);

    // Mobile Navigation
    document.getElementById('btn-nav-left').addEventListener('click', () => switchMobileView('left'));
    document.getElementById('btn-nav-main').addEventListener('click', () => switchMobileView('main'));
    document.getElementById('btn-nav-right').addEventListener('click', () => switchMobileView('right'));
    document.getElementById('btn-nav-info').addEventListener('click', () => switchMobileView('info'));

    // PC Instructions Toggle
    const pcToggle = document.getElementById('pc-instructions-toggle');
    const pcInstructions = document.getElementById('pc-instructions');
    if (pcToggle && pcInstructions) {
        pcToggle.addEventListener('click', () => {
            pcInstructions.classList.toggle('collapsed');
        });
    }

    document.getElementById('prop-name').addEventListener('input', (e) => updateSelectedPart('name', e.target.value));
    document.getElementById('prop-type').addEventListener('change', (e) => updateSelectedPart('type', e.target.value));
    document.getElementById('prop-x').addEventListener('input', (e) => updateSelectedPart('x', parseFloat(e.target.value)));
    document.getElementById('prop-y').addEventListener('input', (e) => updateSelectedPart('y', parseFloat(e.target.value)));
    document.getElementById('prop-hole').addEventListener('input', (e) => updateSelectedPart('hole_dia', parseFloat(e.target.value)));
    document.getElementById('prop-outer').addEventListener('input', (e) => updateSelectedPart('outer_dia', parseFloat(e.target.value)));
    document.getElementById('prop-outer-w').addEventListener('input', (e) => updateSelectedPart('outer_w', parseFloat(e.target.value)));
    document.getElementById('prop-outer-h').addEventListener('input', (e) => updateSelectedPart('outer_h', parseFloat(e.target.value)));
    document.getElementById('prop-rotate-90').addEventListener('change', (e) => updateSelectedPart('isRotated90', e.target.checked));
    document.getElementById('prop-lock').addEventListener('change', (e) => updateSelectedPart('isLocked', e.target.checked));
    document.getElementById('btn-delete-part').addEventListener('click', deleteSelectedParts);

    document.getElementById('btn-clear').addEventListener('click', () => {
        if (confirm('全ての配置をクリアしますか？')) {
            state.parts = [];
            state.selectedIds = [];
            renderAll();
        }
    });

    // Canvas Background Click/Marquee
    canvasViewportEl.addEventListener('mousedown', (e) => {
        // If we hit a part, handleMouseDown will be called via bubbling/direct listener.
        // We only want to start marquee if we didn't hit a part.
        // Also check if we are clicking on the background or canvas itself.
        if (e.target === canvasViewportEl || e.target === canvasContainerEl || e.target === canvasEl) {
            if (!e.shiftKey) {
                state.selectedIds = [];
                selectPart(null);
            }
            
            state.isMarquee = true;
            const rect = canvasViewportEl.getBoundingClientRect();
            const coords = getEvtCoords(e);
            
            state.marqueeStart = {
                x: coords.clientX - rect.left,
                y: coords.clientY - rect.top
            };
            marqueeEl.style.display = 'block';
            marqueeEl.style.left = `${state.marqueeStart.x}px`;
            marqueeEl.style.top = `${state.marqueeStart.y}px`;
            marqueeEl.style.width = '0px';
            marqueeEl.style.height = '0px';
        }
    });

    // Toggle Collapsible Categories
    document.querySelectorAll('.part-category-title').forEach(title => {
        title.addEventListener('click', () => {
            title.parentElement.classList.toggle('collapsed');
        });
    });
}

function applyLayoutPreset(presetKey) {
    const data = LAYOUT_PRESETS[presetKey];
    if (data) {
        if (state.parts.length > 0 && !confirm('配置をクリアしてプリセットを読み込みますか？')) return;
        state.parts = data.map((p, index) => {
            const preset = PARTS_PRESETS[p.type] || PARTS_PRESETS[Object.keys(PARTS_PRESETS)[0]];
            return {
                id: `preset_${presetKey}_${index}`,
                type: p.type,
                category: preset.category,
                shape: preset.shape,
                x: p.x,
                y: p.y,
                isRotated90: !!p.isRotated90,
                hole_dia: preset.hole_dia,
                outer_dia: preset.outer_dia || 0,
                outer_w: preset.outer_w || 0,
                outer_h: preset.outer_h || 0,
                isLocked: false,
                name: p.name || (index + 1).toString()
            };
        });
        state.selectedIds = [];
        renderAll();
    }
}

function updateCanvasSize() {
    canvasContainerEl.style.width = `${state.canvasSize.width}px`;
    canvasContainerEl.style.height = `${state.canvasSize.height}px`;
}

function addPart(type, x = 100, y = 100) {
    const preset = PARTS_PRESETS[type] || PARTS_PRESETS[Object.keys(PARTS_PRESETS)[0]];
    if (!preset) return;
    const newPart = {
        id: `part_${Date.now()}`,
        type: type,
        category: preset.category,
        shape: preset.shape,
        x: x,
        y: y,
        isRotated90: false,
        hole_dia: preset.hole_dia,
        outer_dia: preset.outer_dia || 0,
        outer_w: preset.outer_w || 0,
        outer_h: preset.outer_h || 0,
        isLocked: false,
        name: (state.parts.length + 1).toString()
    };
    state.parts.push(newPart);
    state.selectedIds = [newPart.id];
    
    if (window.innerWidth <= 768) switchMobileView('main');
    
    selectPart(newPart.id);
    renderAll();
}

function selectPart(id) {
    if (id && !state.selectedIds.includes(id)) {
        state.selectedIds = [id];
    }
    
    if (state.selectedIds.length >= 1) {
        const firstPart = state.parts.find(p => p.id === state.selectedIds[0]);
        if (!firstPart) return;
        const allSameCategory = state.selectedIds.every(sid => {
            const p = state.parts.find(part => part.id === sid);
            return p && p.category === firstPart.category;
        });
        
        propertyPanel.style.display = 'block';
        document.getElementById('prop-controls').style.display = 'block';
        
        if (state.selectedIds.length > 1) {
            document.getElementById('prop-title').innerText = `複数選択中 (${state.selectedIds.length})${allSameCategory ? '' : ' - カテゴリ混合'}`;
        } else {
            document.getElementById('prop-title').innerText = 'パーツ詳細';
        }

        const isSingle = state.selectedIds.length === 1;
        
        // Basic visibility logic
        document.getElementById('prop-group-name').style.display = isSingle ? 'flex' : 'none';
        document.getElementById('prop-group-type').style.display = allSameCategory ? 'flex' : 'none';
        document.getElementById('prop-group-x').style.display = isSingle ? 'flex' : 'none';
        document.getElementById('prop-group-y').style.display = isSingle ? 'flex' : 'none';
        document.getElementById('prop-group-lock').style.display = 'flex'; // Always visible
        document.getElementById('prop-group-hole').style.display = allSameCategory ? 'flex' : 'none';
        document.getElementById('prop-divider').style.display = allSameCategory ? 'block' : 'none';

        if (allSameCategory) {
            populateTypeOptions(firstPart.category);
            document.getElementById('prop-type').value = firstPart.type;
            document.getElementById('prop-hole').value = firstPart.hole_dia;
            
            if (firstPart.category === 'lever') {
                document.getElementById('prop-group-outer').style.display = 'none';
                document.getElementById('prop-group-w').style.display = 'flex';
                document.getElementById('prop-group-h').style.display = 'flex';
                document.getElementById('prop-group-rotate').style.display = 'flex';
                document.getElementById('prop-outer-w').value = firstPart.outer_w;
                document.getElementById('prop-outer-h').value = firstPart.outer_h;
                document.getElementById('prop-rotate-90').checked = !!firstPart.isRotated90;
            } else {
                document.getElementById('prop-group-outer').style.display = 'flex';
                document.getElementById('prop-group-w').style.display = 'none';
                document.getElementById('prop-group-h').style.display = 'none';
                document.getElementById('prop-group-rotate').style.display = 'none';
                document.getElementById('prop-outer').value = firstPart.outer_dia;
            }
        } else {
            // Mixed category
            document.getElementById('prop-group-outer').style.display = 'none';
            document.getElementById('prop-group-w').style.display = 'none';
            document.getElementById('prop-group-h').style.display = 'none';
            document.getElementById('prop-group-rotate').style.display = 'none';
        }

        // Shared field: Lock
        const lockCheck = document.getElementById('prop-lock');
        lockCheck.checked = !!firstPart.isLocked;

        if (isSingle) {
            document.getElementById('prop-name').value = firstPart.name;
            syncPropertyPanelPositions();
            const pxInput = document.getElementById('prop-x');
            const pyInput = document.getElementById('prop-y');
            if (pxInput) pxInput.disabled = !!firstPart.isLocked;
            if (pyInput) pyInput.disabled = !!firstPart.isLocked;
        }
    } else {
        propertyPanel.style.display = 'none';
    }
    renderAll();
}

function updateSelectedPart(key, value) {
    if (state.selectedIds.length === 0) return;
    if (key !== 'isRotated90' && key !== 'name' && typeof value === 'number' && isNaN(value)) return;

    state.selectedIds.forEach(sid => {
        const part = state.parts.find(p => p.id === sid);
        if (!part) return;

        let finalValue = value;
        if (key === 'x' || key === 'y') {
            const pw = part.shape === 'rect' ? (part.isRotated90 ? part.outer_h : part.outer_w) : part.outer_dia;
            const ph = part.shape === 'rect' ? (part.isRotated90 ? part.outer_w : part.outer_h) : part.outer_dia;
            if (key === 'x') finalValue = Math.max(pw / 2, Math.min(state.canvasSize.width - pw / 2, finalValue));
            if (key === 'y') finalValue = Math.max(ph / 2, Math.min(state.canvasSize.height - ph / 2, finalValue));
            if (state.selectedIds.length === 1) document.getElementById(`prop-${key}`).value = Math.round(finalValue);
        }

        part[key] = finalValue;
        
        if (key === 'type') {
            const preset = PARTS_PRESETS[finalValue];
            if (preset) {
                part.shape = preset.shape;
                part.category = preset.category;
                part.hole_dia = preset.hole_dia;
                part.outer_dia = preset.outer_dia || 0;
                part.outer_w = preset.outer_w || 0;
                part.outer_h = preset.outer_h || 0;
            }
        }
        
        if (key === 'isLocked') {
            if (state.selectedIds.length === 1) {
                document.getElementById('prop-x').disabled = finalValue;
                document.getElementById('prop-y').disabled = finalValue;
            }
        }
    });

    checkCollisions();
    renderAll();
}

function deleteSelectedParts() {
    if (state.selectedIds.length === 0) return;
    state.parts = state.parts.filter(p => !state.selectedIds.includes(p.id));
    state.selectedIds = [];
    propertyPanel.style.display = 'none';
    renderAll();
}

function renderAll() {
    canvasEl.innerHTML = '';
    checkCollisions();
    syncPropertyPanelPositions();

    state.parts.forEach(part => {
        const isSelected = state.selectedIds.includes(part.id);
        const el = document.createElement('div');
        el.className = `part-element ${isSelected ? 'selected' : ''} ${part.hasCollision ? 'collision' : ''} ${part.isLocked ? 'locked' : ''}`;
        el.style.left = `${part.x}px`;
        el.style.bottom = `${part.y}px`; // Bottom-left coordinate
        
        // Visual Rotation check
        if (part.isRotated90) {
            el.style.transform = `translate(-50%, 50%) rotate(90deg)`;
        } else {
            el.style.transform = `translate(-50%, 50%)`;
        }
        el.dataset.id = part.id;

        const hole = document.createElement('div');
        hole.className = 'hole-circle';
        hole.style.width = `${part.hole_dia}px`;
        hole.style.height = `${part.hole_dia}px`;
        
        const outer = document.createElement('div');
        if (part.shape === 'rect') {
            outer.className = 'outer-rect';
            outer.style.width = `${part.outer_w}px`;
            outer.style.height = `${part.outer_h}px`;
        } else {
            outer.className = 'outer-circle';
            outer.style.width = `${part.outer_dia}px`;
            outer.style.height = `${part.outer_dia}px`;
        }

        const label = document.createElement('div');
        label.className = 'part-label';
        if (part.isRotated90) {
            label.style.transform = `translate(-50%, -50%) rotate(-90deg)`;
        }
        label.innerText = part.name;

        const lockIcon = document.createElement('div');
        lockIcon.className = 'lock-icon';
        lockIcon.innerText = '🔒';

        el.appendChild(outer);
        el.appendChild(hole);
        el.appendChild(label);
        if (part.isLocked) {
            el.appendChild(lockIcon);
        }

        canvasEl.appendChild(el);
    });
}

function isColliding(p1, p2, next1X = p1.x, next1Y = p1.y) {
    const tolerance = 0.5;
    const p1w = p1.shape === 'rect' ? (p1.isRotated90 ? p1.outer_h : p1.outer_w) : p1.outer_dia;
    const p1h = p1.shape === 'rect' ? (p1.isRotated90 ? p1.outer_w : p1.outer_h) : p1.outer_dia;
    const p2w = p2.shape === 'rect' ? (p2.isRotated90 ? p2.outer_h : p2.outer_w) : p2.outer_dia;
    const p2h = p2.shape === 'rect' ? (p2.isRotated90 ? p2.outer_w : p2.outer_h) : p2.outer_dia;

    if (p1.shape === 'circle' && p2.shape === 'circle') {
        const dx = next1X - p2.x;
        const dy = next1Y - p2.y;
        const distSq = dx * dx + dy * dy;
        const mindist = (p1.outer_dia / 2) + (p2.outer_dia / 2) + tolerance;
        return distSq <= mindist * mindist;
    }
    
    if (p1.shape === 'rect' && p2.shape === 'rect') {
        return Math.abs(next1X - p2.x) < (p1w/2 + p2w/2) + tolerance &&
               Math.abs(next1Y - p2.y) < (p1h/2 + p2h/2) + tolerance;
    }
    
    const circle = p1.shape === 'circle' ? p1 : p2;
    const cx = p1.shape === 'circle' ? next1X : p2.x;
    const cy = p1.shape === 'circle' ? next1Y : p2.y;
    const rect = p1.shape === 'rect' ? p1 : p2;
    const rx = p1.shape === 'rect' ? next1X : p2.x;
    const ry = p1.shape === 'rect' ? next1Y : p2.y;
    const rw = p1.shape === 'rect' ? p1w : p2w;
    const rh = p1.shape === 'rect' ? p1h : p2h;

    const closestX = Math.max(rx - rw/2, Math.min(cx, rx + rw/2));
    const closestY = Math.max(ry - rh/2, Math.min(cy, ry + rh/2));
    const dx = cx - closestX;
    const dy = cy - closestY;
    const distSq = dx * dx + dy * dy;
    const r = (circle.outer_dia / 2) + tolerance;
    return distSq <= r * r;
}

function checkCollisions() {
    state.parts.forEach(p => p.hasCollision = false);
    for (let i = 0; i < state.parts.length; i++) {
        for (let j = i + 1; j < state.parts.length; j++) {
            if (isColliding(state.parts[i], state.parts[j])) {
                state.parts[i].hasCollision = true;
                state.parts[j].hasCollision = true;
            }
        }
    }
}

function handleMouseDown(e) {
    const pos = getCanvasCoords(e);
    const isTouch = e.type.startsWith('touch');
    const tolerance = isTouch ? 10 : 0; // 10px tolerance for touch

    const hit = state.parts.find(p => {
        const dx = pos.x - p.x;
        const dy = pos.y - p.y;
        if (p.shape === 'rect') {
            const w = (p.isRotated90 ? p.outer_h : p.outer_w) + (tolerance * 2);
            const h = (p.isRotated90 ? p.outer_w : p.outer_h) + (tolerance * 2);
            return Math.abs(dx) <= w/2 && Math.abs(dy) <= h/2;
        }
        const r = (p.outer_dia / 2) + tolerance;
        return Math.sqrt(dx*dx + dy*dy) <= r;
    });

    if (hit) {
        if (isTouch) e.preventDefault();
        
        // Update selection first
        if (e.shiftKey) {
            if (!state.selectedIds.includes(hit.id)) state.selectedIds.push(hit.id);
        } else {
            if (!state.selectedIds.includes(hit.id)) state.selectedIds = [hit.id];
        }

        // Always show selection on property panel
        selectPart(hit.id);

        // Copy on Drag with Ctrl
        if (e.ctrlKey) {
            const newParts = [];
            const newSelectedIds = [];
            state.selectedIds.forEach((sid, index) => {
                const original = state.parts.find(p => p.id === sid);
                if (original && !original.isLocked) {
                    const copy = { ...original };
                    copy.id = `part_${Date.now()}_${index}`;
                    copy.name = (state.parts.length + newParts.length + 1).toString();
                    newParts.push(copy);
                    newSelectedIds.push(copy.id);
                }
            });
            state.parts.push(...newParts);
            state.selectedIds = newSelectedIds;
        }

        // Lock check: prevent dragging if any selected part is locked
        const anyLocked = state.parts.some(p => state.selectedIds.includes(p.id) && p.isLocked);
        if (anyLocked) return;

        state.isDragging = true;
        state.dragOffsets = {};
        state.selectedIds.forEach(sid => {
            const p = state.parts.find(part => part.id === sid);
            if (p) state.dragOffsets[sid] = { x: pos.x - p.x, y: pos.y - p.y };
        });
    }
}

function handleMouseMove(e) {
    const pos = getCanvasCoords(e);
    
    if (state.isMarquee) {
        if (e.type.startsWith('touch')) e.preventDefault();
        const vRect = canvasViewportEl.getBoundingClientRect();
        const coords = getEvtCoords(e);
        const curX = coords.clientX - vRect.left;
        const curY = coords.clientY - vRect.top;
        const left = Math.min(state.marqueeStart.x, curX);
        const top = Math.min(state.marqueeStart.y, curY);
        marqueeEl.style.left = `${left}px`;
        marqueeEl.style.top = `${top}px`;
        marqueeEl.style.width = `${Math.abs(state.marqueeStart.x - curX)}px`;
        marqueeEl.style.height = `${Math.abs(state.marqueeStart.y - curY)}px`;
        return;
    }
    if (!state.isDragging || state.selectedIds.length === 0) return;
    
    if (e.type.startsWith('touch')) e.preventDefault(); 

    const mouseX = pos.x;
    const mouseY = pos.y;

    const movements = [];
    let canMoveGroup = true;

    for (const sid of state.selectedIds) {
        const part = state.parts.find(p => p.id === sid);
        if (!part) continue;
        const offset = state.dragOffsets[sid];

        // Resolve actual W/H for boundary check
        const pw = part.shape === 'rect' ? (part.isRotated90 ? part.outer_h : part.outer_w) : part.outer_dia;
        const ph = part.shape === 'rect' ? (part.isRotated90 ? part.outer_w : part.outer_h) : part.outer_dia;

        // Clamp positions to keep part entirely within canvas bounds
        const nextX = Math.max(pw / 2, Math.min(state.canvasSize.width - pw / 2, mouseX - offset.x));
        const nextY = Math.max(ph / 2, Math.min(state.canvasSize.height - ph / 2, mouseY - offset.y));
        
        for (const other of state.parts) {
            if (state.selectedIds.includes(other.id)) continue;
            if (isColliding(part, other, nextX, nextY) && !isColliding(part, other)) {
                canMoveGroup = false;
                break;
            }
        }
        if (!canMoveGroup) break;
        movements.push({ part, nextX, nextY });
    }

    if (canMoveGroup) {
        movements.forEach(m => {
            m.part.x = m.nextX;
            m.part.y = m.nextY;
        });
        renderAll();
    }
}

function handleMouseUp(e) {
    if (state.isMarquee) {
        const coords = getEvtCoords(e);
        const vRect = canvasViewportEl.getBoundingClientRect();
        const curX = coords.clientX - vRect.left;
        const curY = coords.clientY - vRect.top;
        const mLeft = Math.min(state.marqueeStart.x, curX);
        const mTop = Math.min(state.marqueeStart.y, curY);
        const mRight = Math.max(state.marqueeStart.x, curX);
        const mBottom = Math.max(state.marqueeStart.y, curY);
        marqueeEl.style.display = 'none';
        state.isMarquee = false;
        
        const cRect = canvasContainerEl.getBoundingClientRect();
        const cLeft = cRect.left - vRect.left;
        const cTop = cRect.top - vRect.top;
        state.parts.forEach(part => {
            const pX = cLeft + part.x;
            const pY = cTop + (state.canvasSize.height - part.y);
            if (pX >= mLeft && pX <= mRight && pY >= mTop && pY <= mBottom) {
                if (!state.selectedIds.includes(part.id)) state.selectedIds.push(part.id);
            }
        });
        selectPart(null);
    }
    state.isDragging = false;
}

document.getElementById('bg-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('bg-upload-label').innerText = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
            bgLayer.src = event.target.result;
            bgLayer.style.display = 'block';
            updateBgOpacity();
            updateBgTransform(); // Apply centering transform immediately
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('btn-bg-clear').addEventListener('click', () => {
    bgLayer.src = '';
    bgLayer.style.display = 'none';
    document.getElementById('bg-upload').value = '';
    document.getElementById('bg-upload-label').innerText = 'ファイル未選択';
    // Reset transform state
    state.bgScale = 1.0;
    state.bgX = 0;
    state.bgY = 0;
    document.getElementById('bg-scale').value = 1.0;
    document.getElementById('bg-scale-val').innerText = '1.00x';
    document.getElementById('bg-x').value = 0;
    document.getElementById('bg-y').value = 0;
    updateBgTransform();
});

function updateBgTransform() {
    if (!bgLayer) return;
    
    // Calculate the current CSS pixel per mm ratio
    const rect = canvasEl.getBoundingClientRect();
    const mmToPx = rect.width / state.canvasSize.width;
    
    const xPx = state.bgX * mmToPx;
    const yPx = -state.bgY * mmToPx; // Negative because CSS Y is down, we want logical Y up
    
    // Base translate(-50%, -50%) to account for the CSS centering
    bgLayer.style.transform = `translate(-50%, -50%) translate(${xPx}px, ${yPx}px) scale(${state.bgScale})`;
}

document.getElementById('bg-scale').addEventListener('input', (e) => {
    state.bgScale = parseFloat(e.target.value);
    document.getElementById('bg-scale-val').innerText = `${state.bgScale.toFixed(2)}x`;
    updateBgTransform();
});

document.getElementById('bg-x').addEventListener('input', (e) => {
    state.bgX = parseFloat(e.target.value) || 0;
    updateBgTransform();
});

document.getElementById('bg-y').addEventListener('input', (e) => {
    state.bgY = parseFloat(e.target.value) || 0;
    updateBgTransform();
});

function updateBgOpacity() {
    const opacity = document.getElementById('bg-opacity').value / 100;
    if (bgLayer) bgLayer.style.opacity = opacity;
}

document.getElementById('bg-opacity').addEventListener('input', updateBgOpacity);

document.getElementById('btn-export-csv').addEventListener('click', () => {
    if (state.parts.length === 0) return alert('パーツが配置されていません。');
    // Header includes canvas size
    let csv = "id,name,type,x,y,isLocked,isRotated90,hole_dia,outer_dia,outer_w,outer_h,canvasW,canvasH\n";
    state.parts.forEach(p => {
        csv += `${p.id},${p.name},${p.type},${p.x},${p.y},${p.isLocked ? 1 : 0},${p.isRotated90 ? 1 : 0},${p.hole_dia},${p.outer_dia},${p.outer_w},${p.outer_h},${state.canvasSize.width},${state.canvasSize.height}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "layout.csv"; a.click();
});

document.getElementById('btn-import-csv').addEventListener('click', () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv';
    inp.onchange = (e) => {
        const f = e.target.files[0];
        const r = new FileReader();
        r.onload = (ev) => {
            const lines = ev.target.result.split('\n').filter(line => line.trim() !== '');
            const newParts = [];
            let canvasUpdated = false;
            
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',');
                if (row.length < 11) continue;
                
                // Update canvas size if present in CSV
                if (!canvasUpdated && row.length >= 13) {
                    state.canvasSize.width = parseInt(row[11]) || state.canvasSize.width;
                    state.canvasSize.height = parseInt(row[12]) || state.canvasSize.height;
                    inputWidth.value = state.canvasSize.width;
                    inputHeight.value = state.canvasSize.height;
                    updateCanvasSize();
                    canvasUpdated = true;
                }

                const type = row[2];
                const preset = PARTS_PRESETS[type] || Object.values(PARTS_PRESETS)[0];
                
                newParts.push({
                    id: row[0],
                    name: row[1],
                    type: type,
                    x: parseFloat(row[3]),
                    y: parseFloat(row[4]),
                    isLocked: row[5] === '1',
                    isRotated90: row[6] === '1',
                    hole_dia: parseFloat(row[7]),
                    outer_dia: parseFloat(row[8]),
                    outer_w: parseFloat(row[9]),
                    outer_h: parseFloat(row[10]),
                    category: preset ? preset.category : 'button',
                    shape: preset ? preset.shape : 'circle'
                });
            }
            state.parts = newParts; 
            state.selectedIds = []; 
            selectPart(null); 
            renderAll();
        };
        r.readAsText(f);
    };
    inp.click();
});

canvasEl.addEventListener('mousedown', (e) => { if (e.target === canvasEl) selectPart(null); });

init();
// Keyboard events for deleting and moving parts
window.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (state.selectedIds.length === 0) return;

    // Delete parts
    if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const remaining = state.parts.filter(p => !state.selectedIds.includes(p.id));
        state.parts = remaining;
        state.selectedIds = [];
        selectPart(null);
        renderAll();
        return;
    }

    // Move parts with arrow keys (1mm = 1px)
    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp') dy = 1;
    if (e.key === 'ArrowDown') dy = -1;
    if (e.key === 'ArrowLeft') dx = -1;
    if (e.key === 'ArrowRight') dx = 1;

    if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        state.selectedIds.forEach(id => {
            const p = state.parts.find(part => part.id === id);
            if (p && !p.isLocked) {
                p.x += dx;
                p.y += dy;
            }
        });
        renderAll();
    }
});

/**
 * README Modal Logic
 */
const btnReadme = document.getElementById('btn-readme');
const modalReadme = document.getElementById('modal-readme');
const btnCloseModal = document.getElementById('btn-close-modal');
const readmeContainer = document.getElementById('readme-container');

if (btnReadme && modalReadme) {
    btnReadme.addEventListener('click', async () => {
        modalReadme.style.display = 'flex';
        // Only fetch if content is still placeholder
        if (readmeContainer.innerHTML.includes('読み込み中')) {
            try {
                const response = await fetch('/apps/web/arcade-layout/README.md');
                if (response.ok) {
                    const md = await response.text();
                    readmeContainer.innerHTML = parseSimpleMarkdown(md);
                } else {
                    readmeContainer.innerHTML = '<p>READMEの読込に失敗しました。</p>';
                }
            } catch (e) {
                readmeContainer.innerHTML = '<p>エラーが発生しました。</p>';
            }
        }
    });
}

if (btnCloseModal && modalReadme) {
    btnCloseModal.addEventListener('click', () => {
        modalReadme.style.display = 'none';
    });
    modalReadme.addEventListener('click', (e) => {
        if (e.target === modalReadme) modalReadme.style.display = 'none';
    });
}

function parseSimpleMarkdown(md) {
    return md
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>') // Basic list
        .replace(/<\/ul>\n<ul>/g, '') // Combine lists
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/^---$/gm, '<hr>')
        .replace(/\n\s*\n/g, '<p></p>')
        .replace(/\n/g, '<br>');
}
