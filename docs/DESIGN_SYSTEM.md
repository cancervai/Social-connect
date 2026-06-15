# Design System — Social Connect

A premium dark-mode SaaS design system inspired by Linear and Vercel. Every UI decision is documented here so the developer can build consistent interfaces without guessing.

---

## Color Palette

All colors are defined as Tailwind custom tokens in `client/tailwind.config.ts`.

### Base Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `base` | `#0A0A0F` | Page background (outermost layer) |
| `surface` | `#111118` | Card and panel backgrounds |
| `raised` | `#1A1A24` | Dropdown menus, hover states, modals |
| `overlay` | `#22222E` | Tooltips, popovers |

### Border Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `border` | `#2A2A38` | Default border color |
| `border-subtle` | `#1E1E28` | Very subtle dividers |
| `border-strong` | `#3A3A50` | Focused elements, active borders |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#F1F1F7` | Main content, headings |
| `text-secondary` | `#A0A0B8` | Subheadings, descriptions |
| `text-muted` | `#6B6B82` | Timestamps, placeholders, disabled |
| `text-inverse` | `#0A0A0F` | Text on light/accent backgrounds |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `purple` | `#7C3AED` | Primary actions, active nav, brand |
| `purple-light` | `#8B5CF6` | Hover state of purple elements |
| `purple-dim` | `rgba(124,58,237,0.15)` | Purple tinted backgrounds |
| `cyan` | `#06B6D4` | Secondary actions, links, LinkedIn indicator |
| `cyan-light` | `#22D3EE` | Hover state of cyan elements |
| `cyan-dim` | `rgba(6,182,212,0.15)` | Cyan tinted backgrounds |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#10B981` | Connected, published, positive metrics |
| `success-dim` | `rgba(16,185,129,0.15)` | Success badge background |
| `warning` | `#F59E0B` | Pending, scheduled, warning states |
| `warning-dim` | `rgba(245,158,11,0.15)` | Warning badge background |
| `error` | `#EF4444` | Failed, error, disconnected |
| `error-dim` | `rgba(239,68,68,0.15)` | Error badge background |
| `info` | `#3B82F6` | Informational messages |
| `info-dim` | `rgba(59,130,246,0.15)` | Info badge background |

### Platform Colors

| Token | Hex | Platform |
|-------|-----|----------|
| `meta` | `#1877F2` | Facebook / Meta brand blue |
| `instagram` | `#E1306C` | Instagram gradient start |
| `linkedin` | `#0A66C2` | LinkedIn brand blue |

---

## Typography

**Font family:** Inter (Google Fonts)

```html
<!-- Add to client/index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Class | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-xs` | 11px | 400 | 1.5 | Timestamps, meta labels |
| `text-sm` | 13px | 400/500 | 1.5 | Body text, descriptions |
| `text-base` | 15px | 400 | 1.6 | Default body |
| `text-lg` | 17px | 500/600 | 1.4 | Card titles, list headings |
| `text-xl` | 20px | 600 | 1.3 | Page section titles |
| `text-2xl` | 24px | 700 | 1.2 | Page headings |
| `text-3xl` | 30px | 700 | 1.1 | Hero numbers, stat cards |
| `text-4xl` | 36px | 700 | 1.1 | Large display numbers |

### Number Display
For large metric numbers (stat cards), use tabular numerals:
```css
font-variant-numeric: tabular-nums;
```
Tailwind: `font-[feature-settings:'tnum']` or use `tabular-nums` class.

---

## Spacing System

Follows Tailwind's default 4px base unit.

| Use case | Value |
|----------|-------|
| Component padding (tight) | `p-3` (12px) |
| Component padding (default) | `p-4` (16px) |
| Component padding (relaxed) | `p-6` (24px) |
| Section gap | `gap-4` or `gap-6` |
| Page padding | `px-6 py-8` |
| Sidebar width | `w-64` (256px) |
| Topbar height | `h-16` (64px) |

---

## Border Radius

