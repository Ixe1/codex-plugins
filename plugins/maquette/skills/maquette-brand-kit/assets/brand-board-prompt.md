Create or edit a website design-system board.

Goal:
- Build a structured brand board for a web UI.
- This board is a creative artifact and approval target for the website visual system.
- Use a 1:1 square composition by default.
- No logo generation, no wordmarks, no brand marks, no large brand-name treatment, no monograms, no mascots, no badges, no seals, no app icons, no emblems, and no trademark-like elements.

Show on the board:
- palette swatches and semantic color roles
- typography direction with clear heading/body distinctions, recommended font families or categories, fallback stacks, weights, sizes, and line-height
- spacing rhythm
- radius scale
- border, elevation, shadow, surface, and motion cues
- focus, hover, disabled, error, selected, and active principles
- only tiny abstract UI fragments if needed to demonstrate color, focus, state, surface, or density principles; these are not component specs
- a compact token/spec panel if it remains readable

Constraints:
- the board must be readable even when the image is not full desktop resolution
- keep spacing rhythm, control language, and typography internally consistent
- do not include a full component inventory or detailed button, input, card, product-card, navigation, or form variants
- clearly name recommended font families or font categories; if exact licensed fonts are unavailable, name practical web-safe or open-source substitutes
- if headings imply condensed or editorial bold type, specify the intended font personality and avoid crude default substitutions such as Impact unless explicitly approved
- do not invent or display a logo, wordmark, emblem, mascot, seal, badge, app icon, placeholder brand mark, monogram, or trademark-like element
- do not show the brand or product name as a masthead, header, large title, display text, logo-like text, app mark, badge, seal, or primary text treatment
- if product text is needed, use neutral labels such as "Design System", "Server Discovery UI", "Telemetry Surface", "Operations Dashboard", or similar generic descriptors
- the actual brand name may appear only, if at all, as small body-size sample copy; it must never be the largest or primary text on the image
- avoid clutter; if the board cannot be understood at normal preview size, narrow the scope rather than shrinking everything
- use the provided brief and references, but choose a coherent direction without asking for styling micro-decisions
- prioritize design clarity, polish, and creativity

Reference rules:
- if an approved board is visible, preserve its palette, typography personality, spacing rhythm, radius style, and control language unless the user explicitly asked to change them
- if an approved greenfield direction concept is visible, preserve its visual tone, hierarchy, density, and component priorities while normalizing them into reusable brand-system rules
- if existing website screenshots, code references, or supplied brand assets are visible, preserve recognizable brand language and normalize it into reusable rules; do not redesign, redraw, or invent replacements for supplied assets
- if inspiration images are visible, borrow mood and hierarchy only; do not copy trademarks or logos
- if a local reference image is relevant, it should first be loaded into the conversation with view_image, then edit the visible image rather than starting from scratch
