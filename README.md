# ChatFlow - Real-time Chat MVP

Event-driven real-time chat application with microservices architecture.

## 🏗️ Architecture

- **Frontend**: Next.js with Socket.IO client (Vercel deployment)
- **Backend**: Node.js microservices with Socket.IO (Render deployment)
- **Event Bus**: Redis Pub/Sub for inter-service communication
- **Databases**: MongoDB (messages) + PostgreSQL (users/metadata)
- **Storage**: Cloudinary (free tier - 25GB) for media files
- **Containers**: Docker & Docker Compose for local development

## 🚀 Quick Start

### Option 1: Using the start script (Recommended)
```bash
./start.sh
```

### Option 2: Manual Docker Compose
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Option 3: Using Makefile
```bash
# Development setup
make dev-setup

# Start services
make up

# View logs
make logs

# Stop services
make down
```

## 📡 Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 3000 | Next.js React application |
| **WebSocket Gateway** | 4000 | Socket.IO real-time communication |
| **Auth Service** | 3001 | JWT authentication & user management |
| **Message Service** | 3002 | Message storage & validation |
| **Delivery Service** | 3003 | Message delivery orchestration |
| **Presence Service** | 3004 | User online/offline status |
| **MongoDB** | 27017 | Message storage database |
| **PostgreSQL** | 5432 | User data & metadata |
| **Redis** | 6379 | Event bus & caching |

## 🔄 Event Flow

1. **User sends message** → WebSocket Gateway receives
2. **Gateway publishes** → `message:send` event to Redis
3. **Message Service** → Stores message in MongoDB
4. **Message Service emits** → `message:created` event
5. **Delivery Service** → Processes delivery to recipient
6. **Delivery Service publishes** → `websocket:message` event
7. **Gateway delivers** → Message to recipient via Socket.IO

## 🎯 Features

- ✅ JWT Authentication (register/login)
- ✅ Real-time messaging via WebSocket
- ✅ Message persistence in MongoDB
- ✅ User presence (online/offline status)
- ✅ Typing indicators
- ✅ Message delivery status
- ✅ **Real user data** (no more mock users!)
- ✅ Dynamic user loading from PostgreSQL
- ✅ Event-driven microservices architecture
- ✅ Docker containerization
- ✅ Horizontal scaling ready
- ✅ **Media file upload** (images, videos, documents)
- ✅ **Drag & drop file upload**
- ✅ **Media preview** with thumbnails and full-screen view
- ✅ **File validation** (type, size limits)
- ✅ **Progress indicators** during upload

## 📁 Media Upload Features

### Supported File Types
- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM, OGG, AVI, MOV
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV

### File Limits
- Maximum file size: 50MB per file
- Storage: 25GB free (Cloudinary)

### Features
- Drag & drop upload interface
- File type validation
- Progress bar during upload
- Thumbnail generation for images/videos
- Full-screen image viewer
- Video player with controls
- Document download links
- Reply support for media messages

### Setup
1. Create free Cloudinary account
2. Add credentials to `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. See [Media Upload Setup Guide](docs/media-upload-setup.md) for detailed instructions

## 🛠️ Development

### Prerequisites
- Docker & Docker Compose v2+ (uses `docker compose` command)
- Node.js 18+ (for local development)

**Note**: This project uses Docker Compose v2 syntax. If you have an older version, please update Docker Desktop or install the latest Docker Compose plugin.

### Local Environment Variables

The system uses the following environment variables (configured in docker-compose.yml):

```bash
# Database URLs
MONGODB_URL=mongodb://mongodb:27017/chatflow
POSTGRES_URL=postgresql://postgres:password@postgres:5432/chatflow
REDIS_URL=redis://redis:6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Cloudinary (Free tier - 25GB storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MESSAGE_API_URL=http://localhost:3002
```

### Testing the Application

1. **Start the system**: `./start.sh`
2. **Test services**: `./test-services.sh` (optional health check)
3. **Open browser**: http://localhost:3000
4. **Register an account**: Register an account using the WebApp
6. **See real users**: Users will load from database in sidebar
7. **Chat**: Select users from sidebar and start messaging
8. **Upload media**: Click the attachment icon to send files

### Service Health Checks

```bash
# Check all services
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Message Service  
curl http://localhost:3003/health  # Delivery Service
curl http://localhost:3004/health  # Presence Service
curl http://localhost:4000/health  # WebSocket Gateway
```

## 🚀 Production Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_WEBSOCKET_URL`: Your Render WebSocket Gateway URL
   - `NEXT_PUBLIC_API_URL`: Your Render Auth Service URL
   - `NEXT_PUBLIC_MESSAGE_API_URL`: Your Render Message Service URL

