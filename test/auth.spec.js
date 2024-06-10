import { expect } from 'chai';
import { describe, it } from 'mocha';
import chaiHttp from 'chai-http';
import { Request, Response } from 'express';
import { allUsers } from '../src/controllers/auth';
import { app } from '../src/app';

chaiHttp.use(chaiHttp);

describe('/Get All users', () => {
  it('should return all users in my DB', (done) => {
    chai.request(app).get('/auth/allusers').end((error, res) => {
      expect(res).to.have.status(200);
      // Additional assertions
      done();
    });
  });
});