const express = require('express');
const multer = require('multer');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 }
});

app.post('/submit', upload.single('photo'), async (req, res) => {
  const { naam, pita, mata, dob, address } = req.body;
  const photo = req.file;

  if (!naam || !pita || !mata || !dob || !address || !photo) {
    return res.status(400).send('Missing fields!');
  }

  try {
    const githubUsername = process.env.GITHUB_USER;
    const repoName = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    const fileName = `${Date.now()}-${naam.replace(/\s+/g, '-')}.json`;
    const photoName = `${Date.now()}-${naam.replace(/\s+/g, '-')}.jpg`;

    const jsonData = {
      naam,
      pita,
      mata,
      dob,
      address,
      photo: `photo/${photoName}`
    };

    await axios.put(
      `https://api.github.com/repos/${githubUsername}/${repoName}/contents/data/${fileName}`,
      {
        message: `Added data for ${naam}`,
        content: Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64')
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    await axios.put(
      `https://api.github.com/repos/${githubUsername}/${repoName}/contents/photo/${photoName}`,
      {
        message: `Uploaded photo for ${naam}`,
        content: photo.buffer.toString('base64')
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    res.send('Form submitted successfully and saved to GitHub!');
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send('Error uploading to GitHub!');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});