### Backend (Render)
1. Use the provided `render.yaml` configuration
2. Set up MongoDB Atlas for production database
3. Configure Redis service in Render
4. Deploy each microservice separately

### Database Setup
- **MongoDB**: Use MongoDB Atlas (cloud)
- **PostgreSQL**: Use Render PostgreSQL
- **Redis**: Use Render Redis

### Media Storage Setup
- **Cloudinary**: Free tier with 25GB storage
- Configure environment variables in Render dashboard
- See [Media Upload Setup Guide](docs/media-upload-setup.md) for details

## 🔧 Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check Docker status
docker ps

# Check logs
docker compose logs [service-name]

# Restart specific service
docker compose restart [service-name]
```

**Connection issues:**
- Ensure all services are running
- Check network connectivity between containers
- Verify environment variables

**Database connection errors:**
- Wait for databases to fully initialize (30-60 seconds)
- Check database credentials in docker-compose.yml

**Media upload issues:**
- Verify Cloudinary credentials in environment variables
- Check file size (max 50MB)
- Ensure file type is supported
- See [Media Upload Setup Guide](docs/media-upload-setup.md) for troubleshooting

**Docker Compose command not found:**
```bash
# Check if you have Docker Compose v2
docker compose version

# If not, update Docker Desktop or install Docker Compose plugin
# For Ubuntu/Debian:
sudo apt-get update && sudo apt-get install docker-compose-plugin
```

**Security vulnerabilities in dependencies:**
```bash
# For frontend security updates
cd frontend && npm audit fix --force

# Check for remaining vulnerabilities
npm audit
```

**Module not found errors with @/ imports:**
```bash
# If you see "Can't resolve '@/hooks/useAuth'" or similar errors
# The issue is usually missing path mapping configuration

# Solution: Ensure tsconfig.json has:
# "baseUrl": "."
# "paths": { "@/*": ["./*"] }

# And next.config.js has webpack alias configuration
# Then rebuild the frontend:
docker compose build frontend
docker compose up -d frontend
```

**Login/Register não redireciona para tela principal:**
```bash
# This was caused by missing environment variables in docker-compose.yml
# Solution: Ensure frontend service has these environment variables:
# - NEXT_PUBLIC_API_URL=http://localhost:3001
# - NEXT_PUBLIC_MESSAGE_API_URL=http://localhost:3002
# - NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:4000

# The frontend needs these URLs to communicate with backend services
# After adding them, rebuild:
docker compose build frontend
docker compose up -d frontend
```

## 📈 Scaling Considerations

The architecture supports horizontal scaling:

- **WebSocket Gateway**: Multiple instances behind load balancer
- **Message Service**: Stateless, can run multiple instances
- **Delivery Service**: Event-driven, scales automatically
- **Presence Service**: Redis-backed, horizontally scalable
- **Databases**: MongoDB sharding, PostgreSQL read replicas
- **Media Storage**: Cloudinary scales automatically

## 🔒 Security Features

- JWT token authentication
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation
- SQL injection prevention
- File type validation
- File size limits

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/profile` - Get user profile

### Message Endpoints
- `POST /api/messages/send` - Send text message
- `POST /api/messages/upload-media` - Upload media file
- `GET /api/messages/conversation/:userId` - Get conversation
- `PUT /api/messages/:messageId/delivered` - Mark as delivered
- `PUT /api/messages/:messageId/read` - Mark as read

### Presence Endpoints
- `GET /api/presence/user/:userId` - Get user presence
- `GET /api/presence/online` - Get online users

### WebSocket Events

**Client → Server:**
- `send_message` - Send new message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `message_delivered` - Mark message delivered
- `message_read` - Mark message read

**Server → Client:**
- `new_message` - Receive new message
- `user_status` - User online/offline status
- `user_typing` - Typing indicator
- `message_status` - Message delivery/read status
