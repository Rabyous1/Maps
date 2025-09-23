import { AppDataSource } from "@/utils/databases";
import { Repository, SelectQueryBuilder } from "typeorm";
import { User } from "./interfaces/user.interfaces";
import { BaseUserEntitySchema } from "./schemas/base-user.schema";

export class UserRepository {
    public repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(BaseUserEntitySchema);
    }

    createQueryBuilder(): SelectQueryBuilder<User> {
        return this.repository.createQueryBuilder();
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({ where: { email } });
    }

    async findOne(conditions: any): Promise<User | null> {
        return this.repository.findOne({
            where: conditions,
            relations: ['files'],
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['files'],
        });
    }

    
    async create(UserData: Partial<User>): Promise<User> {
        const User = this.repository.create(UserData);
        return await this.repository.save(User);
    }

    async update(User: User): Promise<User> {
        return await this.repository.save(User);
    }

    async save(User: User): Promise<User> {
        return await this.repository.save(User);
    }

    async findByIdAndUpdate(id: string, update: Partial<User>, options?: { new?: boolean }): Promise<User | null> {
        const User = await this.findById(id);
        if (!User) return null;
        Object.assign(User, update);
        const updatedUser = await this.repository.save(User);
        return options && options.new ? updatedUser : User;
    }

    async findByIdWithRelations(id: string, relations: string[]): Promise<User | null> {
        return await this.repository.findOne({
            where: { id },
            relations,
        });
    }

    async findByConfirmAccountToken(token: string): Promise<User | null> {
        return await this.repository.findOne({ where: { confirmAccountToken: token } });
    }
}