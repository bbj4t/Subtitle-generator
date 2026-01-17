# SubGen AI - Complete Self-Hosting Guide

This guide covers the deployment of the SubGen AI frontend and the hosting of local, private AI models (LLMs/VLMs) for video analysis.

---

## 1. Hosting the Web Application

SubGen AI is a React-based Single Page Application (SPA). It can be served as static files.

### Option A: Docker (Recommended)
Create a `Dockerfile` in the root:
```dockerfile
# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option B: Manual Static Hosting
1. Run `npm run build`.
2. Upload the `dist/` folder to any provider (S3, Vercel, Netlify, Nginx).
3. **Note**: If using a custom domain, ensure your SSL certificates are valid, as `getUserMedia` and secure API calls require HTTPS.

---

## 2. Hosting the AI Model (Local LLM/VLM)

To replace Google Gemini with a local model, you need a **Vision-Language Model (VLM)** because video analysis requires frame processing.

### Software Recommendation: LocalAI
[LocalAI](https://localai.io/) provides a Gemini-compatible API layer for open-source models.

1. **Deployment via Docker**:
   ```bash
   docker run -p 8080:8080 --name local-ai -ti localai/localai:latest-aio-gpu
   ```
2. **Model Selection**: 
   Use models like **LLaVA 1.6** or **Qwen-VL**. These are excellent at "seeing" images/frames.
3. **Configuration in SubGen AI Settings**:
   - **Custom Endpoint**: `http://your-local-ip:8080`
   - **Model ID**: `llava` (or whatever you named the model in LocalAI)

### Hardware Requirements
Running video-capable AI locally is resource-intensive:
- **GPU**: NVIDIA RTX 3090/4090 (24GB VRAM) is highly recommended for 7B-13B parameter vision models.
- **RAM**: 32GB+ System RAM.
- **Storage**: SSD for fast model loading (models are typically 5GB-15GB).

---

## 3. The Data Flow Pipeline

Understanding how data moves helps in debugging your self-hosted setup:

1. **Client**: User selects a video (e.g., `clip.mp4`).
2. **Client**: Browser reads file -> Base64 encoded string.
3. **Client**: App creates an AI Request object containing the Base64 data.
4. **Network**: Request sent to `Custom Endpoint`. 
   - *Self-Hosting Note*: Ensure your local server can handle large POST payloads (default 50MB limit in app).
5. **Server (LocalAI/Gemini)**: Model processes frames -> Generates text (SRT).
6. **Client**: App parses text into the Subtitle Editor UI.

---

## 4. Troubleshooting Self-Hosted Endpoints

### CORS Issues
If your browser console shows "CORS Error", your self-hosted API server must allow requests from your web app's domain.
- **LocalAI Fix**: Set environment variable `CORS=true` and `CORS_ALLOW_ORIGINS=*`.

### Payload Size Limits
Nginx or Proxies often limit request sizes to 1MB.
- **Nginx Fix**: Add `client_max_body_size 100M;` to your configuration.

### Model Performance
Local models might struggle with precise timestamps compared to Gemini 3 Pro. If timestamps are "drifting," try:
1. Providing a higher `temperature` in the model config.
2. Using a model specifically fine-tuned for captioning.

---

## 5. Security & Privacy
By self-hosting both the app and the model, **your video data never leaves your local network**. 
- Set the `API_KEY` in SubGen AI settings to a dummy value (e.g., `sk-12345`) if your local server doesn't require authentication.
- Ensure your local endpoint is not exposed to the public internet without a VPN or Auth layer.
