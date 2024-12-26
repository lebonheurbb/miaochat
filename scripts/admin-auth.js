const readline = require('readline');
const { exec } = require('child_process');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askPassword() {
  rl.question('请输入管理员密码: ', (password) => {
    if (password === process.env.ADMIN_PASSWORD) {
      console.log('密码正确，正在启动 Prisma Studio...');
      exec('npx prisma studio', (error, stdout, stderr) => {
        if (error) {
          console.error(`执行错误: ${error}`);
          return;
        }
        console.log(stdout);
        console.error(stderr);
      });
    } else {
      console.log('密码错误，访问被拒绝');
      rl.close();
    }
  });
}

console.log('⚠️ 警告：即将访问数据库管理界面');
askPassword(); 