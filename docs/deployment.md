# CryptoLotto Deployment Guide

This guide covers how to deploy CryptoLotto using Docker, Docker Compose, Jenkins, and GitHub Actions for production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Deployment](#development-deployment)
- [Production Deployment](#production-deployment)
- [CI/CD with Jenkins](#cicd-with-jenkins)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Environment Configuration](#environment-configuration)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying CryptoLotto, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Node.js** (version 18 or higher)
- **Git**

For production deployments, you'll also need:

- **Jenkins** (for Jenkins CI/CD) or **GitHub Actions** (for GitHub CI/CD)
- **PostgreSQL** database
- **Redis** instance
- **SSL certificates** (for HTTPS)

## Development Deployment

### Using Docker Compose for Development

1. **Start development services:**

   ```bash
   # Start PostgreSQL and Redis for development
   docker-compose up -d
   ```

2. **Install dependencies:**

   ```bash
   npm ci
   ```

3. **Run the application in development mode:**

   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

5. **Stop development services:**
   ```bash
   docker-compose down
   ```

### Development Environment Variables

Create a `.env.development` file in the root directory:

```bash
NODE_ENV=development
POSTGRES_DB=cryptolotto_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cryptolotto_dev
REDIS_URL=redis://localhost:6379
```

## Production Deployment

### Using Docker Compose for Production

1. **Prepare environment variables:**

   ```bash
   # Copy and configure production environment
   cp .env.example .env.production
   # Edit .env.production with your production values
   ```

2. **Build and start production services:**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Verify deployment:**

   ```bash
   # Check service status
   docker-compose -f docker-compose.prod.yml ps

   # View logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Nginx Proxy: http://localhost:80

5. **Stop production services:**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

### Production Services

The production deployment includes:

- **Frontend**: Next.js application (port 3000)
- **Backend**: Express.js API (port 3001)
- **PostgreSQL**: Database (port 5432)
- **Redis**: Caching and sessions (port 6379)
- **Nginx**: Reverse proxy and load balancer (port 80/443)

### SSL/HTTPS Configuration

For production with SSL:

1. **Obtain SSL certificates** (Let's Encrypt, commercial CA, etc.)

2. **Place certificates in the nginx/ssl directory:**

   ```bash
   mkdir -p nginx/ssl
   cp your-cert.pem nginx/ssl/cert.pem
   cp your-key.pem nginx/ssl/key.pem
   ```

3. **Uncomment HTTPS configuration** in `nginx/nginx.conf`

4. **Update environment variables:**
   ```bash
   FRONTEND_URL=https://your-domain.com
   NEXT_PUBLIC_API_URL=https://api.your-domain.com
   ```

## CI/CD with Jenkins

### Jenkins Setup

1. **Install required Jenkins plugins:**
   - NodeJS Plugin
   - Docker Plugin
   - Pipeline Plugin
   - Blue Ocean (optional)

2. **Configure NodeJS installation:**
   - Go to Jenkins → Manage Jenkins → Global Tool Configuration
   - Add NodeJS installation (version 18)
   - Name it "NodeJS-18"

3. **Set up Docker Hub credentials:**
   - Go to Jenkins → Manage Jenkins → Manage Credentials
   - Add Docker Hub username/password
   - ID: "docker-hub-credentials"

4. **Create a new Pipeline job:**
   - New Item → Pipeline
   - Configure SCM to point to your repository
   - Pipeline script from SCM
   - Script Path: `Jenkinsfile`

### Jenkins Pipeline Stages

The Jenkins pipeline includes:

1. **Checkout**: Clone the repository
2. **Setup Node.js**: Configure Node.js environment
3. **Install Dependencies**: Run `npm ci`
4. **Code Quality**: Parallel linting, type checking, and format checking
5. **Test**: Run frontend and backend tests in parallel
6. **Build**: Build frontend and backend applications
7. **Security Scan**: Run security audits
8. **Build Docker Images**: Create Docker images for both services
9. **Push to Registry**: Push images to Docker Hub (main/develop branches only)
10. **Deploy to Staging**: Deploy to staging environment (develop branch)
11. **Deploy to Production**: Deploy to production with manual approval (main branch)
12. **Health Check**: Verify deployment health

### Jenkins Environment Variables

Configure these in Jenkins:

- `DOCKER_REGISTRY`: Docker registry URL
- `SLACK_WEBHOOK`: Slack notification webhook (optional)

## CI/CD with GitHub Actions

### GitHub Actions Setup

1. **Configure repository secrets:**
   - Go to Repository → Settings → Secrets and variables → Actions
   - Add required secrets (see Environment Configuration section)

2. **Enable GitHub Container Registry:**
   - The workflow uses `ghcr.io` for container registry
   - Ensure your repository has package write permissions

### GitHub Actions Workflow

The workflow includes three jobs:

1. **Test Job**: Runs on every push/PR
   - Install dependencies
   - Run linting, type checking, and tests
   - Build applications

2. **Build and Push Job**: Runs on push to main/develop
   - Build Docker images
   - Push to GitHub Container Registry

3. **Deploy Job**: Runs on push to main
   - Deploy to production server

### GitHub Secrets Required

Add these secrets to your GitHub repository:
DOCKER_REGISTRY_USERNAME
DOCKER_REGISTRY_PASSWORD
PRODUCTION_SERVER_HOST
PRODUCTION_SERVER_USER
PRODUCTION_SERVER_SSH_KEY

## Environment Configuration

### Required Environment Variables

#### Database Configuration

```bash
POSTGRES_DB=cryptolotto_prod
POSTGRES_USER=cryptolotto_user
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### Authentication

```bash
JWT_SECRET=your_jwt_secret_here_minimum_32_characters
```

#### Supabase Configuration

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Payment Providers

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

#### Solana Configuration

```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_solana_private_key
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

#### Application URLs

```bash
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Environment Files

Create environment-specific files:

- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

## Monitoring and Health Checks

### Health Check Endpoints

The application provides health check endpoints:

- **Backend Health**: `GET /health`

  ```json
  {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "environment": "production",
    "version": "1.0.0"
  }
  ```

- **Frontend Health**: `GET /` (returns 200 if healthy)

### Docker Health Checks

All services include Docker health checks:

- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping` command
- **Backend**: HTTP request to `/health`
- **Frontend**: HTTP request to root path

### Monitoring Commands

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f [service_name]

# Check resource usage
docker stats

# Inspect service health
docker inspect --format='{{.State.Health.Status}}' container_name
```

## Troubleshooting

### Common Issues

#### 1. Container Build Failures

**Problem**: Docker build fails with dependency errors

**Solution**:

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### 2. Database Connection Issues

**Problem**: Backend cannot connect to PostgreSQL

**Solutions**:

- Check PostgreSQL container is running: `docker-compose ps postgres`
- Verify environment variables are correct
- Check network connectivity: `docker network ls`
- Review PostgreSQL logs: `docker-compose logs postgres`

#### 3. Frontend Build Errors

**Problem**: Next.js build fails

**Solutions**:

- Check Node.js version compatibility
- Clear Next.js cache: `rm -rf frontend/.next`
- Verify environment variables are set
- Check for TypeScript errors: `npm run type-check:frontend`

#### 4. SSL Certificate Issues

**Problem**: HTTPS not working

**Solutions**:

- Verify certificate files exist in `nginx/ssl/`
- Check certificate validity: `openssl x509 -in cert.pem -text -noout`
- Review Nginx configuration
- Check Nginx logs: `docker-compose logs nginx`

#### 5. Performance Issues

**Problem**: Application running slowly

**Solutions**:

- Check resource usage: `docker stats`
- Review application logs for errors
- Monitor database performance
- Check Redis connection and memory usage
- Verify network latency

### Debugging Commands

```bash
# Enter container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Check environment variables inside container
docker-compose exec backend env

# Test network connectivity
docker-compose exec backend ping postgres
docker-compose exec backend ping redis

# Check file permissions
docker-compose exec backend ls -la /app

# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

### Log Locations

- **Application logs**: Available via `docker-compose logs`
- **Nginx logs**: `/var/log/nginx/` inside nginx container
- **PostgreSQL logs**: Available via `docker-compose logs postgres`
- **Redis logs**: Available via `docker-compose logs redis`

### Backup and Recovery

#### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB < backup.sql
```

#### Volume Backup

```bash
# Backup volumes
docker run --rm -v cryptolotto_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Security Considerations

### Production Security Checklist

- [ ] Use strong, unique passwords for all services
- [ ] Enable SSL/TLS encryption
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Implement rate limiting
- [ ] Use secrets management
- [ ] Enable audit logging
- [ ] Regular backups
- [ ] Network segmentation

### Security Headers

The Nginx configuration includes security headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`

### Rate Limiting

Nginx implements rate limiting:

- API endpoints: 10 requests/second
- Frontend: 30 requests/second

## Support

For deployment issues:

1. Check this documentation first
2. Review application logs
3. Check GitHub Issues
4. Contact the development team

---

**Last Updated**: January 2024
**Version**: 1.0.0
