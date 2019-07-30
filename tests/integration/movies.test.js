const request = require('supertest');
const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/movies', () =>{ 

    beforeEach(() => { server = require('../../index') });
    afterEach(async () => { 
        server.close(); 
        await Genre.remove({});
        await Movie.remove({});
    });

    describe('GET /', () => {
        it('shoud return all movies',  async () => {

            let genre = new Genre({name: "genre1"});
            genre.save();
            
            await Movie.collection.insertMany([
                { title: "Movie1", genreId: genre._id, numberInStock:20, dailyRentalRate:7 },
                { title: "Movie2", genreId: genre._id, numberInStock:15, dailyRentalRate:8 },
            ]);

           const res = await request(server).get('/api/movies')
           expect(res.status).toBe(200);
           expect(res.body.length).toBe(2);
           expect(res.body.some(m => m.title === 'Movie1')).toBeTruthy();
           expect(res.body.some(m => m.title === 'Movie2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return a movie if valid id passed', async () => {
            const genre = new Genre({ name: "genre1" });
            await genre.save();

            const movie = new Movie( { title: "Movie1", genre: genre, numberInStock:20, dailyRentalRate:7 })
            await movie.save();

            const res = await request(server).get('/api/movies/' + movie._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title', movie.title);
            expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
            expect(res.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);
            expect(res.body).toHaveProperty('genreId', movie.genreId);
        });

        it('should return 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/movies/1');

            expect(res.status).toBe(404);
        });
    });

    describe('POST /',  () => {
        let token;
        let title;
        let genre;
        let genreId;
        let numberInStock;
        let dailyRentalRate;

        const exec = async () => {
            return await request(server)
                .post('/api/movies')
                .set('x-auth-token', token)
                .send({ 
                    title: title,
                    genreId: genreId,
                    numberInStock: numberInStock,
                    dailyRentalRate: dailyRentalRate
                });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            genre = new Genre({ name: "genre1" });
            genre.save()

            title = 'movie1';
            numberInStock = 20;
            dailyRentalRate = 5;
            genreId = genre._id;
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await  exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if title the movie is less than 5 characters', async () => {
            title = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if title the movie is more than 50 characters', async () => {
            title = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the movie if it is valid', async () => {
            await exec();

            const movie  = await Movie.find({ title: 'movie1' });

            expect(movie).not.toBeNull();
        });

        it('should return the movie if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('genre');
            expect(res.body).toHaveProperty('title', title);
            expect(res.body).toHaveProperty('numberInStock', numberInStock);
            expect(res.body).toHaveProperty('dailyRentalRate', dailyRentalRate);
        });
    });
});