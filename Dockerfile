# Build stage – .NET 8 SDK (matches CAR.csproj TargetFramework net8.0)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files first for better layer caching (restore only re-runs when csproj change)
COPY backend/RentalCar/CAR.csproj           backend/RentalCar/
COPY backend/CAR.Infrastructure/CAR.Infrastructure.csproj backend/CAR.Infrastructure/
COPY backend/CAR.Application/CAR.Application.csproj      backend/CAR.Application/
COPY backend/CAR.Domain/CAR.Domain.csproj                 backend/CAR.Domain/

# OpenCV native deps: required for OpenCvSharp4.official.runtime.linux-x64 (restore/publish and runtime)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
    && rm -rf /var/lib/apt/lists/*

RUN dotnet restore backend/RentalCar/CAR.csproj

# Copy full backend source
COPY backend/ ./backend/

# Publish with linux-x64 RID so Linux-specific native deps (e.g. OpenCV) resolve correctly when run in container
RUN dotnet publish backend/RentalCar/CAR.csproj \
    -c Release \
    -o /app/publish \
    -r linux-x64 \
    --self-contained false \
    /p:UseAppHost=false

# Runtime stage – .NET 8 ASP.NET runtime (Debian-based)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# OpenCV native deps: required when loading OpenCvSharp native libs at runtime (e.g. after docker pull)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Listen on all interfaces so container is reachable from host; PORT respected at runtime via entrypoint
ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080
EXPOSE 8080

COPY --from=build /app/publish .

# Use shell so PORT from environment (e.g. docker run -e PORT=5000 or cloud PORT) is applied at container start
ENTRYPOINT ["sh", "-c", "exec dotnet CAR.dll --urls \"http://0.0.0.0:${PORT:-8080}\""]
