const jwt = require('jsonwebtoken')
const promisify = require('util').promisify

const sign = promisify(jwt.sign).bind(jwt)
const verify = promisify(jwt.verify).bind(jwt)

const queryPromise = (mysqlConnector, sql) => {
  return new Promise((resolve, reject) => {
    mysqlConnector.query(sql, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

const generateToken = async (payload, secretSignature, tokenLife) => {
  try {
    return await sign(
      {
        payload
      },
      secretSignature,
      {
        algorithm: 'HS256',
        expiresIn: tokenLife
      }
    )
  } catch (error) {
    console.log(`Error in generate access token:  + ${error}`)
    return null
  }
}

const verifyToken = async (token, secretKey) => {
  try {
    return await verify(token, secretKey)
  } catch (error) {
    console.log(`Error in verify access token:  + ${error}`)
    return null
  }
}

const decodeToken = async (token, secretKey) => {
  try {
    return await verify(token, secretKey, {
      ignoreExpiration: true
    })
  } catch (error) {
    console.log(`Error in decode access token: ${error}`)
    return null
  }
}

const generateAccessToken = (id, username) => {
  return jwt.sign(
    { id, username },
    process.env.ACCESS_TOKEN_SECRET || 'secret',
    { expiresIn: process.env.ACCESS_TOKEN_LIFE || '7d' }
  );
};

const generateRefreshToken = (id, username) => {
  return jwt.sign(
    { id, username },
    process.env.REFRESH_TOKEN_SECRET || 'secret',
    { expiresIn: process.env.REFRESH_TOKEN_LIFE || '30d' }
  );
}

const SALT_KEY = 7

const REFRESH_TOKEN_SIZE = 100

module.exports = {
  queryPromise,
  generateToken,
  decodeToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_SIZE,
  SALT_KEY
}