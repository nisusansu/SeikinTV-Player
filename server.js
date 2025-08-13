import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCg4nOl7_gtStrLwF0_xoV0A'; // SeikinTVのチャンネルID

// 「uploads」プレイリストIDを取得
async function getUploadsPlaylistId(channelId) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items || data.items.length === 0) throw new Error('チャンネルが見つかりません');
  return data.items[0].contentDetails.relatedPlaylists.uploads;
}

// uploadsプレイリストから全動画を取得
async function getAllVideosFromPlaylist(playlistId) {
  let videos = [];
  let pageToken = '';
  const videoIds = new Set();

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.items) {
      for (const item of data.items) {
        const videoId = item.snippet.resourceId.videoId;
        if (!videoIds.has(videoId)) {
          videoIds.add(videoId);
          videos.push(item);
        }
      }
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return videos;
}

app.get('/videos', async (req, res) => {
  try {
    const playlistId = await getUploadsPlaylistId(CHANNEL_ID);
    const videos = await getAllVideosFromPlaylist(playlistId);
    res.json({ ok: true, videos });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
