"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_module_1 = __importDefault(require("./app.module"));
const app = (0, express_1.default)();
const port = 3000;
const router = express_1.default.Router();
const routes = app_module_1.default['routes'];
const controllers = app_module_1.default['controllers'];
for (const route of routes) {
    router[route.method](route.path, (req, res) => {
        const controller = controllers[route.controller];
        controller[route.action].call(controller, req, res);
    });
}
app.use('/api', router);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=main.js.map