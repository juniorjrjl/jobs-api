import supertest from "supertest"
import { app } from "../../src/app"
import { Company, sequelize } from "../../src/models"
import { CompanyInstance } from "../../src/models/company"
import { companyFactory } from "../../src/models/factories/company"

describe('companies endpoints', () =>{
    let companies: CompanyInstance[]

    beforeEach(async () =>{
        await sequelize.sync({ force: true })
        companies = await Company.bulkCreate(companyFactory.buildList(5))
    })

    afterAll(async () => await sequelize.close())

    it('should return all companies', async () =>{
        const response = await supertest(app).get('/companies')
        expect(response.statusCode).toBe(200)
        expect(response.body.length).toBe(5)
    })

    it('should create a single company when given valid properties',async () => {
        const newCompany = companyFactory.build()

        const { body, status } = await supertest(app).post('/companies').send(newCompany)

        expect(status).toBe(201)
        expect(body.id).toBeDefined()
        expect(body.name).toBe(newCompany.name)
        expect(body.bio).toBe(newCompany.bio)
        expect(body.email).toBe(newCompany.email)
        expect(body.website).toBe(newCompany.website)
        expect(body.createdAt).toBeDefined()
        expect(body.updatedAt).toBeDefined()
    })

    it('should not create a company without a name', async () => {
        const { bio, email, website } = companyFactory.build()

        const { body, status } = await supertest(app).post('/companies').send({ bio, email, website })

        expect(status).toBe(400)
        expect(body.message).toBeDefined()
    })

    it('should return a specific company when given a valid companyId', async () => {
        const { body, status } = await supertest(app).get(`/companies/${companies[0].id}`)

        expect(status).toBe(200)
        expect(body.id).toBe(companies[0].id)
        expect(body.name).toBe(companies[0].name)
        expect(body.bio).toBe(companies[0].bio)
        expect(body.email).toBe(companies[0].email)
        expect(body.website).toBe(companies[0].website)
    })

    it('should update a specific company when given a valid companyId', async () => {
        const { name, email } = companyFactory.build()
        const { body, status } = await supertest(app).put(`/companies/${companies[0].id}`).send({ name, email })

        expect(status).toBe(200)
        expect(body.id).toBe(companies[0].id)
        expect(body.name).toBe(name)
        expect(body.bio).toBe(companies[0].bio)
        expect(body.email).toBe(email)
        expect(body.website).toBe(companies[0].website)
    })

    it('should return 404 when trying to update an unexisting company', async () => {
        const unexistingId = companies[companies.length - 1].id + 1
        const { name, email } = companyFactory.build()
        const { body, status } = await supertest(app).put(`/companies/${unexistingId}`).send({ name, email })

        expect(status).toBe(404)
        expect(body.message).toBe('Empresa não encontrada')
    })

    it('should delete a specific company when given a valid companyId',async () => {
        const { body, status } = await supertest(app).delete(`/companies/${companies[0].id}`)

        const deletedCandidate = await Company.findByPk(companies[0].id)

        expect(status).toBe(204)
        expect(body).toEqual({})
        expect(deletedCandidate).toBeNull()
    })

})