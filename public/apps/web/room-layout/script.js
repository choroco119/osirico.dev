
/**
 * RoomLayoutDesigner - Core Engine
 * (c) 2026 osirico.dev
 */

const STATE = {
    room: {
        vertices: [
            { x: 0, y: 0 },
            { x: 5000, y: 0 },
            { x: 5000, y: 4000 },
            { x: 0, y: 4000 }
        ]
    },
    objects: [],
    selection: {
        type: null, // 'object' or 'vertex'
        ids: []
    },
    config: {
        units: 'mm',
        scale: 0.1, // 1mm = 0.1px default
        offsetX: 100,
        offsetY: 600,
        showGrid: true,
        showDims: true,
        enableCollision: true
    },
    interaction: {
        isDragging: false,
        lastMouseX: 0,
        lastMouseY: 0,
        mode: 'select', // 'select', 'add'
        dragTarget: null,
        marqueeStart: null
    },
    keys: {
        shift: false,
        ctrl: false
    },
    dragHasDuplicated: false,
    currentMobileView: 'main' // 'left', 'main', 'right', 'info'
};

// UI Elements
const els = {
    canvasContainer: document.getElementById('canvas-container'),
    canvas: document.getElementById('canvas'),
    wallSvg: document.getElementById('wall-svg'),
    bgImgLayer: document.getElementById('bg-img-layer'),
    vertexLayer: document.getElementById('vertex-layer'),
    propPanel: document.getElementById('property-panel'),
    noSelectionMsg: document.getElementById('no-selection-msg'),
    zoomLevel: document.getElementById('zoom-level'),
    // Mobile views
    sidebarParts: document.getElementById('sidebar-parts'),
    canvasViewport: document.querySelector('.canvas-viewport'),
    sidebarProps: document.getElementById('sidebar-props'),
    sidebarInfo: document.getElementById('sidebar-info'),
    mobileNavButtons: document.querySelectorAll('.nav-btn')
};

// Initialize
function init() {
    setupEventListeners();
    
    // Initial mobile setup
    if (window.innerWidth <= 768) {
        switchMobileView('main');
    }

    render();
    console.log("RoomLayoutDesigner Initialized.");
}

function setupEventListeners() {
    // Canvas interaction
    els.canvasContainer.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Touch support
    els.canvasContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) return; // Handle pinch-zoom separately if needed
        handleMouseDown(e);
    }, { passive: false });
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp, { passive: false });

    els.canvasContainer.addEventListener('wheel', handleWheel, { passive: false });
    els.canvasContainer.addEventListener('contextmenu', (e) => e.preventDefault());

    // Buttons
    document.getElementById('btn-reset-walls').onclick = resetWalls;
    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.onclick = () => {
            addObject(btn.dataset.shape);
            if (window.innerWidth <= 768) switchMobileView('main');
        };
    });

    // Zoom
    document.getElementById('zoom-in').onclick = () => changeZoom(0.01);
    document.getElementById('zoom-out').onclick = () => changeZoom(-0.01);

    // Global Actions
    document.getElementById('btn-clear').onclick = resetAll;

    // Operation Guide toggle
    const instrHeader = document.getElementById('instructions-header');
    if (instrHeader) {
        instrHeader.onclick = () => {
            document.getElementById('pc-instructions').classList.toggle('collapsed');
        };
    }

    // Mobile Navigation
    document.getElementById('btn-nav-left').onclick = () => switchMobileView('left');
    document.getElementById('btn-nav-main').onclick = () => switchMobileView('main');
    document.getElementById('btn-nav-right').onclick = () => switchMobileView('right');
    document.getElementById('btn-nav-info').onclick = () => switchMobileView('info');

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') STATE.keys.shift = true;
        if (e.key === 'Control') STATE.keys.ctrl = true;
        handleKeyDown(e);
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') STATE.keys.shift = false;
        if (e.key === 'Control') STATE.keys.ctrl = false;
    });

    document.getElementById('btn-export-json').onclick = exportJSON;
    document.getElementById('btn-import-json').onclick = () => document.getElementById('import-file').click();
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'import-file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.onchange = (e) => importJSON(e);
    document.body.appendChild(fileInput);

    // Background Image Import
    const btnImportBg = document.getElementById('btn-import-bg');
    if (btnImportBg) {
        btnImportBg.onclick = () => document.getElementById('import-bg-file').click();
    }
    const bgFileInput = document.createElement('input');
    bgFileInput.type = 'file';
    bgFileInput.id = 'import-bg-file';
    bgFileInput.accept = 'image/*';
    bgFileInput.style.display = 'none';
    bgFileInput.onchange = (e) => importBgImage(e);
    document.body.appendChild(bgFileInput);
    
    // Property Panel buttons
    const btnDuplicate = document.getElementById('btn-duplicate-object');
    if (btnDuplicate) {
        btnDuplicate.onclick = () => {
            duplicateSelected({ x: 50, y: 50 });
            updatePropertyPanel();
            render();
        };
    }
    
    const btnDelete = document.getElementById('btn-delete-object');
    if (btnDelete) {
        btnDelete.onclick = () => {
            deleteSelected();
        };
    }


    // Property Panel inputs
    setupPropertyListeners();
}

