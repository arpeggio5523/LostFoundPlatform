# MongoDB Atlas Vector Search — Setup Guide

This guide explains how to create the vector search index required for the image
similarity / "View Possible Matches" feature.

---

## Prerequisites

- A MongoDB Atlas cluster (M0 free tier is sufficient for development)
- The `items` collection must exist (it is created automatically when the first item is
  reported through the app)

---

## Step 1 — Create the Vector Search Index

1. Open [MongoDB Atlas](https://cloud.mongodb.com/) and navigate to your cluster.
2. Click **"Atlas Search"** in the left sidebar (or the **"Search"** tab on your cluster).
3. Click **"Create Search Index"**.
4. Choose **"Atlas Vector Search"** (not "Atlas Search").
5. Select **"JSON Editor"** as the configuration method.
6. Choose the correct **database** and select the **`items`** collection.
7. Set the **index name** to exactly:
   ```
   item_image_vector_index
   ```
   > This must match the `MONGODB_VECTOR_INDEX` env var (default: `item_image_vector_index`).
8. Paste the following JSON into the editor:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "imageEmbedding",
      "numDimensions": 1024,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "type"
    }
  ]
}
```

> **Important**: The `filter` field on `type` is required so the backend can filter
> results by `"Lost"` or `"Found"` during vector search.

9. Click **"Next"** → **"Create Search Index"**.
10. Wait 1–2 minutes for the index to build (status changes from *Building* to *Active*).

---

## Step 2 — Configure Environment Variables

Add the following to your `.env` file (see `.env.example` for the full template):

```env
JINA_API_KEY=your-jina-api-key-here
MONGODB_VECTOR_INDEX=item_image_vector_index
MONGODB_VECTOR_DIMENSIONS=1024
```

### Getting a Jina AI API Key

1. Go to [https://jina.ai](https://jina.ai)
2. Sign up for a free account
3. Navigate to **API Keys** in your dashboard
4. Copy the key (starts with `jina_...`)
5. Paste it as `JINA_API_KEY` in your `.env`

> The free tier provides 1 million tokens which is more than enough for development and testing.

---

## Verification

After setup, you can test the vector search by:

1. Reporting a Found item **with a photo** through the app
2. Waiting a few seconds for the embedding to be generated
3. Reporting a Lost item **with a similar photo**
4. Opening the Found item detail page and clicking **"View possible matches"**
5. The Lost item should appear with a similarity percentage

You can also verify embeddings are being stored by checking the item document in
Atlas — the `imageEmbedding` field should contain an array of 1024 numbers.
(Note: `imageEmbedding` has `select: false` in the schema, so it won't show in
normal API responses — query it directly in Atlas or via `+imageEmbedding` projection.)

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| "View possible matches" returns nothing | Atlas index not created or still building | Wait for index status to be *Active* |
| Items save but have no `imageEmbedding` | `JINA_API_KEY` missing or invalid | Check `.env` and server console for warnings |
| `$vectorSearch` error in server logs | Index name mismatch | Ensure `MONGODB_VECTOR_INDEX` matches the Atlas index name exactly |
| Jina API returns 402 | Free tier quota exceeded | Upgrade Jina plan or use a different API key |
