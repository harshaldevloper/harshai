# 🎨 HarshAI MVP - Day 5: Workflow Builder UI (Prep)

**Date:** 2026-03-31
**Focus:** React Flow Integration

---

## ✅ COMPLETED (Days 1-4.5)

- [x] Landing page
- [x] Authentication (Clerk)
- [x] Database schema
- [x] API routes (workflows CRUD)
- [x] Environment variables

---

## 📦 DAY 5 GOAL

**Build visual workflow builder with React Flow**

### Features:
- [ ] Drag-and-drop canvas
- [ ] Node types (Trigger, Action, Condition)
- [ ] Connection handles
- [ ] Node configuration panel
- [ ] Save/load workflows

---

## 🎯 NODE TYPES

### 1. **Trigger Nodes** (Start workflow)
- Webhook received
- Schedule (cron)
- New file uploaded
- Form submission

### 2. **Action Nodes** (Do something)
- ChatGPT: Generate text
- ElevenLabs: Generate voice
- Jasper: Write content
- Midjourney: Generate image
- Send email
- Add to CRM

### 3. **Condition Nodes** (If/Then logic)
- If text contains X
- If sentiment is positive
- If user is premium
- Custom JavaScript

---

## 🎨 UI LAYOUT

```
┌─────────────────────────────────────────────────────┐
│  Header (Logo, User, Save Button)                   │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  Nodes   │          Canvas (React Flow)             │
│  Panel   │                                          │
│          │                                          │
│  [Drag]  │    [Node] ----> [Node] ----> [Node]     │
│          │              |                           │
│          │             [Node]                       │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│  Config Panel (Selected Node Settings)              │
└─────────────────────────────────────────────────────┘
```

---

## 📁 FILES TO CREATE

1. `app/builder/page.tsx` - Main builder page
2. `components/builder/Canvas.tsx` - React Flow canvas
3. `components/builder/NodePanel.tsx` - Node types sidebar
4. `components/builder/ConfigPanel.tsx` - Node configuration
5. `components/builder/nodes/` - Custom node components
6. `lib/flow.ts` - Flow utilities

---

## 🚀 NEXT

Install React Flow and start building!

**Status:** 🚀 READY TO BUILD