/**
 * Switch between views on mobile
 * @param {'left'|'main'|'right'|'info'} view 
 */
function switchMobileView(view) {
    STATE.currentMobileView = view;
    
    // Toggle sidebars & viewport
    els.sidebarParts.classList.toggle('active', view === 'left');
    els.canvasViewport.classList.toggle('active', view === 'main');
    els.sidebarProps.classList.toggle('active', view === 'right');
    els.sidebarInfo.classList.toggle('active', view === 'info');

    // Update nav buttons
    els.mobileNavButtons.forEach(btn => {
        btn.classList.remove('active');
        if (view === 'left' && btn.id === 'btn-nav-left') btn.classList.add('active');
        if (view === 'main' && btn.id === 'btn-nav-main') btn.classList.add('active');
        if (view === 'right' && btn.id === 'btn-nav-right') btn.classList.add('active');
        if (view === 'info' && btn.id === 'btn-nav-info') btn.classList.add('active');
    });

    // Ensure render happens if switching to canvas
    if (view === 'main') render();
}

function getEvtCoords(e) {
    if (e.touches && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
}

function setupPropertyListeners() {
    const inputs = ['prop-name', 'prop-x', 'prop-y', 'prop-rotation', 'prop-layer', 'prop-lock', 'prop-collision', 'prop-memo'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', updateSelectedObject);
        if (el.type === 'checkbox') {
            el.addEventListener('change', updateSelectedObject);
        }
    });
    document.getElementById('btn-delete-object').addEventListener('click', (e) => {
        e.preventDefault();
        deleteSelected();
    });
}

// --- RENDERING ---

function render() {
    const { scale, offsetX, offsetY, backgroundImage } = STATE.config;
    
    // Update Canvas Container Transform
    els.canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    els.wallSvg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    els.vertexLayer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    
    if (els.bgImgLayer) {
        if (backgroundImage) {
            els.bgImgLayer.src = backgroundImage;
            els.bgImgLayer.style.display = 'block';
            els.bgImgLayer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        } else {
            els.bgImgLayer.style.display = 'none';
        }
    }

    renderWalls();
    renderObjects();
    renderVertices();
    updateZoomDisplay();
}

function renderWalls() {
    const { vertices } = STATE.room;
    let pathData = `M ${vertices[0].x} ${-vertices[0].y} `;
    for (let i = 1; i < vertices.length; i++) {
        pathData += `L ${vertices[i].x} ${-vertices[i].y} `;
    }
    pathData += 'Z';

    els.wallSvg.innerHTML = `
        <path d="${pathData}" fill="rgba(74, 158, 255, 0.05)" stroke="var(--accent)" stroke-width="${10 / STATE.config.scale}" stroke-linejoin="round" />
        ${renderWallDimensions()}
    `;
}

function renderWallDimensions() {
    if (!STATE.config.showDims) return '';
    const { vertices } = STATE.room;
    let dims = '';
    for (let i = 0; i < vertices.length; i++) {
        const next = vertices[(i + 1) % vertices.length];
        const dist = Math.sqrt((next.x - vertices[i].x)**2 + (next.y - vertices[i].y)**2);
        const midX = (vertices[i].x + next.x) / 2;
        const midY = -(vertices[i].y + next.y) / 2; // inverted 
        const dy = -(next.y - vertices[i].y); // inverted
        const dx = next.x - vertices[i].x;
        const angle = Math.atan2(dy, dx);
        
        dims += `<text x="${midX}" y="${midY}" fill="var(--accent)" font-size="${12 / STATE.config.scale}" text-anchor="middle" transform="rotate(${angle * 180 / Math.PI}, ${midX}, ${midY}) translate(0, -${15 / STATE.config.scale})">${Math.round(dist)}mm</text>`;
    }
    return dims;
}

function renderObjects() {
    els.canvas.innerHTML = '';
    STATE.objects.forEach(obj => {
        const el = document.createElement('div');
        el.className = `furniture-obj ${STATE.selection.ids.includes(obj.id) ? 'selected' : ''}`;
        el.id = `obj-${obj.id}`;
        
        // Basic style
        el.style.left = `${obj.x}px`;
        el.style.top = `${-obj.y}px`; // Inverted Y
        el.style.backgroundColor = obj.color || 'var(--accent)';
        el.style.transform = `translate(-50%, -50%) rotate(${-obj.rotation || 0}deg)`;
        el.style.zIndex = 10;

        if (obj.shape === 'rectangle') {
            el.style.width = `${obj.width}px`;
            el.style.height = `${obj.depth}px`;
        } else if (obj.shape === 'circle') {
            el.style.width = `${obj.radius * 2}px`;
            el.style.height = `${obj.radius * 2}px`;
            el.style.borderRadius = '50%';
        }
        
        // Add name label
        const label = document.createElement('span');
        label.className = 'name-label';
        label.style.fontSize = `${12 / STATE.config.scale}px`;
        
        // Show lock icon if locked
        if (obj.isLocked) {
            label.innerHTML = `
                <svg class="lock-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                ${obj.name || 'Obj'}
            `;
        } else {
            label.innerText = obj.name || 'Obj';
        }
        
        el.appendChild(label);
        
        // Collision highlight
        if (obj.isColliding) {
            el.style.border = '3px solid var(--danger)';
            el.style.boxShadow = '0 0 20px var(--danger)';
        }

        el.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            selectObject(obj.id, true, e.shiftKey || STATE.keys.shift);
        });

        els.canvas.appendChild(el);
    });
}

