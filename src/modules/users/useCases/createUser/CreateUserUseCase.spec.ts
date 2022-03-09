import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('CreateUserUseCase', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
  })

  it('should be able to create an user', async () => {
    const user: ICreateUserDTO = {
      name: "user test",
      email: "user@mail.com",
      password: "1234"
    };

    await createUserUseCase.execute(user);
    const userExists = await inMemoryUserRepository.findByEmail(user.email);

    expect(userExists).toHaveProperty("id");
  });

  it('should not be able to create an user with a email existent', async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "user test",
        email: "user@mail.com",
        password: "1234"
      };
      await createUserUseCase.execute(user);

      const userError: ICreateUserDTO = {
        name: "user error",
        email: "user@mail.com",
        password: "1234"
      };
      await createUserUseCase.execute(userError);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
