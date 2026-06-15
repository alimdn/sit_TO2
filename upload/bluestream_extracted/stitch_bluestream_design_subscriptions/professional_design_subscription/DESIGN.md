---
name: Professional Design Subscription
colors:
  surface: '#f7fafd'
  surface-dim: '#d7dadd'
  surface-bright: '#f7fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f7'
  surface-container: '#ebeef1'
  surface-container-high: '#e5e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#181c1e'
  on-surface-variant: '#43474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f4'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#49607e'
  primary: '#000f22'
  on-primary: '#ffffff'
  primary-container: '#0a2540'
  on-primary-container: '#768dad'
  inverse-primary: '#b0c8eb'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#01101c'
  on-tertiary: '#ffffff'
  tertiary-container: '#162632'
  on-tertiary-container: '#7d8d9c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#b0c8eb'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#314865'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#d4e5f5'
  tertiary-fixed-dim: '#b8c8d8'
  on-tertiary-fixed: '#0d1d29'
  on-tertiary-fixed-variant: '#394955'
  background: '#f7fafd'
  on-background: '#181c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered to evoke feelings of institutional trust, scalability, and high-fidelity precision. It caters to business owners and marketing departments seeking a reliable, high-output design partner.

The visual style is **Corporate Minimalism**. It avoids decorative clutter in favor of structural clarity, using expansive whitespace to signify "breathing room" for creativity. The aesthetic is defined by crisp edges, purposeful alignment, and a sophisticated interplay between deep monochromatic tones and high-contrast surfaces. The goal is to move the user through the conversion funnel with zero friction and maximum confidence in the service's quality.

## Colors
The palette is anchored by **Primary Dark Blue (#0A2540)**, representing stability and depth. This color is reserved for core branding, primary calls-to-action, and high-level headings.

**Secondary White (#FFFFFF)** serves as the primary canvas color, ensuring a clean, high-contrast environment. To provide structural definition without the harshness of black, a range of **Slate Grays** are utilized:
- **Surface:** #F6F9FC (Used for subtle background sectioning).
- **Border:** #E6EBF1 (Used for dividers and component strokes).
- **Text-Secondary:** #4F5B76 (Used for sub-headers and body descriptions).
- **Success/Accent:** #00D1FF (An optional high-energy blue for interactive accents or status indicators).

## Typography
This design system utilizes **Inter** for its systematic clarity and neutral tone. To achieve a premium "design-agency" feel, the system relies on generous letter spacing for body text and tighter, more aggressive tracking for large headlines.

- **Headlines:** Use Bold weights with slight negative letter-spacing to feel impactful and modern.
- **Body:** Use a standard weight with increased line-height (1.6) to maximize readability across long service descriptions.
- **Labels:** Use uppercase for small UI hints, navigation links, and tags to create a clear visual distinction from body copy.

## Layout & Spacing
The layout follows a **Fixed-Width Grid** model for desktop, centered within the viewport to maintain focus. 

- **Desktop:** 12-column grid, 1280px max-width, 24px gutters, and 48px side margins.
- **Tablet:** 8-column grid, 24px gutters, 32px side margins.
- **Mobile:** 4-column grid, 16px gutters, 20px side margins.

The spacing rhythm is built on an **8px base unit**. Vertical section spacing is intentional and generous (using the `xl` unit) to prevent the interface from feeling crowded, reinforcing the minimalist brand narrative.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and **Tonal Layering** rather than heavy gradients. 

- **Level 0 (Floor):** The main background (#FFFFFF).
- **Level 1 (Subtle):** Used for cards and containers. A soft shadow: `0px 4px 12px rgba(10, 37, 64, 0.05)` with a 1px stroke in #E6EBF1.
- **Level 2 (Interactive):** Used for hovered states. A more pronounced shadow: `0px 12px 24px rgba(10, 37, 64, 0.10)`.
- **Level 3 (Overlays):** Used for sticky headers and modals. A deep, diffused shadow: `0px 20px 40px rgba(0, 0, 0, 0.08)`.

Sticky navigation headers should use a backdrop-blur (12px) with a semi-transparent white background (rgba(255, 255, 255, 0.8)) to maintain context while scrolling.

## Shapes
The design system uses a **Rounded** shape language to soften the corporate professional feel, making the service feel approachable.

- **Small Components:** Checkboxes and small tags use `rounded-sm` (4px).
- **Standard UI:** Buttons, input fields, and small cards use `rounded-md` (8px).
- **Large Components:** Main content cards, pricing tables, and feature containers use `rounded-lg` (16px) or `rounded-xl` (24px) for a modern, high-fidelity look.

## Components
- **Buttons:** 
    - **Primary:** Dark Blue background, White text. No border. On hover, background shifts to a slightly lighter slate or scales up 2% with a smooth 0.3s transition.
    - **Secondary:** White background with a 1px Slate border. Text in Primary Dark Blue.
- **Cards:** 16px+ corner radius. Use Level 1 shadows. Padding should be generous (minimum 32px) to maintain the minimalist aesthetic.
- **Input Fields:** 1px #E6EBF1 border, 8px radius. On focus, the border changes to Primary Dark Blue with a 2px outer glow.
- **Sticky Header:** Compact height (72px). Contains the logo on the left, centered navigation links (Label-MD), and a primary CTA on the right.
- **Pricing Tiers:** Use a vertical hierarchy. Highlight the most popular plan by applying a Level 2 shadow and a subtle Primary Dark Blue top border (4px).
- **Chips/Badges:** Small, subtle backgrounds (#F6F9FC) with #4F5B76 text, used for categories or "New" feature indicators.