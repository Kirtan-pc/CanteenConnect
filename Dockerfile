FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
ARG VITE_BACKEND_URL=https://canteenconnect.onrender.com
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=frontend-builder /frontend/dist ./public
EXPOSE 10000
CMD ["node", "index.js"]