function renderVertices() {
    els.vertexLayer.innerHTML = '';
    STATE.room.vertices.forEach((v, idx) => {
        const dot = document.createElement('div');
        const isSelected = STATE.selection.type === 'vertex' && STATE.selection.ids[0] === idx;
        dot.className = `vertex-dot ${isSelected ? 'selected' : ''} ${v.isLocked ? 'locked' : ''}`;
        
        // Custom styling based on selection and lock state
        if (isSelected) {
            dot.style.background = 'var(--bg-dark)';
            dot.style.borderColor = 'var(--text-primary)';
        }
        if (v.isLocked) {
            dot.style.borderStyle = 'dotted';
        }

        // Position in SVG space, transformed via container
        dot.style.left = `${v.x}px`;
        dot.style.top = `${-v.y}px`; // Inverted Y
        dot.style.width = `${12 / STATE.config.scale}px`;
        dot.style.height = `${12 / STATE.config.scale}px`;
        dot.style.borderWidth = `${3 / STATE.config.scale}px`;
        
        dot.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            startVertexDrag(idx);
        });
        els.vertexLayer.appendChild(dot);
    });
}

// --- INTERACTION ---

function handleMouseDown(e) {
    const coords = getEvtCoords(e);
    const { scale, offsetX, offsetY } = STATE.config;
    const rect = els.canvasContainer.getBoundingClientRect();
    const x = coords.clientX - rect.left;
    const y = coords.clientY - rect.top;
    const mouseX = (x - offsetX) / scale;
    const mouseY = -(y - offsetY) / scale; // Inverted Y

    if (e.button === 2 || e.altKey || (e.touches && e.touches.length > 1)) {
        STATE.interaction.isPanning = true;
    } else {
        // Check for edge click to add vertex
        if (checkEdgeClick(mouseX, mouseY)) {
            render();
            return;
        }

        // Start marquee selection if not clicking on anything else
        STATE.interaction.marqueeStart = { x: coords.clientX, y: coords.clientY };
        
        if (!e.shiftKey && !STATE.keys.shift) {
            STATE.selection.ids = [];
            STATE.selection.type = null;
        }
        updatePropertyPanel();
        render();
    }

    STATE.interaction.lastMouseX = coords.clientX;
    STATE.interaction.lastMouseY = coords.clientY;
}

function checkEdgeClick(x, y) {
    const { vertices } = STATE.room;
    const threshold = 15 / STATE.config.scale; // mm threshold adjusted by zoom

    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];
        
        const dist = distToSegment({ x, y }, p1, p2);
        if (dist < threshold) {
            // Add vertex at midpoint
            const newVertex = { x, y }; // Use click position for now
            vertices.splice(i + 1, 0, newVertex);
            startVertexDrag(i + 1);
            return true;
        }
    }
    return false;
}

function distToSegment(p, v, w) {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
    if (l2 == 0) return Math.sqrt((p.x - v.x)**2 + (p.y - v.y)**2);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const proj = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
    return Math.sqrt((p.x - proj.x)**2 + (p.y - proj.y)**2);
}

function handleMouseMove(e) {
    const coords = getEvtCoords(e);
    const dx = coords.clientX - STATE.interaction.lastMouseX;
    const dy = coords.clientY - STATE.interaction.lastMouseY;
    
    if (STATE.interaction.isPanning) {
        STATE.config.offsetX += dx;
        STATE.config.offsetY += dy;
        render();
    } else if (STATE.interaction.dragTarget) {
        const { target, type, index } = STATE.interaction.dragTarget;
        const moveX = dx / STATE.config.scale;
        const moveY = -dy / STATE.config.scale; // Inverted Y

        if (type === 'object') {
            // Ctrl + Drag to duplicate
            if ((e.ctrlKey || STATE.keys.ctrl) && !STATE.dragHasDuplicated) {
                const idMap = duplicateSelected();
                STATE.dragHasDuplicated = true;
                
                // If we were dragging an object, switch the drag target to the new copy
                if (STATE.interaction.dragTarget && STATE.interaction.dragTarget.type === 'object') {
                    const originalId = STATE.interaction.dragTarget.target.id;
                    if (idMap && idMap[originalId]) {
                        STATE.interaction.dragTarget.target = idMap[originalId];
                    }
                }
            }

            const selectedObjects = STATE.selection.ids
                .map(id => STATE.objects.find(o => o.id === id))
                .filter(o => o && !o.isLocked);
            
            // If dragging an object that is NOT selected, just move that one (if NOT locked)
            const targets = selectedObjects.some(o => o.id === target.id) 
                ? selectedObjects 
                : (target.isLocked ? [] : [target]);

            if (STATE.config.enableCollision) {
                const canMoveAll = targets.every(o => {
                    const wasInside = isCompletelyInsideRoom(o, STATE.room.vertices);
                    o.x += moveX;
                    o.y += moveY;
                    const nowInside = isCompletelyInsideRoom(o, STATE.room.vertices);
                    
                    let cancelMove = false;
                    // Block moving from inside to outside if collision is enabled
                    if (o.enableCollision !== false && wasInside && !nowInside) cancelMove = true;

                    // Only block if a valid collision occurs (both inside and set to collide)
                    if (!cancelMove && testCollisionWithAny(o, STATE.objects)) cancelMove = true;
                    
                    o.x -= moveX;
                    o.y -= moveY;
                    return !cancelMove;
                });

                if (canMoveAll) {
                    targets.forEach(o => {
                        o.x += moveX;
                        o.y += moveY;
                    });
                }
            } else {
                targets.forEach(o => {
                    if (!o.isLocked) {
                        o.x += moveX;
                        o.y += moveY;
                    }
                });
            }
            checkCollisions();
            updatePropertyPanel();
        } else if (type === 'vertex') {
            const v = STATE.room.vertices[index];
            if (!v.isLocked) {
                v.x += moveX;
                v.y += moveY;
                updatePropertyPanel();
            }
        }
        render();
    } else if (STATE.interaction.marqueeStart) {
        updateMarquee(e);
    }

    STATE.interaction.lastMouseX = e.clientX;
    STATE.interaction.lastMouseY = e.clientY;
}

