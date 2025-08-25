import { ComponentService } from '../services/componentService.js'

export class ComponentController {
  static async createComponent(req, res) {
    try {
      const { code } = req.body

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Code is required in request body'
        })
      }

      const component = await ComponentService.createComponent(code)

      res.status(201).json({
        success: true,
        message: 'Component created successfully',
        data: {
          id: component.id,
          code: component.code,
          created_at: component.created_at,
          updated_at: component.updated_at
        }
      })
    } catch (error) {
      console.error('Error creating component:', error)
      
      if (error.message.includes('Code must be a valid React component')) {
        return res.status(400).json({
          success: false,
          message: 'Code must be a valid React component'
        })
      } 

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      })
    }
  }

  static async getComponent(req, res) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Component ID is required'
        })
      }

      const component = await ComponentService.getComponent(id)

      res.status(200).json({
        success: true,
        message: 'Component retrieved successfully',
        data: {
          id: component.id,
          code: component.code,
          created_at: component.created_at,
          updated_at: component.updated_at
        }
      })
    } catch (error) {
      console.error('Error getting component:', error)
      console.log({error})
      
      if (error.message === 'Component not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        })
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      })
    }
  }

  static async updateComponent(req, res) {
    try {
      const { id } = req.params
      const { code } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Component ID is required'
        })
      }

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Code is required in request body'
        })
      }

      const updatedComponent = await ComponentService.updateComponent(id, code)

      res.status(200).json({
        success: true,
        message: 'Component updated successfully',
        data: {
          id: updatedComponent.id,
          code: updatedComponent.code,
          created_at: updatedComponent.created_at,
          updated_at: updatedComponent.updated_at
        }
      })
    } catch (error) {
      console.error('Error updating component:', error)
      
      if (error.message === 'Component not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        })
      }

      if (error.message.includes('Code must be a valid React component')) {
        return res.status(400).json({
          success: false,
          message: error.message
        })
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      })
    }
  }

  static async deleteComponent(req, res) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Component ID is required'
        })
      }

      await ComponentService.deleteComponent(id)

      res.status(200).json({
        success: true,
        message: 'Component deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting component:', error)
      
      if (error.message === 'Component not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        })
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      })
    }
  }
} 