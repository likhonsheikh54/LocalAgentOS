# Makefile for managing the Local Agent OS stack with AlmaLinux agent

.PHONY: build up down logs shell clean restart status test check-env pull update-deps help dev

# Default target shows help
default: help

# Build the Docker images for the services
build: check-env
	docker compose build --pull

# Start the services in detached mode
up: check-env
	docker compose up -d
	@echo "Waiting for services to be healthy..."
	@sleep 15
	@make status

# Start the services in development mode
dev: check-env
	docker compose up

# Stop and remove containers
down:
	docker compose down

# Follow the logs of all services
logs:
	docker compose logs -f

# Get a shell into the agent container
shell:
	docker compose exec agent /bin/bash

# Clean all containers and volumes
clean:
	docker compose down -v
	docker system prune -f

# Restart all services
restart: down up

# Show status of all services
status:
	@echo "Container Status:"
	@docker compose ps
	@echo "\nHealth Checks:"
	@docker compose ps --format json | jq -r '.[] | "\(.Service): \(.Health)"'

# Run tests to verify the stack is working
test: check-env
	@echo "Running integration tests..."
	@echo "\nTesting Chrome connection..."
	@curl -s http://localhost:9222/json/version > /dev/null || (echo "Chrome is not responding" && exit 1)
	@echo "✓ Chrome is healthy"
	@echo "\nTesting Model Runner..."
	@curl -s http://localhost:8080/health > /dev/null || (echo "Model Runner is not responding" && exit 1)
	@echo "✓ Model Runner is healthy"
	@echo "\nTesting Agent..."
	@docker compose exec -T agent node -e "process.exit(0)" || (echo "Agent is not responding" && exit 1)
	@echo "✓ Agent is healthy"
	@echo "\nAll tests passed! ✨"

# Check Docker Model Runner availability
check-env:
	@docker info >/dev/null 2>&1 || (echo "Error: Docker is not running" && exit 1)

# Pull latest versions of all images
pull:
	docker compose pull

# Update npm dependencies in the agent
update-deps:
	docker compose exec agent npm update

# Show help
help:
	@echo "Local Agent OS - AlmaLinux Stack - Available commands:"
	@echo ""
	@echo "  make build        - Build all services"
	@echo "  make up          - Start all services in detached mode"
	@echo "  make dev         - Start all services in development mode"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make status      - Show service status"
	@echo "  make logs        - View logs from all services"
	@echo "  make shell       - Open a shell in the agent container"
	@echo "  make test        - Run integration tests"
	@echo "  make clean       - Remove all containers and volumes"
	@echo "  make pull        - Pull latest versions of images"
	@echo "  make update-deps - Update agent dependencies"
	@echo ""
	@echo "Requirements:"
	@echo "  - Docker Desktop 4.40+ with Model Runner enabled"
	@echo "  - Apple Silicon Mac (for GPU acceleration)"
