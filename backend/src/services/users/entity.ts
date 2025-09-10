import { IsEmail, Length } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, Unique, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserSchema } from './schema';


@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "email", length: 150, unique: true })
  @IsEmail()
  email: string;

  @Column({name: "name", length: 150})
  name: string;

  @Length(8)
  @Column({name: "password", length: 150})
  password: string;

  //Security
	@Column({ name: "reset_token", nullable: true, default: "" })
	resetToken: string;

	@Column({ name: "refresh_token", nullable: true, default: "" })
	refreshToken: string;

	@BeforeInsert()
	@BeforeUpdate()
	async setPassword() {
		const salt = await bcrypt.genSalt();
		this.password = await bcrypt.hash(this.password, salt);
	}

	checkPassword(password: string): boolean {
		return bcrypt.compareSync(password, this.password);
	}

	static validate(input: Partial<UserEntity>) {
		return UserSchema.parse(input);
	}
}

