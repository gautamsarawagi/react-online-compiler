import pool from '../config/database.js'

export class Component {
  static async create(code) {
    try {
      const query = `
        INSERT INTO components (code)
        VALUES ($1)
        RETURNING id, code, created_at, updated_at
      `
      const values = [code]
      const result = await pool.query(query, values)
      return result.rows[0]
    } catch (error) {
      throw new Error(`Error creating component: ${error.message}`)
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT id, code, created_at, updated_at
        FROM components
        WHERE id = $1
      `
      const values = [id]
      const result = await pool.query(query, values)
      return result.rows[0] || null
    } catch (error) {
      throw new Error(`Error finding component: ${error.message}`)
    }
  }

  static async update(id, code) {
    try {
      const query = `
        UPDATE components
        SET code = $2
        WHERE id = $1
        RETURNING id, code, created_at, updated_at
      `
      const values = [id, code]
      const result = await pool.query(query, values)
      return result.rows[0] || null
    } catch (error) {
      throw new Error(`Error updating component: ${error.message}`)
    }
  }

  static async delete(id) {
    try {
      const query = `
        DELETE FROM components
        WHERE id = $1
        RETURNING id
      `
      const values = [id]
      const result = await pool.query(query, values)
      return result.rows[0] || null
    } catch (error) {
      throw new Error(`Error deleting component: ${error.message}`)
    }
  }
} 