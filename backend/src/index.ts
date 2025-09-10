// backend/src/index.ts
import 'dotenv/config';           // <-- PRIMERO, antes de cualquier otro import
import 'reflect-metadata';

import { AppDataSource } from './config/database';
import { ServerConstants } from './constants';
import app from './app';
import { seedNewAdmin } from './seeds';

AppDataSource.initialize()
  .then(async () => {
    console.clear();

    await seedNewAdmin();

    app.listen(ServerConstants.PORT, () => {
      console.log(`🚀 Server is running on port ${ServerConstants.PORT}`);
    });
    console.log('📦 Data Source has been initialized!');
  })
  .catch((error) => {
    console.log('❌ Error during Data Source initialization:', error);
  });