function updateMarquee(e) {
    const start = STATE.interaction.marqueeStart;
    const current = { x: e.clientX, y: e.clientY };
    
    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const width = Math.abs(start.x - current.x);
    const height = Math.abs(start.y - current.y);
    
    const marquee = document.getElementById('selection-marquee');
    marquee.style.display = 'block';
    marquee.style.left = `${x}px`;
    marquee.style.top = `${y}px`;
    marquee.style.width = `${width}px`;
    marquee.style.height = `${height}px`;
}

function handleMouseUp(e) {
    if (STATE.interaction.marqueeStart) {
        finalizeMarquee(e);
    }
    STATE.interaction.isPanning = false;
    STATE.interaction.dragTarget = null;
    STATE.interaction.marqueeStart = null;
    STATE.dragHasDuplicated = false; // Reset duplicate flag

    // Clear temporary collision disable flag from all objects
    STATE.objects.forEach(obj => {
        delete obj.tempDisableCollision;
    });
    
    checkCollisions();
    render();
}

function finalizeMarquee(e) {
    const marquee = document.getElementById('selection-marquee');
    if (marquee.style.display === 'none' || !STATE.interaction.marqueeStart) {
        marquee.style.display = 'none';
        return;
    }

    const rect = marquee.getBoundingClientRect();
    const { x: x1, y: y1 } = screenToModel(rect.left, rect.top);
    const { x: x2, y: y2 } = screenToModel(rect.right, rect.bottom);

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    const hitIds = [];
    STATE.objects.forEach(obj => {
        let isInside = false;
        if (obj.shape === 'rectangle') {
            const w2 = obj.width / 2;
            const d2 = obj.depth / 2;
            const objMinX = obj.x - w2;
            const objMaxX = obj.x + w2;
            const objMinY = obj.y - d2;
            const objMaxY = obj.y + d2;
            isInside = !(objMaxX < minX || objMinX > maxX || objMaxY < minY || objMinY > maxY);
        } else if (obj.shape === 'circle') {
            isInside = !(obj.x + obj.radius < minX || obj.x - obj.radius > maxX || obj.y + obj.radius < minY || obj.y - obj.radius > maxY);
        }
        
        if (isInside) hitIds.push(obj.id);
    });

    if (e.shiftKey || STATE.keys.shift) {
        hitIds.forEach(id => {
            if (!STATE.selection.ids.includes(id)) STATE.selection.ids.push(id);
        });
    } else {
        STATE.selection.ids = hitIds;
    }

    if (STATE.selection.ids.length > 0) {
        STATE.selection.type = 'object';
    } else if (!e.shiftKey && !STATE.keys.shift) {
        STATE.selection.type = null;
    }

    marquee.style.display = 'none';
    updatePropertyPanel();
    render();
}

function screenToModel(clientX, clientY) {
    const canvasRect = els.canvasContainer.getBoundingClientRect();
    const { scale, offsetX, offsetY } = STATE.config;
    
    const x = (clientX - canvasRect.left - offsetX) / scale;
    const y = (offsetY - (clientY - canvasRect.top)) / scale;
    return { x, y };
}

function handleWheel(e) {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.01 : 0.01;
    changeZoom(zoomDelta);
}

function changeZoom(delta) {
    STATE.config.scale += delta;
    STATE.config.scale = Math.max(0.01, Math.min(2.0, STATE.config.scale));
    render();
}

function updateZoomDisplay() {
    els.zoomLevel.innerText = `${Math.round(STATE.config.scale * 1000)}%`;
}

// --- OPERATIONS ---

