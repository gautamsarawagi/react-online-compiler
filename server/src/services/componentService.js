import { Component } from '../models/Component.js'
import { validate as uuidValidate } from 'uuid';

export class ComponentService {
  static async createComponent(code) {
    try {
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        throw new Error('Code is required and must be a non-empty string')
      }

      if (!code.includes('function') && !code.includes('const') && !code.includes('class')) {
        throw new Error('Code must be a valid React component')
      }

      if (!code.includes('return') && !code.includes('render')) {
        throw new Error('Code must have a return statement or render method')
      }

      const component = await Component.create(code.trim())
      return component
    } catch (error) {
      throw error
    }
  }

  static async getComponent(id) {
    try {
      if (!id || typeof id !== 'string' || !uuidValidate(id)) {
        throw new Error('Valid component ID is required')
      }

      const component = await Component.findById(id)
      if (!component) {
        throw new Error('Component not found')
      }

      return component
    } catch (error) {
      throw error
    }
  }

  static async updateComponent(id, code) {
    try {
      if (!id || typeof id !== 'string' || !uuidValidate(id)) {
        throw new Error('Valid component ID is required')
      }

      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        throw new Error('Code is required and must be a non-empty string')
      }

      const existingComponent = await Component.findById(id)
      if (!existingComponent) {
        throw new Error('Component not found')
      }

      if (!code.includes('function') && !code.includes('const') && !code.includes('class')) {
        throw new Error('Code must be a valid React component')
      }

      if (!code.includes('return') && !code.includes('render')) {
        throw new Error('Code must have a return statement or render method')
      }

      const updatedComponent = await Component.update(id, code.trim())
      return updatedComponent
    } catch (error) {
      throw error
    }
  }

  static async deleteComponent(id) {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Valid component ID is required')
      } 

        const existingComponent = await Component.findById(id)
      if (!existingComponent) {
        throw new Error('Component not found')
      }

      const deletedComponent = await Component.delete(id)
      return deletedComponent
    } catch (error) {
      throw error
    }
  }
} 