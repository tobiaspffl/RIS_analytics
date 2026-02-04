# Use official Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy dependency list first (Docker caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose the port Flask/Gunicorn runs on
EXPOSE 5000

# Production server command
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]