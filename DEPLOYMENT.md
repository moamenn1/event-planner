# OpenShift Deployment Guide - Event Planner

## Prerequisites
✅ Red Hat Developer Sandbox account
✅ OpenShift web console access
✅ Container images pushed to Docker Hub or Quay.io

## Step 1: Prepare Container Images

Before deploying, build and push your images to a container registry:

```bash
# Login to Docker Hub
docker login

# Build images
docker build -t YOUR_USERNAME/event-planner-backend:latest ./backend
docker build -t YOUR_USERNAME/event-planner-frontend:latest ./frontend

# Push images
docker push YOUR_USERNAME/event-planner-backend:latest
docker push YOUR_USERNAME/event-planner-frontend:latest
```

**Important:** Replace `YOUR_USERNAME` in the YAML files with your actual Docker Hub username.

## Step 2: Update YAML Files

1. Open `k8s/backend.yaml` and replace `YOUR_USERNAME` with your Docker Hub username
2. Open `k8s/frontend.yaml` and replace `YOUR_USERNAME` with your Docker Hub username
3. Update the `SECRET_KEY` in `k8s/backend.yaml` to a secure random string

## Step 3: Login to OpenShift CLI (Optional)

If you prefer CLI deployment:

```bash
# Get login command from OpenShift web console (top right corner)
oc login --token=YOUR_TOKEN --server=https://api.sandbox.YOUR_CLUSTER.openshiftapps.com:6443

# Create a new project
oc new-project event-planner
```

## Step 4: Deploy Using OpenShift Web Console

### Option A: Web Console Deployment (Recommended for beginners)

1. **Login** to your OpenShift web console at https://console.redhat.com/openshift/sandbox

2. **Create a new project:**
   - Click "Create Project"
   - Name: `event-planner`
   - Click "Create"

3. **Deploy MongoDB:**
   - Click the "+" button (Import YAML) in the top navigation
   - Copy and paste the contents of `k8s/mongodb.yaml`
   - Click "Create"
   - Wait for MongoDB to be ready (check Pods in Topology view)

4. **Deploy Backend:**
   - Click the "+" button again
   - Copy and paste the contents of `k8s/backend.yaml`
   - **IMPORTANT:** First replace `YOUR_USERNAME` with your Docker Hub username
   - Click "Create"
   - Wait for backend pods to be ready

5. **Get Backend Route URL:**
   - Go to Networking → Routes
   - Find the `backend` route
   - Copy the URL (e.g., `https://backend-event-planner.apps.sandbox.xyz.openshiftapps.com`)

6. **Update Frontend Configuration:**
   - Open `k8s/frontend.yaml`
   - Replace the `VITE_API_URL` value with your backend route URL
   - Replace `YOUR_USERNAME` with your Docker Hub username

7. **Deploy Frontend:**
   - Click the "+" button
   - Copy and paste the updated `k8s/frontend.yaml` contents
   - Click "Create"

8. **Update Backend CORS:**
   - Go to Networking → Routes
   - Copy the frontend route URL
   - Go to Workloads → Deployments → backend
   - Edit YAML and update `ALLOWED_ORIGINS` env var with your frontend URL
   - Save changes

### Option B: CLI Deployment (Fast)

```bash
# Navigate to project directory
cd event-planner

# Apply all manifests
oc apply -f k8s/mongodb.yaml
oc apply -f k8s/backend.yaml
oc apply -f k8s/frontend.yaml

# Check status
oc get pods
oc get routes

# Get application URLs
echo "Frontend URL: https://$(oc get route frontend -o jsonpath='{.spec.host}')"
echo "Backend URL: https://$(oc get route backend -o jsonpath='{.spec.host}')"
```

## Step 5: Verify Deployment

1. **Check Pods Status:**
   ```bash
   oc get pods
   ```
   All pods should show `Running` status

2. **Check Routes:**
   ```bash
   oc get routes
   ```
   You should see URLs for both frontend and backend

3. **Access Application:**
   - Click on the frontend route URL
   - You should see your Event Planner application
   - Try signing up and logging in

## Step 6: Update CORS Settings

After deployment, update the backend CORS settings:

```bash
# Get the frontend URL
FRONTEND_URL=$(oc get route frontend -o jsonpath='https://{.spec.host}')

# Update backend deployment
oc set env deployment/backend ALLOWED_ORIGINS=$FRONTEND_URL
```

## Troubleshooting

### Pods not starting:
```bash
# Check pod logs
oc logs -l component=backend
oc logs -l component=frontend
oc logs -l component=database

# Describe pod for events
oc describe pod POD_NAME
```

### Image pull errors:
- Verify images are public on Docker Hub
- Or create an image pull secret for private registries

### MongoDB connection issues:
- Check if MongoDB pod is running: `oc get pods`
- Verify service DNS: `oc get svc mongodb`
- Check backend logs for connection errors

### Cannot access application:
- Verify routes exist: `oc get routes`
- Check if routes have valid URLs
- Verify pods are healthy: `oc get pods`

## Useful Commands

```bash
# View all resources
oc get all

# Scale deployments
oc scale deployment/backend --replicas=3

# View logs
oc logs -f deployment/backend

# Restart deployment
oc rollout restart deployment/backend

# Delete everything
oc delete all -l app=event-planner
oc delete pvc mongo-pvc
oc delete secret backend-secret
oc delete configmap backend-config

# Port forward for local testing
oc port-forward svc/backend 8000:8000
oc port-forward svc/frontend 5173:5173
```

## Security Notes

- Change the `SECRET_KEY` in backend-secret to a strong random value
- Use proper authentication for MongoDB in production
- Consider using OpenShift's built-in secrets management
- Review and restrict CORS origins after deployment

## Next Steps

1. Set up monitoring and logging
2. Configure auto-scaling
3. Add health check endpoints
4. Set up CI/CD pipeline
5. Configure backup for MongoDB
6. Add custom domain name

## Support

If you encounter issues:
- Check OpenShift console logs
- Review pod events
- Check the Red Hat Developer Sandbox documentation
- Use `oc describe` commands for detailed information
