# Graph Report - src  (2026-07-04)

## Corpus Check
- Corpus is ~26,918 words - fits in a single context window. You may not need a graph.

## Summary
- 165 nodes · 285 edges · 12 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Home Monolith & Tab Views|Home Monolith & Tab Views]]
- [[_COMMUNITY_Flight & Hotel Feed|Flight & Hotel Feed]]
- [[_COMMUNITY_Auth, Language & Cookie Consent|Auth, Language & Cookie Consent]]
- [[_COMMUNITY_Persistence & Mock Supabase|Persistence & Mock Supabase]]
- [[_COMMUNITY_Navigation & App State|Navigation & App State]]
- [[_COMMUNITY_Legal Pages|Legal Pages]]
- [[_COMMUNITY_AI Trip Planner (DeepSeek)|AI Trip Planner (DeepSeek)]]
- [[_COMMUNITY_AI Search (DeepSeek)|AI Search (DeepSeek)]]
- [[_COMMUNITY_Waitlist Landing Page|Waitlist Landing Page]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 18 edges
2. `getDestinationImage()` - 12 edges
3. `MockQueryBuilder` - 11 edges
4. `fetchRealFlights()` - 11 edges
5. `fetchRealHotels()` - 11 edges
6. `useAppState()` - 7 edges
7. `getServerSideProps()` - 7 edges
8. `ensureVariedImages()` - 6 edges
9. `LegalH2()` - 5 edges
10. `LegalP()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `CookieBanner()` --calls--> `useLanguage()`  [EXTRACTED]
  components/CookieBanner.tsx → context/LanguageContext.tsx
- `BottomNavProps` --references--> `TabId`  [EXTRACTED]
  components/BottomNav.tsx → context/AppState.tsx
- `BottomNav()` --calls--> `useLanguage()`  [EXTRACTED]
  components/BottomNav.tsx → context/LanguageContext.tsx
- `Home()` --calls--> `useAppState()`  [EXTRACTED]
  pages/index.tsx → context/AppState.tsx
- `AuthProvider()` --indirect_call--> `u()`  [INFERRED]
  context/AuthContext.tsx → utils/destinationImages.ts

## Import Cycles
- 1-file cycle: `pages/_app.tsx -> pages/_app.tsx`
- 1-file cycle: `pages/_document.tsx -> pages/_document.tsx`

## Communities (12 total, 0 thin omitted)

### Community 0 - "Home Monolith & Tab Views"
Cohesion: 0.09
Nodes (23): useAuth(), useLanguage(), ACTIVITY_ICONS, ConciergeView(), DesktopNav(), DropMagazineCard(), DropsView(), FaqSection() (+15 more)

### Community 1 - "Flight & Hotel Feed"
Cohesion: 0.13
Nodes (25): handler(), handler(), FeedCard(), StayCard(), StaysView(), TripPlanView(), ensureVariedImages(), GENERIC (+17 more)

### Community 2 - "Auth, Language & Cookie Consent"
Cohesion: 0.13
Nodes (16): CookieBanner(), AuthContext, AuthContextType, AuthProvider(), Profile, LanguageContext, LanguageContextType, LanguageProvider() (+8 more)

### Community 3 - "Persistence & Mock Supabase"
Cohesion: 0.14
Nodes (4): getMockDb(), MockDb, MockQueryBuilder, mockSupabase

### Community 4 - "Navigation & App State"
Cohesion: 0.24
Nodes (10): BottomNav(), BottomNavProps, TABS, AppContext, AppContextType, AppStateProvider(), generateUUID(), TabId (+2 more)

### Community 5 - "Legal Pages"
Cohesion: 0.28
Nodes (6): LEGAL_PAGES, LegalH2(), LegalLayout(), LegalLayoutProps, LegalP(), LegalUl()

### Community 6 - "AI Trip Planner (DeepSeek)"
Cohesion: 0.24
Nodes (11): handler(), AiTripResult, compact(), flightBookingUrl(), hotelBookingUrl(), HotelOption, normalizeTripPlan(), num() (+3 more)

### Community 7 - "AI Search (DeepSeek)"
Cohesion: 0.53
Nodes (4): handler(), AiSearchResult, compact(), interpretTravelQuery()

### Community 8 - "Waitlist Landing Page"
Cohesion: 0.40
Nodes (3): FEATURES, SOCIAL_PROOF, STATS

## Knowledge Gaps
- **36 isolated node(s):** `TABS`, `LEGAL_PAGES`, `LegalLayoutProps`, `AppContextType`, `AppContext` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Home Monolith & Tab Views` to `Flight & Hotel Feed`, `Auth, Language & Cookie Consent`, `Navigation & App State`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `fetchRealHotels()` connect `Flight & Hotel Feed` to `Home Monolith & Tab Views`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `TABS`, `LEGAL_PAGES`, `LegalLayoutProps` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home Monolith & Tab Views` be split into smaller, more focused modules?**
  _Cohesion score 0.08571428571428572 - nodes in this community are weakly interconnected._
- **Should `Flight & Hotel Feed` be split into smaller, more focused modules?**
  _Cohesion score 0.1330049261083744 - nodes in this community are weakly interconnected._
- **Should `Auth, Language & Cookie Consent` be split into smaller, more focused modules?**
  _Cohesion score 0.12987012987012986 - nodes in this community are weakly interconnected._
- **Should `Persistence & Mock Supabase` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._