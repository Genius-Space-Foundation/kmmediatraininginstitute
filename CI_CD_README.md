# CI/CD Pipeline Setup for KM Media Course Registration System

This document provides a comprehensive guide to the CI/CD pipeline setup for the KM Media Course Registration System.

## 🏗️ Architecture Overview

The CI/CD pipeline is built using:

- **GitHub Actions** for continuous integration and deployment
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Nginx** for reverse proxy and load balancing
- **GitHub Container Registry** for image storage

## 📁 File Structure

```
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # Main CI/CD pipeline
├── client/
│   ├── Dockerfile                 # Production client image
│   ├── Dockerfile.dev             # Development client image
│   └── nginx.conf                 # Client nginx configuration
├── server/
│   ├── Dockerfile                 # Production server image
│   └── Dockerfile.dev             # Development server image
├── nginx/
│   ├── staging.conf               # Staging nginx configuration
│   └── production.conf            # Production nginx configuration
├── scripts/
│   └── deploy.sh                  # Deployment script
├── docker-compose.yml             # Local development
├── docker-compose.staging.yml     # Staging environment
├── docker-compose.production.yml  # Production environment
└── .dockerignore                  # Docker ignore file
```

## 🔄 CI/CD Pipeline Flow

### 1. **Lint and Test** (Triggered on: push, pull_request)

- Runs on multiple Node.js versions (16, 18, 20)
- Installs dependencies
- Lints client code
- Type checks both client and server
- Runs client tests with coverage

### 2. **Build** (Triggered on: push to main/develop)

- Builds client and server applications
- Uploads build artifacts

### 3. **Security Scan** (Triggered on: push, pull_request)

- Runs npm audit on all packages
- Checks for security vulnerabilities

### 4. **Build and Push Docker Images** (Triggered on: push to main)

- Builds Docker images for client and server
- Pushes to GitHub Container Registry
- Uses build cache for optimization

### 5. **Deploy** (Triggered on: push to main/develop)

- **Staging**: Deploys to staging environment (develop branch)
- **Production**: Deploys to production environment (main branch)

## 🚀 Getting Started

### Prerequisites

1. **Docker and Docker Compose**

   ```bash
   # Install Docker Desktop or Docker Engine
   # Docker Compose is included with Docker Desktop
   ```

2. **GitHub Repository Setup**
   - Enable GitHub Actions in your repository
   - Set up GitHub Container Registry access
   - Configure environment secrets

### Environment Variables

Create a `.env` file in the root directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_PATH=./database.sqlite

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### GitHub Secrets

Configure these secrets in your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `JWT_SECRET`: Your JWT secret key
   - `DEPLOY_SSH_KEY`: SSH key for server deployment
   - `DEPLOY_HOST`: Deployment server hostname
   - `DEPLOY_USER`: Deployment server username
   - `DOMAIN`: kmmediatraininginstitute.com

## 🐳 Docker Commands

### Local Development

```bash
# Start development environment with hot reload
docker-compose --profile dev up -d

# Start production-like environment
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Building Images

```bash
# Build client image
docker build -t kmmedia-client ./client

# Build server image
docker build -t kmmedia-server ./server

# Build with specific tags
docker build -t kmmedia-client:latest ./client
docker build -t kmmedia-server:latest ./server
```

### Running Containers

```bash
# Run client container
docker run -p 3000:80 kmmedia-client

# Run server container
docker run -p 5000:5000 -e JWT_SECRET=your-secret kmmedia-server

# Run with environment file
docker run -p 5000:5000 --env-file .env kmmedia-server
```

## 🚀 Deployment

### Using the Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy to local environment
./scripts/deploy.sh local

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### Manual Deployment

#### Staging Environment

```bash
# Pull latest images
docker-compose -f docker-compose.staging.yml pull

# Deploy
docker-compose -f docker-compose.staging.yml up -d

# Check status
docker-compose -f docker-compose.staging.yml ps
```

#### Production Environment

```bash
# Pull latest images
docker-compose -f docker-compose.production.yml pull

# Deploy
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

## 🔧 Configuration

### Nginx Configuration

The Nginx configurations are optimized for:

- **Security**: SSL/TLS, security headers, rate limiting
- **Performance**: Gzip compression, caching, load balancing
- **Reliability**: Health checks, failover

### Environment-Specific Settings

#### Staging

- HTTP only (no SSL)
- Basic rate limiting
- Single instance deployment

#### Production

- HTTPS with SSL certificates
- Advanced rate limiting
- Load balancing with multiple replicas
- Database backup service

## 📊 Monitoring and Health Checks

### Health Check Endpoints

- **Client**: `http://localhost:3000/`
- **Server**: `http://localhost:5000/api/health`
- **Production**: `https://kmmediatraininginstitute.com`
- **Staging**: `http://staging.kmmediatraininginstitute.com`

### Docker Health Checks

Both client and server containers include health checks:

```bash
# Check container health
docker ps

# View health check logs
docker inspect <container_id> | grep -A 10 "Health"
```

## 🔒 Security Considerations

### Environment Variables

- Never commit sensitive data to version control
- Use GitHub Secrets for production credentials
- Rotate JWT secrets regularly

### Container Security

- Run containers as non-root users
- Use multi-stage builds to minimize attack surface
- Keep base images updated

### Network Security

- Use internal Docker networks
- Implement rate limiting
- Configure proper CORS settings

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Check build logs
   docker-compose logs build

   # Clean and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

2. **Container Won't Start**

   ```bash
   # Check container logs
   docker-compose logs <service_name>

   # Check resource usage
   docker stats
   ```

3. **Network Issues**
   ```bash
   # Check network connectivity
   docker network ls
   docker network inspect <network_name>
   ```

### Debug Commands

```bash
# Enter running container
docker exec -it <container_name> sh

# View real-time logs
docker-compose logs -f --tail=100

# Check resource usage
docker stats --no-stream

# Inspect container configuration
docker inspect <container_name>
```

## 📈 Performance Optimization

### Build Optimization

- Use Docker layer caching
- Implement multi-stage builds
- Optimize .dockerignore files

### Runtime Optimization

- Configure proper resource limits
- Use connection pooling
- Implement caching strategies

### Monitoring

- Set up logging aggregation
- Monitor resource usage
- Track application metrics

## 🔄 Continuous Improvement

### Regular Maintenance

- Update base images monthly
- Review and update dependencies
- Monitor security advisories

### Pipeline Enhancements

- Add automated testing
- Implement blue-green deployments
- Set up monitoring and alerting

## 📞 Support

For issues or questions about the CI/CD setup:

1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Consult Docker documentation
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
