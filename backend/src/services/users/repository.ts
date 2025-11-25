import { AppDataSource } from "@/config/database";
import { UserEntity } from "./entity";

export class UserRepository {
  private repository = AppDataSource.getRepository(UserEntity);

  async findById(id: number): Promise<UserEntity | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.repository.findOne({
      where: { email },
    });
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return await this.repository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.repository.find();
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
