# Lens optical core

Copied unchanged from the user's local `D:/lyn/program/geoask/web/vendor/lens/`.
Original: [ruiqichenbiec/design-systems](https://github.com/ruiqichenbiec/design-systems),
commit `7a424c93b9be13cf835b91ea67495fec2ec0584e`, Lens `1.1.0-showcase.1`.

MIT licensed, Copyright (c) 2026 DayDreamInAReverie. See [LICENSE.txt](LICENSE.txt).
Only the renderer, optics, GPU context budget and tokens are included. The source files
are intentionally excluded from project formatting to preserve upstream code.

`components/GlassArtwork.vue` uses the original WebGL2 compositor for the cover's
decorative scene and lenses. It does not sample arbitrary DOM. CSS backdrop glass
supplies live translucent control surfaces; all foreground text remains native DOM.
The renderer suspends when offscreen and is destroyed on unmount. No continuous
background motion is enabled. Reduced transparency and unavailable WebGL use CSS fallback.
