FROM python:3.12-slim

WORKDIR /app

# fonts-nanum: 리포트 PDF에 한글을 찍으려면 한글 글꼴이 필요하다(없으면 한글이 네모로 나온다).
RUN apt-get update && apt-get install -y --no-install-recommends gcc default-libmysqlclient-dev pkg-config fonts-nanum \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
