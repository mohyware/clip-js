# Timeline Video Editor - AI Coding Instructions

## Architecture Overview

This is a Next.js-based online video editor with dual preview/render engines:

- **Real-time preview**: Remotion for instant visual feedback at 30fps
- **High-quality export**: FFmpeg WASM for production-quality rendering up to 1080p

### Core State Management

Central Redux state in `app/store/slices/projectSlice.ts` manages:

- `mediaFiles[]`: Video/audio/image elements with timeline positioning
- `textElements[]`: Text overlays with timing and styling
- `currentTime`: Playhead position synced between timeline and Remotion player
- `timelineZoom`: Controls timeline granularity (30-120px per second)

State persists to localStorage + IndexedDB for file storage.

### Dual Timeline Architecture

1. **Interactive Timeline** (`app/components/editor/timeline/`):

   - Custom-built with React Moveable for drag/resize
   - Each media type has separate timeline component (VideoTimeline, AudioTimeline, etc.)
   - Color-coded: Purple=Images, Blue=Videos, Green=Audio, Orange=Text
   - Handles positioning via `positionStart`/`positionEnd` in timeline seconds

2. **Remotion Preview** (`app/components/editor/player/remotion/`):
   - Converts timeline state to Remotion Sequences
   - Frame-based calculations: `frame = currentTime * fps`
   - Real-time preview during editing

### Performance Patterns

**Critical optimization in timeline components:**

```tsx
// Throttled updates to prevent Redux spam during drag/resize
const onUpdateMedia = useMemo(
  () =>
    throttle((id: string, updates: Partial<MediaFile>) => {
      const currentFiles = mediaFilesRef.current;
      const updated = currentFiles.map((media) =>
        media.id === id ? { ...media, ...updates } : media
      );
      dispatch(setMediaFiles(updated));
    }, 100),
  [dispatch]
);
```

### FFmpeg Rendering Pipeline

Complex filter chains in `app/components/editor/render/Ffmpeg/FfmpegRender.tsx`:

1. Sort media by z-index for proper layering
2. Create base black canvas: `color=c=black:size=1920x1080`
3. Apply timeline positioning via filter delays and overlays
4. Handle opacity, scaling, text overlays with font files
5. Mix audio tracks with volume controls

### Key File Locations

- **Types**: `app/types/index.ts` - MediaFile, TextElement interfaces
- **Timeline**: `app/components/editor/timeline/elements-timeline/` - Separate component per media type
- **Remotion**: `app/components/editor/player/remotion/sequence/` - Preview rendering
- **State**: `app/store/` - Redux setup with persistence
- **Design System**: Depend on Shadcn elements and `app/globals.css` - CSS custom properties for theming, don't do over customaization keep it simple and consistent follow shadcn design system and components
- Don't every use shadcn Card and CardContent components

### Development Patterns

- **Media positioning**: Always use `positionStart`/`positionEnd` for timeline placement
- **Performance**: Use throttled dispatches for frequent updates (drag/resize)
- **Styling**: Leverage design system colors from globals.css, avoid hardcoded colors
- **Timeline sync**: Keep Remotion player and custom timeline in sync via Redux state

### 🚫 Styling Rules (Critical)

- Do not use custom colors (inline hex, RGB, Tailwind arbitrary colors, or hardcoded utility classes).
- ❌ bg-[#123456], text-red-500, border-blue-700
- ❌ Inline style={{ color: 'blue' }} or CSS overrides
- ✅ Always use shadcn/ui default tokens and components as they are, dont manually add colors and styles in the components.
- ✅ If customization is required, use the CSS custom properties defined in app/globals.css.
- ✅ Follow the design system colors and variants (e.g., variant="destructive", variant="secondary"), never invent new ones.

### Common Tasks

- Adding media types: Create timeline component + Remotion sequence item + FFmpeg filter logic
- Performance issues: Check for unthrottled Redux dispatches in timeline interactions
- Styling: Use existing CSS custom properties in globals.css
- FFmpeg debugging: Monitor filter_complex chains and audio mixing

### Testing Setup

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint checking
```

Docker available for self-hosting scenarios.
