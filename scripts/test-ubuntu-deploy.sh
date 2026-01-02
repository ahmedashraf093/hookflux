#!/bin/bash

# Script to test the Ubuntu deployment setup locally using Docker

IMAGE_NAME="hookflux-deploy-test"
CONTAINER_NAME="hookflux-test-container"

echo "Building Test Docker Image..."
docker build -f tests/deployment/Dockerfile.test -t $IMAGE_NAME .

echo "Starting Test Container..."
# Run detached so we can exec commands
docker run -d --name $CONTAINER_NAME -v $(pwd):/app $IMAGE_NAME tail -f /dev/null

echo "---------------------------------------------------"
echo "TEST 1: DRY RUN"
echo "---------------------------------------------------"
docker exec $CONTAINER_NAME bash -c "./deployment/ubuntu/setup.sh --dry-run test.example.com"

echo "---------------------------------------------------"
echo "TEST 2: WET RUN (Simulated)"
echo "---------------------------------------------------"
# Mock systemctl and certbot to avoid failures in Docker
docker exec $CONTAINER_NAME bash -c "echo -e '#!/bin/bash\necho \"[MOCK] systemctl \$@\"' > /usr/bin/systemctl && chmod +x /usr/bin/systemctl"
docker exec $CONTAINER_NAME bash -c "echo -e '#!/bin/bash\necho \"[MOCK] certbot \$@\"' > /usr/bin/certbot && chmod +x /usr/bin/certbot"

# Pass ADMIN_PASSWORD to avoid interactive prompt
docker exec -e ADMIN_PASSWORD="test_password_123" $CONTAINER_NAME bash -c "./deployment/ubuntu/setup.sh test.example.com" || true

echo "---------------------------------------------------"
echo "VERIFICATION"
echo "---------------------------------------------------"
docker exec $CONTAINER_NAME bash -c "ls -la /etc/nginx/sites-available/test.example.com && cat /etc/nginx/sites-available/test.example.com"
docker exec $CONTAINER_NAME bash -c "ls -la /etc/systemd/system/hookflux.service && cat /etc/systemd/system/hookflux.service"
docker exec $CONTAINER_NAME bash -c "node -v"
docker exec $CONTAINER_NAME bash -c "nginx -v"

echo "---------------------------------------------------"
echo "CLEANUP"
echo "---------------------------------------------------"
docker rm -f $CONTAINER_NAME

echo "Test Complete."
