ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest
FROM $BUILD_FROM

# Copy integration and frontend files
# Paths are relative to repository root (not haboard-local/)
COPY haboard-local/haboard /data/haboard
COPY haboard-local/www /data/www

# Copy run script
COPY haboard-local/run.sh /
RUN chmod +x /run.sh

CMD [ "/run.sh" ]
