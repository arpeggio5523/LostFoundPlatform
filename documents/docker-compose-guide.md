Docker Compose and Build Instructions

1. Install Docker Desktop

2. Run Docker Desktop

3. First time setup (or after changing Dockerfile/dependencies), run:
   docker compose up --build

4. For normal usage afterward, run:
   docker compose up

5. Use --build only when:
   - Dockerfile changes
   - package dependencies change (npm/pip/etc.)
   - container configuration changes