function addObject(shape) {
    const id = Date.now().toString();
    
    // Add to screen center (model coord depends on pan/zoom)
    const { x: startX, y: startY } = screenToModel(
        els.canvasContainer.getBoundingClientRect().left + els.canvasContainer.clientWidth / 2,
        els.canvasContainer.getBoundingClientRect().top + els.canvasContainer.clientHeight / 2
    );

    const name = generateNextName(shape);

    const newObj = {
        id,
        name,
        shape,
        x: Math.round(startX),
        y: Math.round(startY),
        rotation: 0,
        layer: 'floor',
        color: '#4a9eff',
        isColliding: false,
        enableCollision: true,
        memo: ""
    };

    if (shape === 'rectangle') {
        newObj.width = 1200;
        newObj.depth = 600;
    } else if (shape === 'circle') {
        newObj.radius = 300;
    }

    STATE.objects.push(newObj);
    selectObject(id, false);
    render();
}

function exportJSON() {
    const data = JSON.stringify({ 
        room: STATE.room, 
        objects: STATE.objects,
        config: STATE.config
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room_layout_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.room) STATE.room = data.room;
            if (data.objects) STATE.objects = data.objects;
            if (data.config) STATE.config = { ...STATE.config, ...data.config };
            render();
            updatePropertyPanel();
        } catch (err) {
            alert('JSONの読み込みに失敗しました');
        }
    };
    reader.readAsText(file);
}

function importBgImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        STATE.config.backgroundImage = e.target.result;
        render();
    };
    reader.readAsDataURL(file);
}

function selectObject(id, startDrag = true, shiftKey = false) {
    const isAlreadySelected = STATE.selection.ids.includes(id) && STATE.selection.type === 'object';

    if (shiftKey) {
        if (STATE.selection.type === 'vertex') {
            STATE.selection.ids = [];
        }
        STATE.selection.type = 'object';
        const idx = STATE.selection.ids.indexOf(id);
        if (idx > -1) {
            STATE.selection.ids.splice(idx, 1);
        } else {
            STATE.selection.ids.push(id);
        }
    } else {
        if (!isAlreadySelected) {
            STATE.selection.ids = [id];
            STATE.selection.type = 'object';
        }
    }

    if (STATE.selection.ids.length === 0) {
        STATE.selection.type = null;
    }

    const obj = STATE.objects.find(o => o.id === id);
    if (startDrag && obj) {
        STATE.interaction.dragTarget = { type: 'object', target: obj };
    } else {
        STATE.interaction.dragTarget = null;
    }
    updatePropertyPanel();
    render();
}

function startVertexDrag(idx) {
    STATE.selection.type = 'vertex';
    STATE.selection.ids = [idx];
    STATE.interaction.dragTarget = { type: 'vertex', index: idx };
    updatePropertyPanel();
    render();
}

function resetAll() {
    if (!confirm('家具と間取りをすべてクリアして初期状態に戻しますか？')) return;
    
    // 1. Reset Room
    STATE.room.vertices = [
        { x: 0, y: 0 },
        { x: 5000, y: 0 },
        { x: 5000, y: 4000 },
        { x: 0, y: 4000 }
    ];

    // 2. Clear all objects
    STATE.objects = [];

    // 3. Reset config (Zoom & Pan)
    STATE.config.scale = 0.1;
    STATE.config.offsetX = 100;
    STATE.config.offsetY = 600;

    // 4. Clear selection
    STATE.selection.ids = [];
    STATE.selection.type = null;

    // 5. Update UI
    updateZoomDisplay();
    updatePropertyPanel();
    render();
}

function resetWalls() {
    STATE.room.vertices = [
        { x: 0, y: 0 },
        { x: 5000, y: 0 },
        { x: 5000, y: 4000 },
        { x: 0, y: 4000 }
    ];
    render();
}

function handleKeyDown(e) {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (STATE.selection.type) {
            e.preventDefault();
            deleteSelected();
        }
        return;
    }

    if (e.key.startsWith('Arrow')) {
        if (STATE.selection.type === 'vertex') {
            const v = STATE.room.vertices[STATE.selection.ids[0]];
            if (v && !v.isLocked) {
                e.preventDefault();
                const step = e.shiftKey ? 100 : 10;
                if (e.key === 'ArrowUp') v.y += step; // Y goes up!
                if (e.key === 'ArrowDown') v.y -= step;
                if (e.key === 'ArrowLeft') v.x -= step;
                if (e.key === 'ArrowRight') v.x += step;
                updatePropertyPanel();
                render();
            }
        } else if (STATE.selection.type === 'object') {
            const selectedObjects = STATE.selection.ids
                .map(id => STATE.objects.find(o => o.id === id))
                .filter(o => o && !o.isLocked);
            
            if (selectedObjects.length > 0) {
                e.preventDefault();
                const step = e.shiftKey ? 100 : 10;
                
                const canMoveAll = selectedObjects.every(obj => {
                    const wasInside = isCompletelyInsideRoom(obj, STATE.room.vertices);
                    const wasCollidingObj = testCollisionWithAny(obj, STATE.objects);

                    let dx = 0, dy = 0;
                    if (e.key === 'ArrowUp') dy = step;
                    if (e.key === 'ArrowDown') dy = -step;
                    if (e.key === 'ArrowLeft') dx = -step;
                    if (e.key === 'ArrowRight') dx = step;

                    obj.x += dx;
                    obj.y += dy;
                    
                    let cancelMove = false;
                    if (STATE.config.enableCollision) {
                        if (testCollisionWithAny(obj, STATE.objects)) cancelMove = true;
                        if (wasInside && !isCompletelyInsideRoom(obj, STATE.room.vertices)) cancelMove = true;
                    }

                    // Revert
                    obj.x -= dx;
                    obj.y -= dy;
                    return !cancelMove;
                });

                if (canMoveAll) {
                    selectedObjects.forEach(obj => {
                        if (e.key === 'ArrowUp') obj.y += step;
                        if (e.key === 'ArrowDown') obj.y -= step;
                        if (e.key === 'ArrowLeft') obj.x -= step;
                        if (e.key === 'ArrowRight') obj.x += step;
                    });
                }

                checkCollisions();
                updatePropertyPanel();
                render();
            }
        }
    }
}

