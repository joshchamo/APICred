# 🔮 APICred

<div align="center">
  <img src="./public/logo.png" alt="APICred Logo" width="120" style="border-radius: 24px; margin-bottom: 20px;" onerror="this.style.display='none'" />
  <p><strong>A hyper-fast, zero-overhead, security-first API testing client. No installs. No accounts. No cloud databases.</strong></p>
  
  <p>
    <a href="https://apicred.vercel.app"><strong>Explore APICred Live 🔗</strong></a> | 
    <a href="https://openspec.vercel.app"><strong>Try OpenSpec Validator 🔗</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Version-1.11.0-blueviolet?style=for-the-badge&logo=semver" alt="Version 1.11.0" />
    <img src="https://img.shields.io/badge/React-Next.js%2016-000000?style=for-the-badge&logo=nextdotjs" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/State-Zustand%205-orange?style=for-the-badge&logo=react" alt="Zustand" />
    <img src="https://img.shields.io/badge/Security-SSRF%20Protected-success?style=for-the-badge&logo=snyk" alt="Security SSRF" />
  </p>
</div>

---

### 💡 Why APICred?

Most modern REST clients (like Postman or Insomnia) have transitioned from lightweight developer utilities into heavy, cloud-sync-forced enterprise platforms. 

**APICred** is built as a counter-approach: a fast, glassmorphic, browser-native developer tool tailored for software and QA engineers who want to test endpoints, inject variables, inspect server response metadata, and export scripts instantly without accounts, cloud lock-in, or slow boot times.

All request parameters, query values, custom environments, and request history live **100% locally in your browser** (`localStorage`).

---

## 🚀 Key Features

### 1. Request Orchestrator
* **Full Protocol Support**: Test `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` endpoints with an ultra-responsive interface.
* **Params Editor**: Dynamic, spreadsheet-style key-value editor for query parameters with on/off toggles.
* **Headers Editor**: Custom request headers with automatic default headers (`Content-Type: application/json`).
* **Auth Tab (Bearer Token)**: Seamless authentication tab featuring interactive hidden password states (`Eye`/`EyeOff` toggles) that automatically compile and inject the `Authorization` header dynamically on request dispatch.
* **Body Editor**: Clean workspace supporting raw JSON payloads or custom plain text.

### 2. Intelligent Response Viewer
* **Context-Aware Visualizer**: Automatic content-type detection rendering custom Prism.js-powered syntax highlighting for JSON structures, with soft fallbacks for Raw Text / HTML.
* **Pre-wrapped Layouts**: Automatic text-wrapping prevents long single-line string payloads from being truncated, completely removing the need for horizontal scrolling.
* **Response Headers View**: A read-only, collapsible grid displaying the exact header map returned by the server (latency metrics, status codes, server signatures).
* **Dynamic Action Bar**: Copy buttons that automatically adapt (`Copy JSON` vs `Copy Content` based on content type) with an instant clipboard visual confirmation toast.

### 3. Dynamic Environment Variables
APICred supports custom named environments. Declare keys (e.g. `baseURL`, `apiKey`) and reference them using standard `{{variableName}}` interpolation anywhere inside the URL bar, query parameters, header values, auth tokens, or request body. 

```
Environment: [ Staging ]
  • host    = https://api.staging.example.com
  • api_key = stage_sec_99182

URL:  {{host}}/v1/users
Auth: Bearer {{api_key}}
```

### 4. Zero-Dependency Dynamic Mocking (Postman-Style)
Generate realistic mock data on every single request with **zero impact on bundle size**! We implemented a custom browser-native resolver that intercepts tokens prefixed with `$` and computes unique values *per occurrence, per request*:

| Dynamic Token | Description | Sample Output |
| --- | --- | --- |
| `{{$randomUUID}}` | Cryptographically safe random UUID v4 | `550e8400-e29b-41d4-a716-446655440000` |
| `{{$randomEmail}}` | Valid mock user email address | `user_a1b2c@gmail.com` |
| `{{$timestamp}}` | Current UNIX Epoch Timestamp (in seconds) | `1716123456` |
| `{{$randomInt}}` | Numerical random integer between 0 and 999 | `412` |
| `{{$randomName}}` | Full human first and last name | `Jane Miller` |
| `{{$randomBool}}` | Boolean conditional state | `true` |
| `{{$randomPhone}}` | Formatted US phone number | `+1-555-8392` |

> [!TIP]
> If a request body contains multiple instances of `{{$randomUUID}}`, the engine resolves each instance to a **different, unique UUID** — perfect for bulk-seeding operations or POST payloads!

### 5. Multi-line cURL Export
Instantly generate beautifully formatted, multi-line shell commands directly from your request configuration via the **cURL** button inside the URL bar:
```bash
# ⚠ Sensitive payload - handle with care
curl --request POST \
  --url 'https://jsonplaceholder.typicode.com/posts' \
  --header 'Authorization: Bearer <your_token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "title": "Jane Miller",
    "body": "user_a1b2c@gmail.com"
  }'
```

