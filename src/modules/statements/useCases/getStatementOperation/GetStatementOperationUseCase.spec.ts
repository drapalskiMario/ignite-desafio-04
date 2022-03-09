import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUserRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('GetStatementOperationUseCase', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUserRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUserRepository, inMemoryStatementsRepository);
  })

  it('should be able to return the statement operation', async () => {
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
    const statementOperationSaved = await inMemoryStatementsRepository.create(statementOperation);
    const result = await getStatementOperationUseCase.execute({
      user_id: userSaved.id as string,
      statement_id: statementOperationSaved.id as string
    });
    expect(result.user_id).toBe(userSaved.id);
    expect(result.amount).toBe(statementOperationSaved.amount);
    expect(result.type).toBe(statementOperationSaved.type);
  });

  it('should not able to return if user doenst exist', async () => {
    expect(async () => {
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
      const statementOperationSaved = await inMemoryStatementsRepository.create(statementOperation);

      const result = await getStatementOperationUseCase.execute({
        user_id: "invalid_user",
        statement_id: statementOperationSaved.id as string
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not able to return if statements operation doenst exist', async () => {
    expect(async () => {
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
      const statementOperationSaved = await inMemoryStatementsRepository.create(statementOperation);

      const result = await getStatementOperationUseCase.execute({
        user_id: userSaved.id as string,
        statement_id: "invalid_id"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
