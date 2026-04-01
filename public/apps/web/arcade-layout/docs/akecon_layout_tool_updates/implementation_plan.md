# Implementation Plan: Background Image Scaling and Positioning

Currently, the background image (underlay) is fixed with `object-fit: cover`. This plan adds controls to scale and move the background image to allow for precise manual alignment during layout tracing.

## User Review Required

> [!IMPORTANT]
> - New controls will be added to the "Background (Underlay)" panel in the right sidebar.
> - **Scale** will be adjustable via a numerical input (e.g., 0.1x to 10.0x).
> - **X/Y Offset** will be adjustable via number inputs, measured in millimeters (mm) representing the distance from the canvas origin (bottom-left).

## Proposed Changes

### Core Logic

#### [MODIFY] [script.js](file:///c:/Users/kohei/.gemini/antigravity/scratch/akecon-layout-tool/script.js)

1.  **State update**: Add `bgScale`, `bgX`, `bgY` to the `state` object.
2.  **Function implementation**: Create `updateBgTransform()`:
    - Calculates the transition from logical mm to CSS pixels based on the current canvas scale.
    - Applies `transform: translate(x, y) scale(s)` to the background image element.
    - Ensures `transform-origin` aligns with the bottom-left of the canvas.
3.  **Event listeners**: Wire up the new UI inputs to update the state and call `updateBgTransform()`.

### UI Component

#### [MODIFY] [index.html](file:///c:/Users/kohei/.gemini/antigravity/scratch/akecon-layout-tool/index.html)

1.  **Refine "Background" Panel**:
    - Add a "倍率 (Scale)" numerical input.
    - Add "位置調整 (Offset)" row with X and Y numerical inputs (mm).

### Styling Component

#### [MODIFY] [styles.css](file:///c:/Users/kohei/.gemini/antigravity/scratch/akecon-layout-tool/styles.css)

1.  **Update `.canvas-bg`**:
    - Change `object-fit: cover` to `object-fit: none` (or similar) to allow manual transforms without browser-enforced scaling.
    - Set `transform-origin: bottom left`.
    - Ensure it remains strictly within the `.canvas-container` clipping.

## Verification Plan

### Automated Tests
- None. Manual verification is necessary for visual feedback tools.

### Manual Verification
1.  **Scaling Test**:
    - Upload an image.
    - Adjust the Scale input. Verify the image zooms in/out relative to the bottom-left origin.
2.  **Offset Test**:
    - Adjust X and Y offset values. Verify the image moves accordingly.
3.  **Consistency Test**:
    - Resize the canvas. Verify that the background image remains correctly aligned and sized relative to its mm-based settings.
4.  **Device Test**:
    - Check the new UI elements on both PC sidebar and Mobile tabs for layout integrity.
