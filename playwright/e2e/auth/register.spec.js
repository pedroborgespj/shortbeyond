import { test, expect } from '../../support/fixtures'

import { getUser } from '../../support/factories/user'

test.describe('POST /auth/register', () => {

    test('deve cadastrar um novo usuário', async ({ auth }) => {

        const user = getUser()

        const response = await auth.createUser(user)

        expect(response.status()).toBe(201)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'Usuário cadastrado com sucesso!')
        expect(responseBody.user).toHaveProperty('id')
        expect(responseBody.user).toHaveProperty('name', user.name)
        expect(responseBody.user).toHaveProperty('email', user.email)
        expect(responseBody.user).not.toHaveProperty('password')

    })

    test('não deve cadastrar quando o enail já estiver em uso', async ({ auth }) => {

        const user = getUser()

        const preCondition = await auth.createUser(user)

        expect(preCondition.status()).toBe(201)

        const response = await auth.createUser(user)

        expect(response.status()).toBe(400)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'Este e-mail já está em uso. Por favor, tente outro.')

    })

    test('não deve cadastrar quando o enail é incorreto', async ({ auth }) => {

        const user = {
            name: `Pedro`,
            email: 'pedro&dev.com',
            password: 'pwd123'
        }

        const response = await auth.createUser(user)

        expect(response.status()).toBe(400)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'O campo \'Email\' deve ser um email válido')

    })

    test('não deve cadastrar quando o nome não é informado', async ({ auth }) => {

        const user = {
            email: 'pedro@dev.com',
            password: 'pwd123'
        }

        const response = await auth.createUser(user)

        expect(response.status()).toBe(400)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'O campo \'Name\' é obrigatório')

    })

    test('não deve cadastrar quando o enail não é informado', async ({ auth }) => {

        const user = {
            name: `Pedro`,
            password: 'pwd123'
        }

        const response = await auth.createUser(user)

        expect(response.status()).toBe(400)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'O campo \'Email\' é obrigatório')

    })

    test('não deve cadastrar quando o password não é informado', async ({ auth }) => {

        const user = {
            name: `Pedro`,
            email: 'pedro@dev.com'
        }

        const response = await auth.createUser(user)

        expect(response.status()).toBe(400)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'O campo \'Password\' é obrigatório')

    })

})