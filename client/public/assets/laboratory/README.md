# page-mascot portrait assets

Source: https://github.com/nilbuild/page-mascot
Pinned upstream revision: `76a44ed9180063bf4852b9dd724b656f4a828ac7`.

`cat-directions.webp` and `cat-reactions.webp` are unmodified upstream cat atlases from `public/mascots/`, used only for Kali's optional reactive portrait. They are not photographs or team member identities. These chibi atlases do not implement world walking; Kali's pixel-art world character is separate.

`client/src/laboratory/portraits.ts` adapts the direction cell mapping, 70px dead zone and angular hysteresis of upstream `src/mascot.tsx` to the existing vanilla TypeScript DOM. No React dependency is required. Pointer tracking is disabled for touch/coarse pointers and reduced motion; activation remains available by keyboard and touch. Each mounted portrait owns removable event handlers.

License: MIT; the complete upstream notice is preserved in `PAGE-MASCOT-LICENSE.txt` beside these assets.

Team portraits use the project's existing official `/assets/brand/lotorium-icon.webp`, without new human likenesses.