// --- PROPERTIES ---

function updatePropertyPanel() {
    if (STATE.selection.type === 'object') {
        const selectedIds = STATE.selection.ids;
        const isMulti = selectedIds.length > 1;
        const obj = STATE.objects.find(o => o.id === selectedIds[0]);
        if (!obj) return;

        els.propPanel.style.display = 'block';
        els.noSelectionMsg.style.display = 'none';

        document.getElementById('prop-title').innerText = isMulti ? `一括編集 (${selectedIds.length}件)` : 'オブジェクト詳細';

        // Toggle visibility based on multi-select
        document.getElementById('group-prop-name').style.display = isMulti ? 'none' : 'flex';
        document.getElementById('group-prop-x').style.display = isMulti ? 'none' : 'flex';
        document.getElementById('group-prop-y').style.display = isMulti ? 'none' : 'flex';
        document.getElementById('group-prop-rotation').style.display = isMulti ? 'none' : 'flex';
        document.getElementById('dim-controls').style.display = isMulti ? 'none' : 'block';
        const groupPropMemo = document.getElementById('group-prop-memo');
        if (groupPropMemo) groupPropMemo.style.display = isMulti ? 'none' : 'flex';
        
        // Show object-specific props (might have been hidden by vertex selection)
        document.getElementById('object-specific-props').style.display = 'block';
        document.getElementById('btn-duplicate-object').style.display = 'block';
        
        document.getElementById('btn-delete-object').innerText = isMulti ? '一括削除' : '削除';

        // Set values from first object
        document.getElementById('prop-name').value = obj.name || '';
        document.getElementById('prop-x').value = Math.round(obj.x);
        document.getElementById('prop-y').value = Math.round(obj.y);
        document.getElementById('prop-lock').checked = !!obj.isLocked;
        document.getElementById('prop-collision').checked = obj.enableCollision !== false;
        document.getElementById('prop-rotation').value = obj.rotation || 0;
        document.getElementById('prop-layer').value = obj.layer || 'floor';
        const propMemo = document.getElementById('prop-memo');
        if (propMemo) propMemo.value = obj.memo || '';

        // Disable inputs if locked (especially for single select)
        const locked = !!obj.isLocked;
        ['prop-x', 'prop-y', 'prop-rotation', 'prop-collision'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.disabled = locked && !isMulti; // Allow unlocking in multi-select if needed, but let's keep it simple
        });

        // Simple Color Palette
        const palette = document.getElementById('color-palette');
        const colors = ['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6'];
        palette.innerHTML = '';
        colors.forEach(col => {
            const btn = document.createElement('div');
            btn.className = `color-chip ${obj.color === col ? 'active' : ''}`;
            btn.style.backgroundColor = col;
            btn.onclick = () => {
                selectedIds.forEach(id => {
                    const target = STATE.objects.find(o => o.id === id);
                    if (target) target.color = col;
                });
                updatePropertyPanel();
                render();
            };
            palette.appendChild(btn);
        });

        // Dynamic dims (Single select only)
        const dimBox = document.getElementById('dim-controls');
        dimBox.innerHTML = '';
        if (!isMulti) {
            if (obj.shape === 'rectangle') {
                dimBox.innerHTML = `
                    <div class="input-group"><label>幅 W (mm)</label><input type="number" id="prop-w" value="${obj.width}"></div>
                    <div class="input-group" style="margin-top: 12px;"><label>奥行 D (mm)</label><input type="number" id="prop-d" value="${obj.depth}"></div>
                `;
                document.getElementById('prop-w').oninput = (e) => { obj.width = Number(e.target.value); render(); };
                document.getElementById('prop-d').oninput = (e) => { obj.depth = Number(e.target.value); render(); };
            } else if (obj.shape === 'circle') {
                dimBox.innerHTML = `
                    <div class="input-group"><label>半径 R (mm)</label><input type="number" id="prop-r" value="${obj.radius}"></div>
                `;
                document.getElementById('prop-r').oninput = (e) => { obj.radius = Number(e.target.value); render(); };
            }
        }
    } else if (STATE.selection.type === 'vertex') {
        const v = STATE.room.vertices[STATE.selection.ids[0]];
        if (!v) return;

        els.propPanel.style.display = 'block';
        els.noSelectionMsg.style.display = 'none';

        document.getElementById('prop-title').innerText = '頂点詳細';
        document.getElementById('group-prop-name').style.display = 'none';
        document.getElementById('object-specific-props').style.display = 'none';
        document.getElementById('btn-duplicate-object').style.display = 'none';
        document.getElementById('btn-delete-object').innerText = '頂点を削除';

        document.getElementById('prop-x').value = Math.round(v.x);
        document.getElementById('prop-y').value = Math.round(v.y);
        document.getElementById('prop-lock').checked = !!v.isLocked;

        const locked = !!v.isLocked;
        document.getElementById('prop-x').disabled = locked;
        document.getElementById('prop-y').disabled = locked;

    } else {
        els.propPanel.style.display = 'none';
        els.noSelectionMsg.style.display = 'block';
    }
}