### 6. Local Session History
Automatically records your last 50 requests. Clicking any item instantly restores its entire state—HTTP method, query params, request headers, active body, and the original server response.

---

## 🔒 Security Architecture

* **Zero Cloud Databases**: Credentials and API keys never leave your browser. There is no server-side database or logging of your payloads.
* **SSRF Proxy Protection**: The custom serverless request proxy includes localized protection blocking requests routed to private, internal, or loopback IP subnets (e.g. `localhost`, `127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`), shutting down Server-Side Request Forgery vectors.
* **Automatic Header Redaction**: Sensitive headers like `Authorization` and `Proxy-Authorization` are automatically partially masked in the Response UI (`Bearer ghp_••••••••`) to prevent accidental leaks during screenshots, stream-sharing, or presentations, while keeping the clipboard copy action intact.
* **Unmasked Exports**: The cURL command generator remains unmasked for absolute utility in the terminal—reminding users to handle exports carefully.

---

## 🛠️ Architecture & Under the Hood

### The CORS Challenge & Next.js Serverless Proxy
A key challenge for browser-based API clients is **CORS (Cross-Origin Resource Sharing)**. The browser restricts sending cross-origin requests directly from client-side scripts. 

APICred solves this elegantly using an optimized serverless Next.js API route (`/api/proxy`). 
1. The client sends a payload summarizing the target URL, method, headers, and body to `/api/proxy`.
2. The proxy forwards the request server-side, bypassing origin limitations.
3. The serverless route captures the upstream status code, headers, and body, returning a clean, standardized response map.
4. Includes a strict 30-second timeout controller (`AbortController`) to handle slow or unresponsive APIs smoothly.

### Hydration Guard State Sync
APICred manages request states, active environments, and history using a synchronized Zustand store persisted to `localStorage`. To prevent the standard **Next.js Hydration Flicker** (where the UI renders defaults before snapping to persisted states), we designed a native hydration guard ensuring a unified, glassmorphic loading skeleton is presented during synchronization.

---

## ⚡ Quick Start — API Sandbox

To test APICred immediately, try these pre-configured sandbox endpoints:

### 1. Pokémon API (Public GET)
* **Method**: `GET`
* **URL**: `{{baseURL}}/pokemon/ditto`
* **Environment Configuration**:
  ```json
  "baseURL": "https://pokeapi.co/api/v2"
  ```

### 2. JSONPlaceholder Users (GET with Parameters)
* **Method**: `GET`
* **URL**: `{{host}}/users/{{id}}`
* **Environment Configuration**:
  ```json
  "host": "https://jsonplaceholder.typicode.com",
  "id": "3"
  ```

### 3. GitHub API — Bearer Token Auth
* **Method**: `GET`
* **URL**: `{{baseURL}}/user`
* **Step-by-Step Instructions**:
  1. Go to GitHub → Settings → Developer settings → Personal access tokens
  2. Generate a token with `read:user` scope
  3. In APICred, open the Environments panel → create an environment → add:
     * `baseURL = https://api.github.com`
  4. Select **Auth** tab → **Bearer Token** → paste your token
  5. Click **Send**!

### 4. Dynamic Variables — POST with Mock Data
* **Method**: `POST`
* **URL**: `https://jsonplaceholder.typicode.com/users`
* **Body (JSON)**:
  ```json
  {
    "id": "{{$randomUUID}}",
    "name": "{{$randomName}}",
    "email": "{{$randomEmail}}",
    "phone": "{{$randomPhone}}"
  }
  ```
  Each request generates a fully unique payload — no setup, no library.

---

## 💻 Running Locally

To run APICred on your local machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/joshchamo/APICred.git
   cd APICred
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Spin up the local Next.js development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser. The serverless CORS proxy handles local requests seamlessly.

---

## 🛠️ The QA Suite Connection

APICred is designed to pair perfectly with **OpenSpec** for a unified developer QA ecosystem:

* **[OpenSpec 🔗](https://openspec.vercel.app)**: Parse, analyze, and validate OpenAPI / Swagger documentation contracts. Compare parameters, schemas, and endpoints.
* **[APICred Studio 🔗](https://apicred.vercel.app)**: Execute active HTTP calls against target servers, inject variables, test payloads, and verify headers.
* **JSONDiff (Upcoming)**: Schema payload comparison engine to catch regression shifts between environments.

---

## 🗺️ Roadmap & Up Next
* [ ] **cURL Import**: Paste raw shell cURL commands directly into the builder to instantly auto-populate URL, method, headers, and body.
* [ ] **Response Payload Size**: Display exact payload size (in KB/MB) next to Latency in the Response metadata bar.
* [ ] **Rate Limit Tracker**: Highlight and extract rate-limit headers (e.g. `X-RateLimit-Remaining`) prominently to prevent endpoint lockout during heavy QA tests.
* [ ] **Deep Link Integrations**: Direct "Test in APICred" button mappings inside the OpenSpec OpenAPI contract dashboard.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
