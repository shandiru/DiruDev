# Portfolio frontend

React + Vite + Tailwind v4 + React Router.

    npm install
    npm run dev        # http://localhost:5173  (proxies /api to the backend on :5000)
    npm run build      # output in dist/

Production: set `VITE_API_URL` (see `.env.example`) to your deployed backend URL, then build.
`public/_redirects` (Netlify) and `vercel.json` (Vercel) make `/blog/...` and `/admin` work on refresh.

Routes: `/` home + contact form, `/blog`, `/blog/:slug`, `/admin` (login required).
Site text lives in `src/data.js`.