| Element | Value | Tailwind |
|---------|-------|----------|
| Cards, panels | 8px | `rounded-lg` |
| Buttons | 6px | `rounded-md` |
| Inputs | 6px | `rounded-md` |
| Badges, chips | 4px | `rounded` |
| Avatars | Full circle | `rounded-full` |
| Tooltips | 4px | `rounded` |

---

## Shadows

```css
/* Card shadow — use on .card elements */
box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 4px 24px rgba(0, 0, 0, 0.4);

/* Raised shadow — use on dropdowns/modals */
box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 40px rgba(0, 0, 0, 0.6);

/* Glow — use on focused inputs */
box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.4);
```

Tailwind utility: `shadow-surface`, `shadow-raised`, `shadow-glow` (add these as custom utilities in tailwind.config.ts).

---

## UI Components

### Button

**Variants:**

```tsx
// Primary — purple, main CTAs
<Button variant="primary">Publish Now</Button>

// Secondary — bordered, secondary actions  
<Button variant="secondary">Save Draft</Button>

// Ghost — no border, nav items, icon buttons
<Button variant="ghost">Cancel</Button>

// Danger — red, destructive actions
<Button variant="danger">Delete Post</Button>
```

**Sizes:** `sm` (32px height), `md` (38px, default), `lg` (44px)

**States:** default → hover (lightened) → active (scale 0.98) → disabled (opacity-40)

**Loading state:** Replace icon + text with `<Spinner size="sm" />` and disable click.

---

### Card

Used for all surface containers.

```tsx
<Card>                          // Default padding (p-6)
<Card padding="sm">             // p-4
<Card padding="none">           // No padding (for tables, images)
<Card hoverable>                // Adds hover:border-border-strong transition
```

Internal structure:
```
border border-border bg-surface rounded-lg shadow-surface
```

---

### Badge

Status indicators. Always use semantic colors.

```tsx
<Badge variant="success">Published</Badge>
<Badge variant="warning">Scheduled</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="neutral">Draft</Badge>
<Badge variant="info">Syncing</Badge>
```

Size: always `text-xs font-medium px-2 py-0.5 rounded`

---

### Input

```tsx
<Input
  label="Business Name"
  placeholder="Acme Corp LLC"
  error="This field is required"  // shows red border + error text
  icon={<BuildingIcon />}          // optional left icon
/>
```

States:
- Default: `border-border bg-surface`
- Focus: `border-border-strong shadow-glow`
- Error: `border-error`
- Disabled: `opacity-40 cursor-not-allowed`

---

### Modal

```tsx
<Modal isOpen={open} onClose={handleClose} title="Schedule Post" size="md">
  {/* content */}
</Modal>
```

Sizes: `sm` (400px), `md` (560px, default), `lg` (720px), `xl` (900px)

Always includes: backdrop blur overlay, X button, focus trap, Escape key close.

---

### Avatar

```tsx
<Avatar src={user.avatarUrl} name="Jane Smith" size="md" />
// Falls back to initials "JS" if no src
```

Sizes: `xs` (24px), `sm` (32px), `md` (40px, default), `lg` (56px), `xl` (80px)

---

### Spinner

```tsx
<Spinner size="sm" />   // 16px — inline loaders
<Spinner size="md" />   // 24px — button loading state
<Spinner size="lg" />   // 40px — page/section loading
```

Color: uses `accent-purple` by default, `text-inherit` variant available.

---

## Layout System

### AppShell

```
┌────────────────────────────────────────────────┐
│  Sidebar (256px, fixed)  │  Main content area  │
│  ┌──────────────────────┐│  ┌────────────────┐ │
│  │ Logo + Workspace     ││  │   TopBar       │ │
│  ├──────────────────────┤│  ├────────────────┤ │
│  │ Nav links            ││  │                │ │
│  │  • Dashboard         ││  │   Page         │ │
│  │  • Posts             ││  │   Content      │ │
│  │  • Analytics         ││  │                │ │
│  │  • Leads             ││  │                │ │
│  │  • Campaigns         ││  │                │ │
│  ├──────────────────────┤│  └────────────────┘ │
│  │ User avatar + name   ││                     │
│  │ Settings link        ││                     │
│  └──────────────────────┘│                     │
└────────────────────────────────────────────────┘
```