function updateSelectedObject(e) {
    if (STATE.selection.type === 'object') {
        const selectedIds = STATE.selection.ids;
        const isMulti = selectedIds.length > 1;
        
        selectedIds.forEach(id => {
            const obj = STATE.objects.find(o => o.id === id);
            if (!obj) return;

            // Common props (Always update in multi or single)
            obj.layer = document.getElementById('prop-layer').value;
            obj.isLocked = document.getElementById('prop-lock').checked;
            obj.enableCollision = document.getElementById('prop-collision').checked;

            // Single select specific props
            if (!isMulti) {
                obj.name = document.getElementById('prop-name').value;
                const propMemo = document.getElementById('prop-memo');
                if (propMemo) obj.memo = propMemo.value;
                if (!obj.isLocked || (e && e.target && e.target.id === 'prop-lock')) {
                    obj.x = Number(document.getElementById('prop-x').value);
                    obj.y = Number(document.getElementById('prop-y').value);
                    obj.rotation = Number(document.getElementById('prop-rotation').value);
                }
            }
        });

        if (e && e.target && e.target.id === 'prop-lock') {
            updatePropertyPanel();
        }

        checkCollisions();
        render();
    } else if (STATE.selection.type === 'vertex') {
        const idx = STATE.selection.ids[0];
        const v = STATE.room.vertices[idx];
        if (!v) return;

        v.isLocked = document.getElementById('prop-lock').checked;

        if (!v.isLocked || (e && e.target && e.target.id === 'prop-lock')) {
            v.x = Number(document.getElementById('prop-x').value);
            v.y = Number(document.getElementById('prop-y').value);
        }

        if (e && e.target && e.target.id === 'prop-lock') {
            updatePropertyPanel();
        }

        render();
    }
}

function deleteSelected() {
    if (STATE.selection.type === 'object') {
        STATE.objects = STATE.objects.filter(o => !STATE.selection.ids.includes(o.id));
        STATE.selection.ids = [];
        STATE.selection.type = null;
        updatePropertyPanel();
        render();
    } else if (STATE.selection.type === 'vertex') {
        if (STATE.room.vertices.length <= 3) {
            alert('部屋の形を維持するため、最低3つの頂点が必要です。');
            return;
        }
        STATE.room.vertices.splice(STATE.selection.ids[0], 1);
        STATE.selection.ids = [];
        STATE.selection.type = null;
        updatePropertyPanel();
        render();
    }
}

// --- COLLISION ENGINE ---

function checkCollisions() {
    if (!STATE.config.enableCollision) {
        STATE.objects.forEach(o => o.isColliding = false);
        return;
    }

    STATE.objects.forEach(o => o.isColliding = false);

    for (let i = 0; i < STATE.objects.length; i++) {
        for (let j = i + 1; j < STATE.objects.length; j++) {
            const a = STATE.objects[i];
            const b = STATE.objects[j];

            // Skip if either object has temporary collision disable
            if (a.tempDisableCollision || b.tempDisableCollision) continue;

            // Only check same layer
            if (a.layer !== b.layer) continue;

            // Collision only triggers if both are inside room AND both have collision enabled
            const aActive = (a.enableCollision !== false) && isCompletelyInsideRoom(a, STATE.room.vertices);
            const bActive = (b.enableCollision !== false) && isCompletelyInsideRoom(b, STATE.room.vertices);

            if (aActive && bActive && testCollision(a, b)) {
                a.isColliding = true;
                b.isColliding = true;
            }
        }
    }
}

function testCollision(a, b) {
    if (a.shape === 'circle' && b.shape === 'circle') {
        const d = Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2);
        return d < (a.radius + b.radius - 0.01); // 0.01mm tolerance for sticking
    }
    
    // Poly vs Poly (SAT)
    const polyA = getPolygon(a);
    const polyB = getPolygon(b);
    return testSAT(polyA, polyB);
}

function getPolygon(obj) {
    const pts = [];
    const rad = -(obj.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    if (obj.shape === 'rectangle') {
        const w2 = obj.width / 2;
        const d2 = obj.depth / 2;
        const corners = [
            { x: -w2, y: -d2 }, { x: w2, y: -d2 },
            { x: w2, y: d2 }, { x: -w2, y: d2 }
        ];
        return corners.map(p => ({
            x: obj.x + (p.x * cos - p.y * sin),
            y: obj.y + (p.x * sin + p.y * cos)
        }));
    } else if (obj.shape === 'circle') {
        const segments = 12;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            pts.push({
                x: obj.x + Math.cos(angle) * obj.radius,
                y: obj.y + Math.sin(angle) * obj.radius
            });
        }
    }
    return pts;
}

