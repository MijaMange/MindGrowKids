# Privacy & Ethics — MindGrow Kids Prototype

This document summarises how the prototype handles data and the ethical choices made for a children’s emotional-expression app.

## Target users

- **Primary:** Children (about 5–12 years) expressing emotions via emoji, text, and drawing.
- **Secondary:** Parents and teachers viewing **aggregated** insights only, not individual content.

## What data is stored

- **On the server (MongoDB or file):** User accounts (email, hashed password, name, role); children’s checkins (emotion, optional text/note, optional drawing reference, date); child profile (e.g. age group, emoji avatar); parent–child links; class and teacher data. Checkins are stored with a **child identifier (ID)**, not the child’s name in each record.
- **In the browser (localStorage):** Draft checkin before submit; offline queue of checkins until sync; calm-mode and sound preferences. No sensitive content is stored only in the browser long term.

## Who can see what

- **Children** see only their own content (their checkins, diary, profile).
- **Parents** see aggregated emotion statistics for linked children (e.g. “Glad 40%, Ledsen 20%”). In the **current prototype UI**, parents do not see individual checkin text or drawings; the app is designed so adults see patterns, not private content.
- **Teachers** see aggregated class statistics (emotion distribution over time). No access to individual pupils’ diaries or content in the active UI.

## Design choices (prototype)

- **Reflective, non-diagnostic replies:** The child-facing “AI” gives short, reflective responses in Swedish. It does not give advice, diagnoses, or judgements.
- **Rule-based logic:** Child replies are produced by rule-based logic (no LLM) in this prototype, to keep behaviour predictable and safe.
- **No voice recording:** The app does not record or process voice; input is text and drawing only.
- **Offline queue:** When offline, checkins are stored locally and synced when back online, so children do not lose input.

## Limitations

This is a **prototype**, not a production product. There is no formal privacy policy or data processing agreement. The backend API could, in principle, expose more data than the current UI shows; the design intent is that the **interface** restricts adults to aggregated views. For a real deployment, a full privacy and safety review would be needed.
