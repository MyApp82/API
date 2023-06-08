import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/user.entity";
import { DisplayUserDto } from "../dto/user.dto";

export const GetBanner = async (req: Request, res: Response) => {
    try {
        const users = await getRepository(User).find({
            where: {
                status: true
            }
        });

        const {...data} = users;
        let userList: DisplayUserDto[] = [];
        users.forEach(item => {
            const user = new DisplayUserDto();
            user.id = item.id;
            user.name = item.name;
            user.email = item.email;
            user.status = item.status;
            userList.push(user);
        });

        res.status(200).json({            
            meta: {
                statusCode: 200,
                success: true,
                message: "Success"
            },
            data: userList
        });
    }catch(err) {
        console.log(err)
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
