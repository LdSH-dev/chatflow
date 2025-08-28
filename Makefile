.PHONY: up down build logs clean install

# Start all services
up:
	docker compose up -d

# Stop all services
down:
	docker compose down

# Build all services
build:
	docker compose build

# Show logs
logs:
	docker compose logs -f

# Clean up everything
clean:
	docker compose down -v --rmi all

# Install dependencies locally (for development)
install:
	cd backend/auth-service && npm install
	cd backend/message-service && npm install
	cd backend/delivery-service && npm install
	cd backend/presence-service && npm install
	cd backend/websocket-gateway && npm install
	cd frontend && npm install

# Development setup
dev-setup: install build up

# Show service status
status:
	docker compose ps

# Restart specific service
restart-auth:
	docker compose restart auth-service

restart-message:
	docker compose restart message-service

restart-delivery:
	docker compose restart delivery-service

restart-presence:
	docker compose restart presence-service

restart-websocket:
	docker compose restart websocket-gateway

restart-frontend:
	docker compose restart frontend