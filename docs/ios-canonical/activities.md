# Activities — iOS Canonical Reference

**Source:** ~/Radr-Mobile/Radr/Models.swift (lines 4-62)
**Audited:** 2026-05-27
**Sync status:** Web is aligned. Implemented in `src/lib/mock-data.ts` (ACTIVITIES export + helpers) and `src/app/create/page.tsx` (picker UI).

## Overview

Radr's workout categories are defined as a Swift enum `WorkoutCategory` with 83 cases. The `.other` case is excluded from UI pickers — it's handled via a separate "Something else..." button that allows custom activity names.

82 activities appear in the picker (83 minus Other).

## Favorites Logic

Top-3 favorites are usage-based, not hardcoded. iOS stores usage counts in UserDefaults key `ActivityPickerUsageCounts`. Each pick increments that activity's count. Top 3 by count appear as starred chips above the alphabetical list.

**Web equivalent:** `getSuggestedActivities()` returns a hardcoded list (Outdoor Run, Outdoor Soccer, Yoga). TODO: replace with localStorage-backed usage counts client-side.

## "Something Else..." Behavior

Standalone pinned button above the alphabetical list. Tapping sets category = .other, nameIsCustom = true, and routes to a custom-name input. The .other case is filtered out of the alphabetical list (`.filter { $0 != .other }`).

**Web equivalent:** "Something else..." row above the list. Currently uses `window.prompt()` for the custom name. TODO: replace with proper inline modal.

## A-Z Activity List (Display Order)

