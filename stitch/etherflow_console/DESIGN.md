# Design System Specification: The Kinetic Network

## 1. Overview & Creative North Star: "The Digital Obsidian"
The Creative North Star for this design system is **"The Digital Obsidian."** Unlike standard educational tools that feel like static textbooks, this system treats a virtual network lab as a high-fidelity, living machine. It rejects the "flat web" aesthetic in favor of technical depth, using a dark, layered UI that feels like a premium command center.

To break the "template" look, we utilize **Intentional Asymmetry**. The layout avoids perfectly centered grids; instead, it uses heavy-weighted sidebars (`surface_container_low`) and offset simulation stages (`surface_container`) to drive the eye toward technical data. High-contrast typography scales—pairing the brutalist precision of Space Grotesk with the human-centric Inter—ensure that complex networking data feels authoritative and curated.

---

## 2. Colors: Tonal Architecture
The palette is built on deep oceanic blues and slate grays, designed to reduce eye strain during long simulation sessions while providing high-contrast "signal" colors for network status.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are prohibited for sectioning. Boundaries must be defined solely through background color shifts. Use `surface_container_low` against a `background` to define a sidebar. If a container needs to stand out, use a shift from `surface_container` to `surface_container_high`.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **Base Layer:** `surface` (#0b1326) – The foundation.
- **Structural Layer:** `surface_container_low` (#131b2e) – Persistent sidebars and navigation.
- **Content Layer:** `surface_container` (#171f33) – Main simulation stage.
- **Interactive Layer:** `surface_container_highest` (#2d3449) – Active cards and focused modal elements.

### The "Glass & Gradient" Rule
Floating control panels (Play/Pause/Reset) should use **Glassmorphism**. Apply `surface_variant` at 60% opacity with a `backdrop-blur` of 12px. For primary CTAs, use a subtle linear gradient from `primary` (#7bd0ff) to `on_primary_container` (#008abb) at a 135-degree angle to provide "visual soul."

---

## 3. Typography: The Technical Editorial
We pair **Space Grotesk** (Display/Headlines) with **Inter** (Body) to create a "Technical Editorial" feel—marrying the precision of a terminal with the readability of a premium journal.

- **The Power Gap:** Use `display-lg` (3.5rem) in Space Grotesk for lab titles, contrasted immediately with `label-md` (0.75rem) for metadata. This extreme scale hierarchy makes the UI feel "designed" rather than "defaulted."
- **Monospaced Utility:** While Inter handles instructional text, all network packets, IP addresses, and terminal outputs must use a monospaced font-family to align with professional network simulation software standards.
- **Labels as Architecture:** Use `label-sm` in all-caps with `0.05em` letter spacing for section headers to evoke a "blueprint" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is a function of light and tone, not lines.

- **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` section. This "recessed" look suggests a physical slot for data input.
- **Ambient Shadows:** For "floating" elements like packet inspectors, use a shadow with a blur of `24px`, an offset of `y: 8px`, and an opacity of `6%`. The shadow color must be a tinted version of `on_background` (#dae2fd) to create a natural, atmospheric lift.
- **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., high-contrast mode), use `outline_variant` at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Tactile Control Buttons (Play, Pause, Reset)
- **Primary (Play):** Background: `tertiary_fixed` (#6bff8f), Text: `on_tertiary_fixed`. Shape: `md` (0.375rem).
- **Secondary (Pause):** Background: `secondary_container`, Text: `on_secondary_container`.
- **Destructive (Reset/Drop):** Background: `error_container`, Text: `on_error_container`.
- **Interaction:** On hover, buttons should not just change color but "lift" using a subtle 2px translate-y move and a 4% increase in shadow opacity.

### Simulation Cards
Forbid divider lines. Separate the "Header" of a router card from its "Ports" list using a `2.5` (0.5rem) spacing gap and a background shift from `surface_container_high` to `surface_container`.

### Networking State Chips
- **ACK/Success:** `tertiary` (#4ae176) with 10% opacity background; `on_tertiary_container` text.
- **Processing:** `primary` (#7bd0ff) with 10% opacity; `on_primary_container` text.
- **Dropped/Error:** `error` (#ffb4ab) with 10% opacity; `on_error_container` text.

### Input Fields (Terminal Style)
- **Base:** `surface_container_lowest`.
- **Focus State:** No thick border. Use a `2px` bottom-only glow in `primary_fixed_dim`.
- **Text:** Always use monospaced fonts for technical inputs (IP, Subnet).

---

## 6. Do's and Don'ts

### Do:
- **Use Vertical Whitespace:** Use the spacing scale (e.g., `8` or `12`) to separate terminal blocks instead of lines.
- **Layer Color:** Nest `surface_container_highest` inside `surface_container_low` to create "active" zones.
- **Type Contrast:** Mix `display-sm` (Space Grotesk) with `body-sm` (Inter) for a sophisticated dashboard feel.

### Don't:
- **Don't use 1px Borders:** Never use `#ffffff` or high-contrast lines to separate the sidebar from the main lab. Use a shift from `surface_dim` to `surface_container_low`.
- **Don't use Standard Drop Shadows:** Avoid heavy, black `rgba(0,0,0,0.5)` shadows. They muddy the deep blue palette.
- **Don't Crowd the Data:** Network simulations are complex. Use the `16` (3.5rem) spacing token for outer page margins to let the technical components "breathe."

### Accessibility Note:
While we use tonal shifts, ensure the contrast ratio between `on_surface` and `surface_container` always meets WCAG AA standards. If a background shift is too subtle for certain displays, the **Ghost Border** (at 15% opacity) is your primary tool for reinforcement.