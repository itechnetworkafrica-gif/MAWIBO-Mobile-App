---
name: MAWIBO notifications architecture
description: How in-app notifications and community tab badge work in MAWIBO
---

## Rule
Notifications are managed by `NotificationsContext` (not `profile.notifBadge`). The community tab badge reads `communityUnreadCount` from this context. The bell icon on the home header reads `unreadCount`.

**Why:** Previous design stored badge count in AppContext profile (crude integer). Now we have proper typed notifications with persistence, grouping, and mark-as-read.

## How to apply
- To fire a notification from anywhere: `useNotifications().addNotification({ type, title, body, icon, color })`
- Community tab badge auto-clears when Community tab mounts (markAllRead on mount)
- Home notification bell navigates to `/notifications` and also calls markAllRead
- Seed notifications in `SEED_NOTIFS` inside `NotificationsContext.tsx` — only seeded on first install (no stored data)
- Storage key: `mawibo_notifications_v1`
- Types: `like | comment | community | system | appointment`
- `communityUnreadCount` = unread likes + comments + community type only
