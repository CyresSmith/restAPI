const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');

mongoose.Promise = global.Promise;

const { PORT = 3000, DB_HOST } = process.env;

mongoose
  .connect(DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch(error => {
    console.error(error.meaage);
    process.exit(1);
  });
