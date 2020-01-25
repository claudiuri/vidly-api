const request = require('supertest');
const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/movies', () =>{ 

    beforeEach(() => { server = require('../../index') });
    afterEach(async (done) => { 
        await Genre.deleteMany({});
        await Movie.deleteMany({});
        // mongoose.disconnect()
        server.close(); 
        done()
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

        it('should return 400 if numberInStock the movie is less than 0', async () => {
            numberInStock = -1;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if numberInStock the movie is more than 255', async () => {
            numberInStock = 256;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if dailyRentalRate the movie is less than 0', async () => {
            dailyRentalRate = -1;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if dailyRentalRate the movie is more than 255', async () => {
            dailyRentalRate = 256;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genreId the movie is invalid', async () => {
            genreId = "1234";

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

    describe('PUT /:id', () => {
        let token;
        let newTitle;
        let movie;
        let newGenreId;
        let newNumberInStock;
        let newDailyRentalRate;

        const exec = async () => {
          return await request(server)
            .put('/api/movies/' + id)
            .set('x-auth-token', token)
            .send({
                 title: newTitle,
                 numberInStock: newNumberInStock,
                 dailyRentalRate: newDailyRentalRate,
                 genreId: newGenreId
            });
        }
    
        beforeEach(async () => {
            
            genre = new Genre({ name: 'genre1' });
            await genre.save();

            movie = new Movie({ 
                title: 'movie1',
                dailyRentalRate: 10,
                numberInStock: 10,
                genre: genre 
            });

            await movie.save();
            
            token = new User().generateAuthToken();     

            id = movie._id; 
            newTitle = 'updateTitle';
            newNumberInStock = 20;
            newDailyRentalRate = 5;
            newGenreId = genre._id; 
        })
    
        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();
        
            expect(res.status).toBe(401);

        });
    
        it('should return 400 if title the movie is less than 5 characters', async () => {
            newTitle = '1234'; 
            
            const res = await exec();
        
            expect(res.status).toBe(400);
        });
    
        it('should return 400 if title the movie is more than 50 characters', async () => {
            newTitle = new Array(52).join('a');
        
            const res = await exec();
        
            expect(res.status).toBe(400);
        });
    
        it('should return 404 if id is invalid', async () => {
            id = 1;
        
            const res = await exec();
        
            expect(res.status).toBe(404);
        });
    
        it('should return 404 if genre with the given id was not found', async () => {
            id = mongoose.Types.ObjectId();
        
            const res = await exec();
        
            expect(res.status).toBe(404);
        });
    
        it('should update the movie if input is valid', async () => {
            await exec();
        
            const updatedMovie = await Movie.findById(movie._id);
        
            expect(updatedMovie.title).toBe(newTitle);
            expect(updatedMovie.numberInStock).toBe(newNumberInStock);
            expect(updatedMovie.dailyRentalRate).toBe(newDailyRentalRate);
            expect(updatedMovie).toHaveProperty('genre');
        });
    
        it('should return the updated movie if it is valid', async () => {
            const res = await exec();
        
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('genre');
            expect(res.body).toHaveProperty('title', newTitle);
            expect(res.body).toHaveProperty('numberInStock', newNumberInStock);
            expect(res.body).toHaveProperty('dailyRentalRate', newDailyRentalRate);
        });
    });  

    describe('DELETE /:id', () => {
        let token; 
        let movie; 
        let id; 

        const exec = async () => {
            return await request(server)
            .delete('/api/movies/' + id)
            .set('x-auth-token', token)
            .send();
        }

        beforeEach( async () => {
            movie = new Movie({ 
                title: 'movie1',
                dailyRentalRate: 10,
                numberInStock: 10,
                genre: genre 
            });

            await movie.save();
            
            id = movie._id; 
            token = new User({ isAdmin: true }).generateAuthToken();     
        })

        it('should return 401 if client is not logged in', async () => {
            token = ''; 

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken(); 

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1; 
            
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if no movie with the given id was found', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete the movie if input is valid', async () => {
            await exec();

            const movieInDb = await Movie.findById(id);

            expect(movieInDb).toBeNull();
        });

        it('should return the removed movie', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id', movie._id.toHexString());
            expect(res.body).toHaveProperty('title', movie.title);
            expect(res.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);
            expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
            expect(res.body).toHaveProperty('genre');
        });
    }); 
});