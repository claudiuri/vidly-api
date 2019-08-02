const request = require('supertest');
const { User } = require('../../models/user');

let server;

describe('/api/users',  () =>{
    beforeEach(() => { server = require('../../index'); })
    afterEach(async () => { 
        server.close(); 
        await User.remove({});
    });

    describe('POST /', () => {
        
        let name;
        let email;
        let password;
        let isAdmin;

        const exec = async () => {
            return  await request(server)
                .post('/api/users')
                .send({ 
                    name: name,
                    email: email,
                    password: password,
                });
        }

        beforeEach(() => {
            name = 'user1';
            email = 'user@email.com';
            password = 'passwordUser';
            isAdmin = true;
        })

        it('should return 400 if name the user is less than 5 characters',  async () => {
            name = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if name the user is more than 50 characters',  async () => {
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if passord the user is less than 5 characters',  async () => {
            password = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if passord the user is more than 255 characters',  async () => {
            password = new Array(257).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if email the user is less than 5 characters',  async () => {
            email = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if email the user is more than 255 characters',  async () => {
            email = new Array(257).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if email the user is already registered',  async () => {
            await exec();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the user if it is valid', async () => {
            await exec();

            const user  = await User.find({ name: 'user1' });

            expect(user).not.toBeNull();
        });

        it('should return the user if it is valid', async () => {
            email = 'claudio.yuri@hotmail.com'

            const res = await exec();

            console.log(res.body);
            expect(res.body).toHaveProperty('name', name);
            expect(res.body).toHaveProperty('email', email);
        });
    });

    describe('GET /', () => {
        
        let token;

        const exec = async () => {
            return await request(server)
            .get('/api/users/me')
            .set('x-auth-token', token)
            .send();
        }

        beforeEach( async () => {
            token = new User({ isAdmin: true }).generateAuthToken();     
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await  exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if token is not valid', async () => {
            token = '3123123123123';

            const res = await  exec();

            expect(res.status).toBe(400);
        });

        it('should return user valid', async () => {
            const res = await  exec();

            expect(res.status).toBe(200);
        });
       
        
    });
});