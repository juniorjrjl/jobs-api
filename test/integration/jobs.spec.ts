import supertest from "supertest"
import { app } from "../../src/app"
import { Candidate, Company, Job, sequelize } from "../../src/models"
import { CompanyInstance } from "../../src/models/company"
import { candidateFactory } from "../../src/models/factories/candidate"
import { companyFactory } from "../../src/models/factories/company"
import { jobFactory } from "../../src/models/factories/job"
import { JobInstance } from "../../src/models/job"

describe('Jobs endpoints', () => {
    let company: CompanyInstance
    let jobs: JobInstance[]

    beforeEach(async () => {
        await sequelize.sync({ force: true })
        company = await Company.create(companyFactory.build())
        jobs = await Job.bulkCreate(jobFactory.buildList(5, { companyId: company.id }))
    })

    afterAll(async () => {
        await sequelize.close()
    })

    it('should return all jobs on database', async () => {
        const response = await supertest(app).get('/jobs')

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(5)
    })

    it('should create a single company when given valid properties', async () => {
        const newJob = jobFactory.build()

        const { body, statusCode } = await supertest(app).post('/jobs').send(newJob)

        expect(statusCode).toBe(201)
        expect(body).toHaveProperty('id')
        expect(body.title).toBe(newJob.title)
        expect(body.description).toBe(newJob.description)
        expect(new Date(body.limitDate)).toEqual(newJob.limitDate)
        expect(body.companyId).toBe(newJob.companyId)
        expect(body).toHaveProperty('createdAt')
        expect(body).toHaveProperty('updatedAt')
    })

    it('should not create a job without a title', async () => {
        const { body, statusCode } = await supertest(app).post('/jobs').send({
            description: 'some job description',
            limitDate: '2022-06-01',
            companyId: company.id
        })

        expect(statusCode).toBe(400)
        expect(body.message).toBeDefined()
    })

    it('should not create a job without a description', async () => {
        const { title, limitDate, companyId } = jobFactory.build()
        const { body, statusCode } = await supertest(app).post('/jobs').send({ 
            title, 
            limitDate, 
            companyId 
        })

        expect(statusCode).toBe(400)
        expect(body.message).toBeDefined()
    })

    it('should not create a job without a limitDate', async () => {
        const { description, title } = jobFactory.build()
        const { body, statusCode } = await supertest(app).post('/jobs').send({ description, title })

        expect(statusCode).toBe(400)
        expect(body.message).toBeDefined()
    })

    it('should not create a job without a companyId', async () => {
        const { description, limitDate, title } = jobFactory.build()
        const { body, statusCode } = await supertest(app).post('/jobs').send({ 
            description, 
            limitDate, 
            title 
        })

        expect(statusCode).toBe(400)
        expect(body.message).toBeDefined()
    })

    it('should return a specific job when given a valid jobId', async () => {
        const { body, statusCode } = await supertest(app).get(`/jobs/${jobs[0].id}`)

        expect(statusCode).toBe(200)
        expect(body.id).toBe(jobs[0].id)
        expect(body.title).toBe(jobs[0].title)
        expect(body.description).toBe(jobs[0].description)
        expect(new Date(body.limitDate)).toEqual(jobs[0].limitDate)
        expect(body.companyId).toBe(jobs[0].companyId)
    })

    it('should update a specific job when given a valid jobId', async () => {
        const { body, statusCode } = await supertest(app).put(`/jobs/${jobs[0].id}`).send({
            title: 'Front-end developer',
            limitDate: '2023-01-01'
        })

        expect(statusCode).toBe(200)
        expect(body.title).toBe('Front-end developer')
        expect(body.description).toBe(jobs[0].description)
        expect(new Date(body.limitDate)).toEqual(new Date('2023-01-01'))
        expect(body.companyId).toBe(jobs[0].companyId)
    })

    it('should delete a specific job when given a valid jobId', async () => {
        const { body, statusCode } = await supertest(app).delete(`/jobs/${jobs[0].id}`)

        const deletedJob = await Job.findByPk(jobs[0].id)

        expect(statusCode).toBe(204)
        expect(body).toEqual({})
        expect(deletedJob).toBeNull()
    })

    
    it('should add a candidate to a job when given valid jobId and candidateId', async () => {
        const candidate = await Candidate.create(candidateFactory.build())

        const { body, statusCode } = await supertest(app).post(`/jobs/${jobs[0].id}/candidates/${candidate.id}`)

        const jobCandidates = await jobs[0].getCandidates()

        expect(statusCode).toBe(201)
        expect(body).toEqual({})
        expect(jobCandidates.length).toBe(1)
        expect(jobCandidates[0].id).toBe(candidate.id)
        expect(jobCandidates[0].name).toBe(candidate.name)
        expect(jobCandidates[0].email).toBe(candidate.email)
    })

    it('should return 404 when trying to add a candidate to an unexisting job', async () => {
        const candidate = await Candidate.create(candidateFactory.build())
        const unexistingJobId = jobs[jobs.length - 1].id + 1

        const { body, statusCode } = await supertest(app).post(`/jobs/${unexistingJobId}/candidates/${candidate.id}`)

        expect(statusCode).toBe(404)
        expect(body.message).toEqual('Vaga de emprego não encontrada')
    })

    it('should remove a candidate from a job when given valid jobId and candidateId', async () => {
        const candidates = await Candidate.bulkCreate(candidateFactory.buildList(3))
        await jobs[0].addCandidates(candidates.map(candidate => candidate.id))

        const { body, statusCode } = await supertest(app).delete(`/jobs/${jobs[0].id}/candidates/${candidates[0].id}`)

        const jobCandidates = await jobs[0].getCandidates()

        expect(statusCode).toBe(204)
        expect(body).toEqual({})
        expect(jobCandidates.length).toBe(2)
    })

    it('should return 404 when trying to remove a candidate from an unexisting job', async () => {
        const candidate = await Candidate.create(candidateFactory.build())
        const unexistingJobId = jobs[jobs.length - 1].id + 1

        const { body, statusCode } = await supertest(app).delete(`/jobs/${unexistingJobId}/candidates/${candidate.id}`)

        expect(statusCode).toBe(404)
        expect(body.message).toEqual('Vaga de emprego não encontrada')
    })

})