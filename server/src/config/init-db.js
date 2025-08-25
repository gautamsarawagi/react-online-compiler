import pool from './database.js'

const initDatabase = async () => {
  try {
    
    const client = await pool.connect()
    
    // Create components table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await client.query(createTableQuery)
    
    // Create updated_at trigger function
    const createTriggerFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `
    
    await client.query(createTriggerFunction)
    
    // Create trigger for updated_at
      const createTrigger = `
      DROP TRIGGER IF EXISTS update_components_updated_at ON components;
      CREATE TRIGGER update_components_updated_at
        BEFORE UPDATE ON components
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
    
    await client.query(createTrigger)
        
    client.release()
  } catch (error) {
    throw error
  }
}

export default initDatabase

// Execute if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      process.exit(1)
    })
} 