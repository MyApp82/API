import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        unique: true
    })
    name!: string;

    @Column({
        unique: true
    })
    email!: string;

    @Column()
    password!: string;

    @Column()
    status!: boolean;
}
