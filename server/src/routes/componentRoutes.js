import express from 'express'
import { ComponentController } from '../controllers/componentController.js'

const router = express.Router()

router.post('/component', ComponentController.createComponent)

router.get('/preview/:id', ComponentController.getComponent)

router.put('/component/:id', ComponentController.updateComponent)

router.delete('/component/:id', ComponentController.deleteComponent)

export default router