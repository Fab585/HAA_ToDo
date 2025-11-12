ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest
FROM $BUILD_FROM

# Copy integration and frontend files
# Paths are relative to repository root (not haboard-addon/)
COPY haboard-addon/haboard /data/haboard
COPY haboard-addon/www /data/www

# Copy run script
COPY haboard-addon/run.sh /
RUN chmod +x /run.sh

CMD [ "/run.sh" ]
