# Makefile for managing the Super Agent Docker Compose stack

# Use a .PHONY declaration to prevent conflicts with files of the same name.
.PHONY: build up down logs shell

# The default target will be 'up'.
default: up

# Build the Docker images for the services.
build:
	sudo docker compose build

# Start the services in detached mode.
up:
	sudo docker compose up -d

# Stop and remove the containers, networks, volumes, and images created by 'up'.
down:
	sudo docker compose down

# Follow the logs of all services.
logs:
	sudo docker compose logs -f

# Get a shell into the agent container.
shell:
	sudo docker compose exec agent /bin/bash