function testSAT(polyA, polyB) {
    const polys = [polyA, polyB];
    for (let i = 0; i < polys.length; i++) {
        const p = polys[i];
        for (let j = 0; j < p.length; j++) {
            const p1 = p[j];
            const p2 = p[(j + 1) % p.length];
            
            // Perpendicular axis
            const axis = { x: -(p2.y - p1.y), y: p2.x - p1.x };
            
            if (isSeparatingAxis(axis, polyA, polyB)) return false;
        }
    }
    return true; // No separating axis found
}

function isSeparatingAxis(axis, polyA, polyB) {
    let minA = Infinity, maxA = -Infinity;
    let minB = Infinity, maxB = -Infinity;

    for (const p of polyA) {
        const proj = p.x * axis.x + p.y * axis.y;
        minA = Math.min(minA, proj);
        maxA = Math.max(maxA, proj);
    }
    for (const p of polyB) {
        const proj = p.x * axis.x + p.y * axis.y;
        minB = Math.min(minB, proj);
        maxB = Math.max(maxB, proj);
    }

    // Use a small epsilon (0.01mm) to allow "sticking" without triggering collision
    return maxA <= minB + 0.01 || maxB <= minA + 0.01;
}

function testCollisionWithAny(targetObj, objects) {
    // Skip if target has temporary collision disable
    if (targetObj.tempDisableCollision) return false;

    const isTargetActive = (targetObj.enableCollision !== false) && isCompletelyInsideRoom(targetObj, STATE.room.vertices);
    if (!isTargetActive) return false;

    for (const o of objects) {
        if (o.id === targetObj.id) continue;
        if (o.tempDisableCollision) continue; // Skip objects with temporary collision disable
        if (o.layer !== targetObj.layer) continue;
        
        const isOtherActive = (o.enableCollision !== false) && isCompletelyInsideRoom(o, STATE.room.vertices);
        if (!isOtherActive) continue;

        if (testCollision(targetObj, o)) {
            return true;
        }
    }
    return false;
}

function isCompletelyInsideRoom(obj, roomVertices) {
    const poly = getPolygon(obj);
    
    // 1. Check if all vertices are inside room (with epsilon)
    for (const pt of poly) {
        if (!pointInPolygon(pt, roomVertices, 0.01)) return false;
    }
    
    // 2. Check if any edge intersects any room wall
    for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        
        for (let j = 0; j < roomVertices.length; j++) {
            const w1 = roomVertices[j];
            const w2 = roomVertices[(j + 1) % roomVertices.length];
            
            if (segmentsIntersect(p1, p2, w1, w2)) {
                return false;
            }
        }
    }
    return true;
}

function pointInPolygon(point, vs, epsilon = 0) {
    let x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i].x, yi = vs[i].y;
        let xj = vs[j].x, yj = vs[j].y;
        
        // Use epsilon to allow points on the edge
        let intersect = ((yi > y - epsilon) !== (yj > y - epsilon))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi + epsilon);
        if (intersect) inside = !inside;
    }

    // Secondary check: if point is not inside by Ray Casting, check if it's on any edge
    if (!inside && epsilon > 0) {
        for (let i = 0; i < vs.length; i++) {
            if (distToSegment(point, vs[i], vs[(i+1)%vs.length]) < epsilon) return true;
        }
    }
    return inside;
}

function segmentsIntersect(p1, p2, p3, p4) {
    const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
}

function generateNextName(shape) {
    const prefixMap = { 'rectangle': 'R', 'circle': 'C' };
    const prefix = prefixMap[shape] || 'OBJ';
    
    // Find highest existing number for this prefix
    let maxNum = 0;
    const regex = new RegExp(`^${prefix}(\\d+)$`);
    
    STATE.objects.forEach(obj => {
        const match = obj.name.match(regex);
        if (match) {
            const num = parseInt(match[1]);
            if (num > maxNum) maxNum = num;
        }
    });
    
    return `${prefix}${maxNum + 1}`;
}

function duplicateSelected(offset = null) {
    if (STATE.selection.type !== 'object' || STATE.selection.ids.length === 0) return null;
    
    const newIds = [];
    const idMap = {}; // originalId -> new object
    
    STATE.selection.ids.forEach(id => {
        const original = STATE.objects.find(o => o.id === id);
        if (!original) return;
        
        const newId = (Date.now() + Math.random()).toString();
        const newName = generateNextName(original.shape);
        
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = newId;
        copy.name = newName;
        
        if (offset) {
            copy.x += offset.x;
            copy.y += offset.y;
        }

        // Temporarily disable collision for the new copy until drag is finished
        copy.tempDisableCollision = true; 
        
        STATE.objects.push(copy);
        newIds.push(newId);
        idMap[id] = copy;
    });
    
    // Switch selection to new objects
    STATE.selection.ids = newIds;
    render();
    return idMap;
}

init();

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
                const response = await fetch('/apps/web/room-layout/README.md');
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
