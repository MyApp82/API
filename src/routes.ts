import { Router } from "express";
import { GetProfile, Login, UserUpdate, Register, ForgotPassword } from "./controller/auth.controller";
import { GetBanner } from "./controller/banner.controller";

export const routes = (router: Router) => {
    router.post('/api/register', Register)
    router.post('/api/login', Login)
    router.get('/api/getprofile', GetProfile)
    router.put('/api/profile/:id', UserUpdate)
    router.get('/api/getbanner', GetBanner)
    router.put('/api/forgotpassword/:id', ForgotPassword)
}