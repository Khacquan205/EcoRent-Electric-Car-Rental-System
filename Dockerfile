# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy only backend (ignore frontend entirely)
COPY backend/ ./backend/

# Restore & publish
RUN dotnet restore backend/RentalCar/CAR.csproj
RUN dotnet publish backend/RentalCar/CAR.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

EXPOSE 8080

# Default to 8080 (good for local runs). Render will set PORT automatically.
ENV PORT=8080
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "CAR.dll"]