### Sidebar Navigation Items

Each nav item:
- Icon (Lucide, 18px) + label
- Active state: `bg-purple-dim text-purple border-l-2 border-purple`
- Hover state: `bg-raised text-primary`

```
Dashboard      → LayoutDashboard icon
Posts          → FileText icon
Analytics      → BarChart2 icon
Leads          → Users icon
Campaigns      → Megaphone icon
── divider ──
Settings       → Settings icon
```

### TopBar

- Left: current page title (text-xl font-semibold)
- Right: `[Sync Leads] [+ New Post] [notifications bell] [avatar]`

---

## Animation & Transitions

Keep animations subtle and performance-first.

| Element | Animation |
|---------|-----------|
| Sidebar nav hover | `transition-colors duration-150` |
| Button hover | `transition-colors duration-150` |
| Card hover | `transition-border-color duration-150` |
| Modal open | `fade-in + scale-in (0.95 → 1.0) over 150ms` |
| Toast notifications | `slide-in from right over 200ms` |
| Page transitions | No animation — keep it instant |
| Chart loading | Skeleton shimmer, then fade-in data |

---

## Onboarding Wizard Design

The onboarding is a full-screen flow (no sidebar) with a centered card.

```
┌──────────────────────────────────────────────────┐
│  [Logo]                                          │
│                                                  │
│  Step 1 of 3 ●──○──○                            │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  📋 Connect Meta Business Suite           │  │
│  │                                            │  │
│  │  [Step content — form, upload, or OAuth]   │  │
│  │                                            │  │
│  │  [Skip for now]          [Continue →]      │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

Progress indicator: horizontal step dots, not a progress bar.

Meta Verification sub-steps use a secondary step indicator within the card:
`Business Info → Method → Documents → Submitted`

---

## Chart Design (Recharts)

All charts inherit the dark theme.

```tsx
// Standard chart config — apply to all Recharts components
const chartTheme = {
  background: 'transparent',
  gridColor: '#2A2A38',      // border color
  axisColor: '#6B6B82',      // text-muted
  labelColor: '#A0A0B8',     // text-secondary
  tooltipBg: '#1A1A24',      // bg-raised
  tooltipBorder: '#2A2A38',  // border
  lineColorPurple: '#7C3AED',
  lineColorCyan: '#06B6D4',
  areaOpacity: 0.15,
};
```

**Line chart:** `strokeWidth={2}`, smooth curve (`type="monotone"`), dot hidden by default, visible on hover.

**Bar chart:** Rounded bars (`radius={[4,4,0,0]}`), gap between bars (`barGap={4}`).

**Tooltip:** Custom dark tooltip component — white text on `bg-raised` background.

---

## Platform Indicators

Use consistent brand colors and icons for each platform:

```tsx
// Meta (Facebook/Instagram)
<span className="flex items-center gap-1.5 text-[#1877F2]">
  <FacebookIcon size={14} />
  <span>Facebook</span>
</span>

// LinkedIn
<span className="flex items-center gap-1.5 text-[#0A66C2]">
  <LinkedInIcon size={14} />
  <span>LinkedIn</span>
</span>
```

Use platform-colored left borders on cards to indicate the source at a glance:
```css
/* Meta card */
border-left: 3px solid #1877F2;

/* LinkedIn card */
border-left: 3px solid #0A66C2;
```

---

## Responsive Breakpoints

The app is desktop-first (dashboard tools are used on desktop). Mobile support is secondary.

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| `xl` | 1280px+ | Default layout (sidebar + content) |
| `lg` | 1024–1279px | Sidebar narrowed to icons only |
| `md` | 768–1023px | Sidebar hidden, hamburger menu |
| `sm` | < 768px | Stacked layout, simplified views |

---

## Accessibility

- All interactive elements must have focus-visible styles: `focus-visible:ring-2 focus-visible:ring-purple focus-visible:outline-none`
- Color is never the only indicator of state (always pair with icon or text)
- Minimum touch target: 44×44px on mobile
- All icons paired with text or `aria-label`
- Modal uses `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Form inputs always have associated `<label>` elements
