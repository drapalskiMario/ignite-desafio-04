import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersCategory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase

describe('ShowUserProfileUseCase', () => {
  beforeEach(() => {
    inMemoryUsersCategory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersCategory);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersCategory);
  })

  it('should be able to show a user profile', async () => {
    const user: ICreateUserDTO = {
      name: "UserTest",
      email: "user@test.com",
      password: "1234",
    };
    const userSaved = await createUserUseCase.execute(user);
    const result = await showUserProfileUseCase.execute(userSaved.id as string);

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("password");
  });

  it('should not be able to show user profile if user non exists', async () => {
    expect(async () => {
      const invalidUserId = "invalid";
      await showUserProfileUseCase.execute(invalidUserId);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
