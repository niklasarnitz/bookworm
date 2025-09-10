# Copilot Instructions

## Package Manager

bun

## Technologies used

T3 Stack with typescript
zod for schema validation
react-hook-form for form validation
trpc for backend communication
Shadcn UI for frontend

## Best practises

- use zod for schema validation
- use trpc for backend communication
- use react-hook-form for form validation
- use bun for package manager
- everything should be 100% typesafe and striclty typed
- server side rendering using actionState, transitions and suspense boundaries should ALWAYS be preferred over client side rendering
  - when a client side component is needed, it should just be the component it self - not the whole page or the bigger component
  - when building components, try to make them reusable and not depend on the context of the page
- make sure to invalidate react query hooks AND the server rendered routes when editing/deleting data
- screens (like detail or edit pages) should always have their own route so the link to them can be copied
- Use the RouterOutputs type from trpc for types in components - don't re-define types in components or helper functions!

## Shadcn UI

components can be installed by using:

```
bunx shadcn@latest add ...
```
