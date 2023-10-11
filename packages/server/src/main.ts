import express from 'express'
import AppModule from './app.module'

const app = express()
const port = 3000
const router = express.Router();
const routes = AppModule['routes'];
const controllers = AppModule['controllers'];

for (const route of routes) {
  router[route.method](route.path, (req, res) => {
    const controller = controllers[route.controller]
    controller[route.action].call(controller, req, res);
  })
}

app.use('/api', router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})