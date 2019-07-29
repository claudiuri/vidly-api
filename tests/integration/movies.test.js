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


});