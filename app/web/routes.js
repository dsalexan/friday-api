import express from 'express'
const router = express.Router()

import axios from 'axios'
import google from 'lib/google'
import { has, pick } from 'lodash'
const { OAuth2Client } = require('google-auth-library')
import jwt from 'jsonwebtoken'

// https://stackoverflow.com/questions/31450229/open-and-close-pop-up-window-using-javascript
router.get('/me', async (req, res) => {
  res.send(req.user)
})

router.get('/signin', (req, res) => {
  var url = google().generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: [
      'email',
      'profile',
      'openid',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'select_account',
  })

  res.redirect(url)
})

// https://developers.google.com/identity/protocols/oauth2

// https://developers.google.com/identity/sign-in/web/server-side-flow#java
// https://tomanagle.medium.com/google-oauth-with-node-js-4bff90180fe6
router.get('/signin/callback', async (req, res, next) => {
  try {
    const client = google()
    const code = req.query.code

    const { tokens } = await client.getToken(code)

    // Fetch the user's profile with the access token and bearer
    const { data: response } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
      {
        headers: { Authorization: `Bearer ${tokens.id_token}` },
      }
    )

    const user = pick(response, ['email', 'name', 'picture'])
    user.roles = ['usuario']
    user.google = tokens

    const token = jwt.sign(user, Buffer.from(process.env.JWT_SECRET, 'base64'), {
      algorithm: 'HS256',
      expiresIn: '1 hour',
    }) // TODO: usar refresh token ao receber coiso expirado para gerar novo

    res.redirect(`${process.env.EPLANCK_URL}?token=${token}`)
  } catch (err) {
    return next(err)
  }
})

// https://developers.google.com/identity/protocols/oauth2

// https://developers.google.com/identity/sign-in/web/server-side-flow#java
// https://tomanagle.medium.com/google-oauth-with-node-js-4bff90180fe6
router.post('/auth', async (req, res, next) => {
  try {
    const email = req.body.email

    if (!email) throw new Error('Bad Request')

    const user = {
      email,
      roles: ['usuario'],
    }

    res.json(user)
  } catch (err) {
    return next(err)
  }
})

router.post('/signin/:service', async (req, res, next) => {
  try {
    const service = req.params.service
    const token = req.user.google.id_token

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    })
    const user = ticket.getPayload()
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    const email = user.email
    // console.log(service)
    if (service === 'eduqo') {
      // VERIFICA O EMAIL NO EDUQO

      const response = await axios({
        method: 'get',
        url: process.env.EDUQO_GET_TOKEN,
        params: {
          key_id: process.env.EDUQO_KEY_ID,
          secret: process.env.EDUQO_SECRET,
          email_login_or_cpf: email,
        },
      })
      res.send({
        url: process.env.EDUQO_LOGIN_BY_TOKEN,
        token: response.data.token,
      })
    } else {
      const err = new Error(`Service "${service}" not implemented`)
      throw err
    }
  } catch (error) {
    return next(error)
  }
})

export default router
