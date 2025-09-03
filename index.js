const express = require('express');
const mongoose = require('mongoose');
const helloRoutes = require('./routes/hello');
const userRoutes = require('./routes/users');
const User = require('./models/User');
const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 连接 MongoDB
mongoose.connect('mongodb://root:76ghnp2d@dbconn.sealosbja.site:41314/?directConnection=true', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  // 创建集合和硬编码数据
  const users = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 }
  ];
  User.insertMany(users).then(() => {
    console.log('Users inserted');
  }).catch(err => {
    console.error('Error inserting users:', err);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// 使用 hello 路由
app.use('/', helloRoutes);
// 使用 users 路由
app.use('/', userRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 