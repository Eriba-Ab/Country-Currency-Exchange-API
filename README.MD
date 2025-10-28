# 🌍 Country Currency Exchange API

A simple Node.js + Express API that converts between currencies using live exchange rates.

## 🚀 Features
- Real-time currency conversion
- Country-based currency support
- RESTful endpoint design

## 🧠 Example
GET /api/exchange?from=USD&to=NGN&amount=100


Response:
```json
{
  "from": "USD",
  "to": "NGN",
  "amount": 100,
  "conversion_rate": 1600.5,
  "conversion_result": 160050
}

## ⚙️ Setup
git clone https://github.com/your-username/country-currency-exchange-api.git
cd country-currency-exchange-api
npm install
cp .env.example .env
npm run dev


---

## 🧩 GIT Commands to Create Repo

Run these step-by-step:

```bash
# 1. Create and enter project folder
mkdir country-currency-exchange-api
cd country-currency-exchange-api

# 2. Initialize git repo
git init

# 3. Initialize npm project
npm init -y

# 4. Create folders
mkdir -p src/{routes,controllers,services,utils}

# 5. Create files
touch src/app.js src/server.js src/routes/exchangeRoutes.js \
      src/controllers/exchangeController.js src/services/exchangeService.js \
      src/utils/apiClient.js .env .gitignore README.md LICENSE

# 6. Install dependencies
npm install express axios dotenv
npm install --save-dev nodemon

# 7. Add files to git
git add .

# 8. Commit changes
git commit -m "Initial commit: Country Currency Exchange API setup"

# 9. Add remote repo
git remote add origin https://github.com/<your-username>/country-currency-exchange-api.git

# 10. Push to GitHub
git branch -M main
git push -u origin main
