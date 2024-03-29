import express from 'express'
import { candidatesController } from './controllers/candidates-controller'
import { companiesController } from './controllers/companies-controler'
import { jobsController } from './controllers/jobs-controller'

const router = express.Router()

router.get('/', (req, res) => res.json({hello: 'hello, word!'}))

router.get('/candidates', candidatesController.index)
router.get('/candidates/:id', candidatesController.show)
router.post('/candidates', candidatesController.save)
router.put('/candidates/:id', candidatesController.update)
router.delete('/candidates/:id', candidatesController.delete)

router.get('/companies', companiesController.index)
router.get('/companies/:id', companiesController.show)
router.post('/companies', companiesController.save)
router.put('/companies/:id', companiesController.update)
router.delete('/companies/:id', companiesController.delete)

router.get('/jobs', jobsController.index)
router.get('/jobs/:id', jobsController.show)
router.post('/jobs', jobsController.save)
router.put('/jobs/:id', jobsController.update)
router.delete('/jobs/:id', jobsController.delete)
router.post('/jobs/:jobId/candidates/:candidateId', jobsController.addCandidate)
router.delete('/jobs/:jobId/candidates/:candidateId', jobsController.removeCandidate)

export { router }