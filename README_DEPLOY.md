# Deployment to Render

This project is prepared for deployment on [Render](https://render.com/) using a Blueprint (`render.yaml`).

## Prerequisites

1. A Render account.
2. Your code pushed to a GitHub or GitLab repository.

## Deployment Steps

1. In the Render Dashboard, click **New** -> **Blueprint**.
2. Connect your repository.
3. Render will detect the `render.yaml` file and show the resources to be created:
   - **marketplace-db**: A PostgreSQL database.
   - **marketplace-backend**: The FastAPI web service.
   - **marketplace-frontend**: The React static site.
4. Click **Apply**.

## Important Configurations

### 1. API URL (Frontend)
The `render.yaml` is configured to try and link the frontend to the backend. However, because Render's public URLs are only known after the first deployment, you might need to:
- Wait for the backend to deploy.
- Copy its public URL (e.g., `https://marketplace-backend-xxxx.onrender.com`).
- Go to the **marketplace-frontend** settings in Render -> **Environment**.
- Update `VITE_API_URL` to `https://marketplace-backend-xxxx.onrender.com/api`.
- Trigger a new deploy for the frontend.

### 2. CORS (Backend)
Similarly, the backend needs to allow the frontend's URL:
- Copy the frontend's public URL (e.g., `https://marketplace-frontend-xxxx.onrender.com`).
- Go to the **marketplace-backend** settings in Render -> **Environment**.
- Update `BACKEND_CORS_ORIGINS` to `["https://marketplace-frontend-xxxx.onrender.com"]`.
- Render will restart the service automatically.

### 3. Persistent Storage (Optional)
Currently, uploaded images are stored in `uploads/images`. On Render, the disk is ephemeral, meaning images will be deleted whenever the service restarts or redeploys.
- **For production:** It is recommended to use a service like AWS S3 or Cloudinary for image storage.
- **Temporary fix:** You can add a "Disk" to the backend service in Render for persistent storage, but this requires a paid plan.

## Manual Build & Run
If you want to test the production build locally:

**Backend:**
```bash
export DATABASE_URL=sqlite:///./test.db
export SECRET_KEY=test_secret
./build.sh
uvicorn app.main:app
```

**Frontend:**
```bash
cd marketplace-frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run build
```
