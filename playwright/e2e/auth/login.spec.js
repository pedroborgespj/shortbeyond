import { expect, test } from '@playwright/test'

import { getUser } from '../../support/factories/user'

import { authService } from '../../support/services/auth'

test.describe('POST /auth/login', () => {

    let auth

    test.beforeEach(({request})=> {
        auth = authService(request)
    })

    test('deve fazer login com sucesso', async ()=> {

        const user = getUser()

        const preCondition = await auth.createUser(user)
        expect(preCondition.status()).toBe(201)

        const response = await auth.login(user)
        expect(response.status()).toBe(200)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'Login realizado com sucesso')
        expect(body.data).toHaveProperty('token')
        expect(body.data.user).toHaveProperty('id')
        expect(body.data.user).toHaveProperty('name', user.name)
        expect(body.data.user).toHaveProperty('email', user.email)
        expect(body.data.user).not.toHaveProperty('password')

    })

    test('não deve logar com senha incorreta', async ()=> {

        const user = getUser()

        const preCondition = await auth.createUser(user)
        expect(preCondition.status()).toBe(201)

        const response = await auth.login({...user, password: '123456'})
        expect(response.status()).toBe(401)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'Credenciais inválidas')

    })

    test('não deve logar com email que não foi cadastrado', async ()=> {

        const user = {
            email: '404@dev.com',
            password: 'pwd123'
        }

        const response = await auth.login(user)
        expect(response.status()).toBe(401)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'Credenciais inválidas')

    })

    test('não deve logar quando o email não é informado', async ()=> {

        const user = {
            password: 'pwd123'
        }

        const response = await auth.login(user)
        expect(response.status()).toBe(400)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'O campo \'Email\' é obrigatório')

    })

    test('não deve logar quando o password não é informado', async ()=> {

        const user = {
            email: 'pedro@dev.com'
        }

        const response = await auth.login(user)
        expect(response.status()).toBe(400)

        const body = await response.json()
        expect(body).toHaveProperty('message', 'O campo \'Password\' é obrigatório')

    })

})