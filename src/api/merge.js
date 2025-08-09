// api/merge.js (for Vercel or Netlify functions)
import { tmpdir } from 'os';
import { join } from 'path';
import fs from 'fs';
import formidable from 'formidable';
import { spawn } from 'child_process';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const form = formidable({ multiples: true, uploadDir: tmpdir(), keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).send('Error parsing files');

    const audioPath = files.audio.filepath;
    const videoPath = files.video.filepath;
    const outputPath = join(tmpdir(), `merged_${Date.now()}.mp4`);

    // ffmpeg command to mux audio + video
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-i', videoPath,
      '-i', audioPath,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      outputPath,
    ]);

    ffmpeg.stderr.on('data', data => {
      console.error(data.toString());
    });

    ffmpeg.on('close', code => {
      if (code !== 0) return res.status(500).send('FFmpeg failed');

      const stream = fs.createReadStream(outputPath);
      res.setHeader('Content-Type', 'video/mp4');
      stream.pipe(res);

      stream.on('close', () => {
        fs.unlink(audioPath, () => {});
        fs.unlink(videoPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    });
  });
}
