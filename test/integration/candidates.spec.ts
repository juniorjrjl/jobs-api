import e from "express"
import supertest from "supertest"
import { app } from "../../src/app"
import { Candidate, sequelize } from "../../src/models"
import { CandidateInstance } from "../../src/models/candidate"
import { candidateFactory } from "../../src/models/factories/candidate"

describe('candidates endpoints', () =>{
    let candidates: CandidateInstance[]

    beforeEach(async () =>{
        await sequelize.sync({ force: true })
        candidates = await Candidate.bulkCreate(candidateFactory.buildList(5))
    })

    afterAll(async () =>{
        await sequelize.close()
    })

    it('should return all candidates', async () =>{
        const response = await supertest(app).get('/candidates')
        expect(response.statusCode).toBe(200)
        expect(response.body.length).toBe(5)
    })

    it('should create a unique candidate when given valid properties', async () =>{
        const newCandidate = candidateFactory.build()
        const {body, status} = await supertest(app).post('/candidates').send(newCandidate)

        expect(status).toBe(201)
        expect(body).toHaveProperty('id')
        expect(body.name).toBe(newCandidate.name)
        expect(body.bio).toBe(newCandidate.bio)
        expect(body.email).toBe(newCandidate.email)
        expect(body.phone).toBe(newCandidate.phone)
        expect(body.openToWork).toBe(newCandidate.openToWork)
        expect(body).toHaveProperty('createdAt')
        expect(body).toHaveProperty('updatedAt')
    })

    it('should not create a unique candidate without a name', async () =>{
        const { bio, email, phone, openToWork } = candidateFactory.build()
        const {body, status} = await supertest(app).post('/candidates').send({ 
            bio, 
            email, 
            phone, 
            openToWork 
        })

        expect(status).toBe(400)
        expect(body.message).toBeDefined()
    })

    it('should not create a unique candidate without a name', async () =>{
        const { name, bio, phone, openToWork } = candidateFactory.build()
        const {body, status} = await supertest(app).post('/candidates').send({ 
            name,
            bio,  
            phone, 
            openToWork 
        })

        expect(status).toBe(400)
        expect(body.message).toBeDefined()
    })

    it('should not create a unique candidate without a name', async () =>{
        const newCandidate = candidateFactory.build()
        newCandidate.email = candidates[0].email
        const {body, status} = await supertest(app).post('/candidates').send(newCandidate)

        expect(status).toBe(400)
        expect(body.message).toBeDefined()
    })

    it('should return a specific candidate when given a valid candidateId', async () =>{
        const {body, status} = await supertest(app).get(`/candidates/${candidates[0].id}`)
        expect(status).toBe(200)
        expect(body.id).toBe(candidates[0].id)
        expect(body.name).toBe(candidates[0].name)
        expect(body.bio).toBe(candidates[0].bio)
        expect(body.email).toBe(candidates[0].email)
        expect(body.phone).toBe(candidates[0].phone)
        expect(body.openToWork).toBe(candidates[0].openToWork)
    })

    it('should update a unique candidate without a name', async () =>{
        const name = 'James P. Sullivan'
        const email = 'sully@email.com'
        const {body, status} = await supertest(app).put(`/candidates/${candidates[0].id}`).send({
            name, 
            email
        })

        expect(status).toBe(200)
        expect(body.name).toBe(name)
        expect(body.bio).toBe(candidates[0].bio)
        expect(body.email).toBe(email)
        expect(body.phone).toBe(candidates[0].phone)
        expect(body.openToWork).toBe(candidates[0].openToWork)
    })

    it('shoud return 404 when trying to update an unexisting candidate',async () => {
        const unexistingId = candidates[candidates.length -1].id + 1
        const name = 'James P. Sullivan'
        const email = 'sully@email.com'
        const {body, status} = await supertest(app).put(`/candidates/${unexistingId}`).send({
            name, 
            email
        })

        expect(status).toBe(404)
        expect(body.message).toBe('Candidato não encontrado')
    })

    it('should delete a specific candidate when given invalid candidate id', async () => {
        const {body, status} = await supertest(app).delete(`/candidates/${candidates[0].id}`)

        const deletedCandidate = await Candidate.findByPk(candidates[0].id)

        expect(status).toBe(204)
        expect(body).toEqual({})
        expect(deletedCandidate).toBeNull()
    })

})