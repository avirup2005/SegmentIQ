# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (layer caching — faster rebuilds)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else
COPY . .

# Expose port 7860 — this is the default port Hugging Face Spaces uses
EXPOSE 7860

# Run the app
CMD ["python", "app.py"]
