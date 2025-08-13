import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.YOUTUBE_API_KEY;

app.use(cors());

// プレイリストの動画一覧を取得
app.get('/videos', async (req, res) => {
  try {
    const channelId = req.query.channelId || 'UCaH8RKE2jzE4uONd9v9n0fA'; // 例: SeikinTV
    // uploadsプレイリストID取得
    const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`);
    const chData = await chRes.json();
    if (!chData.items || !chData.items[0]) {
      return res.json({ ok: false, error: 'チャンネル情報取得失敗' });
    }

    const uploadsId = chData.items[0].contentDetails.relatedPlaylists.uploads;

    // uploadsプレイリストの動画取得
    const listRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsId}&key=${API_KEY}`);
    const listData = await listRes.json();

    res.json({ ok: true, videos: listData.items || [] });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, error: err.message });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`YouTube proxy running on port ${PORT}`);
});
