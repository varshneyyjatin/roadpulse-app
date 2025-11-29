# Docker Deployment Guide

Complete guide to deploy RoadPulse using Docker.

## Prerequisites
- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

## Quick Start

### 1. Build and Run with Docker Compose
```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at: `http://localhost:3000`

### 2. Build Docker Image Manually
```bash
# Build the image
docker build -t roadpulse-frontend:latest .

# Run the container
docker run -d \
  --name roadpulse-frontend \
  -p 3000:80 \
  --restart unless-stopped \
  roadpulse-frontend:latest

# View logs
docker logs -f roadpulse-frontend

# Stop and remove
docker stop roadpulse-frontend
docker rm roadpulse-frontend
```

## Configuration

### Environment Variables
Create a `.env` file in the project root:
```env
VITE_API_BASE_URL=http://your-api-server:port
```

### Custom Port
To run on a different port, modify `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change 8080 to your desired port
```

Or with docker run:
```bash
docker run -d -p 8080:80 roadpulse-frontend:latest
```

### API Proxy Configuration
If your API is on a different server, uncomment the proxy section in `nginx.conf`:
```nginx
location /api {
    proxy_pass http://your-api-server:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Docker Commands

### View Running Containers
```bash
docker ps
```

### View All Containers
```bash
docker ps -a
```

### View Logs
```bash
# Follow logs
docker logs -f roadpulse-frontend

# Last 100 lines
docker logs --tail 100 roadpulse-frontend
```

### Execute Commands in Container
```bash
docker exec -it roadpulse-frontend sh
```

### Remove Image
```bash
docker rmi roadpulse-frontend:latest
```

### Clean Up
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (careful!)
docker system prune -a
```

## Multi-Stage Build Benefits
✅ Smaller image size (~25MB vs ~1GB)
✅ Faster deployment
✅ More secure (no build tools in production)
✅ Optimized for production

## Production Deployment

### 1. Build for Production
```bash
docker build -t roadpulse-frontend:v1.0.0 .
```

### 2. Tag for Registry
```bash
docker tag roadpulse-frontend:v1.0.0 your-registry/roadpulse-frontend:v1.0.0
```

### 3. Push to Registry
```bash
docker push your-registry/roadpulse-frontend:v1.0.0
```

### 4. Deploy on Server
```bash
docker pull your-registry/roadpulse-frontend:v1.0.0
docker run -d -p 80:80 --restart always your-registry/roadpulse-frontend:v1.0.0
```

## Health Check
The container includes a health check that runs every 30 seconds:
```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' roadpulse-frontend
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs roadpulse-frontend

# Check if port is already in use
netstat -tulpn | grep 3000
```

### Build fails
```bash
# Clear build cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t roadpulse-frontend:latest .
```

### Can't access application
- Check if container is running: `docker ps`
- Check container logs: `docker logs roadpulse-frontend`
- Verify port mapping: `docker port roadpulse-frontend`
- Check firewall settings

### Image too large
- The multi-stage build should produce a ~25MB image
- If larger, check if `.dockerignore` is properly configured

## Security Best Practices
✅ Non-root user in container
✅ Security headers configured in nginx
✅ Minimal base image (Alpine)
✅ No sensitive data in image
✅ Health checks enabled

## Performance Optimization
✅ Gzip compression enabled
✅ Static asset caching (1 year)
✅ Optimized nginx configuration
✅ Multi-stage build for smaller images

## Offline Deployment
The Docker image is completely self-contained and works offline:
1. Build the image on a machine with internet
2. Save the image: `docker save roadpulse-frontend:latest > roadpulse.tar`
3. Transfer to offline machine
4. Load the image: `docker load < roadpulse.tar`
5. Run the container

## Support
For issues or questions, check the logs first:
```bash
docker logs --tail 100 roadpulse-frontend
```
