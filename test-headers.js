import Parse from 'parse/node.js';

Parse.initialize('X0kPntbSjK0479AWe8m6U24z31eSihdM2p5fKXZk', 'B0A2Z9W1tU8Z0q5a6g7xH0dE0gY2uF8hC8kY5w');
Parse.serverURL = 'https://parseapi.back4app.com/';

async function test() {
  try {
    const res = await Parse.Cloud.run('test', {});
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
test();
