import express from 'express'

import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import jwt from 'express-jwt'

import session from 'express-session'

import routes from './routes'

const app = express() // Permite acesso externo

app
  .use(morgan('dev'))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(
    session({
      secret: 'SecretMartianLudiJuvenalis',
      resave: true,
      saveUninitialized: true,
    })
  )
  .use(cors()) // Desativa o X-Powered-By: Express
  .disable('x-powered-by')
  .use('/health-check', (req, res) => res.send('OK')) // Health Check
  .use('/api', routes) // Routes
  // .use(
  //   jwt({
  //     secret: Buffer.from(process.env.JWT_SECRET, 'base64'),
  //     algorithms: ['HS256'],
  //     //algorithms: ['RS256']
  //     credentialsRequired: false,
  //   }).unless((req) => req.path === '/api/auth')
  // )
  .use(function (err, req, res, next) {
    // Error handling
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV === `development`) console.error(err)
    if (!err.statusCode) err.statusCode = 500

    res.status(err.statusCode).send({
      statusCode: err.statusCode,
      name: err.name,
      message: err.message,
    })
  })

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Listening at http://localhost:${process.env.PORT}`)
})
