# Country Currency & Exchange API

Backend service that:
- Fetches country data from restcountries.com
- Fetches USD-based exchange rates from open.er-api.com
- Computes estimated_gdp = population × random(1000–2000) ÷ exchange_rate
- Stores/updates records in MySQL
- Generates a summary PNG at cache/summary.png after each refresh

## Endpoints
- POST /countries/refresh -> fetch & cache (writes DB, generates image)
- GET /countries -> list countries. Query params: ?region=Africa | ?currency=NGN | ?sort=gdp_desc
- GET /countries/:name -> get single country by name (case-insensitive)
- DELETE /countries/:name -> delete by name
- GET /status -> { total_countries, last_refreshed_at }
- GET /countries/image -> serve cache/summary.png

## Env / config
Copy `.env.example` to `.env` and edit:
PORT=3000
DB_HOST=...
DB_PORT=3306
DB_NAME=...
DB_USER=...
DB_PASS=...
EXTERNAL_TIMEOUT=15000


## Setup (Linux / macOS)
1. Install system deps for `canvas`:
   - On Ubuntu:
     ```
     sudo apt-get update
     sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
     ```
   - On macOS (Homebrew):
     ```
     brew install pkg-config cairo pango libpng jpeg giflib librsvg
     ```

2. Install dependencies:
    npm install


3. Create DB and run migration:
- Create database `country_exchange_db` (or name from `.env`)
- Option A: Run SQL migration:
    node src/migrations/run_migration.js
- Option B: `sequelize.sync()` is called on server start (dev convenience).

4. Start server:
    npm start


## Using Railway
1. Create a new Railway project.
2. Connect your GitHub repo or push code to Railway.
3. Add environment variables (PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, EXTERNAL_TIMEOUT).
4. Set Start Command: `node src/server.js`
5. Deploy.

## Notes & Implementation details
- If a country has **no currencies**, `currency_code` is stored as `null`, `exchange_rate` is `null`, `estimated_gdp` is `0` (per spec) and the record is stored.
- If `currency_code` is present but not found in exchange API rates, we set `exchange_rate` to `null` and `estimated_gdp` to `null`.
- Refresh is transactional: if external API calls fail the database is not modified and a 503 is returned.
- Generated image: `cache/summary.png` contains total countries, top 5 by `estimated_gdp` (if available), and timestamp.

## Error responses
- 400 → `{"error":"Validation failed", "details":{...}}`
- 404 → `{"error":"Country not found"}`
- 503 → `{"error":"External data source unavailable", "details":"Could not fetch data from [API name]"}`
- 500 → `{"error":"Internal server error"}`

