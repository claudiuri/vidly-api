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
                    isAdmin: isAdmin
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
            passord = new Array(257).join('a');

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
            email = 'user@email.com'

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the user if it is valid', async () => {
            await exec();

            const user  = await User.find({ name: 'user1' });

            expect(user).not.toBeNull();
        });

        // it('should return the user if it is valid', async () => {
        //     email = 'claudio.yuri@hotmail.com'

        //     const res = await exec();

        //     console.log(res.body);
        //     expect(res.body).toHaveProperty('name', name);
        //     expect(res.body).toHaveProperty('email', email);
        // });
    });
});