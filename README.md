## Running Frontend, Backend, and Database Together

To run all services (frontend, backend, and Postgres database) together, use Docker Compose. This will start the database first, then the backend, then the frontend.

**Command:**
```sh
# In the project root
docker-compose up --build
```

- The frontend will be available at [http://localhost:3000](http://localhost:3000)
- The backend API will be available at [http://localhost:8000](http://localhost:8000)
- The database runs internally and is accessible to the backend via the `DATABASE_URL` environment variable.

To stop all services, press `Ctrl+C` in the terminal or run:
```sh
docker-compose down
```

## Troubleshooting Docker Permission Errors

If you get the error:
```
dial unix /var/run/docker.sock: connect: permission denied
```
Run the following command to fix permissions (Linux/macOS only):
```sh
sudo chmod 666 /var/run/docker.sock
```
This allows your user to access the Docker daemon. On Windows, ensure Docker Desktop is running.

