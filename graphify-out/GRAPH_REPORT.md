# Graph Report - codedemons  (2026-10-07)

## Corpus Check
- 101 files · ~224,252 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 6, .css 1, .example 1)

## Summary
- 576 nodes · 1095 edges · 30 communities (25 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Admin Panel UI
- Admin API Controller
- Client Dependencies
- Dev Run Driver
- Server Middleware Stack
- Express App Setup
- Server Dev Tooling
- Client TS Config
- Server Dependencies
- Server Bootstrap & Config
- Vite Node Config
- User Data Access
- Auth Types
- Auth Controller
- Token & Session Utils
- Server TS Config
- Auth Routes & Validators
- Session Data Access
- Package Watcher Script
- Token Data Access
- Projects Model & Seeding
- Google OAuth
- Server NPM Scripts
- Oxlint Config
- Dependency Overrides
- Client TS References

## God Nodes (most connected - your core abstractions)
1. `express` - 24 edges
2. `Ok()` - 24 edges
3. `compilerOptions` - 18 edges
4. `BadRequest` - 18 edges
5. `Home()` - 17 edges
6. `AuthController` - 17 edges
7. `compilerOptions` - 15 edges
8. `AdminController` - 15 edges
9. `NotFound` - 15 edges
10. `ik()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `startServer()` --calls--> `createApp()`  [EXTRACTED]
  server/server.ts → server/src/app.ts
- `createApp()` --indirect_call--> `errorHandler()`  [INFERRED]
  server/src/app.ts → server/src/shared/middlewares/error.middleware.ts
- `createApp()` --indirect_call--> `notFoundHandler()`  [INFERRED]
  server/src/app.ts → server/src/shared/middlewares/NotFound.middleware.ts
- `AuthController` --references--> `SessionDao`  [EXTRACTED]
  server/src/modules/public/auth/auth.controller.ts → server/src/shared/dao/session.dao.ts
- `AuthController` --references--> `TokenDAO`  [EXTRACTED]
  server/src/modules/public/auth/auth.controller.ts → server/src/shared/dao/token.dao.ts

## Import Cycles
- None detected.

## Communities (30 total, 5 thin omitted)

### Community 0 - "Admin Panel UI"
Cohesion: 0.05
Nodes (89): Admin(), Editor(), Field, IK_MAX, IKAuth, isVideo(), Item, Login() (+81 more)

### Community 1 - "Admin API Controller"
Cohesion: 0.07
Nodes (34): express, jsonwebtoken, AdminController, attempts, checkId(), mediaUrl, parse(), projectSchema (+26 more)

### Community 2 - "Client Dependencies"
Cohesion: 0.05
Nodes (45): dependencies, gsap, @gsap/react, lenis, react, react-dom, @react-three/drei, @react-three/fiber (+37 more)

### Community 3 - "Dev Run Driver"
Cohesion: 0.07
Nodes (29): ADMIN, API_PORT, children, clientDir, [cmd = "smoke", ...extraPaths], here, log(), root (+21 more)

### Community 4 - "Server Middleware Stack"
Cohesion: 0.07
Nodes (32): compression, cookie-parser, cors, eslint, helmet, hpp, jest, morgan (+24 more)

### Community 5 - "Express App Setup"
Cohesion: 0.14
Nodes (14): multer, supertest, swagger-ui-express, createApp(), frontendIndex, publicDirectory, serverDirectory, ALLOWED (+6 more)

### Community 6 - "Server Dev Tooling"
Cohesion: 0.09
Nodes (22): devDependencies, eslint, jest, pino-pretty, prettier, supertest, ts-jest, tsx (+14 more)

### Community 7 - "Client TS Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 8 - "Server Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, bcryptjs, compression, cookie-parser, cors, dotenv, express, express-validator (+12 more)

### Community 9 - "Server Bootstrap & Config"
Cohesion: 0.18
Nodes (11): dotenv, @getbrevo/brevo, pino, zod, startServer(), connectDB(), envSchema, parsedEnv (+3 more)

### Community 10 - "Vite Node Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 11 - "User Data Access"
Cohesion: 0.15
Nodes (7): bcryptjs, UserDao, User, userSchema, comparePassword(), hashPassword(), SALT_ROUNDS

### Community 12 - "Auth Types"
Cohesion: 0.18
Nodes (14): AuthenticatedRequest, ForgotPasswordRequest, ForgotPasswordRequestBody, GoogleLoginRequest, GoogleLoginRequestBody, ISessionPayload, IUserPayload, LoginRequest (+6 more)

### Community 13 - "Auth Controller"
Cohesion: 0.16
Nodes (4): AuthController, sendMail(), generateOTPToken(), generateResetPasswordToken()

### Community 14 - "Token & Session Utils"
Cohesion: 0.25
Nodes (10): COOKIE_EXPIRY_TIME, EXPIRY, OTP_EXPIRY_TIME, REFRESH_TOKEN_COOKIE_OPTIONS, RESET_PASSWORD_TOKEN_EXPIRY_TIME, SINGLE_TOKEN_COOKIE_OPTIONS, buildTokenPayload(), createSession() (+2 more)

### Community 15 - "Server TS Config"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, resolveJsonModule, rootDir (+5 more)

### Community 16 - "Auth Routes & Validators"
Cohesion: 0.27
Nodes (9): express-validator, authController, router, forgotPasswordValidators, googleLoginValidators, loginValidators, resetPasswordValidators, signupValidators (+1 more)

### Community 17 - "Session Data Access"
Cohesion: 0.20
Nodes (3): SessionDao, Session, sessionSchema

### Community 18 - "Package Watcher Script"
Cohesion: 0.22
Nodes (6): { execSync, spawn }, fs, path, watchApp(), installAndRestart(), startApp()

### Community 19 - "Token Data Access"
Cohesion: 0.24
Nodes (3): TokenDAO, Token, tokenSchema

### Community 20 - "Projects Model & Seeding"
Cohesion: 0.32
Nodes (4): mongoose, samples, Project, projectSchema

### Community 21 - "Google OAuth"
Cohesion: 0.43
Nodes (5): googleapis, createGoogleOAuthClient(), getGoogleAuthorizationUrl(), getGoogleUserFromCode(), verifyGoogleToken()

### Community 22 - "Server NPM Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, copy-db, dev, seed, start, test

### Community 23 - "Oxlint Config"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 24 - "Dependency Overrides"
Cohesion: 0.40
Nodes (5): overrides, brace-expansion, glob, node-domexception, test-exclude

## Knowledge Gaps
- **225 isolated node(s):** `here`, `root`, `serverDir`, `clientDir`, `shotsDir` (+220 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 266 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `Admin API Controller` to `Server Middleware Stack`, `Express App Setup`, `Server Bootstrap & Config`, `Auth Types`, `Token & Session Utils`, `Auth Routes & Validators`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `here`, `root`, `serverDir` to the rest of the system?**
  _225 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Panel UI` be split into smaller, more focused modules?**
  _Cohesion score 0.05274725274725275 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Server Dev Tooling` to `Server Middleware Stack`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `Admin API Controller` be split into smaller, more focused modules?**
  _Cohesion score 0.07063063063063063 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Server Dependencies` to `Server Middleware Stack`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `Client Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04609929078014184 - nodes in this community are weakly interconnected._