| Display Name | Enum Case | iOS Icon (SF Symbol) | Web Icon (Emoji) |
|---|---|---|---|
| American Football | americanFootball | figure.american.football | 🏈 |
| Archery | archery | target | 🎯 |
| Australian Football | australianFootball | figure.australian.football | 🏉 |
| Badminton | badminton | figure.badminton | 🏸 |
| Barre | barre | figure.barre | 🩰 |
| Baseball | baseball | figure.baseball | ⚾ |
| Basketball | basketball | figure.basketball | 🏀 |
| Bowling | bowling | figure.bowling | 🎳 |
| Boxing | boxing | figure.boxing | 🥊 |
| Climbing | climbing | figure.climbing | 🧗 |
| Cooldown | cooldown | figure.cooldown | 🧊 |
| Core Training | coreTraining | figure.core.training | 💪 |
| Cricket | cricket | figure.cricket | 🏏 |
| Cross Country Skiing | crossCountrySkiing | figure.skiing.crosscountry | ⛷️ |
| Cross Training | crossTraining | figure.cross.training | 🏋️ |
| Curling | curling | figure.curling | 🥌 |
| Dance | dance | figure.dance | 💃 |
| Disc Sports | discSports | figure.disc.sports | 🥏 |
| Downhill Skiing | downhillSkiing | figure.skiing.downhill | ⛷️ |
| Elliptical | elliptical | figure.elliptical | 🏃 |
| Equestrian Sports | equestrianSports | figure.equestrian.sports | 🐴 |
| Fencing | fencing | figure.fencing | 🤺 |
| Fishing | fishing | figure.fishing | 🎣 |
| Fitness Gaming | fitnessGaming | gamecontroller.fill | 🎮 |
| Flexibility | flexibility | figure.flexibility | 🤸 |
| Functional Strength Training | functionalStrength | figure.strengthtraining.functional | 🏋️ |
| Golf | golf | figure.golf | ⛳ |
| Gymnastics | gymnastics | figure.gymnastics | 🤸 |
| Hand Cycling | handCycling | figure.hand.cycling | 🚴 |
| Handball | handball | figure.handball | 🤾 |
| High Intensity Interval Training | hiit | figure.highintensity.intervaltraining | 🔥 |
| Hiking | hike | figure.hiking | 🥾 |
| Hunting | hunting | figure.hunting | 🏹 |
| Hyrox | hyrox | figure.strengthtraining.functional | 💪 |
| Indoor Cycle | indoorCycle | figure.indoor.cycle | 🚴 |
| Indoor Hockey | indoorHockey | figure.hockey | 🏒 |
| Indoor Rowing | indoorRowing | figure.rower | 🚣 |
| Indoor Run | indoorRun | figure.run | 🏃 |
| Indoor Skating | indoorSkating | figure.skating | ⛸️ |
| Indoor Soccer | indoorSoccer | figure.soccer | ⚽ |
| Indoor Walk | indoorWalk | figure.walk | 🚶 |
| Jump Rope | jumpRope | figure.jumprope | 🪢 |
| Kickboxing | kickboxing | figure.kickboxing | 🥋 |
| Lacrosse | lacrosse | figure.lacrosse | 🥍 |
| Martial Arts | martialArts | figure.martial.arts | 🥋 |
| Mind & Body | mindAndBody | figure.mind.and.body | 🧘 |
| Mixed Cardio | mixedCardio | figure.mixed.cardio | ❤️ |
| Open Water Swim | openWaterSwim | figure.open.water.swim | 🌊 |
| Outdoor Cycle | outdoorCycle | figure.outdoor.cycle | 🚴 |
| Outdoor Hockey | outdoorHockey | figure.hockey | 🏒 |
| Outdoor Rowing | outdoorRowing | figure.rower | 🚣 |
| Outdoor Run | outdoorRun | figure.run | 🏃 |
| Outdoor Skating | outdoorSkating | figure.skating | ⛸️ |
| Outdoor Soccer | outdoorSoccer | figure.soccer | ⚽ |
| Outdoor Walk | outdoorWalk | figure.walk | 🚶 |
| Pádel | padel | figure.racquetball | 🎾 |
| Paddling | paddling | figure.water.fitness | 🛶 |
| Pickleball | pickleball | figure.pickleball | 🏓 |
| Pilates | pilates | figure.pilates | 🤸 |
| Play | play | figure.play | 🤾 |
| Pool Swim | poolSwim | figure.pool.swim | 🏊 |
| Racquetball | racquetball | figure.racquetball | 🎾 |
| Rolling | rolling | figure.rolling | 🛹 |
| Rugby | rugby | figure.rugby | 🏉 |
| Sailing | sailing | figure.sailing | ⛵ |
| Snow Sports | snowSports | figure.skiing.downhill | 🎿 |
| Snowboarding | snowboarding | figure.snowboarding | 🏂 |
| Social Dance | socialDance | figure.socialdance | 💃 |
| Softball | softball | figure.softball | 🥎 |
| Squash | squash | figure.squash | 🎾 |
| Stair Stepper | stairStepper | figure.stair.stepper | 🪜 |
| Stairs | stairs | figure.stairs | 🪜 |
| Step Training | stepTraining | figure.step.training | 🪜 |
| Surfing | surfing | figure.surfing | 🏄 |
| Table Tennis | tableTennis | figure.table.tennis | 🏓 |
| Tai Chi | taiChi | figure.taichi | 🧘 |
| Tennis | tennis | figure.tennis | 🎾 |
| Track & Field | trackAndField | figure.track.and.field | 🏃 |
| Traditional Strength Training | traditionalStrength | figure.strengthtraining.traditional | 🏋️ |
| Volleyball | volleyball | figure.volleyball | 🏐 |
| Wrestling | wrestling | figure.wrestling | 🤼 |
| Yoga | yoga | figure.yoga | 🧘 |

## DB Value Mappings (Storage-Layer Aliases)

The Swift enum has a `dbValue` computed property that collapses some activities into broader categories for storage. Known collapses from audit:
- indoorRun, outdoorRun → "run"
- indoorCycle, outdoorCycle → "cycle"
- poolSwim, openWaterSwim → "swim"

**TODO (Luke):** full `dbValue` audit when migrating activities to Supabase. Not yet captured here.

## Legacy Aliases

iOS Models.swift defines 16 legacy `static let` aliases mapping old names to current enum cases (e.g. `run` → `.outdoorRun`). Backwards-compatibility only — do NOT use in new web code.

## Web Implementation Notes

- **Display source:** `src/lib/mock-data.ts` → `ACTIVITIES` export
- **Picker UI:** `src/app/create/page.tsx` (step 1 of workout creation)
- **Helpers:** `getSuggestedActivities()`, `getActivityByKey(key)`
- **Icon strategy:** iOS uses SF Symbols (Apple proprietary). Web uses emoji fallbacks. Designer will likely replace emoji with custom SVG icons later.

## Sync Strategy (Long-Term)

Activities is the highest-priority candidate for **Approach 1: Backend as source of truth** (see `docs/handoff-to-luke.md`). When activities move to Supabase:
- Both iOS and web fetch from `get_activities()` RPC
- Adding new activity = one Supabase insert, both apps see it
- Until then, adding activities requires manual sync to both iOS + web codebases
