# Portfolio v6: frontend + backend

    portfolio-v6/
      frontend/   React site + admin panel (port 5173)
      backend/    Express + MongoDB API   (port 5000)

## Run locally (two terminals)

    cd backend  && npm install && npm run dev
    cd frontend && npm install && npm run dev

Open http://localhost:5173 for the site and http://localhost:5173/admin for the admin panel.

## Admin login
Email: rubakumardirushan@gmail.com
Password: see ADMIN_PASSWORD in backend/.env (created automatically on first start;
change it there and restart to change the password).

## What the backend stores (MongoDB database "dirushan")
- events: every page view, click, section view, blog view and contact submit, with IP, country, city, device
- contacts: every contact form message (also emailed to the admin address via SMTP)
- posts: blog posts written in the admin panel (Markdown)
- admins: the admin account (password is hashed)

## Deploying
- Backend: set the same variables as .env on your host, set CLIENT_URL to the frontend origin
  (for example, https://your-site.vercel.app; no trailing slash). It trusts the proxy header so the real visitor IP/country is stored.
- Frontend: set VITE_API_URL to the backend origin (for example, https://your-api.vercel.app; no /api suffix) and redeploy.
- MongoDB Atlas: Network Access must allow your server's IP (or 0.0.0.0/0).

## Security note
backend/.env holds real secrets (database + Gmail app password). It is git-ignored, so never commit it
or share this zip publicly. Because the credentials were shared in a chat, rotate the Atlas password and the
Gmail App Password after setting up.
