# Build stage – .NET 8 SDK (Debian-based)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files first for better layer caching
COPY backend/RentalCar/CAR.csproj           backend/RentalCar/
COPY backend/CAR.Infrastructure/CAR.Infrastructure.csproj backend/CAR.Infrastructure/
COPY backend/CAR.Application/CAR.Application.csproj      backend/CAR.Application/
COPY backend/CAR.Domain/CAR.Domain.csproj                 backend/CAR.Domain/

RUN dotnet restore backend/RentalCar/CAR.csproj

# Copy full backend source
COPY backend/ ./backend/

# Publish with linux-x64 RID so OpenCvSharp4.official.runtime.linux-x64 native libs are included
RUN dotnet publish backend/RentalCar/CAR.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# Runtime stage – Ubuntu 22.04 for OpenCvSharp native lib compatibility (libavcodec58, libjpeg8, etc.)
# The official OpenCvSharp runtime was built against Ubuntu 22.04; Debian 12 has different sonames.
FROM ubuntu:22.04 AS runtime
WORKDIR /app

# Avoid apt prompts in Docker
ENV DEBIAN_FRONTEND=noninteractive

# Install .NET 8 ASP.NET Core runtime (Ubuntu 22.04)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        wget \
        ca-certificates \
    && wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O /tmp/packages-microsoft-prod.deb \
    && dpkg -i /tmp/packages-microsoft-prod.deb \
    && rm /tmp/packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y --no-install-recommends aspnetcore-runtime-8.0 \
    && apt-get remove -y wget \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# OpenCvSharp + OpenCV native dependencies (required by libOpenCvSharpExtern.so)
# Based on ldd output from OpenCvSharp issues: libGL, glib, X11, FFmpeg, image libs, Tesseract, GTK/Cairo
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        # OpenGL / display
        libgl1 \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
        libgomp1 \
        libtbb12 \
        # Image codecs (JPEG, PNG, TIFF, OpenJPEG, OpenEXR)
        libjpeg8 \
        libpng16-16 \
        libtiff5 \
        libopenjp2-7 \
        libilmbase25 \
        libopenexr25 \
        # GTK/Cairo (optional but often linked by OpenCV build)
        libcairo2 \
        libgdk-pixbuf2.0-0 \
        libgtk2.0-0 \
        # Tesseract OCR (referenced by OpenCvSharpExtern)
        tesseract-ocr \
        libtesseract4 \
        # FFmpeg (libavcodec58, libavformat58, etc.)
        libavcodec58 \
        libavformat58 \
        libavutil56 \
        libswscale5 \
        # DC1394 (optional)
        libdc1394-25 \
    && rm -rf /var/lib/apt/lists/*

# Ensure native libs are found: app dir and runtimes/linux-x64/native (where OpenCvSharpExtern.so lives)
ENV LD_LIBRARY_PATH="/app:/app/runtimes/linux-x64/native"

ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080
EXPOSE 8080

COPY --from=build /app/publish .

# Optional: verify OpenCvSharp native lib and deps (uncomment to debug DllNotFoundException)
# RUN find /app -name "*.so" -o -name "OpenCvSharp*" 2>/dev/null; \
#     [ -f /app/runtimes/linux-x64/native/libOpenCvSharpExtern.so ] && ldd /app/runtimes/linux-x64/native/libOpenCvSharpExtern.so || true

ENTRYPOINT ["sh", "-c", "exec dotnet CAR.dll --urls \"http://0.0.0.0:${PORT:-8080}\""]
