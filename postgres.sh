docker pull postgres:latest
docker ps | grep postgres > /dev/null || docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=root -d postgres:latest
npm run build:prisma
npm run schema