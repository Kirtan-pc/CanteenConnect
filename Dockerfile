FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
ENV VITE_FIREBASE_API_KEY=AIzaSyCRgXtwdA2-adpOfjwuaYIyYTZ9SBDp0F8
ENV VITE_FIREBASE_AUTH_DOMAIN=canteenconnect-894bd.firebaseapp.com
ENV VITE_FIREBASE_PROJECT_ID=canteenconnect-894bd
ENV VITE_FIREBASE_STORAGE_BUCKET=canteenconnect-894bd.firebasestorage.app
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=234785606294
ENV VITE_FIREBASE_APP_ID=1:234785606294:web:2bdacbb683cb2adee450b7
ENV VITE_FIREBASE_MEASUREMENT_ID=G-4VKLTDWR6P
ENV VITE_GOOGLE_MAPS_API_KEY=AIzaSyBodtM1SEVQeitat5jPPDv5v4mrqKSnvDA
ENV VITE_RAZORPAY_KEY_ID=rzp_test_ScYWzfeATK9Hgt
ENV VITE_BACKEND_URL=https://canteenconnect.onrender.com
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=frontend-builder /frontend/dist ./public
EXPOSE 10000
CMD ["node", "index.js"]
