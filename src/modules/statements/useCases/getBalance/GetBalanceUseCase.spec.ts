import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUserRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('GetBalanceUseCase', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUserRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUserRepository);
  })

  it('should be able to return a balance response', async () => {
    const user: ICreateUserDTO = {
      name: "user test",
      email: "user@mail.com",
      password: "1234"
    }
    const userSaved = await inMemoryUserRepository.create(user);
    const statementOperation: ICreateStatementDTO = {
      user_id: userSaved.id as string,
      type: OperationType.DEPOSIT,
      amount: 150.00,
      description: "testing"
    }
    await inMemoryStatementsRepository.create(statementOperation);
    const result = await getBalanceUseCase.execute({ user_id: userSaved.id as string})
    expect(result).toHaveProperty("balance");
    expect(result).toHaveProperty("statement");
    expect(result.balance).toBe(statementOperation.amount);
  });

  it('should not be able to create stament if the user doesnt exist', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "invalid_id"});
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
