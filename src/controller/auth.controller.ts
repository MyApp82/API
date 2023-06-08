import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/user.entity";
import bcryptjs from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { validate } from "class-validator";
import { RegisterUserDto, LoginUserDto, UpdateUserDto, ForgotPasswordUserDto } from "../dto/user.dto";

export const Register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const user = new RegisterUserDto();
        user.email = email;
        user.name = name;
        user.password = password;
        user.status =  true;
        const errors = await validate(user);
        
        if (errors.length > 0) {
            return res.status(400).json({
                meta: {
                    statusCode: 400,
                    success: false,
                    message: errors.map(item => {
                        return item.constraints
                    })
                },
                data: errors
            })        
        } else {
            const userData = await getRepository(User).save({
                name,
                email,
                status: true,
                password: await bcryptjs.hash(password, 12)
            })
    
            res.status(200).json({
                meta: {
                    statusCode: 200,
                    success: true,
                    message: "Registration success"
                },
                data: {
                    name: userData.name,
                    email: userData.email,
                }
            });
        }        
    }catch(err) {                
        return res.status(400).json({
            meta: {
                statusCode: 400,
                success: false,
                message: err.message
            },
            data: err
        })
    }
}

export const Login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = new LoginUserDto();
    user.email = email;
    user.password = password;  
    const errors = await validate(user);
    
    if (errors.length > 0) {
        return res.status(400).json({
            meta: {
                statusCode: 400,
                success: false,
                message: errors.map(item => {
                    return item.constraints
                })
            },
            data: errors
        })        
    } 

    const userData = await getRepository(User).findOne({
        where: {
            email: email
        }
    });
    if (!userData) {
        return res.status(400).json({
            meta: {
                statusCode: 400,
                success: false,
                message: "Email not found"
            },
            data: {
                email: email
            }
        })
    }

    if (!await bcryptjs.compare(password, userData.password)) {
        return res.status(400).json({
            meta: {
                statusCode: 400,
                success: false,
                message: 'Wrong password'
            },
            data: {
                email: email
            }
        })
    }

    const accessToken = sign({
        id: userData.id
    }, "access_secret", {expiresIn: 60 * 60});

    const refreshToken = sign({id: userData.id
    }, "refresh_secret", {expiresIn: 24 * 60 * 60 })

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 //equivalent to 1 day
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 //equivalent to 7 days
    })

    res.status(200).json({
        meta: {
            statusCode: 200,
            success: true,
            message: "Login success"
        },
        data: {
            name: userData.name,
            email: user.email,
            bearerToken: accessToken
        }
    });
}

export const GetProfile = async (req: Request, res: Response) => {
    try {
        const bearerToken = req.headers.authorization ?? "";
        const currentBearerToken = bearerToken.split('Bearer ').join('').trim();
        const payload: any = verify(currentBearerToken, "access_secret");
        if (!payload) {
            res.status(401).json({            
                meta: {
                    statusCode: 401,
                    success: true,
                    message: "Unauthenticated"
                },
                data: {                    
                    message: "Unauthenticated"
                }
            });
        } else {
            const user = await getRepository(User).findOne({
                where: {
                    id: payload.id
                }
            });
    
            const {...data} = user;
    
            res.status(200).json({            
                meta: {
                    statusCode: 200,
                    success: true,
                    message: "Authenticated"
                },
                data: {
                    name: user?.name,
                    email: user?.email
                }
            });
        }
    }catch(err) {
        console.log(err)
        return res.status(400).json({
            meta: {
                statusCode: 400,
                success: false,
                message: err.name == "TokenExpiredError" ? 'Bearer token has expired.' : err.message
            },
            data: err.name == "TokenExpiredError" ? err.message = 'Bearer token has expired.' : err
        })
    }
}

export const UserUpdate = async (req: Request, res: Response) => {
    try {
        const { name, email, status } = req.body;
        const userId = req.params.id;
        const bearerToken = req.headers.authorization ?? "";
        const currentBearerToken = bearerToken.split('Bearer ').join('').trim();
        const payload: any = verify(currentBearerToken, "access_secret");

        const user = new UpdateUserDto();
        user.name = name;
        user.email = email;
        user.status = status;
        const errors = await validate(user);
        if (errors.length > 0) {
            return res.status(400).json({
                meta: {
                    statusCode: 400,
                    success: false,
                    message: errors.map(item => {
                        return item.constraints
                    })
                },
                data: errors
            })        
        }

        const currentUser = await getRepository(User).findOne({
            where: {
                id: parseInt(payload.id)
            }
        });

        if (currentUser?.id != parseInt(userId)) {
            return res.status(401).json({
                meta: {
                    statusCode: 401,
                    success: false,
                    message: "unauthenticated"
                },
                data: "unauthenticated"
            })
        } else {
            const userData = await getRepository(User).save({
                id: parseInt(userId),
                name,
                email,
                status
            })

            res.status(200).json({            
                meta: {
                    statusCode: 200,
                    success: true,
                    message: "Update user is successfully"
                },
                data: {
                    name: userData.name,
                    email: userData.email
                }
            });
        }
    }catch(err) {
        console.log(err)
        return res.status(400).json({
            meta: {
                statusCode: 400,
                success: false,
                message: err.name == "TokenExpiredError" ? 'Bearer token has expired.' : err.message
            },
            data: err.name == "TokenExpiredError" ? err.message = 'Bearer token has expired.' : err
        })
    }
}

export const ForgotPassword = async (req: Request, res: Response) => {
    try {
        const { email, newPassword } = req.body;
        const userId = req.params.id;
        const bearerToken = req.headers.authorization ?? "";
        const currentBearerToken = bearerToken.split('Bearer ').join('').trim();
        const payload: any = verify(currentBearerToken, "access_secret");
        await getRepository(User).findOne({
            where: {
                id: payload.id
            }
        });

        const user = await getRepository(User).findOne({
            where: {
                id: payload.id
            }
        });
        const userData = new ForgotPasswordUserDto();
        userData.email = email;
        userData.newPassword = newPassword;
        const errors = await validate(userData);
        if (errors.length > 0) {
            return res.status(400).json({
                meta: {
                    statusCode: 400,
                    success: false,
                    message: errors.map(item => {
                        return item.constraints
                    })
                },
                data: errors
            })        
        } else {
            if (payload.id != parseInt(userId)) {
                res.status(401).json({            
                    meta: {
                        statusCode: 401,
                        success: false,
                        message: "Unauthenticated"
                    },
                    data: "Unauthenticated"
                });
            } else {
                await getRepository(User).save({
                    id: parseInt(userId),
                    password: await bcryptjs.hash(newPassword, 12)
                })

                res.status(200).json({            
                    meta: {
                        statusCode: 200,
                        success: true,
                        message: "Reset password is successfully"
                    },
                    data: {
                        name: user?.name,
                        email: user?.email
                    }
                });
            }
        }
    }catch(err) {
        console.log(err)
        return res.status(400).json({
            meta: {
                statusCode: 400,
                success: false,
                message: err.name == "TokenExpiredError" ? 'Bearer token has expired.' : err.message
            },
            data: err.name == "TokenExpiredError" ? err.message = 'Bearer token has expired.' : err
        })
    }
}
