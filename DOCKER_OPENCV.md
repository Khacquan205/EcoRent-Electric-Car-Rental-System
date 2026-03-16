n# Docker + OpenCvSharp

## What the Dockerfile does

- **Build stage**: .NET 8 SDK, publish with RID `linux-x64` so `OpenCvSharp4.official.runtime.linux-x64` places `libOpenCvSharpExtern.so` under `runtimes/linux-x64/native/`.
- **Runtime stage**: **Ubuntu 22.04** (not Debian) so system libraries match what the official OpenCvSharp native build expects (e.g. `libavcodec58`, `libjpeg8`, `libtesseract.so.4`).
- **.NET 8**: ASP.NET Core runtime is installed from Microsoft’s repo on Ubuntu 22.04.
- **System packages**: OpenGL/GLib, image codecs (JPEG, PNG, TIFF, OpenJPEG, OpenEXR), FFmpeg, Tesseract, GTK/Cairo, and related deps required by `libOpenCvSharpExtern.so`.
- **LD_LIBRARY_PATH**: Set to `/app` and `/app/runtimes/linux-x64/native` so the loader finds `libOpenCvSharpExtern.so` and any other native libs in the app directory.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `LD_LIBRARY_PATH` | Set in Dockerfile so the app and OpenCvSharp native libs are found. Override only if you change layout. |
| `PORT` | Port the app listens on (default `8080`). |
| `ASPNETCORE_ENVIRONMENT` | Set to `Production` in the image. |

## Debugging `DllNotFoundException`

If you still get `Unable to load shared library 'OpenCvSharpExtern' or one of its dependencies`:

### 1. Run a shell in the built image

```bash
docker build -t ecorent-car .
docker run --rm -it --entrypoint /bin/bash ecorent-car
```

### 2. Check that the native lib is present

```bash
find /app -name "*.so" -o -name "OpenCvSharp*"
ls -la /app/runtimes/linux-x64/native/
```

You should see `libOpenCvSharpExtern.so` (or similar) under `runtimes/linux-x64/native/`.

### 3. See which dependencies are missing

```bash
ldd /app/runtimes/linux-x64/native/libOpenCvSharpExtern.so
```

Any line ending in “not found” is a missing system library. Install the matching Ubuntu 22.04 package (e.g. `apt-get update && apt-get install -y <package>`) and rebuild the image.

### 4. Confirm LD_LIBRARY_PATH at runtime

```bash
echo $LD_LIBRARY_PATH
# Should include /app and /app/runtimes/linux-x64/native
```

### 5. Optional: enable the Dockerfile debug step

In the Dockerfile, uncomment the `RUN` that runs `find` and `ldd`:

```dockerfile
RUN find /app -name "*.so" -o -name "OpenCvSharp*" 2>/dev/null; \
    [ -f /app/runtimes/linux-x64/native/libOpenCvSharpExtern.so ] && ldd /app/runtimes/linux-x64/native/libOpenCvSharpExtern.so || true
```

Then `docker build` and check the build output for “not found” libraries.

## Permissions

The image runs as root by default. The app only needs read/execute access to `/app` (and its native libs). If you switch to a non-root user, ensure that user can read and execute everything under `/app`.

## Note on Tesseract

The project does not reference Tesseract in code; it is installed because `libOpenCvSharpExtern.so` may link against `libtesseract.so.4`. If you add Tesseract-based OCR later, the same image already provides the runtime library.
