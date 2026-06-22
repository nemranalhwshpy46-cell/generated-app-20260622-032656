# Usage

## Overview
Cloudflare Workers + React with Andromo Convex Backend for real-time data and authentication.
- Frontend: React Router 6 + TypeScript + ShadCN UI + Tailwind + Lucide Icons
- Backend: Convex (real-time queries, mutations, auth)
- Hosting: Cloudflare Workers (only serving)
- Tooling: Vite, ESLint

## IMPORTANT: Demo Content
**The existing demo page is FOR TEMPLATE UNDERSTANDING ONLY.**
- Replace `src/pages/HomePage.tsx` with your application UI
- Add application tables to `convex/schema.ts` while preserving the pre-configured auth tables
- Create your queries/mutations in `convex/` directory
- Add custom routes to `worker/userRoutes.ts` if needed

## Code Organization

### Frontend Structure
- `src/pages/HomePage.tsx` - Demo page (replace with your UI)
- `src/pages/AboutPage.tsx` - Second demo page (shows multi-page routing pattern)
- `src/main.tsx` - Router setup with layout routes (add page routes to `children` array)
- `src/components/ui/*` - ShadCN components (use, don't rewrite)
- `src/components/SignInForm.tsx` - Auth form (functional, keep)
- `src/components/SignOutButton.tsx` - Sign out (functional, keep)
- `src/lib/convex.ts` - Convex client (don't modify)

### Backend Structure (Convex)
- `convex/schema.ts` - Define application tables here; preserve `...authTables`
- `convex/auth.ts` - Auth setup (pre-configured, don't modify)
- `convex/files.ts` - Optional file upload/storage example; keep it only if the app needs file uploads
- `convex/*.ts` - Add your queries/mutations here
- `convex/_generated/` - Auto-generated (never edit)

### Worker Structure
- `worker/index.ts` - Entry point (**DO NOT MODIFY**)
- `worker/userRoutes.ts` - Add custom API routes here
- `worker/core-utils.ts` - Core utilities (**DO NOT MODIFY**)

## Development Restrictions
- **Tailwind Colors**: Define custom colors in `tailwind.config.js`, NOT in `index.css`
- **Components**: Use existing ShadCN components from `@/components/ui/*` instead of writing custom ones
- **Icons**: Import from `lucide-react` directly
- **Error Handling**: ErrorBoundary components are pre-implemented
- **Worker Files**: DO NOT modify `worker/index.ts` or `worker/core-utils.ts`
- **Convex Auth**: Authentication is pre-configured; don't modify `convex/auth.ts` and don't redefine the auth-owned `users` table for app profile data
- **Generated Files**: Never edit `convex/_generated/*` - these are auto-generated

## Styling
- Responsive, accessible
- Prefer ShadCN components; Tailwind utilities for custom parts
- Icons from `lucide-react`
- Error boundaries are already implemented

## Animation
- Use `framer-motion` for small interactions when needed

## Components
- Import from `@/components/ui/*` (ShadCN). Avoid reinventing components.

## Routing (CRITICAL)

Uses `createBrowserRouter` with **layout routes** - do NOT switch to `BrowserRouter`/`HashRouter`.

If you switch routers, `RouteErrorBoundary`/`useRouteError()` will not work (you'll get a router configuration error screen instead of proper route error handling).

### Layout Routes with Outlet

The starter uses a layout route pattern. Keep the `createBrowserRouter` layout route and `<Outlet />` structure, but choose the shell that fits the requested app:
- Dashboard, admin, CRM, classroom, project-management, or multi-section productivity apps: the included `AppLayout` sidebar is a good starting point.
- Landing pages, marketing sites, portfolios, simple product pages, games, or single-flow apps: replace the sidebar shell with an appropriate header/top-nav or no persistent navigation.

If you keep the included sidebar, `AppLayout` renders the collapsible shadcn sidebar (`SidebarProvider`, `AppSidebar`, `SidebarInset`, and `SidebarTrigger`) plus an `<Outlet />` where child routes render. On desktop the sidebar starts expanded and collapses to an icon rail when the trigger is clicked:

```tsx
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
    ],
  },
]);
```

### Adding New Pages

1. Create the page component in `src/pages/MyPage.tsx`
2. Import it in `src/main.tsx`
3. Add a route entry to the `children` array:
   ```tsx
   { path: "/my-page", element: <MyPage /> },
   ```
4. Add the route to the app's chosen navigation pattern. If using the included sidebar, add it to `src/components/app-sidebar.tsx`; if using a header/top-nav, add it there instead.

### Navigation Components

Use `Link` for declarative navigation and `useNavigate` for programmatic navigation:

```tsx
import { Link, useNavigate } from "react-router-dom";

// Declarative: renders an anchor tag with client-side routing
<Link to="/about">About</Link>

// Programmatic: navigate in event handlers
const navigate = useNavigate();
const handleSubmit = () => {
  navigate("/dashboard");
};
```

### Active Link Styling

Use `useLocation()` to determine the active route. For the template sidebar, keep `SidebarMenuButton asChild` and pass `isActive`; do not move active styling onto a plain `Link` in a way that bypasses `SidebarMenuButton`:

```tsx
import type { ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

function isActiveRoute(pathname: string, path: string): boolean {
  return path === "/"
    ? pathname === "/"
    : pathname === path || pathname.startsWith(`${path}/`);
}

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: ComponentType;
}) {
  const { pathname } = useLocation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActiveRoute(pathname, to)}>
        <Link to={to}><Icon /> <span>{label}</span></Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
```

The sidebar already uses this pattern -- see `app-sidebar.tsx` for the full example with ShadCN `SidebarMenuButton isActive`.

### Dynamic Routes

Use route params for detail pages:

```tsx
// In main.tsx children array:
{ path: "/item/:id", element: <ItemPage /> },

// In ItemPage.tsx:
import { useParams, Link } from "react-router-dom";

export function ItemPage() {
  const { id } = useParams<{ id: string }>();
  return <div>Item {id} <Link to="/">Back</Link></div>;
}
```

### Sidebar Behavior

Use the sidebar only when it fits the requested product. If the app keeps the sidebar, keep the shadcn sidebar primitives intact:
- `AppLayout` must keep `SidebarProvider`, `AppSidebar`, `SidebarInset`, and a visible `SidebarTrigger`.
- `AppSidebar` must keep `<Sidebar collapsible="icon">` on desktop so the trigger collapses the full sidebar into a visible icon rail. Do not set `collapsible="none"` unless the user explicitly asks for a permanently fixed sidebar.
- Sidebar collapse styling deliberately uses explicit data-attribute variants like `[[data-collapsible=icon]_&]:hidden` and `[[data-collapsible=icon]_&]:w-[--sidebar-width-icon]`. Do not convert these back to `group-data-[collapsible=icon]:...`; recent Tailwind/shadcn combinations can miss those generated CSS rules and make the trigger appear inactive.
- New navigation items belong in `navItems` and should render through `SidebarMenuButton asChild isActive={...}`.
- When adding custom header/footer/sidebar text, hide text-only elements in icon mode with `[[data-collapsible=icon]_&]:hidden` and keep icons visible.
- For mobile navigation, prefer the built-in sidebar behavior. Add a bottom nav only when the app design needs it, and do not remove the sidebar trigger by accident.

If the requested app should not have a sidebar, remove `AppSidebar` from the shell and replace `AppLayout` intentionally with a complete layout that still renders `<Outlet />` and preserves route error handling.

### Navigation Mistakes (DO NOT)

- Do NOT use `<a href="...">` for internal links -- always use `<Link to="...">` from `react-router-dom`
- Do NOT use `window.location.href` for navigation -- use `useNavigate()` from `react-router-dom`
- Do NOT switch to `BrowserRouter`, `HashRouter`, or `MemoryRouter`
- Do NOT create page components without adding them to the router `children` array in `main.tsx`
- Do NOT remove `errorElement` from the layout route
- Do NOT nest routers -- use a single `createBrowserRouter` with nested routes
- Do NOT use `useRouteError()` in your page components

## Authentication
Convex Auth is pre-configured with Password and Anonymous providers.

```tsx
import { Authenticated, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function MyComponent() {
  const user = useQuery(api.auth.loggedInUser);

  return (
    <>
      <Authenticated>
        <p>Welcome, {user?.name}</p>
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}
```

Components available: `<SignInForm />`, `<SignOutButton />`

## React backend usage
- import from "@convex" to load convex generated api. Example:
```tsx
  import { useQuery, useMutation } from 'convex/react';
  import { api } from "@convex/_generated/api";

  export function Page() {
    const data = useQuery(api.table.getData, { Id }) ?? [];
    const addDataMutation = useMutation(api.table.addData);
  }
  ...

```

## UI Components
All ShadCN components are in `./src/components/ui/*`. Import and use them directly:
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```
**Do not rewrite these components.**

## Example
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function Example() {
  return (
    <Card className="max-w-sm">
      <CardContent className="p-4 flex gap-2">
        <Button>Click</Button>
      </CardContent>
    </Card>
  )
}
```

## Convex Backend
- You can use all the Convex functionality, located at `convex`. Follow the existing patterns and guidelines carefully to avoid breakage.
- Convex is preconfigured with all needed env variables
- Logs from backend is included to get_runtime_errors tool

## Convex Auth Schema Contract
- `convex/schema.ts` already includes `...authTables` from `@convex-dev/auth/server`. This owns the `users` table and the required auth indexes.
- Do not define `users: defineTable(...)` for ordinary app data. Put app-specific profile/domain data in a separate table such as `profiles`, `members`, or `userSettings` with `userId: v.id("users")`.
- Only customize the `users` table when explicitly changing Convex Auth user documents. If you do, inline the documented Convex Auth users schema, keep all auth fields compatible, and preserve the framework-required `.index("email", ["email"])` name. Do not rename it to `by_email`.
- The generic Convex index naming rule (`by_field`) does not override Convex Auth's required `users.email` index name.

## Demo, Initial, and User-Scoped Data
When the developer asks you to add, seed, or change backend data, do it directly in Convex with a proper query/mutation/action or one-off script.

- First decide whether the requested data is global app data or belongs to a specific end user.
- For global app data, seed or update it directly in the appropriate Convex table.
- For end-user-scoped data, inspect the existing backend `users` records before choosing a `userId`.
- If exactly one backend user exists, use that user's `_id` for the requested data change.
- If multiple backend users exist, ask the developer which user should receive the data. Include useful identifiers such as email, name, and `_id`.
- If no backend users exist, do not invent a target user. Ask the developer whether to create a user, wait for sign-in, or make the data global instead.
- For agent-driven seeding or admin data changes, prefer `internalQuery` helpers for inspection and `internalMutation` helpers for writes.
- Do not weaken existing public mutations or remove auth checks just to seed data.
- For user-facing app behavior, keep using public `query`/`mutation` functions and derive the user server-side from auth, such as `getAuthUserId(ctx)` or `ctx.auth.getUserIdentity()`. Do not accept a `userId` argument for authorization.
- For user-scoped seed/admin writes, pass the selected `Id<"users">` into an `internalMutation` and validate that the user exists before writing.

# Convex Important
 - Backend redeploy is automated and done automaticly on file changes
 - Don't create convex/_generated/* files, as they are generated automaticly
 - You are always working with single persistant backend

# Convex guidelines
## Function guidelines
### New function syntax
- ALWAYS use the new function syntax for Convex functions. For example:
    ```typescript
    import { query } from "./_generated/server";
    import { v } from "convex/values";
    export const f = query({
        args: {},
        returns: v.null(),
        handler: async (ctx, args) => {
        // Function body
        },
    });
    ```

### Http endpoint syntax
- HTTP endpoints are defined in `convex/http.ts` and require an `httpAction` decorator. For example:
    ```typescript
    import { httpRouter } from "convex/server";
    import { httpAction } from "./_generated/server";
    const http = httpRouter();
    http.route({
        path: "/echo",
        method: "POST",
        handler: httpAction(async (ctx, req) => {
        const body = await req.bytes();
        return new Response(body, { status: 200 });
        }),
    });
    ```
- HTTP endpoints are always registered at the exact path you specify in the `path` field. For example, if you specify `/api/someRoute`, the endpoint will be registered at `/api/someRoute`.

### Validators
- Below is an example of an array validator:
    ```typescript
    import { mutation } from "./_generated/server";
    import { v } from "convex/values";

    export default mutation({
    args: {
        simpleArray: v.array(v.union(v.string(), v.number())),
    },
    handler: async (ctx, args) => {
        //...
    },
    });
    ```
- Below is an example of a schema with validators that codify a discriminated union type:
    ```typescript
    import { defineSchema, defineTable } from "convex/server";
    import { v } from "convex/values";

    export default defineSchema({
        results: defineTable(
            v.union(
                v.object({
                    kind: v.literal("error"),
                    errorMessage: v.string(),
                }),
                v.object({
                    kind: v.literal("success"),
                    value: v.number(),
                }),
            ),
        )
    });
    ```
- Always use the `v.null()` validator when returning a null value. Below is an example query that returns a null value:
      ```typescript
      import { query } from "./_generated/server";
      import { v } from "convex/values";

      export const exampleQuery = query({
        args: {},
        returns: v.null(),
        handler: async (ctx, args) => {
            console.log("This query returns a null value");
            return null;
        },
      });
      ```
- Here are the valid Convex types along with their respective validators:
 Convex Type  | TS/JS type  |  Example Usage         | Validator for argument validation and schemas  | Notes                                                                                                                                                                                                 |
| ----------- | ------------| -----------------------| -----------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Id          | string      | `doc._id`              | `v.id(tableName)`                              |                                                                                                                                                                                                       |
| Null        | null        | `null`                 | `v.null()`                                     | JavaScript's `undefined` is not a valid Convex value. Functions the return `undefined` or do not return will return `null` when called from a client. Use `null` instead.                             |
| Int64       | bigint      | `3n`                   | `v.int64()`                                    | Int64s only support BigInts between -2^63 and 2^63-1. Convex supports `bigint`s in most modern browsers.                                                                                              |
| Float64     | number      | `3.1`                  | `v.number()`                                   | Convex supports all IEEE-754 double-precision floating point numbers (such as NaNs). Inf and NaN are JSON serialized as strings.                                                                      |
| Boolean     | boolean     | `true`                 | `v.boolean()`                                  |
| String      | string      | `"abc"`                | `v.string()`                                   | Strings are stored as UTF-8 and must be valid Unicode sequences. Strings must be smaller than the 1MB total size limit when encoded as UTF-8.                                                         |
| Bytes       | ArrayBuffer | `new ArrayBuffer(8)`   | `v.bytes()`                                    | Convex supports first class bytestrings, passed in as `ArrayBuffer`s. Bytestrings must be smaller than the 1MB total size limit for Convex types.                                                     |
| Array       | Array]      | `[1, 3.2, "abc"]`      | `v.array(values)`                              | Arrays can have at most 8192 values.                                                                                                                                                                  |
| Object      | Object      | `{a: "abc"}`           | `v.object({property: value})`                  | Convex only supports "plain old JavaScript objects" (objects that do not have a custom prototype). Objects can have at most 1024 entries. Field names must be nonempty and not start with "$" or "_". |
| Record      | Record      | `{"a": "1", "b": "2"}` | `v.record(keys, values)`                       | Records are objects at runtime, but can have dynamic keys. Keys must be only ASCII characters, nonempty, and not start with "$" or "_".                                                               |

### Function calling
- Use `ctx.runQuery` to call a query from a query, mutation, or action.
- Use `ctx.runMutation` to call a mutation from a mutation or action.
- Use `ctx.runAction` to call an action from an action.
- ONLY call an action from another action if you need to cross runtimes (e.g. from V8 to Node). Otherwise, pull out the shared code into a helper async function and call that directly instead.
- Try to use as few calls from actions to queries and mutations as possible. Queries and mutations are transactions, so splitting logic up into multiple calls introduces the risk of race conditions.
- All of these calls take in a `FunctionReference`. Do NOT try to pass the callee function directly into one of these calls.
- When using `ctx.runQuery`, `ctx.runMutation`, or `ctx.runAction` to call a function in the same file, specify a type annotation on the return value to work around TypeScript circularity limitations. For example,
                            ```
                            export const f = query({
                              args: { name: v.string() },
                              returns: v.string(),
                              handler: async (ctx, args) => {
                                return "Hello " + args.name;
                              },
                            });

                            export const g = query({
                              args: {},
                              returns: v.null(),
                              handler: async (ctx, args) => {
                                const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });
                                return null;
                              },
                            });
                            ```

### Function references

- Function references are pointers to registered Convex functions.
- ALWAYS use the `api` object defined by the framework in `convex/_generated/api.ts` to call public functions registered with `query`, `mutation`, or `action`. You must import the `api` object in the same file when using it and it looks like:

```ts
import { api } from "./_generated/api";
```

- ALWAYS use the `internal` object defined by the framework in `convex/_generated/api.ts` to call internal (or private) functions registered with `internalQuery`, `internalMutation`, or `internalAction`. You must import the `internal` object in the same file when using it and it looks like:

```ts
import { internal } from "./_generated/api";
```

- Convex uses file-based routing, so a public function defined in `convex/example.ts` named `f` has a function reference of `api.example.f`.
- A private function defined in `convex/example.ts` named `g` has a function reference of `internal.example.g`.
- Functions can also registered within directories nested within the `convex/` folder. For example, a public function `h` defined in `convex/messages/access.ts` has a function reference of `api.messages.access.h`.


### Api design
- Convex uses file-based routing, so thoughtfully organize files with public query, mutation, or action functions within the `convex/` directory.
- Use `query`, `mutation`, and `action` to define public functions.
- Use `internalQuery`, `internalMutation`, and `internalAction` to define private, internal functions.

## Schema guidelines
- Always define your schema in `convex/schema.ts`.
- Always import the schema definition functions from `convex/server`:
- System fields are automatically added to all documents and are prefixed with an underscore. The two system fields that are automatically added to all documents are `_creationTime` which has the validator `v.number()` and `_id` which has the validator `v.id(tableName)`.
- Always include all index fields in the index name. For example, if an index is defined as `["field1", "field2"]`, the index name should be "by_field1_and_field2".
- Exception: Convex Auth's `users.email` index is a framework contract. If you explicitly customize the Auth `users` table, preserve `.index("email", ["email"])`; do not rename it to `by_email`.
- Index fields must be queried in the same order they are defined. If you want to be able to query by "field1" then "field2" and by "field2" then "field1", you must create separate indexes.
- Do not store unbounded lists as an array field inside a document. Create a separate table for child items with a foreign key back to the parent.
- Separate high-churn operational data (e.g. heartbeats, online status, typing indicators) from stable profile data into dedicated tables.

## Typescript guidelines
- You can use the helper typescript type `Id` imported from './_generated/dataModel' to get the type of the id for a given table. For example if there is a table called 'users' you can use `Id<'users'>` to get the type of the id for that table.
- If you need to define a `Record` make sure that you correctly provide the type of the key and value in the type. For example a validator `v.record(v.id('users'), v.string())` would have the type `Record<Id<'users'>, string>`. Below is an example of using `Record` with an `Id` type in a query:
                    ```ts
                    import { query } from "./_generated/server";
                    import { Doc, Id } from "./_generated/dataModel";

                    export const exampleQuery = query({
                        args: { userIds: v.array(v.id("users")) },
                        returns: v.record(v.id("users"), v.string()),
                        handler: async (ctx, args) => {
                            const idToUsername: Record<Id<"users">, string> = {};
                            for (const userId of args.userIds) {
                                const user = await ctx.db.get(userId);
                                if (user) {
                                    users[user._id] = user.username;
                                }
                            }

                            return idToUsername;
                        },
                    });
                    ```
- Be strict with types, particularly around id's of documents. For example, if a function takes in an id for a document in the 'users' table, take in `Id<'users'>` rather than `string`.
- Always use `as const` for string literals in discriminated union types.
- When using the `Array` type, make sure to always define your arrays as `const array: Array<T> = [...];`
- When using the `Record` type, make sure to always define your records as `const record: Record<KeyType, ValueType> = {...};`
- Always add `@types/node` to your `package.json` when using any Node.js built-in modules.
- Use `Doc<"tableName">` from `./_generated/dataModel` for full document types.
- Use `QueryCtx`, `MutationCtx`, `ActionCtx` from `./_generated/server` for typing function contexts. NEVER use `any` for ctx parameters.

## Full text search guidelines
- A query for "10 messages in channel '#general' that best match the query 'hello hi' in their body" would look like:

const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general"),
  )
  .take(10);

## Function registration
- Use `internalQuery`, `internalMutation`, and `internalAction` to register internal functions. These are private and not part of the public API.
- Use `query`, `mutation`, and `action` for public functions. Do NOT use them for sensitive internal logic.
- You CANNOT register a function through the `api` or `internal` objects.
- ALWAYS include argument validators for all Convex functions.

## Pagination guidelines
- Use `paginationOptsValidator` from `"convex/server"` for paginated queries:
    ```typescript
    import { paginationOptsValidator } from "convex/server";
    export const listWithPagination = query({
        args: { paginationOpts: paginationOptsValidator },
        handler: async (ctx, args) => {
            return await ctx.db.query("items").order("desc").paginate(args.paginationOpts);
        },
    });
    ```
- Return shape: `{ page, isDone, continueCursor }`.

## Query guidelines
- Do NOT use `filter` in queries. Define an index in the schema and use `withIndex` instead.
- Default to bounded collections: use `.take()` or paginate instead of `.collect()` unless you are sure the table is small.
- Never use `.collect().length` to count rows. Maintain a denormalized counter in a separate document.
- Convex queries do NOT support `.delete()`. Use `.take(n)` to read batches, iterate with `ctx.db.delete(row._id)`.
- Use `.unique()` to get a single document from a query (throws if multiple matches).
- Default ordering is ascending `_creationTime`. Use `.order('asc')` or `.order('desc')` to change.
- Mutations are transactions with limits. If a mutation needs to process more documents than fit in a single transaction, process a batch with `.take(n)` and schedule continuation with `ctx.scheduler.runAfter(0, api.myModule.myMutation, args)`.
- When using async iteration, use `for await (const row of query)` syntax instead of `.collect()` or `.take(n)`.

## Mutation guidelines
- Use `ctx.db.replace` to fully replace an existing document (throws if not found).
- Use `ctx.db.patch` for shallow merge updates (throws if not found).

## Action guidelines
- Always add `"use node";` to the top of files containing actions that use Node.js built-in modules.
- Never add `"use node";` to a file that also exports queries or mutations. Put the action in a separate file.
- `fetch()` is available in the default Convex runtime. No `"use node";` needed for fetch.
- Never use `ctx.db` inside an action. Actions do not have database access.

## Scheduling guidelines
- Only use `crons.interval` or `crons.cron` methods (NOT `crons.hourly`, `crons.daily`, `crons.weekly`).
- Both methods take a FunctionReference. Do NOT pass the function directly.
- Define crons by declaring a top-level `crons` object, calling methods, and exporting as default:
    ```typescript
    import { cronJobs } from "convex/server";
    import { internal } from "./_generated/api";
    const crons = cronJobs();
    crons.interval("cleanup", { hours: 2 }, internal.crons.cleanup, {});
    export default crons;
    ```
- You can register functions within `crons.ts` like any other file.
- Always import `internal` from `_generated/api` even for functions in the same file.

## File storage guidelines
- The starter includes `convex/files.ts` and a `files` table as an optional file upload/storage example, not required infrastructure.
- If the app does not need file uploads, delete `convex/files.ts` and remove the `files` table from `convex/schema.ts` in the same change.
- If keeping `convex/files.ts`, keep or adapt the matching `files` table and indexes in `convex/schema.ts`.
- Before removing any Convex table, search for matching `ctx.db.query("table")`, `ctx.db.insert("table")`, `ctx.db.patch`, `ctx.db.delete`, `v.id("table")`, and frontend `api.<module>` references.
- `ctx.storage.getUrl()` returns a signed URL for a given file. Returns `null` if the file does not exist.
- Do NOT use the deprecated `ctx.storage.getMetadata`. Instead query the `_storage` system table:
    ```typescript
    const metadata = await ctx.db.system.get(args.fileId);
    ```
- Convex storage stores items as `Blob` objects. Convert to/from Blob when using storage.
- For file uploads, use `ctx.storage.generateUploadUrl()` in a mutation, POST the file from the client, then save the returned storageId to your database via another mutation.
- To get file metadata, query the `_storage` system table with `ctx.db.system.get`:
    ```typescript
    type FileMetadata = {
        _id: Id<"_storage">;
        _creationTime: number;
        contentType?: string;
        sha256: string;
        size: number;
    }
    const metadata: FileMetadata | null = await ctx.db.system.get(args.fileId);
    ```

# Examples:
## Example: chat-app

### Task
```
Create a real-time chat application backend with AI responses. The app should:
- Allow signed-in users to create or update display profiles
- Support multiple chat channels
- Enable users to send messages to channels
- Automatically generate AI responses to user messages
- Show recent message history

The backend should provide APIs for:
1. Profile management for authenticated users
2. Channel management (creation)
3. Message operations (sending, listing)
4. AI response generation using OpenAI's GPT-4

Messages should be stored with their channel, author, and content. The system should maintain message order
and limit history display to the 10 most recent messages per channel.

```

### Analysis
1. Task Requirements Summary:
- Build a real-time chat backend with AI integration
- Support authenticated user profile setup
- Enable channel-based conversations
- Store and retrieve messages with proper ordering
- Generate AI responses automatically

2. Main Components Needed:
- Database tables: profiles, channels, messages (auth users come from `...authTables`)
- Public APIs for profile/channel management
- Message handling functions
- Internal AI response generation system
- Context loading for AI responses

3. Public API and Internal Functions Design:
Public Mutations:
- upsertProfile:
  - file path: convex/index.ts
  - arguments: {displayName: v.string()}
  - returns: v.id("profiles")
  - purpose: Create or update the current authenticated user's app profile
- createChannel:
  - file path: convex/index.ts
  - arguments: {name: v.string()}
  - returns: v.id("channels")
  - purpose: Create a new channel with a given name
- sendMessage:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels"), content: v.string()}
  - returns: v.null()
  - purpose: Send a message as the current authenticated user and schedule a response from the AI

Public Queries:
- listMessages:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels")}
  - returns: v.array(v.object({
    _id: v.id("messages"),
    _creationTime: v.number(),
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
    }))
  - purpose: List the 10 most recent messages from a channel in descending creation order

Internal Functions:
- generateResponse:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels")}
  - returns: v.null()
  - purpose: Generate a response from the AI for a given channel
- loadContext:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels")}
  - returns: v.array(v.object({
    _id: v.id("messages"),
    _creationTime: v.number(),
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  }))
- writeAgentResponse:
  - file path: convex/index.ts
  - arguments: {channelId: v.id("channels"), content: v.string()}
  - returns: v.null()
  - purpose: Write an AI response to a given channel

4. Schema Design:
- keep `...authTables` for the Convex Auth `users` table
- profiles
  - validator: { userId: v.id("users"), displayName: v.string() }
  - indexes
    - by_userId: ["userId"]
- channels
  - validator: { name: v.string() }
  - indexes: <none>
- messages
  - validator: { channelId: v.id("channels"), authorId: v.optional(v.id("users")), content: v.string() }
  - indexes
    - by_channel: ["channelId"]

5. Background Processing:
- AI response generation runs asynchronously after each user message
- Uses OpenAI's GPT-4 to generate contextual responses
- Maintains conversation context using recent message history


### Implementation

#### convex/index.ts
```typescript
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";
import { internal } from "./_generated/api";

/**
 * Create or update an app profile for the current authenticated user.
 */
export const upsertProfile = mutation({
  args: {
    displayName: v.string(),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthenticated");
    }
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { displayName: args.displayName });
      return existing._id;
    }
    return await ctx.db.insert("profiles", {
      userId,
      displayName: args.displayName,
    });
  },
});

/**
 * Create a channel with a given name.
 */
export const createChannel = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("channels"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("channels", { name: args.name });
  },
});

/**
 * List the 10 most recent messages from a channel in descending creation order.
 */
export const listMessages = query({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      channelId: v.id("channels"),
      authorId: v.optional(v.id("users")),
      content: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);
    return messages;
  },
});

/**
 * Send a message to a channel and schedule a response from the AI.
 */
export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthenticated");
    }
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: userId,
      content: args.content,
    });
    await ctx.scheduler.runAfter(0, internal.index.generateResponse, {
      channelId: args.channelId,
    });
    return null;
  },
});

const openai = new OpenAI();

export const generateResponse = internalAction({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(internal.index.loadContext, {
      channelId: args.channelId,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: context,
    });
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }
    await ctx.runMutation(internal.index.writeAgentResponse, {
      channelId: args.channelId,
      content,
    });
    return null;
  },
});

export const loadContext = internalQuery({
  args: {
    channelId: v.id("channels"),
  },
  returns: v.array(
    v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);

    const result = [];
    for (const message of messages) {
      if (message.authorId) {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", message.authorId))
          .unique();
        const user = await ctx.db.get(message.authorId);
        const displayName =
          profile?.displayName ?? user?.name ?? user?.email ?? "User";
        result.push({
          role: "user" as const,
          content: `${displayName}: ${message.content}`,
        });
      } else {
        result.push({ role: "assistant" as const, content: message.content });
      }
    }
    return result;
  },
});

export const writeAgentResponse = internalMutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      channelId: args.channelId,
      content: args.content,
    });
    return null;
  },
});
```

#### convex/schema.ts
```typescript
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  channels: defineTable({
    name: v.string(),
  }),

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
  }).index("by_userId", ["userId"]),

  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  }).index("by_channel", ["channelId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
```

#### src/App.tsx
```typescript
export default function App() {
  return <div>Hello World</div>;
}
```
