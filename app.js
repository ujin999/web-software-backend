const express = require('express');
const cors = require('cors');
const db = require('./db/db');


const app = express();
const port = 5001;

const indexRouter = require('./routes/index');

app.use(cors());
app.use(express.json());

const randomValue_today = (Math.random() * 2 + 2).toFixed(1);

app.get('/', (req, res) => {
  db.query('SELECT NOW() AS now', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database query error');
    }
    res.send(`현재 DB 시간: ${results[0].now}`);
  });
});

/* Dashboard Main Section Start */
app.get('/api/dashboard', (req, res) => {
  res.json({
    // visitorsToday: 13001,
    currentUsers: (Math.random() * 100 + 500).toFixed(0),
    newSignups: (Math.random() * 10 + 50).toFixed(0),
    avgStayTime: randomValue_today,
  });
});

app.get('/api/doughnut', (req, res) => {
  const labels = ["검색엔진", "SNS", "직접 방문", "기타"];
  const data = labels.map(() => Math.floor(Math.random() * 31) + 20); // 20~50

  res.json({ labels, data });
});

app.get('/api/visit', (req, res) => {
  const query = `
    INSERT INTO total_visitors (id, count)
    VALUES (1, 1)
    ON DUPLICATE KEY UPDATE count = count + 1;
  `;

  db.query(query, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('DB error');
    }

    db.query('SELECT count FROM total_visitors WHERE id = 1', (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('DB error');
      }
      res.json({ totalVisitors: results[0].count });
    });
  });
});

app.get('/api/linev2chart', (req, res) => {
  const today = new Date();
  const dates = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const formatted = `${date.getMonth() + 1}/${date.getDate()}`;
    dates.push({ label: formatted, dateObj: date });
  }

  db.query(
    'SELECT count FROM total_visitors WHERE id = 1',
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      const todayCount = results.length > 0 ? results[0].count : 0;

      const data = dates.map((d, idx) => {
        if (idx === 6) return todayCount;
        return Math.floor(Math.random() * 300) + 100;
      });

      res.json({
        labels: dates.map(d => d.label),
        data
      });
    }
  );
});

app.get('/api/linev3chart', (req, res) => {
  const today = new Date();
  const data = [];

  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

    let randomValue = 0;

    if (i != 0) {
      randomValue = (Math.random() * 2 + 2).toFixed(1);
    } else {
      randomValue = randomValue_today;
    }

    data.push({ date: formattedDate, value: parseFloat(randomValue) });
  }

  res.json({ chartData: data });
});
/* Dashboard Main Section End */

/* notice section start */
app.get('/api/notices', (req, res) => {
  const sql = 'SELECT * FROM noticetable ORDER BY id ASC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('공지사항 조회 실패:', err);
      res.status(500).json({ error: 'DB error' });
    } else {
      // 날짜를 'YYYY.MM.DD HH:MM' 포맷으로 변환
      const formatted = results.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
          hour12: false
        }).replace(/\./g, '-').replace(' ', ' ')
      }));
      res.json(formatted);
    }
  });
});
/* notice section end */

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});