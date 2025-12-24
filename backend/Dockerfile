# Use Python slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

#better caching 
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy code
COPY . .


EXPOSE 8000

# Run the application
CMD ["python", "run.py"]
