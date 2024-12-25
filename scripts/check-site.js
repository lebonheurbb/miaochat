const http = require('http');

function checkSite() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, res => {
    console.log(`状态码: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ 网站可以正常访问');
    } else {
      console.log('❌ 网站返回错误状态码');
    }
  });

  req.on('error', error => {
    console.error('❌ 无法连接到网站:', error.message);
  });

  req.end();
}

// 每秒检查一次
setInterval(checkSite, 1000);
console.log('开始监控网站...'); 